<template>
  <div class="page-container news-consult">
    <!-- 主体内容区：左分类 + 右列表（仿课程界面） -->
    <div class="split-layout">
      <!-- 左侧：资讯分类侧边栏 -->
      <aside class="major-sidebar">
        <div class="sidebar-header">
          <div class="sidebar-title">资讯分类</div>
          <el-button class="add-cat-btn" type="primary" link @click="handleCategoryAdd">
            <el-icon><Plus /></el-icon>新增
          </el-button>
        </div>
        <div class="sidebar-filter">
          <el-input
            v-model="categoryFilterText"
            placeholder="搜索分类"
            clearable
            size="default"
            :prefix-icon="Search"
          />
        </div>
        <div class="sidebar-tree">
          <div
            class="sidebar-item all-item"
            :class="{ active: !selectedCategoryId }"
            @click="handleCategorySelect(null)"
          >
            全部资讯
          </div>
          <div
            v-for="cat in filteredCategories"
            :key="cat.id"
            class="cat-item"
            :class="{ active: selectedCategoryId === cat.id, 'is-disabled': cat.status === 0 }"
            @click="handleCategorySelect(cat.id)"
          >
            <span class="cat-label">{{ cat.name }}</span>
            <span v-if="cat.status === 0" class="tree-badge">禁用</span>
            <span class="tree-actions">
              <el-tooltip content="编辑" placement="top">
                <el-icon class="act" @click.stop="handleCategoryEdit(cat)"><Edit /></el-icon>
              </el-tooltip>
              <el-tooltip content="删除" placement="top">
                <el-icon class="act danger" @click.stop="handleCategoryDelete(cat.id)"><Delete /></el-icon>
              </el-tooltip>
            </span>
          </div>
          <div v-if="filteredCategories.length === 0" class="sidebar-empty">暂无分类</div>
        </div>
      </aside>

      <!-- 右侧：新闻资讯列表 -->
      <section class="course-list">
        <!-- 搜索区 -->
        <el-card class="search-card" shadow="never">
          <div class="card-accent"></div>
          <el-form :model="queryParams" inline>
            <el-form-item label="标题">
              <el-input v-model="queryParams.title" placeholder="请输入标题" clearable style="width: 200px" @keyup.enter="handleQuery" />
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

        <!-- 表格区域 -->
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

        <!-- 分页栏 -->
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
      </section>
    </div>

    <!-- 新增/编辑资讯对话框 -->
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
                    <el-option v-for="c in categoryList" :key="c.id" :label="c.name" :value="c.id" />
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

    <!-- 资讯详情对话框 -->
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

    <!-- 资讯分类新增/编辑对话框 -->
    <NewsCategoryFormDialog
      v-model="categoryDialogVisible"
      :edit-category="categoryEditData"
      @success="handleCategoryDialogSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  getNewsPage, getNewsDetail, createNews, updateNews, deleteNews,
  getNewsCategoryList, deleteNewsCategory
} from '@/api/edu/news'
import { uploadImage } from '@/api/edu/upload'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, FolderOpened, Edit, Delete, Search } from '@element-plus/icons-vue'
import YubDialog from '@/components/YubDialog.vue'
import RichEditor from '@/components/RichEditor.vue'
import NewsCategoryFormDialog from './NewsCategoryFormDialog.vue'

// ===== 右侧：新闻列表 =====
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

const queryParams = reactive({ title: '', status: null, categoryId: null })

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

// ===== 左侧：资讯分类 =====
const categoryList = ref([])
const categoryFilterText = ref('')
const selectedCategoryId = ref(null)
const categoryDialogVisible = ref(false)
const categoryEditData = ref(null)

const filteredCategories = computed(() => {
  const kw = categoryFilterText.value.trim().toLowerCase()
  const list = kw
    ? categoryList.value.filter(c => c.name && c.name.toLowerCase().includes(kw))
    : categoryList.value
  return [...list].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
})

function loadCategories() {
  getNewsCategoryList().then(r => { categoryList.value = r.data || [] }).catch(() => {})
}

function handleCategorySelect(id) {
  selectedCategoryId.value = id
  queryParams.categoryId = id
  pageNum.value = 1
  fetchData()
}

function handleCategoryAdd() {
  categoryEditData.value = null
  categoryDialogVisible.value = true
}

function handleCategoryEdit(cat) {
  categoryEditData.value = cat
  categoryDialogVisible.value = true
}

function handleCategoryDelete(id) {
  ElMessageBox.confirm('确定要删除该分类吗？若存在关联资讯将拒绝删除。', '删除确认', { type: 'warning' })
    .then(() => deleteNewsCategory(id))
    .then(() => {
      ElMessage.success('删除成功')
      if (selectedCategoryId.value === id) {
        selectedCategoryId.value = null
        queryParams.categoryId = null
        fetchData()
      }
      loadCategories()
    })
    .catch(() => {})
}

function handleCategoryDialogSuccess() {
  loadCategories()
}

// ===== 新闻列表数据 =====
function fetchData() {
  loading.value = true
  getNewsPage({
    queryParam: {
      title: queryParams.title || null,
      status: queryParams.status,
      categoryId: queryParams.categoryId || null
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
  queryParams.title = ''; queryParams.status = null; queryParams.categoryId = null
  selectedCategoryId.value = null
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

/* ===== 左侧资讯分类侧边栏（仿课程分类） ===== */
.major-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: calc(100vh - 180px);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
}

.sidebar-title {
  font-weight: 600;
  color: #1a2332;
}

.add-cat-btn {
  padding: 4px 8px;
  font-size: 13px;
}

.sidebar-filter {
  padding: 10px 12px 4px;
}

.sidebar-tree {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 8px;
}

.sidebar-item {
  padding: 10px 16px;
  cursor: pointer;
  color: #475569;
  transition: all 0.2s;
}

.sidebar-item:hover {
  background: #f1f5f9;
  color: var(--el-color-primary);
}

.sidebar-item.active {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: 600;
  border-left: 3px solid var(--el-color-primary);
  padding-left: 13px;
}

.cat-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  color: #334155;
  border-left: 3px solid transparent;
  transition: all 0.2s;
}

.cat-item:hover {
  background: #f1f5f9;
}

.cat-item.active {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: 600;
  border-left-color: var(--el-color-primary);
}

.cat-item.is-disabled {
  color: #94a3b8;
}

.cat-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.tree-badge {
  flex-shrink: 0;
  margin-left: 6px;
  padding: 0 5px;
  font-size: 11px;
  line-height: 16px;
  color: #94a3b8;
  background: #f1f5f9;
  border-radius: 8px;
}

.sidebar-empty {
  padding: 24px 16px;
  text-align: center;
  font-size: 13px;
  color: #cbd5e1;
}

.tree-actions {
  flex-shrink: 0;
  display: none;
  align-items: center;
  gap: 2px;
  margin-left: 6px;
}

.cat-item:hover .tree-actions {
  display: inline-flex;
}

.tree-actions .act {
  padding: 2px;
  border-radius: 4px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
}

.tree-actions .act:hover {
  background: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
}

.tree-actions .act.danger:hover {
  background: var(--el-color-danger-light-8);
  color: var(--el-color-danger);
}

/* ===== 右侧列表 ===== */
.course-list {
  flex: 1;
  padding: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

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
