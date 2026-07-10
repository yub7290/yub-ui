<template>
  <div class="teacher-title-management">
    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <div class="card-accent"></div>
      <el-form :model="queryParams" inline>
        <el-form-item label="职称名称">
          <el-input v-model="queryParams.name" placeholder="职称名称" clearable style="width: 180px" />
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
        <div class="table-title">职称列表</div>
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
        <el-table-column prop="name" label="名称" min-width="140" />
        <el-table-column prop="teacherCount" label="教师" width="80" align="center" />
        <el-table-column prop="courseCount" label="课程数" width="80" align="center" />
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
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
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
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
    <TeacherTitleFormDialog
      v-model="dialogVisible"
      :title-id="editId"
      @success="fetchData"
    />
  </div>
</template>

<script setup>
import { Plus, FolderOpened } from '@element-plus/icons-vue'
import { useTeacherTitleManagement } from '@/composables/edu/useTeacherTitleManagement'
import TeacherTitleFormDialog from './TeacherTitleFormDialog.vue'

const {
  loading, tableData, total, pageNum, pageSize, queryParams,
  dialogVisible, editId,
  fetchData, handleQuery, handleReset, handleAdd, handleEdit, handleDelete, handleStatusChange
} = useTeacherTitleManagement()
</script>

<style scoped>
@import '@/assets/css/user-management.css';
.teacher-title-management {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
