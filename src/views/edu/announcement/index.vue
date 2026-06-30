<template>
  <div class="announcement-management">
    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <div class="card-accent"></div>
      <el-form :model="queryParams" inline>
        <el-form-item label="课程ID">
          <el-input v-model="queryParams.courseId" placeholder="请输入课程ID" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="queryParams.title" placeholder="请输入公告标题" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格区域 -->
    <div class="table-wrapper">
      <div class="table-header">
        <div class="table-title">公告列表</div>
        <div class="table-actions">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新增公告
          </el-button>
        </div>
      </div>

      <el-table
        :data="tableData"
        v-loading="loading"
        border
        stripe
        style="width: 100%"
        :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: 600 }"
      >
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
        <el-table-column prop="courseId" label="课程ID" width="90" align="center" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="source" label="来源" width="120" />
        <el-table-column prop="status" label="状态" width="70" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
              size="small"
              active-color="#38daa6"
              inactive-color="#cbd5e1"
              disabled
            />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="170">
          <template #default="{ row }">{{ row.createTime || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
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

    <!-- 分页栏 -->
    <div class="pagination-bar">
      <div class="pagination-left">
        <span class="total-text">共 <b>{{ total }}</b> 条数据</span>
      </div>
      <div class="pagination-right">
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
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑公告' : '新增公告'" width="800px"
      :before-close="() => dialogVisible = false" destroy-on-close>
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="基本信息" name="basic">
          <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
            <el-form-item label="课程ID" prop="courseId">
              <el-input-number v-model="formData.courseId" :min="1" placeholder="请输入课程ID" style="width: 200px" />
            </el-form-item>
            <el-form-item label="标题" prop="title">
              <el-input v-model="formData.title" placeholder="请输入公告标题" maxlength="200" />
            </el-form-item>
            <el-form-item label="长标题">
              <el-input v-model="formData.longTitle" placeholder="展示详情时优先显示（可选）" maxlength="500" />
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="8"><el-form-item label="分类"><el-input v-model="formData.category" placeholder="可选" maxlength="100" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="简述"><el-input v-model="formData.summary" placeholder="可选" maxlength="500" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="来源"><el-input v-model="formData.source" placeholder="可选" maxlength="200" /></el-form-item></el-col>
            </el-row>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="公告内容" name="content"><RichEditor v-model="formData.content" /></el-tab-pane>
      </el-tabs>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看公告详情对话框 -->
    <el-dialog v-model="viewDialogVisible" title="公告详情" width="700px" destroy-on-close>
      <div class="view-detail">
        <h2 class="view-title">{{ viewData.title || '-' }}</h2>
        <div class="view-meta">
          <span>分类：{{ viewData.category || '-' }}</span>
          <span>来源：{{ viewData.source || '-' }}</span>
          <span>创建时间：{{ viewData.createTime || '-' }}</span>
        </div>
        <div class="view-summary" v-if="viewData.summary">{{ viewData.summary }}</div>
        <div class="view-content" v-html="viewData.content || '暂无内容'"></div>
      </div>
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  getAnnouncementPage,
  getAnnouncementDetail,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} from '@/api/edu/announcement'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, FolderOpened } from '@element-plus/icons-vue'
import RichEditor from '@/components/RichEditor.vue'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

const queryParams = reactive({
  courseId: '',
  title: '',
  status: null
})

const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const submitting = ref(false)
const formRef = ref(null)
const activeTab = ref('basic')

const viewDialogVisible = ref(false)
const viewData = ref({})

const formData = reactive({ courseId: null, title: '', longTitle: '', category: '', summary: '', source: '', status: 1, content: '' })
const formRules = {
  courseId: [{ required: true, message: '请输入课程ID', trigger: 'blur' }],
  title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }]
}

onMounted(() => {
  fetchData()
})

async function fetchData() {
  loading.value = true
  try {
    const r = await getAnnouncementPage({
      queryParam: {
        courseId: queryParams.courseId ? Number(queryParams.courseId) : null,
        title: queryParams.title || null,
        status: queryParams.status
      },
      pageParam: { pageNum: pageNum.value, pageSize: pageSize.value }
    })
    const d = r.data
    tableData.value = d.records || []
    total.value = d.total || 0
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
  queryParams.courseId = ''
  queryParams.title = ''
  queryParams.status = null
  pageNum.value = 1
  fetchData()
}

function handleAdd() {
  editId.value = null
  isEdit.value = false
  Object.assign(formData, { courseId: null, title: '', longTitle: '', category: '', summary: '', source: '', status: 1, content: '' })
  activeTab.value = 'basic'
  dialogVisible.value = true
}

async function handleEdit(id) {
  editId.value = id
  isEdit.value = true
  activeTab.value = 'basic'
  try {
    const r = await getAnnouncementDetail(id)
    const d = r.data
    Object.assign(formData, {
      courseId: d.courseId,
      title: d.title || '',
      longTitle: d.longTitle || '',
      category: d.category || '',
      summary: d.summary || '',
      source: d.source || '',
      status: d.status ?? 1,
      content: d.content || ''
    })
    dialogVisible.value = true
  } catch {
    ElMessage.error('加载公告详情失败')
  }
}

async function handleView(id) {
  try {
    const r = await getAnnouncementDetail(id)
    viewData.value = r.data || {}
    viewDialogVisible.value = true
  } catch {
    ElMessage.error('加载公告详情失败')
  }
}

async function handleSubmit() {
  if (!formRef.value) return
  try { await formRef.value.validate() } catch { return }
  submitting.value = true
  try {
    if (isEdit.value) {
      await updateAnnouncement({ ...formData, id: editId.value })
      ElMessage.success('编辑成功')
    } else {
      await createAnnouncement(formData)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    await fetchData()
  } catch {
    // 错误已在拦截器中处理
  } finally {
    submitting.value = false
  }
}

async function handleDelete(id) {
  try {
    await ElMessageBox.confirm('确定要删除该公告吗？', '删除确认', { type: 'warning' })
    await deleteAnnouncement(id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {
    // 取消操作
  }
}
</script>

<style scoped>
@import '@/assets/css/user-management.css';
.announcement-management {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: calc(100vh - 140px);
  padding: 0;
}
.view-detail { padding: 0 4px; }
.view-title { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 12px; }
.view-meta { display: flex; gap: 20px; font-size: 13px; color: #94a3b8; margin-bottom: 12px; }
.view-summary { background: #f8fafc; padding: 10px 14px; border-radius: 6px; font-size: 14px; color: #64748b; margin-bottom: 16px; }
.view-content { font-size: 14px; color: #334155; line-height: 1.8; }
</style>
