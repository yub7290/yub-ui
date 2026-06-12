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
import { Plus, List, FolderOpened } from '@element-plus/icons-vue'
import UserFormDialog from './UserFormDialog.vue'
import UserDetailDrawer from './UserDetailDrawer.vue'
import { useUserManagement } from '@/composables/useUserManagement'

const { loading, tableData, total, pageNum, pageSize, queryParams, dialogVisible, editUserId, drawerVisible, detailUserId, fetchData, handleQuery, handleReset, handleAdd, handleEdit, handleDetail, handleDelete, handleResetPwd, handleStatusChange } = useUserManagement()
</script>

<style scoped>
@import '@/assets/css/user-management.css';
</style>
