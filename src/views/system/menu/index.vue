<template>
  <div class="menu-management">
    <!-- 搜索区 -->
    <el-card class="search-card" shadow="never">
      <div class="card-accent"></div>
      <el-form :model="queryParams" inline>
        <el-form-item label="菜单名称">
          <el-input v-model="queryParams.name" placeholder="菜单名称" clearable style="width: 180px" @keyup.enter="handleQuery" />
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
        <div class="table-title">菜单列表</div>
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
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column prop="name" label="菜单名称" min-width="160">
          <template #default="{ row }">
            <el-icon v-if="row.icon" style="vertical-align: middle; margin-right: 4px;">
              <component :is="row.icon" />
            </el-icon>
            {{ row.name }}
          </template>
        </el-table-column>
        <el-table-column prop="icon" label="图标" width="100" align="center" />
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="path" label="路由路径" min-width="160" />
        <el-table-column prop="component" label="组件路径" min-width="180" />
        <el-table-column prop="menuType" label="类型" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.menuType === 0" type="warning">目录</el-tag>
            <el-tag v-else-if="row.menuType === 1" type="primary">菜单</el-tag>
            <el-tag v-else type="info">按钮</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="permission" label="权限标识" min-width="160" />
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
        <el-table-column label="操作" width="240" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleAdd(row.id)">新增子菜单</el-button>
            <el-button type="primary" link size="small" @click="handleEdit(row.id)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row.id)">删除</el-button>
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
    <MenuFormDialog
      :key="dialogKey"
      v-model="dialogVisible"
      :edit-menu-id="editMenuId"
      :menu-tree="tableData"
      @success="fetchData"
    />
  </div>
</template>

<script setup>
import { Plus, FolderOpened } from '@element-plus/icons-vue'
import { useMenuManagement } from '@/composables/useMenuManagement'
import MenuFormDialog from './MenuFormDialog.vue'

const {
  loading, tableData, tableKey, queryParams,
  dialogVisible, editMenuId, dialogKey,
  fetchData, handleQuery, handleReset, handleAdd, handleEdit, handleDelete, handleStatusChange
} = useMenuManagement()
</script>

<style scoped>
@import '@/assets/css/user-management.css';
.menu-management {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
