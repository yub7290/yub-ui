<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="900px"
    :before-close="() => visible = false"
    @open="handleOpen"
    destroy-on-close
  >
    <!-- 工具栏 -->
    <div class="instance-toolbar">
      <div class="toolbar-left">
        <el-select v-model="filterStatus" placeholder="状态筛选" clearable style="width: 120px; margin-right: 8px">
          <el-option label="未使用" :value="0" />
          <el-option label="已使用" :value="1" />
          <el-option label="已回滚" :value="2" />
          <el-option label="已禁用" :value="3" />
        </el-select>
        <el-input v-model="searchKeyword" placeholder="搜索卡号/使用人" clearable style="width: 200px" @keyup.enter="handleSearch" />
        <el-button type="primary" @click="handleSearch" style="margin-left: 8px">搜索</el-button>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" @click="handleBatchGenerate">
          <el-icon><Plus /></el-icon>批量生成
        </el-button>
      </div>
    </div>

    <!-- 实例列表表格 -->
    <el-table
      :data="instanceData"
      v-loading="loading"
      border
      stripe
      style="width: 100%"
      :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: 600 }"
      max-height="450"
    >
      <el-table-column type="index" label="#" width="50" align="center" />
      <el-table-column prop="cardNo" label="卡号-密码" min-width="220">
        <template #default="{ row }">
          <span class="card-code">{{ row.cardNo }}</span>
          <el-button link type="primary" size="small" @click="handleCopy(row)" style="margin-left: 8px">复制</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="useTime" label="使用时间" width="170" align="center">
        <template #default="{ row }">
          {{ row.useTime || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="userAccount" label="使用人" width="120" align="center">
        <template #default="{ row }">
          {{ row.userAccount || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" align="center" fixed="right">
        <template #default="{ row }">
          <el-button
            link
            type="warning"
            size="small"
            :disabled="row.status !== 1"
            @click="handleRollback(row)"
          >回滚</el-button>
        </template>
      </el-table-column>

      <template #empty>
        <div class="empty-state">
          <p>暂无卡号数据，请先生成</p>
        </div>
      </template>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-bar" style="margin-top: 16px">
      <div class="pagination-left">
        <span class="total-text">共 <b>{{ total }}</b> 条数据</span>
      </div>
      <div class="pagination-right">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          :pager-count="5"
          layout="sizes, prev, pager, next, jumper"
          background
          @size-change="fetchInstances"
          @current-change="fetchInstances"
        />
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { getInstancePage, batchGenerateInstances, rollbackInstance, toggleInstanceStatus } from '@/api/edu/studyCard'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  cardId: { type: Number, default: null },
  dialogTitle: { type: String, default: '卡号管理' }
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = ref(false)
const loading = ref(false)
const instanceData = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const filterStatus = ref(null)
const searchKeyword = ref('')

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
  if (val && props.cardId) {
    fetchInstances()
  } else {
    instanceData.value = []
    total.value = 0
    pageNum.value = 1
    filterStatus.value = null
    searchKeyword.value = ''
  }
})

async function fetchInstances() {
  if (!props.cardId) return
  loading.value = true
  try {
    const res = await getInstancePage(props.cardId, {
      queryParam: {
        status: filterStatus.value,
        cardNo: searchKeyword.value || undefined,
        userAccount: searchKeyword.value || undefined
      },
      pageParam: { pageNum: pageNum.value, pageSize: pageSize.value }
    })
    const data = res.data
    instanceData.value = (data.records || []).map(row => ({ ...row }))
    total.value = data.total || 0
  } catch {
    instanceData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pageNum.value = 1
  fetchInstances()
}

async function handleBatchGenerate() {
  try {
    const { value } = await ElMessageBox.prompt('请输入生成数量', '批量生成卡号', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /^[1-9]\d*$/,
      inputErrorMessage: '请输入正整数',
      inputValue: '10'
    })
    const count = parseInt(value, 10)
    if (count > 0) {
      await batchGenerateInstances(props.cardId, count)
      ElMessage.success(`已生成 ${count} 张卡号`)
      fetchInstances()
      emit('success')
    }
  } catch {
    // 取消操作
  }
}

async function handleRollback(row) {
  try {
    await ElMessageBox.confirm('确定要回滚该卡号吗？回滚后卡号将恢复为未使用状态。', '回滚确认', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    await rollbackInstance(row.id)
    ElMessage.success('回滚成功')
    fetchInstances()
    emit('success')
  } catch {
    // 取消操作
  }
}

function handleCopy(row) {
  navigator.clipboard.writeText(row.cardNo).then(() => {
    ElMessage.success('已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

/** 状态标签文本 */
function statusLabel(status) {
  const map = { 0: '未使用', 1: '已使用', 2: '已回滚', 3: '已禁用' }
  return map[status] || '未知'
}

/** 状态标签样式 */
function statusTagType(status) {
  const map = { 0: 'info', 1: 'success', 2: 'warning', 3: 'danger' }
  return map[status] || 'info'
}
</script>

<style scoped>
@import '@/assets/css/user-management.css';
.instance-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.toolbar-left {
  display: flex;
  align-items: center;
}
.toolbar-right {
  display: flex;
  align-items: center;
}
.card-code {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #475569;
}
</style>
