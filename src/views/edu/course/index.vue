<template>
  <div class="course-management">
    <!-- 搜索区 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="queryParams" inline>
        <el-form-item label="课程名称">
          <el-input v-model="queryParams.name" placeholder="课程名称" clearable style="width: 180px" @keyup.enter="handleQuery" />
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

    <!-- 主体内容区 -->
    <div class="split-layout">
      <!-- 左侧：课程分类（即专业）侧边栏 -->
      <div class="major-sidebar">
        <div class="sidebar-header">
          <div class="sidebar-title">课程分类</div>
          <el-button class="add-cat-btn" type="primary" link @click="handleMajorAdd(0)">
            <el-icon><Plus /></el-icon>新增
          </el-button>
        </div>
        <div class="sidebar-filter">
          <el-input
            v-model="filterText"
            placeholder="搜索分类"
            clearable
            size="default"
            :prefix-icon="Search"
            @input="handleTreeFilter"
          />
        </div>
        <div class="sidebar-tree">
          <div
            class="sidebar-item all-item"
            :class="{ active: !selectedMajorId }"
            @click="handleMajorSelect(null)"
          >
            全部课程
          </div>
          <el-tree
            ref="treeRef"
            :data="majorTree"
            :props="{ label: 'name', children: 'children' }"
            node-key="id"
            highlight-current
            :current-node-key="selectedMajorId"
            :draggable="true"
            :allow-drop="allowDrop"
            :expand-on-click-node="false"
            :expanded-keys="expandedKeys"
            :filter-node-method="treeFilterMethod"
            @node-click="handleMajorSelect"
            @node-drop="handleNodeDrop"
            @node-expand="onNodeExpand"
            @node-collapse="onNodeCollapse"
          >
            <template #default="{ node, data }">
              <div class="tree-node" :class="{ 'is-disabled': data.status === 0 }">
                <span class="tree-label">{{ data.name }}</span>
                <span v-if="data.status === 0" class="tree-badge">禁用</span>
                <span class="tree-count">({{ data.totalCount || 0 }})</span>
                <span class="tree-actions">
                  <el-tooltip content="新增子分类" placement="top">
                    <el-icon class="act" @click.stop="handleMajorAdd(data.id)"><Plus /></el-icon>
                  </el-tooltip>
                  <el-tooltip content="编辑" placement="top">
                    <el-icon class="act" @click.stop="handleMajorEdit(data.id)"><Edit /></el-icon>
                  </el-tooltip>
                  <el-tooltip content="删除" placement="top">
                    <el-icon class="act danger" @click.stop="handleMajorDelete(data.id)"><Delete /></el-icon>
                  </el-tooltip>
                </span>
              </div>
            </template>
          </el-tree>
        </div>
      </div>

      <!-- 右侧：课程列表 -->
      <div class="course-list">
        <!-- 表格区域 -->
        <div class="table-wrapper">
          <div class="table-header">
            <div class="table-title">课程列表</div>
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
            <el-table-column type="index" label="#" width="45" align="center" />
            <el-table-column prop="name" label="课程名称" min-width="150" show-overflow-tooltip />
            <el-table-column label="价格" width="70" align="center">
              <template #default="{ row }">
                <span v-if="row.isFree === 1" style="color: var(--el-color-success)">免费</span>
                <span v-else>{{ row.totalPrice ? '¥' + row.totalPrice : '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="信息" min-width="160" align="center">
              <template #default="{ row }">
                <el-tag size="small" type="info" class="info-tag">章 {{ row.chapterCount || 0 }}</el-tag>
                <el-tag size="small" type="info" class="info-tag">题 {{ row.questionCount || 0 }}</el-tag>
                <el-tag size="small" type="info" class="info-tag">试 {{ row.examCount || 0 }}</el-tag>
                <el-tag size="small" type="info" class="info-tag">视 {{ row.videoCount || 0 }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="majorName" label="专业" width="100" show-overflow-tooltip />
            <el-table-column prop="teacher" label="教师" width="80" show-overflow-tooltip />
            <el-table-column label="状态" width="70" align="center">
              <template #default="{ row }">
                <el-switch
                  :model-value="row.status === 1"
                  :loading="row._statusLoading"
                  @change="(val) => handleStatusChange(row, val)"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column label="推荐" width="70" align="center">
              <template #default="{ row }">
                <el-switch
                  :model-value="row.recommended === 1"
                  :loading="row._recommendLoading"
                  @change="handleSetRecommended(row)"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" align="center" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleShowOverview(row.id)">综述</el-button>
                <el-button link type="primary" size="small" @click="handleEdit(row.id)">编辑</el-button>
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
      </div>
    </div>

    <!-- 新增/编辑对话框 -->
    <CourseFormDialog
      v-model="dialogVisible"
      :course-id="editCourseId"
      @success="fetchData"
    />

    <!-- 课程分类（专业）新增/编辑对话框 -->
    <MajorFormDialog
      :key="majorDialogKey"
      v-model="majorDialogVisible"
      :edit-major-id="majorEditId"
      :major-tree="majorTree"
      @success="handleMajorDialogSuccess"
    />

    <!-- 课程综述抽屉 -->
    <el-drawer
      v-model="overviewVisible"
      title="课程综述"
      size="400px"
    >
      <template v-if="overviewData">
        <div class="overview-container">
          <div class="overview-section">
            <h4>基本信息</h4>
            <div class="overview-item">
              <span class="label">课程名称：</span>
              <span class="value">{{ overviewData.name }}</span>
            </div>
            <div class="overview-item" v-if="overviewData.majorName">
              <span class="label">专业：</span>
              <span class="value">{{ overviewData.majorName }}</span>
            </div>
            <div class="overview-item" v-if="overviewData.teacher">
              <span class="label">教师：</span>
              <span class="value">{{ overviewData.teacher }}</span>
            </div>
          </div>
          <div class="overview-section">
            <h4>资费信息</h4>
            <div class="overview-item">
              <span class="label">价格：</span>
              <span class="value">
                <span v-if="overviewData.isFree === 1" style="color: var(--el-color-success)">免费</span>
                <span v-else>{{ overviewData.totalPrice ? '¥' + overviewData.totalPrice : '-' }}</span>
              </span>
            </div>
          </div>
          <div class="overview-section">
            <h4>运营数据</h4>
            <div class="overview-item">
              <span class="label">学员数：</span>
              <span class="value">{{ overviewData.studentCount || 0 }}</span>
            </div>
            <div class="overview-item">
              <span class="label">浏览数：</span>
              <span class="value">{{ overviewData.viewCount || 0 }}</span>
            </div>
          </div>
          <div class="overview-section">
            <h4>内容数据</h4>
            <div class="overview-item">
              <span class="label">章节数：</span>
              <span class="value">{{ overviewData.chapterCount || 0 }}</span>
            </div>
            <div class="overview-item">
              <span class="label">试题数：</span>
              <span class="value">{{ overviewData.questionCount || 0 }}</span>
            </div>
            <div class="overview-item">
              <span class="label">试卷数：</span>
              <span class="value">{{ overviewData.examCount || 0 }}</span>
            </div>
            <div class="overview-item">
              <span class="label">视频数：</span>
              <span class="value">{{ overviewData.videoCount || 0 }}</span>
            </div>
          </div>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { Plus, FolderOpened, Edit, Delete, Search } from '@element-plus/icons-vue'
import { useCourseManagement } from '@/composables/edu/useCourseManagement'
import CourseFormDialog from './CourseFormDialog.vue'
import MajorFormDialog from '@/views/edu/major/MajorFormDialog.vue'

const {
  loading, tableData, total, pageNum, pageSize, queryParams,
  dialogVisible, editCourseId, overviewVisible, overviewData,
  majorTree, selectedMajorId, treeRef, filterText, expandedKeys,
  majorDialogVisible, majorEditId, majorDialogKey,
  handleTreeFilter, treeFilterMethod, onNodeExpand, onNodeCollapse,
  handleMajorAdd, handleMajorEdit, handleMajorDelete, handleMajorDialogSuccess,
  allowDrop, handleNodeDrop,
  fetchData, handleQuery, handleReset, handleAdd, handleEdit, handleDelete,
  handleStatusChange, handleSetRecommended, handleShowOverview, handleMajorSelect
} = useCourseManagement()
</script>

<style scoped>
@import '@/assets/css/user-management.css';


.major-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: calc(100vh - 180px);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
}

.sidebar-title {
  font-weight: 600;
  color: #1a2332;
}

.add-cat-btn {
  padding: 4px 8px;
  font-size: 13px;
}

.sidebar-filter {
  padding: 10px 12px 4px;
}

.sidebar-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 16px 8px;
  font-size: 12px;
  color: #94a3b8;
}

.sidebar-tree {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 8px;
}

.sidebar-item {
  padding: 10px 16px;
  cursor: pointer;
  color: #475569;
  transition: all 0.2s;
}

.sidebar-item:hover {
  background: #f1f5f9;
  color: var(--el-color-primary);
}

.sidebar-item.active {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: 600;
  border-left: 3px solid var(--el-color-primary);
  padding-left: 13px;
}

.course-list {
  flex: 1;
  padding: 20px;
  min-width: 0;
}

.table-wrapper {
  flex: 1;
  overflow: hidden;
  min-width: 0;
}

.table-wrapper :deep(.el-table) {
  overflow: visible;
}

.table-wrapper :deep(.el-table__inner-wrapper) {
  overflow: visible;
}

.info-tag {
  margin: 2px;
}

/* Tree styling */
.major-sidebar :deep(.el-tree) {
  padding: 4px 0;
  background: transparent;
}

.major-sidebar :deep(.el-tree-node__content) {
  height: 38px;
  padding: 0 8px 0 4px;
  cursor: grab;
  border-radius: 6px;
}

.major-sidebar :deep(.el-tree-node__content:active) {
  cursor: grabbing;
}

.major-sidebar :deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: 600;
}

