<template>
  <div class="question-management">
    <!-- 搜索区 -->
    <el-card class="search-card" shadow="never">
      <div class="card-accent"></div>
      <el-form :model="queryParams" inline>
        <el-form-item label="试题类型">
          <el-select v-model="queryParams.questionType" placeholder="全部" clearable style="width: 120px">
            <el-option label="单选" :value="0" />
            <el-option label="多选" :value="1" />
            <el-option label="判断" :value="2" />
            <el-option label="简答" :value="3" />
            <el-option label="填空" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="难度">
          <el-select v-model="queryParams.difficulty" placeholder="全部" clearable style="width: 120px">
            <el-option v-for="i in 5" :key="i" :label="'⭐'.repeat(i)" :value="i" />
          </el-select>
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
        <div class="table-title">试题列表</div>
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
        <el-table-column label="试题类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.questionType)" size="small">
              {{ questionTypeMap[row.questionType] || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="试题（题干）" min-width="300">
          <template #default="{ row }">
            <div class="question-content">{{ textPreview(row.content) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="难度" width="100" align="center">
          <template #default="{ row }">
            <span>{{ '⭐'.repeat(row.difficulty || 0) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="courseName" label="课程" min-width="140" />
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
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
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

    <!-- 新增/编辑对话框 -->
    <QuestionFormDialog
      v-model="dialogVisible"
      :question-id="editQuestionId"
      @success="fetchData"
    />
  </div>
</template>

<script setup>
import { Plus, FolderOpened } from '@element-plus/icons-vue'
import { useQuestionManagement } from '@/composables/edu/useQuestionManagement'
import QuestionFormDialog from './QuestionFormDialog.vue'

/** Strip HTML tags and truncate for safe list display */
function textPreview(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').substring(0, 100)
}

const {
  loading, tableData, total, pageNum, pageSize, queryParams,
  dialogVisible, editQuestionId, questionTypeMap,
  fetchData, handleQuery, handleReset, handleAdd, handleEdit,
  handleDelete, handleStatusChange
} = useQuestionManagement()

function getTypeTag(type) {
  const map = { 0: '', 1: 'warning', 2: 'info', 3: 'success', 4: 'danger' }
  return map[type] || ''
}
</script>

<style scoped>
@import '@/assets/css/user-management.css';
.question-management {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: calc(100vh - 140px);
  padding: 0;
}
.question-content {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-height: 40px;
}
</style>
