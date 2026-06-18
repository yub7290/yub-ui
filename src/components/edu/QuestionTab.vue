<template>
  <div class="question-tab">
    <!-- 搜索区 -->
    <el-row :gutter="12" class="tab-search">
      <el-col :span="6">
        <el-select v-model="queryParams.questionType" placeholder="试题类型" clearable style="width:100%" size="small">
          <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="Number(item.value)" />
        </el-select>
      </el-col>
      <el-col :span="6">
        <el-select v-model="queryParams.difficulty" placeholder="难度" clearable style="width:100%" size="small">
          <el-option v-for="i in 5" :key="i" :label="'⭐'.repeat(i)" :value="i" />
        </el-select>
      </el-col>
      <el-col :span="6">
        <el-select v-model="queryParams.status" placeholder="状态" clearable style="width:100%" size="small">
          <el-option label="启用" :value="1" />
          <el-option label="停用" :value="0" />
        </el-select>
      </el-col>
      <el-col :span="6" style="text-align:right">
        <el-button type="primary" size="small" @click="handleQuery">查询</el-button>
        <el-button size="small" @click="handleReset">重置</el-button>
        <el-button type="primary" size="small" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增
        </el-button>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table :data="tableData" v-loading="loading" border stripe size="small" style="width:100%"
      :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: 600 }">
      <el-table-column type="index" label="#" width="40" align="center" />
      <el-table-column label="类型" width="70" align="center">
        <template #default="{ row }">
          <el-tag :type="typeTag(row.questionType)" size="small">{{ typeMap[row.questionType] || '未知' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="题干" min-width="250">
        <template #default="{ row }"><div class="cell-preview">{{ textPreview(row.content) }}</div></template>
      </el-table-column>
      <el-table-column label="难度" width="80" align="center">
        <template #default="{ row }">{{ '⭐'.repeat(row.difficulty || 0) }}</template>
      </el-table-column>
      <el-table-column prop="courseName" label="课程" min-width="120" />
      <el-table-column prop="status" label="状态" width="60" align="center">
        <template #default="{ row }">
          <el-switch :model-value="row.status === 1" :loading="row._statusLoading"
            @change="(v) => handleStatusChange(row, v)" size="small"
            active-color="#38daa6" inactive-color="#cbd5e1" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="130" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row.id)">编辑</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty><el-empty description="暂无试题" :image-size="50" /></template>
    </el-table>

    <!-- 分页 -->
    <div class="tab-pagination">
      <el-pagination
        v-model:current-page="pageNum" v-model:page-size="pageSize"
        :total="total" :page-sizes="[5, 10, 20]" layout="sizes, prev, pager, next"
        background size="small" @size-change="fetchData" @current-change="fetchData" />
    </div>

    <!-- 新增/编辑对话框 -->
    <QuestionFormDialog v-model="dialogVisible" :question-id="editId" 
      :default-course-id="courseId" :default-major-id="props.defaultMajorId" @success="fetchData" />
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { getQuestionPage, deleteQuestion, changeQuestionStatus } from '@/api/edu/question'
import { getDictOptions } from '@/api/system/dictData'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import QuestionFormDialog from '@/views/edu/question/QuestionFormDialog.vue'

/** Strip HTML tags and truncate for safe list display */
function textPreview(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').substring(0, 100)
}

const props = defineProps({
  courseId: { type: Number, default: null },
  defaultMajorId: { type: Number, default: null }
})

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const editId = ref(null)

const queryParams = reactive({
  questionType: null,
  difficulty: null,
  courseId: props.courseId,
  status: null
})

const typeMap = { 0: '单选', 1: '多选', 2: '判断', 3: '简答', 4: '填空' }
const typeOptions = ref([])

onMounted(async () => {
  try {
    const res = await getDictOptions('edu_question_type')
    typeOptions.value = res.data || []
  } catch { typeOptions.value = [] }
})

watch(() => props.courseId, (val) => {
  queryParams.courseId = val
  fetchData()
}, { immediate: true })

async function fetchData() {
  loading.value = true
  try {
    const res = await getQuestionPage({
      queryParam: { ...queryParams },
      pageParam: { pageNum: pageNum.value, pageSize: pageSize.value }
    })
    const data = res.data
    tableData.value = (data.records || []).map(r => ({ ...r, _statusLoading: false }))
    total.value = data.total || 0
  } catch {
    tableData.value = []; total.value = 0
  } finally {
    loading.value = false
  }
}

function handleQuery() { pageNum.value = 1; fetchData() }
function handleReset() {
  queryParams.questionType = null; queryParams.difficulty = null; queryParams.status = null
  pageNum.value = 1; fetchData()
}
function handleAdd() { editId.value = null; dialogVisible.value = true }
function handleEdit(id) { editId.value = id; dialogVisible.value = true }

async function handleDelete(id) {
  try {
    await ElMessageBox.confirm('确定要删除该试题吗？', '删除确认', { type: 'warning' })
    await deleteQuestion(id); ElMessage.success('删除成功'); fetchData()
  } catch { /* 取消 */ }
}

async function handleStatusChange(row, checked) {
  const status = checked ? 1 : 0
  row._statusLoading = true
  try {
    await changeQuestionStatus(row.id, status)
    row.status = status
  } catch { /* 错误已处理 */ }
  finally { row._statusLoading = false }
}

function typeTag(t) {
  return { 0: '', 1: 'warning', 2: 'info', 3: 'success', 4: 'danger' }[t] || ''
}
</script>

<style scoped>
.question-tab { min-height: 300px; }
.tab-search { margin-bottom: 12px; }
.tab-pagination { margin-top: 12px; display: flex; justify-content: flex-end; }
.cell-preview { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
