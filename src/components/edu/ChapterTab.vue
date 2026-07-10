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
    <YubDialog
      :model-value="dialogVisible"
      :title="isEdit ? '编辑章节' : '新增章节'"
      width="700px"
      destroy-on-close
      :before-close="() => dialogVisible = false"
      @update:model-value="dialogVisible = $event"
      @open="handleDialogOpen"
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
          </el-tab-pane>

          <!-- 视频 -->
          <el-tab-pane label="视频" name="video">
            <div class="chapter-video-field">
                <div v-if="videoUploading" class="upload-progress-box">
                  <el-icon class="upload-spinner"><Loading /></el-icon>
                  <div class="upload-file-name">{{ uploadFileName }}</div>
                  <el-progress :percentage="uploadProgress" :stroke-width="10" />
                  <div class="upload-percent-text">上传进度 {{ uploadProgress }}%</div>
                </div>
                <el-upload
                  drag
                  multiple
                  :show-file-list="false"
                  :before-upload="handleVideoUpload"
                  accept="video/*"
                  :disabled="videoUploading"
                >
                  <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                  <div class="el-upload__text">将视频拖到此处，或<em>点击上传</em></div>
                  <template #tip>
                    <div class="el-upload__tip">可上传多个视频，每个视频不超过 500MB，仅用于 APP 章节学习播放</div>
                  </template>
                </el-upload>
                <div v-if="formData.videoList.length" class="video-list">
                  <div v-for="(video, index) in formData.videoList" :key="video.videoUrl || index" class="video-item">
                    <div class="video-main">
                      <el-icon><VideoPlay /></el-icon>
                      <span class="video-name">{{ video.videoName || `视频${index + 1}` }}</span>
                      <span class="video-size" v-if="video.fileSize">{{ formatFileSize(video.fileSize) }}</span>
                    </div>
                    <el-button link type="danger" size="small" @click="removeVideo(index)">移除</el-button>
                  </div>
                </div>
            </div>
          </el-tab-pane>

          <!-- 附件 -->
          <el-tab-pane label="附件" name="attachment">
            <div class="chapter-video-field">
                <div v-if="attachmentUploading" class="upload-progress-box">
                  <el-icon class="upload-spinner"><Loading /></el-icon>
                  <div class="upload-file-name">{{ attachmentUploadFileName }}</div>
                  <el-progress :percentage="attachmentUploadProgress" :stroke-width="10" />
                  <div class="upload-percent-text">上传进度 {{ attachmentUploadProgress }}%</div>
                </div>
                <el-upload
                  drag
                  multiple
                  :show-file-list="false"
                  :before-upload="handleAttachmentUpload"
                  :disabled="attachmentUploading"
                >
                  <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                  <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                  <template #tip>
                    <div class="el-upload__tip">支持 doc/docx/pdf/xls/xlsx/ppt/pptx/zip/rar/7z/txt 等文件，单个不超过 100MB</div>
                  </template>
                </el-upload>
                <div v-if="formData.attachmentList.length" class="video-list">
                  <div v-for="(file, index) in formData.attachmentList" :key="file.fileUrl || index" class="video-item">
                    <div class="video-main">
                      <el-icon><Document /></el-icon>
                      <span class="video-name">{{ file.fileName }}</span>
                      <span class="video-size" v-if="file.fileSize">{{ formatFileSize(file.fileSize) }}</span>
                    </div>
                    <el-button link type="danger" size="small" @click="removeAttachment(index)">移除</el-button>
                  </div>
                </div>
            </div>
          </el-tab-pane>

          <!-- 直播 -->
          <el-tab-pane label="直播" name="live">
            <el-form-item label="开启直播">
              <template #label>
                开启直播
                <el-tooltip content="当前竞节作为直播课" placement="top">
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
    </YubDialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { getChapterTree, getChapterDetail, createChapter, updateChapter, deleteChapter, getChapterKnowledgeIds, saveChapterKnowledge } from '@/api/edu/chapter'
import { uploadVideo, uploadFile } from '@/api/edu/upload'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, InfoFilled, UploadFilled, VideoPlay, Loading, Document } from '@element-plus/icons-vue'
import RichEditor from '@/components/RichEditor.vue'
import KnowledgePicker from '@/components/edu/KnowledgePicker.vue'
import YubDialog from '@/components/YubDialog.vue'

const props = defineProps({
  courseId: { type: Number, required: true }
})

const emit = defineEmits(['change'])

