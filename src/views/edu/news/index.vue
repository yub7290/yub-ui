<template>
  <div class="news-management">
    <el-card class="search-card" shadow="never">
      <div class="card-accent"></div>
      <el-form :model="queryParams" inline>
        <el-form-item label="分类">
          <el-select v-model="queryParams.categoryId" placeholder="全部" clearable filterable style="width: 160px">
            <el-option v-for="c in categoryOptions" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="queryParams.title" placeholder="请输入标题" clearable style="width: 200px" />
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
        <div class="table-title">资讯列表</div>
        <div class="table-actions">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新增资讯
          </el-button>
        </div>
      </div>

      <el-table :data="tableData" v-loading="loading" border stripe style="width: 100%"
        :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: 600 }">
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column label="封面" width="80" align="center">
          <template #default="{ row }">
            <el-image v-if="row.coverUrl" :src="row.coverUrl" fit="cover" class="cover-thumb"
              :preview-src-list="[row.coverUrl]" />
            <span v-else class="no-cover">—</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
        <el-table-column prop="categoryName" label="分类" width="110" />
        <el-table-column prop="author" label="作者" width="110" />
        <el-table-column label="阅读量" width="90" align="center">
          <template #default="{ row }">{{ row.views || 0 }}</template>
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

    <YubDialog v-model="dialogVisible" :title="isEdit ? '编辑资讯' : '新增资讯'" width="820px" destroy-on-close>
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="基本信息" name="basic">
          <el-form ref="formRef" :model="formData" :rules="formRules" label-width="90px">
            <el-form-item label="标题" prop="title">
              <el-input v-model="formData.title" placeholder="请输入资讯标题" maxlength="200" />
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="分类">
                  <el-select v-model="formData.categoryId" placeholder="不选则无分类" clearable filterable style="width: 100%">
                    <el-option v-for="c in categoryOptions" :key="c.id" :label="c.name" :value="c.id" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="作者">
                  <el-input v-model="formData.author" placeholder="可选" maxlength="100" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="来源">
              <el-input v-model="formData.source" placeholder="可选" maxlength="200" />
            </el-form-item>
            <el-form-item label="摘要">
              <el-input v-model="formData.summary" type="textarea" :rows="2" placeholder="列表展示的摘要（可选）" maxlength="500" />
            </el-form-item>
            <el-form-item label="封面">
              <el-upload class="cover-uploader" :show-file-list="false" accept="image/*"
                :http-request="coverUpload" :before-upload="beforeCover">
                <img v-if="formData.coverUrl" :src="formData.coverUrl" class="cover-preview" />
                <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
              </el-upload>
              <el-button v-if="formData.coverUrl" link type="danger" size="small" @click="formData.coverUrl = ''">移除封面</el-button>
            </el-form-item>
            <el-form-item label="状态">
              <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" active-text="已发布" inactive-text="草稿" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="资讯内容" name="content">
          <RichEditor v-model="formData.content" />
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </YubDialog>

    <YubDialog v-model="viewDialogVisible" title="资讯详情" width="720px" destroy-on-close>
      <div class="view-detail">
        <h2 class="view-title">{{ viewData.title || '-' }}</h2>
        <div class="view-meta">
          <span>分类：{{ viewData.categoryName || '无' }}</span>
          <span>作者：{{ viewData.author || '-' }}</span>
          <span>来源：{{ viewData.source || '-' }}</span>
          <span>阅读量：{{ viewData.views || 0 }}</span>
        </div>
        <el-image v-if="viewData.coverUrl" :src="viewData.coverUrl" fit="cover" class="view-cover" :preview-src-list="[viewData.coverUrl]" />
        <div v-if="viewData.summary" class="view-summary">{{ viewData.summary }}</div>
        <div class="view-content" v-html="viewData.content || '暂无内容'"></div>
      </div>
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </YubDialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  getNewsPage, getNewsDetail, createNews, updateNews, deleteNews,
  getNewsCategoryList
} from '@/api/edu/news'
import { uploadImage } from '@/api/edu/upload'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, FolderOpened } from '@element-plus/icons-vue'
import YubDialog from '@/components/YubDialog.vue'
import RichEditor from '@/components/RichEditor.vue'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const categoryOptions = ref([])

const queryParams = reactive({ categoryId: null, title: '', status: null })

