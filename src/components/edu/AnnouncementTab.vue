<template>
  <div class="announcement-tab">
    <div class="tab-toolbar">
      <el-button type="primary" size="small" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增公告
      </el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe style="width:100%"
      :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: 600 }">
      <el-table-column type="index" label="#" width="50" align="center" />
      <el-table-column prop="title" label="标题" min-width="160" />
      <el-table-column prop="category" label="分类" width="100" />
      <el-table-column prop="source" label="来源" width="120" />
      <el-table-column prop="status" label="状态" width="70" align="center">
        <template #default="{ row }">
          <el-switch :model-value="row.status === 1" size="small" active-color="#38daa6" inactive-color="#cbd5e1" disabled />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="170">
        <template #default="{ row }">{{ row.createTime || '-' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row.id)">编辑</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty><el-empty description="暂无公告" :image-size="60" /></template>
    </el-table>

    <div class="pagination-bar">
      <div class="pagination-left"><span class="total-text">共 <b>{{ total }}</b> 条数据</span></div>
      <div class="pagination-right">
        <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :total="total"
          :page-sizes="[5, 10, 20]" :pager-count="3" layout="sizes, prev, pager, next" background size="small"
          @size-change="fetchData" @current-change="fetchData" />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑公告' : '新增公告'" width="800px"
      :before-close="() => dialogVisible = false" destroy-on-close>
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="基本信息" name="basic">
          <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
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
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { getAnnouncementPage, getAnnouncementDetail, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '@/api/edu/announcement'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import RichEditor from '@/components/RichEditor.vue'

const props = defineProps({ courseId: { type: Number, default: null } })
const emit = defineEmits(['change'])

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(5)
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const submitting = ref(false)
const formRef = ref(null)
const activeTab = ref('basic')

const formData = reactive({ title: '', longTitle: '', category: '', summary: '', source: '', status: 1, content: '' })
const formRules = { title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }] }

async function fetchData() {
  if (!props.courseId) return; loading.value = true
  try { const r = await getAnnouncementPage({ queryParam: { courseId: props.courseId }, pageParam: { pageNum: pageNum.value, pageSize: pageSize.value } }); const d = r.data; tableData.value = d.records || []; total.value = d.total || 0 }
  catch { tableData.value = []; total.value = 0 } finally { loading.value = false }
}

watch(() => props.courseId, (val) => { if (val) fetchData() }, { immediate: true })

function handleAdd() { editId.value = null; isEdit.value = false; Object.assign(formData, { title: '', longTitle: '', category: '', summary: '', source: '', status: 1, content: '' }); activeTab.value = 'basic'; dialogVisible.value = true }

async function handleEdit(id) {
  editId.value = id; isEdit.value = true
  try { const r = await getAnnouncementDetail(id); const d = r.data; Object.assign(formData, { title: d.title || '', longTitle: d.longTitle || '', category: d.category || '', summary: d.summary || '', source: d.source || '', status: d.status ?? 1, content: d.content || '' }); dialogVisible.value = true }
  catch { ElMessage.error('加载公告详情失败') }
}

async function handleSubmit() {
  if (!formRef.value) return; try { await formRef.value.validate() } catch { return }
  submitting.value = true
  try {
    const payload = { ...formData, courseId: props.courseId }
    if (isEdit.value) { payload.id = editId.value; await updateAnnouncement(payload); ElMessage.success('编辑成功') }
    else { await createAnnouncement(payload); ElMessage.success('新增成功') }
    dialogVisible.value = false; await fetchData(); emit('change')
  } catch {/**/} finally { submitting.value = false }
}

async function handleDelete(id) {
  try { await ElMessageBox.confirm('确定要删除该公告吗？', '删除确认', { type: 'warning' }); await deleteAnnouncement(id); ElMessage.success('删除成功'); fetchData() }
  catch {/**/}
}
</script>
<style scoped>
.announcement-tab { min-height: 300px; }
.tab-toolbar { margin-bottom: 12px; }
.pagination-bar { display: flex; justify-content: space-between; align-items: center; padding: 12px 0 0; }
.total-text { font-size: 13px; color: #64748b; }
.total-text b { color: #38daa6; font-weight: 700; }
</style>