const loading = ref(false)
const treeData = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const videoUploading = ref(false)
const uploadProgress = ref(0)
const uploadFileName = ref('')
const attachmentUploading = ref(false)
const attachmentUploadProgress = ref(0)
const attachmentUploadFileName = ref('')
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
  knowledgePointIds: [],
  videoList: [],
  attachmentList: []
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
    formData.videoList = (data.videoList || []).map((item, index) => ({
      videoName: item.videoName || `视频${index + 1}`,
      videoUrl: item.videoUrl,
      fileSize: item.fileSize || null
    })).filter(item => item.videoUrl)
    formData.attachmentList = (data.attachmentList || []).map(item => ({
      fileName: item.fileName,
      fileUrl: item.fileUrl,
      fileSize: item.fileSize || null,
      fileType: item.fileType || ''
    })).filter(item => item.fileUrl)
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
  formData.videoList = []
  formData.attachmentList = []
  formData.knowledgePointIds = []
  knowledgeLoadFailed.value = false
  isEdit.value = false
  disableParentSelect.value = false
  if (formRef.value) formRef.value.resetFields()
}

async function handleVideoUpload(file) {
  const maxSize = 500 * 1024 * 1024
  if (!file.type?.startsWith('video/')) {
    ElMessage.error('只能上传视频文件')
    return false
  }
  if (file.size > maxSize) {
    ElMessage.error('单个视频不能超过 500MB')
    return false
  }
  videoUploading.value = true
  uploadProgress.value = 0
  uploadFileName.value = file.name
  try {
    const res = await uploadVideo(file, 'edu/chapter/videos', (percent) => {
      uploadProgress.value = percent
    })
    formData.videoList.push({
      videoName: file.name,
      videoUrl: res.data,
      fileSize: file.size
    })
    ElMessage.success('视频上传成功')
  } catch {
    // request interceptor already shows the error message
  } finally {
    videoUploading.value = false
    uploadProgress.value = 0
    uploadFileName.value = ''
  }
  return false
}

function removeVideo(index) {
  formData.videoList.splice(index, 1)
}

async function handleAttachmentUpload(file) {
  const maxSize = 100 * 1024 * 1024
  if (file.size > maxSize) {
    ElMessage.error('单个附件不能超过 100MB')
    return false
  }
  attachmentUploading.value = true
  attachmentUploadProgress.value = 0
  attachmentUploadFileName.value = file.name
  try {
    const res = await uploadFile(file, 'edu/chapter/attachments', (percent) => {
      attachmentUploadProgress.value = percent
    })
    const ext = file.name.split('.').pop() || ''
    formData.attachmentList.push({
      fileName: file.name,
      fileUrl: res.data,
      fileSize: file.size,
      fileType: ext.toLowerCase()
    })
    ElMessage.success('附件上传成功')
  } catch {
    // request interceptor already shows the error message
  } finally {
    attachmentUploading.value = false
    attachmentUploadProgress.value = 0
    attachmentUploadFileName.value = ''
  }
  return false
}

function removeAttachment(index) {
  formData.attachmentList.splice(index, 1)
}

function formatFileSize(size) {
  if (!size) return ''
  if (size < 1024 * 1024) return `${Math.round(size / 1024)}KB`
  return `${(size / 1024 / 1024).toFixed(1)}MB`
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
      liveDuration: formData.liveDuration,
      videoList: formData.videoList.map((item, index) => ({
        videoName: item.videoName || `视频${index + 1}`,
        videoUrl: item.videoUrl,
        fileSize: item.fileSize || null,
        sort: index
      })),
      attachmentList: formData.attachmentList.map((item, index) => ({
        fileName: item.fileName,
        fileUrl: item.fileUrl,
        fileSize: item.fileSize || null,
        fileType: item.fileType || '',
        sort: index
      }))
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
.chapter-video-field { width: 100%; }
.video-list { margin-top: 10px; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; }
.video-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; border-bottom: 1px solid #edf0f5; background: #fff; }
.video-item:last-child { border-bottom: none; }
.video-main { display: flex; align-items: center; gap: 8px; min-width: 0; }
.video-name { max-width: 420px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #303133; font-size: 13px; }
.upload-progress-box { background: #ecf5ff; border: 1px solid #d9ecff; border-radius: 4px; padding: 16px; margin-bottom: 10px; text-align: center; }
.upload-spinner { font-size: 32px; color: #409eff; margin-bottom: 8px; animation: spin 1s linear infinite; }
.upload-progress-detail { margin-top: 8px; }
.upload-file-name { font-size: 13px; color: #303133; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.upload-percent-text { font-size: 12px; color: #909399; margin-top: 4px; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.video-size { color: #909399; font-size: 12px; }
</style>
