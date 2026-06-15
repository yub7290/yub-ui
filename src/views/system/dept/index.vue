<template>
  <div class="dept-management">
    <!-- 搜索区 -->
    <el-card class="search-card" shadow="never">
      <div class="card-accent"></div>
      <el-form :model="queryParams" inline>
        <el-form-item label="部门名称">
          <el-input v-model="queryParams.deptName" placeholder="部门名称" clearable style="width: 180px" @keyup.enter="handleQuery" />
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

    <!-- 表格区域 -->
    <div class="table-wrapper">
      <div class="table-header">
        <div class="table-title">部门列表</div>
        <div class="table-actions">
          <el-button type="primary" @click="handleAdd(0)">
            <el-icon><Plus /></el-icon>新增
          </el-button>
        </div>
      </div>

      <el-table
        :key="tableKey"
        :data="tableData"
        v-loading="loading"
        border
        stripe
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        style="width: 100%"
        :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: 600 }"
        default-expand-all
      >
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column prop="deptName" label="部门名称" min-width="200" />
        <el-table-column prop="deptCode" label="部门编码" min-width="140" />
        <el-table-column prop="sort" label="排序" width="80" align="center" />
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
        <el-table-column prop="createTime" label="创建时间" width="170">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleAdd(row.id)">新增子部门</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row.id)">编辑</el-button>
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

    <!-- 新增/编辑对话框 -->
    <DeptFormDialog
      :key="dialogKey"
      v-model="dialogVisible"
      :edit-dept-id="editDeptId"
      :dept-tree="tableData"
      @success="fetchData"
    />
  </div>
</template>

<script setup>
import dayjs from 'dayjs'
import { Plus, FolderOpened } from '@element-plus/icons-vue'
import { useDeptManagement } from '@/composables/useDeptManagement'
import DeptFormDialog from './DeptFormDialog.vue'

const {
  loading, tableData, tableKey, queryParams,
  dialogVisible, editDeptId, dialogKey,
  fetchData, handleQuery, handleReset, handleAdd, handleEdit, handleDelete, handleStatusChange
} = useDeptManagement()

/** 格式化日期时间，去掉 T */
function formatDateTime(date) {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '-'
}
</script>

<style scoped>
@import '@/assets/css/user-management.css';
.dept-management {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: calc(100vh - 140px);
  padding: 0;
}
</style>