.tree-node {
  display: flex;
  align-items: center;
  width: 100%;
  font-size: 14px;
  color: #334155;
}

.tree-node.is-disabled {
  color: #94a3b8;
}

.tree-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-badge {
  flex-shrink: 0;
  margin-left: 4px;
  padding: 0 5px;
  font-size: 11px;
  line-height: 16px;
  color: #94a3b8;
  background: #f1f5f9;
  border-radius: 8px;
}

.tree-count {
  flex-shrink: 0;
  color: #94a3b8;
  font-size: 12px;
  margin-left: 4px;
}

.tree-actions {
  flex-shrink: 0;
  display: none;
  align-items: center;
  gap: 2px;
  margin-left: 4px;
}

.tree-node:hover .tree-actions {
  display: inline-flex;
}

.tree-actions .act {
  padding: 2px;
  border-radius: 4px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
}

.tree-actions .act:hover {
  background: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
}

.tree-actions .act.danger:hover {
  background: var(--el-color-danger-light-8);
  color: var(--el-color-danger);
}

/* 拖拽时的视觉反馈 */
.major-sidebar :deep(.el-tree-node.is-drop-inner > .el-tree-node__content) {
  background-color: var(--el-color-primary-light-8);
  box-shadow: inset 0 0 0 1px var(--el-color-primary);
}

/* Pagination */
.pagination-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.total-text {
  color: #64748b;
  font-size: 14px;
}

/* Overview styles */
.overview-container {
  padding: 0 16px;
}
.overview-section {
  margin-bottom: 24px;
}
.overview-section h4 {
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
  color: #1a2332;
}
.overview-item {
  display: flex;
  margin-bottom: 8px;
  line-height: 1.8;
}
.overview-item .label {
  color: #64748b;
  width: 80px;
  flex-shrink: 0;
}
.overview-item .value {
  color: #1a2332;
  font-weight: 500;
}
</style>
