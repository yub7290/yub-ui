<template>
  <div class="message-tab">
    <el-table :data="tableData" v-loading="loading" border stripe size="small" style="width:100%"
      :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: 600 }">
      <el-table-column type="index" label="#" width="50" align="center" />
      <el-table-column prop="userId" label="学员" width="120" align="center" />
      <el-table-column label="时间" width="170">
        <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
      </el-table-column>
      <el-table-column prop="content" label="内容" min-width="300" show-overflow-tooltip />
      <el-table-column label="操作" width="100" align="center">
        <template #default="{ row }">
          <el-button link type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <div style="text-align:center;padding:32px;color:#999">暂无留言</div>
      </template>
    </el-table>
    <div v-if="total > 0" class="pagination-bar" style="margin-top:12px">
      <span style="color:#999;font-size:13px">共 {{ total }} 条</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getMessagePage, deleteMessage } from '@/api/edu/message'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

const props = defineProps({ courseId: { type: Number, default: null } })
const loading = ref(false)
const tableData = ref([])
const total = ref(0)

watch(() => props.courseId, (val) => { if (val) fetchData() }, { immediate: true })

async function fetchData() {
  if (!props.courseId) return
  loading.value = true
  try {
    const res = await getMessagePage({ courseId: props.courseId })
    tableData.value = res.data || []
    total.value = tableData.value.length
  } catch { tableData.value = []; total.value = 0 } finally { loading.value = false }
}

async function handleDelete(id) {
  try {
    await ElMessageBox.confirm('确定要删除该留言吗？', '删除确认', { type: 'warning' })
    await deleteMessage(id)
    ElMessage.success('删除成功')
    fetchData()
  } catch { /* cancel */ }
}

function formatTime(time) {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
}
</script>
