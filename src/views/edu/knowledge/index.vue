<template>
  <div class="knowledge-page">
    <!-- 搜索区 -->
    <el-card class="search-card" shadow="never">
      <div class="card-accent"></div>
      <el-form inline>
        <el-form-item label="知识点标题">
          <el-input v-model="searchForm.kpTitle" placeholder="请输入知识点标题" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 主体内容区 -->
    <div class="split-layout">
      <!-- 左侧：分类树 -->
      <div class="major-sidebar">
        <div class="sidebar-title">知识点分类</div>
        <div class="sidebar-item" :class="{ active: !selectedCategoryId }" @click="onCategoryClick({ id: null, name: '' })">
          全部知识点
        </div>
        <el-tree ref="treeRef" :data="categoryTree" :props="{ label: 'name', children: 'children' }"
          node-key="id" highlight-current :expand-on-click-node="false" :filter-node-method="filterCatNode"
          @node-click="onCategoryClick" class="cat-tree">
          <template #default="{ data }">
            <span class="tree-node">
              <span class="node-label">{{ data.name }}</span>
              <span class="node-actions">
                <el-icon size="14" @click.stop="showCategoryDialog(data.id)"><Edit /></el-icon>
                <el-icon size="14" @click.stop="handleDeleteCategory(data.id)" style="color:#f56c6c"><Delete /></el-icon>
              </span>
            </span>
          </template>
        </el-tree>
      </div>

      <!-- 右侧：知识点列表 -->
      <div class="course-list">
        <div class="table-wrapper">
          <div class="table-header">
            <div class="table-title">
              知识点列表
              <span v-if="selectedCategoryName" class="title-sub">— {{ selectedCategoryName }}</span>
            </div>
            <div class="table-actions">
              <el-button type="primary" :disabled="!selectedCategoryId" @click="showKnowledgeDialog(null)">
                <el-icon><Plus /></el-icon>新增
              </el-button>
            </div>
          </div>

          <el-table :data="tableData" v-loading="loading" border stripe style="width:100%"
            :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: 600 }">
            <el-table-column type="index" label="#" width="50" align="center" />
            <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
            <el-table-column prop="status" label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-switch :model-value="row.status === 1" size="small" disabled />
              </template>
            </el-table-column>
            <el-table-column label="创建时间" width="170">
              <template #default="{ row }">{{ row.createTime || '-' }}</template>
            </el-table-column>
            <el-table-column label="操作" width="180" align="center" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="showKnowledgeDialog(row.id)">编辑</el-button>
                <el-button link type="danger" size="small" @click="handleDeleteKnowledge(row.id)">删除</el-button>
              </template>
            </el-table-column>
            <template #empty>
              <div class="empty-state">
                <el-icon :size="56" color="#cbd5e1"><FolderOpened /></el-icon>
                <p>{{ selectedCategoryId ? '暂无知识点' : '请先在左侧选择分类' }}</p>
              </div>
            </template>
          </el-table>
        </div>

        <!-- 分页栏 -->
        <div class="pagination-bar" v-if="total > 0">
          <div class="pagination-left">
            <span class="total-text">共 <b>{{ total }}</b> 条数据</span>
          </div>
          <div class="pagination-right">
            <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :total="total"
              :page-sizes="[10, 20, 50]" :pager-count="5" layout="sizes, prev, pager, next, jumper"
              background @size-change="fetchData" @current-change="fetchData" />
          </div>
        </div>
      </div>
    </div>

    <!-- 分类编辑弹窗 -->
    <YubDialog v-model="catDialogVisible" :title="editingCatId ? '编辑分类' : '新增分类'" width="450px"
      destroy-on-close>
      <el-form ref="catFormRef" :model="catForm" :rules="catRules" label-width="80px">
        <el-form-item label="上级分类">
          <el-tree-select v-model="catForm.parentId" :data="categoryTree" :props="{ label: 'name', value: 'id' }"
            placeholder="不选则为顶级分类" clearable check-strictly style="width:100%" />
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="catForm.name" placeholder="请输入分类名称" maxlength="100" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="catForm.description" type="textarea" :rows="2" placeholder="可选" maxlength="500" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="catForm.sort" :min="0" style="width:100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="catDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="catSubmitting" @click="submitCategory">确定</el-button>
      </template>
    </YubDialog>

    <!-- 知识点编辑弹窗 -->
    <YubDialog v-model="kpDialogVisible" :title="editingKpId ? '编辑知识点' : '新增知识点'" width="750px"
      destroy-on-close @open="onKpDialogOpen">
      <el-form ref="kpFormRef" :model="kpForm" :rules="kpRules" label-width="80px">
        <el-form-item label="分类" prop="categoryId">
          <el-tree-select v-model="kpForm.categoryId" :data="categoryTree" :props="{ label: 'name', value: 'id' }"
            placeholder="请选择所属分类" clearable check-strictly style="width:100%" />
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="kpForm.title" placeholder="请输入知识点标题" maxlength="200" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="kpForm.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="内容">
          <RichEditor v-model="kpForm.content" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="kpDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="kpSubmitting" @click="submitKnowledge">确定</el-button>
      </template>
    </YubDialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { getCategoryTree, getCategoryDetail, createCategory, updateCategory, deleteCategory } from '@/api/edu/knowledgeCategory'
import { getKnowledgePage, getKnowledgeDetail, createKnowledge, updateKnowledge, deleteKnowledge } from '@/api/edu/knowledgePoint'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, FolderOpened, Search } from '@element-plus/icons-vue'
import YubDialog from '@/components/YubDialog.vue'
import RichEditor from '@/components/RichEditor.vue'

