<template>
  <div class="study-card-management">
    <!-- 搜索区 -->
    <el-card class="search-card" shadow="never">
      <div class="card-accent"></div>
      <el-form :model="queryParams" inline>
        <el-form-item label="主题">
          <el-input v-model="queryParams.title" placeholder="学习卡主题" clearable style="width: 180px" @keyup.enter="handleQuery" />
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
        <div class="table-title">学习卡列表</div>
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
        <el-table-column prop="title" label="主题" min-width="160" />
        <el-table-column prop="courseCount" label="课程数" width="80" align="center" />
        <el-table-column prop="quantity" label="数量" width="80" align="center" />
        <el-table-column label="面额" width="80" align="center">
          <template #default="{ row }">
            <span v-if="row.amount != null">¥{{ row.amount }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="有效期" min-width="200">
          <template #default="{ row }">
            <span v-if="row.validStartDate && row.validEndDate">{{ row.validStartDate }} ~ {{ row.validEndDate }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="学习时长" width="120" align="center">
          <template #default="{ row }">
            <span v-if="row.studyDuration">{{ row.studyDuration }}{{ unitLabel(row.studyDurationUnit) }}</span>
            <span v-else>-</span>
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
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-dropdown trigger="click">
              <el-button link type="primary" size="small">
                操作<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleEdit(row.id)">编辑</el-dropdown-item>
                  <el-dropdown-item @click="handleShowInstances(row)">卡号管理</el-dropdown-item>
                  <el-dropdown-item @click="handleBatchGenerate(row)">批量生成</el-dropdown-item>
                  <el-dropdown-item divided @click="handleDelete(row.id)" style="color: #f56c6c">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>

        <template #empty>
          <div class="empty-state">
            <el-icon :size="56" color="#cbd5e1"><Ticket /></el-icon>
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
    <StudyCardFormDialog
      v-model="dialogVisible"
      :study-card-id="editStudyCardId"
      @success="fetchData"
    />

    <!-- 卡号管理对话框 -->
    <StudyCardInstanceDialog
      v-model="instanceDialogVisible"
      :card-id="instanceCardId"
      :dialog-title="instanceDialogTitle"
      @success="fetchData"
    />
  </div>
</template>

<script setup>
import { Plus, Ticket, ArrowDown } from '@element-plus/icons-vue'
import { useStudyCardManagement } from '@/composables/edu/useStudyCardManagement'
import StudyCardFormDialog from './StudyCardFormDialog.vue'
import StudyCardInstanceDialog from './StudyCardInstanceDialog.vue'

const {
  loading, tableData, total, pageNum, pageSize, queryParams,
  dialogVisible, editStudyCardId,
  instanceDialogVisible, instanceCardId, instanceDialogTitle,
  fetchData, handleQuery, handleReset, handleAdd, handleEdit, handleDelete,
  handleStatusChange, handleShowInstances, handleBatchGenerate
} = useStudyCardManagement()

/** 时长单位文本映射 */
function unitLabel(unit) {
  const map = { day: '天', month: '个月', year: '年' }
  return map[unit] || unit
}
</script>

<style scoped>
@import '@/assets/css/user-management.css';
.study-card-management {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
