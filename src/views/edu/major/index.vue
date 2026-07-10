<template>
  <div class="major-management">
    <!-- 搜索区 -->
    <el-card class="search-card" shadow="never">
      <div class="card-accent"></div>
      <el-form :model="queryParams" inline>
        <el-form-item label="专业名称">
          <el-input v-model="queryParams.name" placeholder="专业名称" clearable style="width: 180px" @keyup.enter="handleQuery" />
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
        <div class="table-title">专业列表</div>
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
      >
        <el-table-column prop="name" label="名称" min-width="200" />
        <el-table-column prop="courseCount" label="课程数" width="80" align="center" />
        <el-table-column prop="questionCount" label="试题数" width="80" align="center" />
        <el-table-column prop="examCount" label="试卷数" width="80" align="center" />
        <el-table-column prop="status" label="状态" width="60" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
              :loading="row._statusLoading"
              @change="(val) => handleStatusChange(row, val)"
              size="small"
             
             
            />
          </template>
        </el-table-column>
        <el-table-column prop="recommended" label="推荐" width="60" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.recommended === 1"
              :loading="row._recommendedLoading"
              @change="(val) => handleRecommendedChange(row, val)"
              size="small"
             
             
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleAdd(row.id)">新增子专业</el-button>
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
    <MajorFormDialog
      :key="dialogKey"
      v-model="dialogVisible"
      :edit-major-id="editMajorId"
      :major-tree="tableData"
      @success="fetchData"
    />
  </div>
</template>

<script setup>
import { Plus, FolderOpened } from '@element-plus/icons-vue'
import { useMajorManagement } from '@/composables/edu/useMajorManagement'
import MajorFormDialog from './MajorFormDialog.vue'

const {
  loading, tableData, tableKey, queryParams,
  dialogVisible, editMajorId, dialogKey,
  fetchData, handleQuery, handleReset, handleAdd, handleEdit, handleDelete, handleStatusChange,
  handleRecommendedChange
} = useMajorManagement()
</script>

<style scoped>
@import '@/assets/css/user-management.css';
</style>
