<template>
  <div class="t-page">
    <YubPageHeader title="考试管理" subtitle="管理与发布课程考试">
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>新建考试
      </el-button>
    </YubPageHeader>

    <div class="t-toolbar">
      <div class="t-toolbar__filters">
        <el-input
          v-model="queryParams.keyword"
          placeholder="考试名称"
          clearable
          style="width: 220px"
          :prefix-icon="Search"
          @keyup.enter="handleQuery"
          @clear="handleQuery"
        />
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable
          style="width: 130px"
          @change="handleQuery"
        >
          <el-option label="启用" :value="1" />
          <el-option label="停用" :value="0" />
        </el-select>
      </div>
      <div class="t-toolbar__actions">
        <el-button @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <section class="t-card exam-card">
      <el-table :data="tableData" v-loading="loading" style="width: 100%">
        <el-table-column type="index" label="#" width="48" align="center" />
        <el-table-column prop="name" label="考试名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="courseName" label="课程" min-width="140" show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
              :loading="row._loading"
              @change="(val) => handleStatus(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <div class="t-empty">
            <el-icon :size="40"><Tickets /></el-icon>
            <p class="t-empty__text">暂无考试</p>
          </div>
        </template>
      </el-table>

      <div class="t-pagination" v-if="total > 0">
        <span class="t-pagination__total">共 <b>{{ total }}</b> 条数据</span>
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          :pager-count="5"
          layout="sizes, prev, pager, next, jumper"
          background
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </section>

    <YubDialog v-model="dialogVisible" :title="isEdit ? '编辑考试' : '新建考试'" width="520px">
      <el-form :model="form" label-width="72px">
        <el-form-item label="考试名称">
          <el-input v-model="form.name" placeholder="请输入考试名称" maxlength="100" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="4"
            placeholder="考试说明（选填）"
            maxlength="300"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
      </template>
    </YubDialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Search, Tickets } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import YubPageHeader from '@/components/YubPageHeader.vue'
import YubDialog from '@/components/YubDialog.vue'
import {
  getExamPage, getExamDetail, createExam, updateExam, deleteExam, changeExamStatus
} from '@/api/edu/exam'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

const queryParams = reactive({ keyword: '', status: null })

const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const editId = ref(null)
const form = reactive({ name: '', remark: '' })

async function fetchData() {
  loading.value = true
  try {
    const res = await getExamPage({
      queryParam: { ...queryParams },
      pageParam: { pageNum: pageNum.value, pageSize: pageSize.value }
    })
    const data = res.data
    const list = Array.isArray(data) ? data : (data.list || data.records || [])
    tableData.value = list.map(r => ({ ...r, _loading: false }))
    total.value = Array.isArray(data) ? data.length : (data.total || 0)
  } catch {
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  pageNum.value = 1
  fetchData()
}

function handleReset() {
  queryParams.keyword = ''
  queryParams.status = null
  pageNum.value = 1
  fetchData()
}

function handleCreate() {
  isEdit.value = false
  editId.value = null
  form.name = ''
  form.remark = ''
  dialogVisible.value = true
}

async function handleEdit(row) {
  isEdit.value = true
  editId.value = row.id
  try {
    const res = await getExamDetail(row.id)
    const d = res.data || {}
    form.name = d.name || ''
    form.remark = d.remark || d.description || ''
  } catch {
    form.name = row.name || ''
    form.remark = ''
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!form.name.trim()) {
    ElMessage.warning('请输入考试名称')
    return
  }
  submitting.value = true
  try {
    if (isEdit.value) {
      await updateExam({ id: editId.value, name: form.name, remark: form.remark })
      ElMessage.success('更新成功')
    } else {
      await createExam({ name: form.name, remark: form.remark, status: 1 })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch {
    // 错误已由拦截器处理
  } finally {
    submitting.value = false
  }
}

async function handleStatus(row, checked) {
  row._loading = true
  try {
    await changeExamStatus(row.id, checked ? 1 : 0)
    row.status = checked ? 1 : 0
    ElMessage.success(checked ? '已启用' : '已停用')
  } catch {
    // 错误已处理
  } finally {
    row._loading = false
  }
}

async function handleDelete(id) {
  try {
    await ElMessageBox.confirm('确定要删除该考试吗？', '删除确认', { type: 'warning' })
    await deleteExam(id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {}
}

onMounted(fetchData)
</script>

<style scoped>
.exam-card {
  padding: 0;
  overflow: hidden;
}
</style>
