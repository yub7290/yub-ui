<template>
  <div class="knowledge-tab">
    <el-row :gutter="12">
      <!-- 左侧分类树 -->
      <el-col :span="8">
        <div class="kt-panel">
          <div class="kt-panel-header">
            <span>分类</span>
            <el-button size="small" type="primary" text @click="showCatDialog(null)">
              <el-icon><Plus /></el-icon>
            </el-button>
          </div>
          <el-tree
            ref="treeRef"
            :data="categoryTree"
            :props="{ label: 'name', children: 'children' }"
            node-key="id"
            highlight-current
            :expand-on-click-node="false"
            @node-click="onCategoryClick"
            class="kt-tree"
          >
            <template #default="{ node, data }">
              <span class="kt-node">
                <span class="kt-node-label">{{ data.name }}</span>
                <span class="kt-node-actions">
                  <el-icon size="12" @click.stop="showCatDialog(data.id)" title="编辑"><Edit /></el-icon>
                  <el-icon size="12" @click.stop="confirmDeleteCat(data.id)" title="删除" style="color:#f56c6c"><Delete /></el-icon>
                </span>
              </span>
            </template>
          </el-tree>
        </div>
      </el-col>

      <!-- 右侧知识点列表 -->
      <el-col :span="16">
        <div class="kt-panel">
          <div class="kt-panel-header">
            <span>知识点</span>
            <el-button size="small" type="primary" :disabled="!canAddKnowledge" @click="showKpDialog(null)">
              <el-icon><Plus /></el-icon>新增
            </el-button>
          </div>
          <div class="kt-list">
            <div v-for="kp in kpList" :key="kp.id" class="kt-list-item">
              <div class="kt-item-info">
                <span class="kt-item-title">{{ kp.title }}</span>
                <el-tag v-if="kp.status === 1" size="small" type="success">启用</el-tag>
                <el-tag v-else size="small" type="info">停用</el-tag>
              </div>
              <div class="kt-item-actions">
                <el-button text size="small" @click="showKpDialog(kp.id)">编辑</el-button>
                <el-button text size="small" type="danger" @click="confirmDeleteKp(kp.id)">删除</el-button>
              </div>
            </div>
            <el-empty v-if="kpList.length === 0" :description="emptyText" :image-size="50" />
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 分类编辑弹窗 -->
    <el-dialog v-model="catDialogVisible" :title="editingCatId ? '编辑分类' : '新增分类'" width="400px" destroy-on-close>
      <el-form ref="catFormRef" :model="catForm" :rules="catRules" label-width="80px" size="small">
        <el-form-item label="上级分类">
          <el-tree-select v-model="catForm.parentId" :data="categoryTree" :props="{ label: 'name', value: 'id' }"
            placeholder="顶级分类" clearable check-strictly style="width:100%" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="catForm.name" maxlength="100" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="catForm.description" type="textarea" :rows="2" maxlength="500" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" @click="catDialogVisible = false">取消</el-button>
        <el-button size="small" type="primary" :loading="catSubmitting" @click="submitCat">确定</el-button>
      </template>
    </el-dialog>

    <!-- 知识点编辑弹窗（课程模式下增加分类选择） -->
    <el-dialog v-model="kpDialogVisible" :title="editingKpId ? '编辑知识点' : '新增知识点'" width="650px" destroy-on-close>
      <el-form ref="kpFormRef" :model="kpForm" :rules="kpRules" label-width="70px" size="small">
        <el-form-item label="标题" prop="title">
          <el-input v-model="kpForm.title" maxlength="200" />
        </el-form-item>
        <el-form-item v-if="!!props.courseId" label="分类" prop="categoryId">
          <el-tree-select v-model="kpForm.categoryId" :data="categoryTree"
            :props="{ label: 'name', value: 'id' }" placeholder="请选择分类" clearable check-strictly style="width:100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="kpForm.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="内容">
          <RichEditor v-model="kpForm.content" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" @click="kpDialogVisible = false">取消</el-button>
        <el-button size="small" type="primary" :loading="kpSubmitting" @click="submitKp">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getCategoryTree, getCategoryDetail, createCategory, updateCategory, deleteCategory } from '@/api/edu/knowledgeCategory'
import { getKnowledgeListByCategory, getKnowledgeListByCourse, getKnowledgeDetail, createKnowledge, updateKnowledge, deleteKnowledge } from '@/api/edu/knowledgePoint'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import RichEditor from '@/components/RichEditor.vue'

const props = defineProps({
  courseId: { type: Number, default: null }
})

// ====== 分类树 ======
const categoryTree = ref([])
const selectedCategoryId = ref(null)

async function loadCategoryTree() {
  try {
    const res = await getCategoryTree()
    categoryTree.value = res.data || []
  } catch { categoryTree.value = [] }
}

function onCategoryClick(data) {
  selectedCategoryId.value = data.id
  loadKpList()
}

// ====== 知识点列表 ======
const kpList = ref([])

const emptyText = computed(() => {
  if (!selectedCategoryId.value && !props.courseId) {
    return '请先选择分类'
  }
  return '暂无知识点'
})

const canAddKnowledge = computed(() => {
  // 课程模式下，不需要选择分类即可新增
  if (props.courseId) return true
  // 分类模式下，需要选中分类才能新增
  return !!selectedCategoryId.value
})

