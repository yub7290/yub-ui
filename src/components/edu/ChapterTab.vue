<template>
  <div class="chapter-tab">
    <!-- 工具栏 -->
    <div class="tab-toolbar">
      <el-button type="primary" size="small" @click="handleAdd(0)">
        <el-icon><Plus /></el-icon>新增章节
      </el-button>
    </div>

    <!-- 章节树表格 -->
    <el-table
      :data="treeData"
      v-loading="loading"
      border
      stripe
      row-key="id"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      style="width:100%"
      :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: 600 }"
      default-expand-all
      size="small"
    >
      <el-table-column prop="name" label="章节名称" min-width="200" />
      <el-table-column prop="status" label="状态" width="60" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="isCompleted" label="完结" width="60" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.isCompleted === 1" type="success" size="small">是</el-tag>
          <el-tag v-else type="info" size="small">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="isFree" label="免费" width="60" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.isFree === 1" type="warning" size="small">是</el-tag>
          <el-tag v-else type="info" size="small">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="isLive" label="直播" width="60" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.isLive === 1" type="danger" size="small">是</el-tag>
          <el-tag v-else type="info" size="small">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleAdd(row.id)">新增子章节</el-button>
          <el-button link type="primary" size="small" @click="handleEdit(row.id)">编辑</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="暂无章节" :image-size="60" />
      </template>
    </el-table>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑章节' : '新增章节'"
      width="700px"
      :before-close="() => dialogVisible = false"
      @open="handleDialogOpen"
      destroy-on-close
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-tabs v-model="activeTab" type="border-card">
          <el-tab-pane label="基本信息" name="basic">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="章节名称" prop="name">
                  <el-input v-model="formData.name" placeholder="请输入章节名称" maxlength="200" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="上级章节">
                  <el-tree-select
                    v-model="formData.parentId"
                    :data="treeData"
                    :props="{ label: 'name', value: 'id', children: 'children' }"
                    placeholder="不选则为顶级章节"
                    clearable
                    check-strictly
                    style="width:100%"
                    :disabled="disableParentSelect"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="状态">
                  <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item>
                  <template #label>
                    完结
                    <el-tooltip content="编辑完成的章节，学员才能学习" placement="top">
                      <el-icon style="margin-left:4px;color:#909399;cursor:help;font-size:14px"><InfoFilled /></el-icon>
                    </el-tooltip>
                  </template>
                  <el-checkbox v-model="formData.isCompleted" :true-value="1" :false-value="0" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item>
                  <template #label>
                    免费
                    <el-tooltip content="允许试学时免费试学" placement="top">
                      <el-icon style="margin-left:4px;color:#909399;cursor:help;font-size:14px"><InfoFilled /></el-icon>
                    </el-tooltip>
                  </template>
                  <el-checkbox v-model="formData.isFree" :true-value="1" :false-value="0" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="图文资料">
              <RichEditor v-model="formData.contentText" />
            </el-form-item>
            <el-form-item>
              <template #label>
                直播
                <el-tooltip content="当前章节作为直播课" placement="top">
                  <el-icon style="margin-left:4px;color:#909399;cursor:help;font-size:14px"><InfoFilled /></el-icon>
                </el-tooltip>
              </template>
              <el-checkbox v-model="formData.isLive" :true-value="1" :false-value="0" />
            </el-form-item>
            <template v-if="formData.isLive === 1">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="开始时间" prop="liveStartTime">
                    <el-date-picker v-model="formData.liveStartTime" type="datetime" placeholder="选择直播开始时间" style="width:100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="直播时长" prop="liveDuration">
                    <el-input-number v-model="formData.liveDuration" :min="0" :max="1440" style="width:100%">
                      <template #suffix>分钟</template>
                    </el-input-number>
                  </el-form-item>
                </el-col>
              </el-row>
            </template>
          </el-tab-pane>

          <el-tab-pane label="关联知识点" name="knowledge">
            <KnowledgePicker v-model="formData.knowledgePointIds" scope="global" />
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { getChapterTree, getChapterDetail, createChapter, updateChapter, deleteChapter, getChapterKnowledgeIds, saveChapterKnowledge } from '@/api/edu/chapter'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, InfoFilled } from '@element-plus/icons-vue'
import RichEditor from '@/components/RichEditor.vue'
import KnowledgePicker from '@/components/edu/KnowledgePicker.vue'

const props = defineProps({
  courseId: { type: Number, required: true }
})

const emit = defineEmits(['change'])

