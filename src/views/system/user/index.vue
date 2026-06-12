<template>
  <div class="user-management">
    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <div class="card-accent"></div>
      <el-form :model="queryParams" inline>
        <el-form-item label="账号">
          <el-input v-model="queryParams.account" placeholder="请输入账号" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="queryParams.nickName" placeholder="请输入昵称" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格区域 -->
    <div class="table-wrapper">
      <div class="table-header">
        <div class="table-title">
          <el-icon :size="18"><List /></el-icon>
          用户列表
        </div>
        <div class="table-actions">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新增
          </el-button>
        </div>
      </div>

      <el-table
        :data="tableData"
        v-loading="loading"
        border
        stripe
        style="width: 100%"
        :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: 600 }"
      >
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column prop="account" label="账号" min-width="120" />
        <el-table-column prop="nickName" label="昵称" min-width="120" />
        <el-table-column prop="phone" label="手机号" min-width="130" />
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
              :loading="row._statusLoading"
              @change="(val) => handleStatusChange(row, val)"
              size="small"
              active-color="#38daa6"
              inactive-color="#cbd5e1"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleDetail(row.id)">详情</el-button>
            <el-button link type="primary" @click="handleEdit(row.id)">编辑</el-button>
            <el-button link type="primary" @click="handleResetPwd(row.id)">重置密码</el-button>
            <el-button link type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>

        <!-- 空数据状态 -->
        <template #empty>
          <div class="empty-state">
            <el-icon :size="56" color="#cbd5e1"><FolderOpened /></el-icon>
            <p>暂无数据</p>
          </div>
        </template>
      </el-table>
    </div>

    <!-- 分页栏 - 固定在底部 -->
    <div class="pagination-bar">
      <div class="pagination-left">
        <span class="total-text">共 <b>{{ total }}</b> 条数据</span>
      </div>
      <div class="pagination-right">
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
    </div>

    <UserFormDialog v-model="dialogVisible" :user-id="editUserId" @success="fetchData" />
    <UserDetailDrawer v-model="drawerVisible" :user-id="detailUserId" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getUserPage, deleteUser, resetPassword, changeUserStatus } from '@/api/system/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, List, FolderOpened } from '@element-plus/icons-vue'
import UserFormDialog from './UserFormDialog.vue'
import UserDetailDrawer from './UserDetailDrawer.vue'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

const queryParams = reactive({
  account: '',
  nickName: '',
  phone: '',
  status: null
})

const dialogVisible = ref(false)
const editUserId = ref(null)
const drawerVisible = ref(false)
const detailUserId = ref(null)

onMounted(() => {
  fetchData()
})

async function fetchData() {
  loading.value = true
  try {
    const res = await getUserPage({
      queryParam: { ...queryParams },
      pageParam: { pageNum: pageNum.value, pageSize: pageSize.value }
    })
    const data = res.data
    tableData.value = (data.records || []).map(row => ({ ...row, _statusLoading: false }))
    total.value = data.total || 0
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
  queryParams.account = ''
  queryParams.nickName = ''
  queryParams.phone = ''
  queryParams.status = null
  pageNum.value = 1
  fetchData()
}

function handleAdd() {
  editUserId.value = null
  dialogVisible.value = true
}

function handleEdit(id) {
  editUserId.value = id
  dialogVisible.value = true
}

function handleDetail(id) {
  detailUserId.value = id
  drawerVisible.value = true
}

async function handleDelete(id) {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '删除确认', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    await deleteUser(id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {
    // 取消操作
  }
}

async function handleResetPwd(id) {
  try {
    await ElMessageBox.confirm('确定要将密码重置为默认密码（admin123）吗？', '重置密码', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    await resetPassword(id)
    ElMessage.success('密码重置成功')
  } catch {
    // 取消操作
  }
}

async function handleStatusChange(row, checked) {
  const status = checked ? 1 : 0
  row._statusLoading = true
  try {
    await changeUserStatus(row.id, status)
    row.status = status
    ElMessage.success(checked ? '用户已启用' : '用户已停用')
  } catch {
    // 错误已处理
  } finally {
    row._statusLoading = false
  }
}
</script>

<style scoped>
.user-management {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: calc(100vh - 140px);
}

/* ===== 搜索卡片 ===== */
.search-card {
  position: relative;
  margin-bottom: 16px;
  overflow: hidden;
  border-radius: 10px;
}

.card-accent {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: #38daa6;
  border-radius: 0 2px 2px 0;
}

/* ===== 表格区域 ===== */
.table-wrapper {
  flex: 1;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  padding: 20px;
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-actions {
  display: flex;
  gap: 8px;
}

/* ===== 空数据 ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  color: #94a3b8;
}

.empty-state p {
  margin: 12px 0 0;
  font-size: 14px;
}

/* ===== 分页栏 ===== */
.pagination-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  margin-top: 12px;
}

.pagination-left {
  flex-shrink: 0;
}

.total-text {
  font-size: 14px;
  color: #64748b;
}

.total-text b {
  color: #38daa6;
  font-weight: 700;
}

.pagination-right {
  flex-shrink: 0;
}

:deep(.el-pagination) {
  font-weight: 400;
}

:deep(.el-pagination.is-background .btn-prev),
:deep(.el-pagination.is-background .btn-next),
:deep(.el-pagination.is-background .el-pager li) {
  border-radius: 6px;
  min-width: 32px;
  height: 32px;
  line-height: 32px;
}

:deep(.el-pagination .el-select .el-input .el-input__wrapper) {
  border-radius: 6px;
}

:deep(.el-pagination .el-input__inner) {
  border-radius: 6px;
}
</style>