async function loadKpList() {
  try {
    if (props.courseId) {
      // 课程知识点模式：调用按课程查询接口
      const params = {}
      if (selectedCategoryId.value) {
        params.categoryId = selectedCategoryId.value
      }
      const res = await getKnowledgeListByCourse(props.courseId, params)
      kpList.value = res.data || []
    } else if (selectedCategoryId.value) {
      // 纯分类模式（原逻辑）
      const res = await getKnowledgeListByCategory(selectedCategoryId.value)
      kpList.value = res.data || []
    } else {
      kpList.value = []
    }
  } catch { kpList.value = [] }
}

// 当 courseId 变化时重置并重新加载
watch(() => props.courseId, () => {
  selectedCategoryId.value = null
  loadKpList()
})

// ====== 分类 CRUD ======
const catDialogVisible = ref(false)
const editingCatId = ref(null)
const catSubmitting = ref(false)
const catFormRef = ref(null)
const catForm = ref({ parentId: null, name: '', description: '' })
const catRules = { name: [{ required: true, message: '请输入名称', trigger: 'blur' }] }

async function showCatDialog(id) {
  editingCatId.value = id
  if (id) {
    const res = await getCategoryDetail(id)
    const d = res.data
    catForm.value = { parentId: d.parentId || null, name: d.name, description: d.description || '' }
  } else {
    catForm.value = { parentId: null, name: '', description: '' }
  }
  catDialogVisible.value = true
}

async function submitCat() {
  if (!catFormRef.value) return
  try { await catFormRef.value.validate() } catch { return }
  catSubmitting.value = true
  try {
    if (editingCatId.value) {
      await updateCategory(editingCatId.value, catForm.value)
      ElMessage.success('编辑成功')
    } else {
      await createCategory(catForm.value)
      ElMessage.success('新增成功')
    }
    catDialogVisible.value = false
    await loadCategoryTree()
  } catch { /* 错误已处理 */ } finally { catSubmitting.value = false }
}

async function confirmDeleteCat(id) {
  try {
    await ElMessageBox.confirm('确定删除该分类？', '确认', { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' })
    await deleteCategory(id)
    ElMessage.success('删除成功')
    await loadCategoryTree()
  } catch { /* 取消 */ }
}

// ====== 知识点 CRUD ======
const kpDialogVisible = ref(false)
const editingKpId = ref(null)
const kpSubmitting = ref(false)
const kpFormRef = ref(null)
const kpForm = ref({ title: '', content: '', status: 1, categoryId: null })
const kpRules = { title: [{ required: true, message: '请输入标题', trigger: 'blur' }] }

async function showKpDialog(id) {
  editingKpId.value = id
  if (id) {
    try {
      const res = await getKnowledgeDetail(id)
      const d = res.data
      kpForm.value = {
        title: d.title,
        content: d.content || '',
        status: d.status ?? 1,
        categoryId: d.categoryId || null
      }
      kpDialogVisible.value = true
    } catch { /* 错误已处理 */ }
  } else {
    // 新增时，课程模式下默认使用当前选中分类
    kpForm.value = {
      title: '',
      content: '',
      status: 1,
      categoryId: selectedCategoryId.value
    }
    kpDialogVisible.value = true
  }
}

async function submitKp() {
  if (!kpFormRef.value) return
  try { await kpFormRef.value.validate() } catch { return }
  kpSubmitting.value = true
  try {
    const payload = { ...kpForm.value }
    if (props.courseId) {
      // 课程模式下带上 courseId，分类来自弹窗选择
      payload.courseId = props.courseId
    } else {
      // 分类模式下，分类来自当前选中的树节点
      payload.categoryId = selectedCategoryId.value
    }
    // 删除空 categoryId（非课程模式时 categoryId 由 selectedCategoryId 提供）
    if (!payload.categoryId) delete payload.categoryId

    if (editingKpId.value) {
      payload.id = editingKpId.value
      await updateKnowledge(payload)
      ElMessage.success('编辑成功')
    } else {
      await createKnowledge(payload)
      ElMessage.success('新增成功')
    }
    kpDialogVisible.value = false
    await loadKpList()
  } catch { /* 错误已处理 */ } finally { kpSubmitting.value = false }
}

async function confirmDeleteKp(id) {
  try {
    await ElMessageBox.confirm('确定删除该知识点？', '确认', { type: 'warning' })
    await deleteKnowledge(id)
    ElMessage.success('删除成功')
    await loadKpList()
  } catch { /* 取消 */ }
}

onMounted(() => { loadCategoryTree() })
</script>

<style scoped>
.knowledge-tab { min-height: 300px; }
.kt-panel {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}
.kt-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e4e7ed;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}
.kt-tree {
  padding: 4px 0;
  max-height: 350px;
  overflow-y: auto;
}
.kt-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-right: 4px;
}
.kt-node-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.kt-node-actions { display: none; gap: 2px; }
.el-tree-node__content:hover .kt-node-actions { display: inline-flex; }
.kt-node-actions .el-icon { cursor: pointer; color: #909399; }
.kt-node-actions .el-icon:hover { color: #38daa6; }
.kt-list { max-height: 350px; overflow-y: auto; }
.kt-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
}
.kt-list-item:last-child { border-bottom: none; }
.kt-item-info { display: flex; align-items: center; gap: 8px; flex: 1; }
.kt-item-title { font-size: 13px; }
.kt-item-actions { flex-shrink: 0; }
</style>