const loading = ref(false)
const treeData = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const editId = ref(null)
const formRef = ref(null)
const disableParentSelect = ref(false)
const activeTab = ref('basic')
const knowledgeLoadFailed = ref(false)

const formData = reactive({
  name: '',
  parentId: null,
  status: 1,
  isCompleted: 0,
  isFree: 0,
  contentText: '',
  isLive: 0,
  liveStartTime: null,
  liveDuration: null,
  knowledgePointIds: []
})

const formRules = {
  name: [{ required: true, message: '请输入章节名称', trigger: 'blur' }]
}

// 加载章节树
async function loadTree() {
  if (!props.courseId) return
  loading.value = true
  try {
    const res = await getChapterTree(props.courseId)
    treeData.value = res.data || []
  } catch {
    treeData.value = []
  } finally {
    loading.value = false
  }
}

watch(() => props.courseId, () => loadTree(), { immediate: true })

function handleAdd(parentId) {
  editId.value = null
  isEdit.value = false
  resetForm()
  formData.parentId = parentId || null
  dialogVisible.value = true
}

async function handleEdit(id) {
  editId.value = id
  isEdit.value = true
  try {
    const res = await getChapterDetail(id)
    const data = res.data
    formData.name = data.name || ''
    formData.parentId = data.parentId || null
    formData.status = data.status ?? 1
    formData.isCompleted = data.isCompleted ?? 0
    formData.isFree = data.isFree ?? 0
    formData.contentText = data.contentText || ''
    formData.isLive = data.isLive ?? 0
    formData.liveStartTime = data.liveStartTime || null
    formData.liveDuration = data.liveDuration || null
    disableParentSelect.value = true

    // 加载已关联知识点
    try {
      const kidRes = await getChapterKnowledgeIds(id)
      formData.knowledgePointIds = kidRes.data || []
      knowledgeLoadFailed.value = false
    } catch {
      knowledgeLoadFailed.value = true
      formData.knowledgePointIds = []
      ElMessage.warning('知识点关联加载失败，保存时不会修改已有关联')
    }

    dialogVisible.value = true
  } catch {
    ElMessage.error('获取章节详情失败')
  }
}

function handleDialogOpen() {
  activeTab.value = 'basic'
  knowledgeLoadFailed.value = false
  if (!isEdit.value) {
    disableParentSelect.value = false
  }
}

function resetForm() {
  formData.name = ''
  formData.parentId = null
  formData.status = 1
  formData.isCompleted = 0
  formData.isFree = 0
  formData.contentText = ''
  formData.isLive = 0
  formData.liveStartTime = null
  formData.liveDuration = null
  formData.knowledgePointIds = []
  knowledgeLoadFailed.value = false
  isEdit.value = false
  disableParentSelect.value = false
  if (formRef.value) formRef.value.resetFields()
}

async function handleSubmit() {
  if (!formRef.value) return
  try { await formRef.value.validate() } catch { return }

  submitting.value = true
  try {
    const payload = {
      courseId: props.courseId,
      name: formData.name,
      parentId: formData.parentId || 0,
      status: formData.status,
      isCompleted: formData.isCompleted,
      isFree: formData.isFree,
      contentText: formData.contentText || null,
      isLive: formData.isLive,
      liveStartTime: formData.liveStartTime,
      liveDuration: formData.liveDuration
    }

    let chapterId
    if (isEdit.value) {
      chapterId = editId.value
      payload.id = chapterId
      await updateChapter(payload)
      ElMessage.success('编辑成功')
    } else {
      const res = await createChapter(payload)
      chapterId = res.data
      ElMessage.success('新增成功')
    }

    // 保存章节关联知识点（加载失败时不修改，避免清空已有关联）
    if (!knowledgeLoadFailed.value) {
      try {
        await saveChapterKnowledge(chapterId, formData.knowledgePointIds)
      } catch {
        ElMessage.warning('章节已保存，但知识点关联保存失败')
      }
    }

    dialogVisible.value = false
    await loadTree()
    emit('change')
  } catch {
    // 错误已处理
  } finally {
    submitting.value = false
  }
}

async function handleDelete(id) {
  try {
    await ElMessageBox.confirm('确定要删除该章节吗？', '删除确认', {
      type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消'
    })
  } catch {
    // 取消操作
    return
  }
  try {
    await deleteChapter(id)
    ElMessage.success('删除成功')
    await loadTree()
    emit('change')
  } catch {
    ElMessage.error('删除失败')
  }
}
</script>

<style scoped>
.chapter-tab { min-height: 300px; }
.tab-toolbar { margin-bottom: 12px; }
</style>
