<template>
  <div class="page-container">
    <el-card class="search-card" shadow="never">
      <div class="card-accent"></div>
      <el-form :model="queryParams" inline>
        <el-form-item label="标题">
          <el-input v-model="queryParams.title" placeholder="请输入标题" clearable style="width: 250px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
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
        <div class="table-title">分享内容管理</div>
        <div class="table-actions">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新增分享内容
          </el-button>
        </div>
      </div>

      <el-table :data="tableData" v-loading="loading" border stripe style="width: 100%"
        :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: 600 }">
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="description" label="描述" min-width="250" show-overflow-tooltip />
        <el-table-column label="图片" width="120" align="center">
          <template #default="{ row }">
            <el-image v-if="row.imageUrl" :src="row.imageUrl" :preview-src-list="[row.imageUrl]"
              class="table-image" fit="cover" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
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

    <YubDialog v-model="dialogVisible" :title="isEdit ? '编辑分享内容' : '新增分享内容'" width="600px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="90px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入分享标题" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入分享描述" />
        </el-form-item>
        <el-form-item label="图片" prop="imageUrl">
          <div class="upload-area">
            <el-image v-if="formData.imageUrl" :src="formData.imageUrl"
              class="upload-preview" fit="cover" />
            <el-upload
              v-else
              :show-file-list="false"
              :http-request="handleUploadRequest"
              :before-upload="beforeUpload"
              class="upload-btn"
            >
              <el-icon :size="32" color="#909399"><Plus /></el-icon>
              <span>点击上传图片</span>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="formData.content" type="textarea" :rows="5" placeholder="请输入分享内容" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </YubDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Plus, FolderOpened } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import YubDialog from '@/components/YubDialog.vue'
import { http } from '@/utils/http'
import { uploadImage } from '@/api/edu/upload'

const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

const queryParams = reactive({
  title: '',
  status: undefined,
})

const formData = reactive({
  id: undefined,
  title: '',
  description: '',
  imageUrl: '',
  content: '',
  status: 1,
  sort: 0,
})

const formRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
}

async function fetchData() {
  loading.value = true
  try {
    const res = await http.get('/edu/share-content/page', {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      title: queryParams.title || undefined,
      status: queryParams.status,
    })
    tableData.value = res.data?.records || []
    total.value = res.data?.total || 0
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
  queryParams.title = ''
  queryParams.status = undefined
  pageNum.value = 1
  fetchData()
}

function handleAdd() {
  isEdit.value = false
  formData.id = undefined
  formData.title = ''
  formData.description = ''
  formData.imageUrl = ''
  formData.content = ''
  formData.status = 1
  formData.sort = 0
  dialogVisible.value = true
}

function handleEdit(row: any) {
  isEdit.value = true
  formData.id = row.id
  formData.title = row.title
  formData.description = row.description
  formData.imageUrl = row.imageUrl
  formData.content = row.content
  formData.status = row.status
  formData.sort = row.sort
  dialogVisible.value = true
}

function handleDelete(id: number) {
  ElMessageBox.confirm('确定删除该分享内容吗？', '确认删除', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  })
    .then(async () => {
      await http.delete(`/edu/share-content/${id}`)
      ElMessage.success('删除成功')
      fetchData()
    })
    .catch(() => {})
}

function beforeUpload(file: File) {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('请上传图片文件')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB')
    return false
  }
  return true
}

function handleUploadRequest(options: any) {
  const file = options.file
  uploadImage(file, 'edu/share-content')
    .then((res) => {
      formData.imageUrl = res.data
      options.onSuccess(res)
    })
    .catch(() => {
      ElMessage.error('图片上传失败')
      options.onError()
    })
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate()
  try {
    if (isEdit.value) {
      await http.put(`/edu/share-content/${formData.id}`, formData)
    } else {
      await http.post('/edu/share-content', formData)
    }
    ElMessage.success('操作成功')
    dialogVisible.value = false
    fetchData()
  } catch {
    // error handled by request interceptor
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;
}

.search-card {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
}

.card-accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #0195ff, #00c6ff);
}

.table-wrapper {
  margin-top: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: #334155;
}

.table-actions {
  display: flex;
  gap: 8px;
}

.table-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
}

.pagination-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 12px 0;
  border-top: 1px solid #e2e8f0;
}

.total-text {
  font-size: 13px;
  color: #64748b;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
  color: #94a3b8;

  p {
    margin-top: 12px;
    font-size: 14px;
  }
}

.upload-area {
  display: flex;
  align-items: center;
}

.upload-preview {
  width: 100px;
  height: 100px;
  border-radius: 8px;
}

.upload-btn {
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;

  span {
    font-size: 12px;
    margin-top: 4px;
  }
}
</style>