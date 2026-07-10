<template>
  <div class="student-management">
    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <div class="card-accent"></div>
      <el-form :model="queryParams" inline>
        <el-form-item label="姓名">
          <el-input v-model="queryParams.name" placeholder="请输入姓名" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="queryParams.phone" placeholder="请输入手机号" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="账号">
          <el-input v-model="queryParams.account" placeholder="请输入账号" clearable style="width: 160px" />
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
          学员列表
        </div>
        <div class="table-actions">
          <el-button type="warning" :disabled="selectedIds.length === 0" @click="handleBatchDisable">
            <el-icon><Lock /></el-icon>批量禁用
          </el-button>
          <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>批量删除
          </el-button>
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
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="45" align="center" />
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column prop="name" label="姓名" min-width="100">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 8px;">
              <el-avatar :size="28" v-if="row.avatarUrl" :src="row.avatarUrl" />
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="电话" min-width="130" />
        <el-table-column prop="age" label="年龄" width="60" align="center" />
        <el-table-column prop="account" label="账号" min-width="120" />
        <el-table-column prop="idCard" label="身份证号" min-width="170" show-overflow-tooltip />
        <el-table-column prop="lastLoginTime" label="最后登录时间" width="170">
          <template #default="{ row }">
            {{ formatDateTime(row.lastLoginTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
              :loading="row._statusLoading"
              @change="(val) => handleStatusChange(row, val)"
              size="small"
             
             
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="success" size="small" @click="handleGrowth(row.id)">成长档案</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row.id)">编辑</el-button>
            <el-button link type="primary" size="small" @click="handleResetPassword(row.id)">重置密码</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
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

    <!-- 分页栏 -->
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

    <!-- 新增/编辑对话框 -->
    <StudentFormDialog v-model="dialogVisible" :student-id="editId" @success="fetchData" />
  </div>
</template>

<script setup>
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import { Plus, Delete, FolderOpened, Lock } from '@element-plus/icons-vue'
import StudentFormDialog from './StudentFormDialog.vue'
import { useStudentManagement } from '@/composables/edu/useStudentManagement'

const {
  loading, tableData, total, pageNum, pageSize, queryParams,
  dialogVisible, editId, selectedIds,
  fetchData, handleQuery, handleReset, handleAdd, handleEdit,
  handleDelete, handleBatchDelete, handleStatusChange, handleBatchDisable,
  handleResetPassword, handleSelectionChange
} = useStudentManagement()

const router = useRouter()

/** 格式化日期时间，去掉 T */
function formatDateTime(date) {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '-'
}

function handleGrowth(id) {
  router.push(`/edu/student/${id}/growth`)
}
</script>

<style scoped>
@import '@/assets/css/user-management.css';
.student-management {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
