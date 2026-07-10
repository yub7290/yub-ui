<template>
  <div class="notice-management">
    <el-card class="search-card" shadow="never">
      <div class="card-accent"></div>
      <el-form :model="queryParams" inline>
        <el-form-item label="课程">
          <el-select v-model="queryParams.courseId" placeholder="全部" clearable filterable style="width: 200px">
            <el-option v-for="c in courseOptions" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="queryParams.title" placeholder="请输入标题" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="queryParams.type" placeholder="全部" clearable style="width: 130px">
            <el-option v-for="t in typeOptions" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="已发布" :value="1" />
            <el-option label="草稿" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="table-wrapper">
      <div class="table-header">
        <div class="table-title">通知列表</div>
        <div class="table-actions">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新增通知
          </el-button>
        </div>
      </div>

      <el-table :data="tableData" v-loading="loading" border stripe style="width: 100%"
        :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: 600 }">
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column prop="courseName" label="课程" min-width="140" show-overflow-tooltip />
        <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
        <el-table-column label="类型" width="100" align="center">
          <template #default="{ row }">{{ typeLabel(row.type) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发布时间" width="170">
          <template #default="{ row }">{{ row.publishTimeStr || row.publishTime || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="210" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleStats(row)">统计</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row.id)">编辑</el-button>
            <el-button link type="primary" size="small" @click="handleView(row.id)">查看</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <div class="empty-state">
            <el-icon :size="56" color="#cbd5e1"><FolderOpened /></el-icon>
            <p>暂无数据</p>
          </div>
        </template>
      </el-table>
    </div>

    <div class="pagination-bar">
      <div class="pagination-left">
        <span class="total-text">共 <b>{{ total }}</b> 条数据</span>
      </div>
      <div class="pagination-right">
        <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]" :total="total" :pager-count="5"
          layout="sizes, prev, pager, next, jumper" background
          @size-change="fetchData" @current-change="fetchData" />
      </div>
    </div>

    <YubDialog v-model="dialogVisible" :title="isEdit ? '编辑通知' : '新增通知'" width="800px" destroy-on-close>
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="基本信息" name="basic">
          <el-form ref="formRef" :model="formData" :rules="formRules" label-width="90px">
            <el-form-item label="课程" prop="courseId">
              <el-select v-model="formData.courseId" placeholder="请选择课程" filterable style="width: 100%">
                <el-option v-for="c in courseOptions" :key="c.id" :label="c.name" :value="c.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="标题" prop="title">
              <el-input v-model="formData.title" placeholder="请输入通知标题" maxlength="200" />
            </el-form-item>
            <el-form-item label="类型">
              <el-select v-model="formData.type" style="width: 200px">
                <el-option v-for="t in typeOptions" :key="t.value" :label="t.label" :value="t.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" active-text="已发布" inactive-text="草稿" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="通知内容" name="content">
          <RichEditor v-model="formData.content" />
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </YubDialog>

    <YubDialog v-model="viewDialogVisible" title="通知详情" width="700px" destroy-on-close>
      <div class="view-detail">
        <h2 class="view-title">{{ viewData.title || '-' }}</h2>
        <div class="view-meta">
          <span>课程：{{ viewData.courseName || '-' }}</span>
          <span>类型：{{ typeLabel(viewData.type) }}</span>
          <span>状态：{{ viewData.status === 1 ? '已发布' : '草稿' }}</span>
          <span>发布时间：{{ viewData.publishTimeStr || viewData.publishTime || '-' }}</span>
        </div>
        <div class="view-content" v-html="viewData.content || '暂无内容'"></div>
      </div>
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </YubDialog>

    <YubDialog v-model="statsDialogVisible" title="阅读统计" width="460px" destroy-on-close>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="接收人数">{{ statsData.receivers || 0 }}</el-descriptions-item>
        <el-descriptions-item label="已读人数">{{ statsData.readCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="未读人数">{{ statsData.unreadCount || 0 }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="statsDialogVisible = false">关闭</el-button>
      </template>
    </YubDialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  getNoticePage, getNoticeDetail, getNoticeStats,
  createNotice, updateNotice, deleteNotice
} from '@/api/edu/notice'
import { getCoursePage } from '@/api/edu/course'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, FolderOpened } from '@element-plus/icons-vue'
import YubDialog from '@/components/YubDialog.vue'
import RichEditor from '@/components/RichEditor.vue'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const courseOptions = ref([])

const typeOptions = [
  { value: 1, label: '系统通知' },
  { value: 2, label: '课程相关' },
  { value: 3, label: '考试相关' },
  { value: 4, label: '活动' }
]

const queryParams = reactive({ courseId: null, title: '', type: null, status: null })

const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const submitting = ref(false)
const formRef = ref(null)
const activeTab = ref('basic')

const viewDialogVisible = ref(false)
const viewData = ref({})

const statsDialogVisible = ref(false)
const statsData = reactive({ receivers: 0, readCount: 0, unreadCount: 0 })

const formData = reactive({ courseId: null, title: '', type: 1, status: 1, content: '' })
const formRules = {
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
  title: [{ required: true, message: '请输入通知标题', trigger: 'blur' }]
}

function typeLabel(type) {
  return (typeOptions.find(t => t.value === type) || {}).label || '-'
}

function loadCourses() {
  getCoursePage({ queryParam: {}, pageParam: { pageNum: 1, pageSize: 200 } })
    .then(r => { courseOptions.value = (r.data.records || []).map(c => ({ id: c.id, name: c.name })) })
    .catch(() => {})
}

function fetchData() {
  loading.value = true
  getNoticePage({
    queryParam: {
      courseId: queryParams.courseId || null,
      title: queryParams.title || null,
      type: queryParams.type,
      status: queryParams.status
    },
    pageParam: { pageNum: pageNum.value, pageSize: pageSize.value }
  }).then(r => {
    tableData.value = r.data.records || []
    total.value = r.data.total || 0
  }).catch(() => {
    tableData.value = []
    total.value = 0
  }).finally(() => { loading.value = false })
}

function handleQuery() { pageNum.value = 1; fetchData() }
function handleReset() {
  queryParams.courseId = null; queryParams.title = ''; queryParams.type = null; queryParams.status = null
  pageNum.value = 1; fetchData()
}

function handleAdd() {
  editId.value = null; isEdit.value = false
  Object.assign(formData, { courseId: null, title: '', type: 1, status: 1, content: '' })
  activeTab.value = 'basic'; dialogVisible.value = true
}

function handleEdit(id) {
  editId.value = id; isEdit.value = true; activeTab.value = 'basic'
  getNoticeDetail(id).then(r => {
    const d = r.data
    Object.assign(formData, {
      courseId: d.courseId, title: d.title || '', type: d.type || 1,
      status: d.status ?? 1, content: d.content || ''
    })
    dialogVisible.value = true
  }).catch(() => ElMessage.error('加载详情失败'))
}

function handleView(id) {
  getNoticeDetail(id).then(r => { viewData.value = r.data || {}; viewDialogVisible.value = true })
    .catch(() => ElMessage.error('加载详情失败'))
}

function handleStats(row) {
  getNoticeStats(row.id).then(r => {
    Object.assign(statsData, r.data || {})
    statsDialogVisible.value = true
  }).catch(() => ElMessage.error('加载统计失败'))
}

function handleSubmit() {
  if (!formRef.value) return
  formRef.value.validate().then(() => {
    submitting.value = true
    const payload = { ...formData }
    if (isEdit.value) payload.id = editId.value
    const req = isEdit.value ? updateNotice(payload) : createNotice(payload)
    req.then(() => {
      ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
      dialogVisible.value = false
      fetchData()
    }).catch(() => {}).finally(() => { submitting.value = false })
  }).catch(() => {})
}

function handleDelete(id) {
  ElMessageBox.confirm('确定要删除该通知吗？', '删除确认', { type: 'warning' })
    .then(() => deleteNotice(id)).then(() => { ElMessage.success('删除成功'); fetchData() })
    .catch(() => {})
}

onMounted(() => { loadCourses(); fetchData() })
</script>

<style scoped>
@import '@/assets/css/user-management.css';
.notice-management { display: flex; flex-direction: column; height: 100%; }
.view-detail { padding: 0 4px; }
.view-title { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 12px; }
.view-meta { display: flex; flex-wrap: wrap; gap: 16px; font-size: 13px; color: #94a3b8; margin-bottom: 12px; }
.view-content { font-size: 14px; color: #334155; line-height: 1.8; }
</style>