const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const submitting = ref(false)
const formRef = ref(null)
const activeTab = ref('basic')

const viewDialogVisible = ref(false)
const viewData = ref({})

const formData = reactive({
  title: '', categoryId: null, author: '', source: '', summary: '', coverUrl: '', status: 1, content: ''
})
const formRules = {
  title: [{ required: true, message: '请输入资讯标题', trigger: 'blur' }]
}

function loadCategories() {
  getNewsCategoryList().then(r => { categoryOptions.value = r.data || [] }).catch(() => {})
}

function fetchData() {
  loading.value = true
  getNewsPage({
    queryParam: {
      categoryId: queryParams.categoryId || null,
      title: queryParams.title || null,
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
  queryParams.categoryId = null; queryParams.title = ''; queryParams.status = null
  pageNum.value = 1; fetchData()
}

function handleAdd() {
  editId.value = null; isEdit.value = false
  Object.assign(formData, { title: '', categoryId: null, author: '', source: '', summary: '', coverUrl: '', status: 1, content: '' })
  activeTab.value = 'basic'; dialogVisible.value = true
}

function handleEdit(id) {
  editId.value = id; isEdit.value = true; activeTab.value = 'basic'
  getNewsDetail(id).then(r => {
    const d = r.data
    Object.assign(formData, {
      title: d.title || '', categoryId: d.categoryId || null, author: d.author || '',
      source: d.source || '', summary: d.summary || '', coverUrl: d.coverUrl || '',
      status: d.status ?? 1, content: d.content || ''
    })
    dialogVisible.value = true
  }).catch(() => ElMessage.error('加载详情失败'))
}

function handleView(id) {
  getNewsDetail(id).then(r => { viewData.value = r.data || {}; viewDialogVisible.value = true })
    .catch(() => ElMessage.error('加载详情失败'))
}

function beforeCover(file) {
  const isImg = file.type.startsWith('image/')
  if (!isImg) ElMessage.error('请上传图片文件')
  return isImg
}

function coverUpload(options) {
  const { file } = options
  uploadImage(file, 'edu/news').then(res => {
    formData.coverUrl = res.data
    options.onSuccess(res)
  }).catch(() => {
    ElMessage.error('封面上传失败')
    options.onError()
  })
}

function handleSubmit() {
  if (!formRef.value) return
  formRef.value.validate().then(() => {
    submitting.value = true
    const payload = { ...formData }
    if (isEdit.value) payload.id = editId.value
    const req = isEdit.value ? updateNews(payload) : createNews(payload)
    req.then(() => {
      ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
      dialogVisible.value = false
      fetchData()
    }).catch(() => {}).finally(() => { submitting.value = false })
  }).catch(() => {})
}

function handleDelete(id) {
  ElMessageBox.confirm('确定要删除该资讯吗？', '删除确认', { type: 'warning' })
    .then(() => deleteNews(id)).then(() => { ElMessage.success('删除成功'); fetchData() })
    .catch(() => {})
}

onMounted(() => { loadCategories(); fetchData() })
</script>

<style scoped>
@import '@/assets/css/user-management.css';
.news-management { display: flex; flex-direction: column; height: 100%; }
.cover-thumb { width: 56px; height: 40px; border-radius: 4px; }
.no-cover { color: #cbd5e1; }
.cover-uploader { display: inline-flex; }
.cover-uploader :deep(.el-upload) {
  border: 1px dashed #dcdfe6; border-radius: 6px; cursor: pointer;
  width: 120px; height: 80px; display: flex; align-items: center; justify-content: center;
}
.cover-uploader-icon { font-size: 24px; color: #8c939d; }
.cover-preview { width: 120px; height: 80px; object-fit: cover; border-radius: 6px; display: block; }
.view-detail { padding: 0 4px; }
.view-title { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 12px; }
.view-meta { display: flex; flex-wrap: wrap; gap: 16px; font-size: 13px; color: #94a3b8; margin-bottom: 12px; }
.view-cover { width: 100%; max-height: 240px; object-fit: cover; border-radius: 8px; margin-bottom: 12px; }
.view-summary { background: #f8fafc; padding: 10px 14px; border-radius: 6px; font-size: 14px; color: #64748b; margin-bottom: 16px; }
.view-content { font-size: 14px; color: #334155; line-height: 1.8; }
</style>