const catSearch = ref('')
const treeRef = ref(null)
watch(catSearch, (val) => { treeRef.value?.filter(val) })
function filterCatNode(value, data) {
  if (!value) return true
  return data.name.toLowerCase().includes(value.toLowerCase())
}

const searchForm = reactive({ kpTitle: '' })
function handleQuery() { pageNum.value = 1; fetchData() }
function handleReset() { searchForm.kpTitle = ''; pageNum.value = 1; fetchData() }

const categoryTree = ref([])
const selectedCategoryId = ref(null)
const selectedCategoryName = ref('')

async function loadCategoryTree() {
  try { const res = await getCategoryTree(); categoryTree.value = res.data || [] }
  catch { categoryTree.value = [] }
}

function onCategoryClick(data) {
  selectedCategoryId.value = data.id; selectedCategoryName.value = data.name
  pageNum.value = 1; fetchData()
}

const catDialogVisible = ref(false)
const editingCatId = ref(null)
const catSubmitting = ref(false)
const catFormRef = ref(null)
const catForm = reactive({ parentId: null, name: '', description: '', sort: 0 })
const catRules = { name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }] }

async function showCategoryDialog(id) {
  editingCatId.value = id
  if (id) {
    const res = await getCategoryDetail(id); const d = res.data
    Object.assign(catForm, { parentId: d.parentId || null, name: d.name, description: d.description || '', sort: d.sort || 0 })
  } else { Object.assign(catForm, { parentId: null, name: '', description: '', sort: 0 }) }
  catDialogVisible.value = true
}

async function submitCategory() {
  if (!catFormRef.value) return
  try { await catFormRef.value.validate() } catch { return }
  catSubmitting.value = true
  try {
    if (editingCatId.value) { await updateCategory(editingCatId.value, catForm); ElMessage.success('编辑成功') }
    else { await createCategory(catForm); ElMessage.success('新增成功') }
    catDialogVisible.value = false; await loadCategoryTree()
  } catch { /* 错误已处理 */ } finally { catSubmitting.value = false }
}

async function handleDeleteCategory(id) {
  try {
    await ElMessageBox.confirm('确定要删除该分类吗？', '删除确认', { type: 'warning' })
    await deleteCategory(id); ElMessage.success('删除成功'); await loadCategoryTree()
  } catch { /* 取消 */ }
}

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

async function fetchData() {
  loading.value = true
  try {
    const res = await getKnowledgePage({
      queryParam: { categoryId: selectedCategoryId.value, title: searchForm.kpTitle || null },
      pageParam: { pageNum: pageNum.value, pageSize: pageSize.value }
    })
    const d = res.data; tableData.value = d.records || []; total.value = d.total || 0
  } catch { tableData.value = []; total.value = 0 }
  finally { loading.value = false }
}

const kpDialogVisible = ref(false)
const editingKpId = ref(null)
const kpSubmitting = ref(false)
const kpFormRef = ref(null)
const kpForm = reactive({ categoryId: null, title: '', content: '', status: 1 })
const kpRules = {
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }]
}

function onKpDialogOpen() {
  if (!editingKpId.value && selectedCategoryId.value) kpForm.categoryId = selectedCategoryId.value
}

async function showKnowledgeDialog(id) {
  editingKpId.value = id
  if (id) {
    const res = await getKnowledgeDetail(id); const d = res.data
    Object.assign(kpForm, { categoryId: d.categoryId, title: d.title, content: d.content || '', status: d.status ?? 1 })
  } else {
    Object.assign(kpForm, { categoryId: selectedCategoryId.value, title: '', content: '', status: 1 })
  }
  kpDialogVisible.value = true
}

async function submitKnowledge() {
  if (!kpFormRef.value) return
  try { await kpFormRef.value.validate() } catch { return }
  kpSubmitting.value = true
  try {
    if (editingKpId.value) { await updateKnowledge({ id: editingKpId.value, ...kpForm }); ElMessage.success('编辑成功') }
    else { await createKnowledge(kpForm); ElMessage.success('新增成功') }
    kpDialogVisible.value = false; await fetchData()
  } catch { /* 错误已处理 */ } finally { kpSubmitting.value = false }
}

async function handleDeleteKnowledge(id) {
  try {
    await ElMessageBox.confirm('确定要删除该知识点吗？', '删除确认', { type: 'warning' })
    await deleteKnowledge(id); ElMessage.success('删除成功'); fetchData()
  } catch { /* 取消 */ }
}

onMounted(() => { loadCategoryTree() })
</script>

<style scoped>
@import '@/assets/css/user-management.css';

/* 左侧面板 — 与课程页面 major-sidebar 完全一致 */
.major-sidebar {
  width: 260px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-title {
  padding: 16px;
  font-weight: 600;
  color: #1a2332;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
}

.sidebar-item {
  padding: 12px 16px;
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

/* 右侧面板 — 与课程页面 course-list 完全一致 */
.course-list {
  flex: 1;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

/* 标题副文本 */
.title-sub {
  font-weight: 400;
  font-size: 13px;
  color: #94a3b8;
}

/* 分类树 */
.cat-tree {
  padding: 4px 0;
  flex: 1;
  overflow-y: auto;
}

.tree-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-right: 4px;
}

.node-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

.node-actions {
  display: none;
  gap: 2px;
  flex-shrink: 0;
}

.node-actions .el-icon { cursor: pointer; color: #909399; }
.node-actions .el-icon:hover { color: var(--el-color-primary); }
.el-tree-node__content:hover .node-actions { display: inline-flex; }
</style>
