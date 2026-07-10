<template>
  <div class="category-management">
    <el-card class="search-card" shadow="never">
      <div class="card-accent"></div>
      <div class="table-header">
        <div class="table-title">资讯分类</div>
        <div class="table-actions">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新增分类
          </el-button>
        </div>
      </div>
    </el-card>

    <div class="table-wrapper">
      <el-table :data="tableData" v-loading="loading" border stripe style="width: 100%"
        :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: 600 }">
        <el-table-column prop="name" label="分类名称" min-width="160" />
        <el-table-column label="排序" width="100" align="center">
          <template #default="{ row }">{{ row.sortOrder ?? 0 }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">{{ row.createTime || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right">
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

    <YubDialog v-model="dialogVisible" :title="isEdit ? '编辑分类' : '新增分类'" width="480px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="90px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入分类名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="formData.sortOrder" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </YubDialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  getNewsCategoryList, createNewsCategory, updateNewsCategory, deleteNewsCategory
} from '@/api/edu/news'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, FolderOpened } from '@element-plus/icons-vue'
import YubDialog from '@/components/YubDialog.vue'

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const submitting = ref(false)
const formRef = ref(null)

const formData = reactive({ name: '', sortOrder: 0, status: 1 })
const formRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

function fetchData() {
  loading.value = true
  getNewsCategoryList().then(r => { tableData.value = r.data || [] })
    .catch(() => { tableData.value = [] })
    .finally(() => { loading.value = false })
}

function handleAdd() {
  editId.value = null; isEdit.value = false
  Object.assign(formData, { name: '', sortOrder: 0, status: 1 })
  dialogVisible.value = true
}

function handleEdit(row) {
  editId.value = row.id; isEdit.value = true
  Object.assign(formData, { name: row.name || '', sortOrder: row.sortOrder ?? 0, status: row.status ?? 1 })
  dialogVisible.value = true
}

function handleSubmit() {
  if (!formRef.value) return
  formRef.value.validate().then(() => {
    submitting.value = true
    const payload = { ...formData }
    if (isEdit.value) payload.id = editId.value
    const req = isEdit.value ? updateNewsCategory(payload) : createNewsCategory(payload)
    req.then(() => {
      ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
      dialogVisible.value = false
      fetchData()
    }).catch(() => {}).finally(() => { submitting.value = false })
  }).catch(() => {})
}

function handleDelete(id) {
  ElMessageBox.confirm('确定要删除该分类吗？若存在关联资讯将拒绝删除。', '删除确认', { type: 'warning' })
    .then(() => deleteNewsCategory(id)).then(() => { ElMessage.success('删除成功'); fetchData() })
    .catch(() => {})
}

onMounted(() => { fetchData() })
</script>

<style scoped>
@import '@/assets/css/user-management.css';
.category-management { display: flex; flex-direction: column; height: 100%; }
.table-header { display: flex; justify-content: space-between; align-items: center; padding: 4px 0 12px; }
.table-title { font-size: 15px; font-weight: 600; color: #1e293b; }
</style>
