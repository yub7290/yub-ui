<template>
  <div class="t-page">
    <YubPageHeader title="课程公告" subtitle="发布与维护面向学员的课程通知">
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>发布通知
      </el-button>
    </YubPageHeader>

    <div class="t-toolbar">
      <div class="t-toolbar__filters">
        <el-input
          v-model="queryParams.keyword"
          placeholder="通知标题"
          clearable
          style="width: 220px"
          :prefix-icon="Search"
          @keyup.enter="handleQuery"
          @clear="handleQuery"
        />
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable
          style="width: 130px"
          @change="handleQuery"
        >
          <el-option label="已发布" :value="1" />
          <el-option label="草稿" :value="0" />
        </el-select>
      </div>
      <div class="t-toolbar__actions">
        <el-button @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <section class="t-card announce-card">
      <el-table :data="tableData" v-loading="loading" style="width: 100%">
        <el-table-column type="index" label="#" width="48" align="center" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column label="内容" min-width="240" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="t-muted">{{ row.content || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <span class="t-badge" :class="row.status === 1 ? 't-badge--green' : 't-badge--gray'">
              {{ row.status === 1 ? '已发布' : '草稿' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发布时间" min-width="160" />
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <div class="t-empty">
            <el-icon :size="40"><Bell /></el-icon>
            <p class="t-empty__text">暂无通知</p>
          </div>
        </template>
      </el-table>

      <div class="t-pagination" v-if="total > 0">
        <span class="t-pagination__total">共 <b>{{ total }}</b> 条数据</span>
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
    </section>

    <!-- 发布/编辑对话框 -->
    <YubDialog v-model="dialogVisible" :title="isEdit ? '编辑通知' : '发布通知'" width="560px" @open="onOpen">
      <el-form :model="form" label-width="64px">
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="请输入通知标题" maxlength="100" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="6"
            placeholder="请输入通知内容"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">发布</el-button>
      </template>
    </YubDialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Search, Bell } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import YubPageHeader from '@/components/YubPageHeader.vue'
import YubDialog from '@/components/YubDialog.vue'
import {
  getAnnouncementPage, getAnnouncementDetail,
  createAnnouncement, updateAnnouncement, deleteAnnouncement
} from '@/api/edu/announcement'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

const queryParams = reactive({ keyword: '', status: null })

const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const editId = ref(null)
const form = reactive({ title: '', content: '' })

async function fetchData() {
  loading.value = true
  try {
    const res = await getAnnouncementPage({
      queryParam: { ...queryParams },
      pageParam: { pageNum: pageNum.value, pageSize: pageSize.value }
    })
    const data = res.data
    if (Array.isArray(data)) {
      tableData.value = data
      total.value = data.length
    } else {
      tableData.value = data.list || data.records || []
      total.value = data.total || 0
    }
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
  queryParams.keyword = ''
  queryParams.status = null
  pageNum.value = 1
  fetchData()
}

function handleCreate() {
  isEdit.value = false
  editId.value = null
  form.title = ''
  form.content = ''
  dialogVisible.value = true
}

async function handleEdit(row) {
  isEdit.value = true
  editId.value = row.id
  try {
    const res = await getAnnouncementDetail(row.id)
    const d = res.data || {}
    form.title = d.title || ''
    form.content = d.content || ''
  } catch {
    form.title = row.title || ''
    form.content = row.content || ''
  }
  dialogVisible.value = true
}

function onOpen() {}

async function handleSubmit() {
  if (!form.title.trim()) {
    ElMessage.warning('请输入通知标题')
    return
  }
  submitting.value = true
  try {
    if (isEdit.value) {
      await updateAnnouncement({ id: editId.value, ...form })
      ElMessage.success('更新成功')
    } else {
      await createAnnouncement({ ...form, status: 1 })
      ElMessage.success('发布成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch {
    // 错误已由拦截器处理
  } finally {
    submitting.value = false
  }
}

async function handleDelete(id) {
  try {
    await ElMessageBox.confirm('确定要删除该通知吗？', '删除确认', { type: 'warning' })
    await deleteAnnouncement(id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {}
}

onMounted(fetchData)
</script>

<style scoped>
.announce-card {
  padding: 0;
  overflow: hidden;
}
</style>
