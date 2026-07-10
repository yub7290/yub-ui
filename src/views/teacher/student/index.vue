<template>
  <div class="t-page">
    <YubPageHeader title="我的学生" subtitle="查看与维护你课程下的学员">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增学员
      </el-button>
    </YubPageHeader>

    <div class="t-toolbar">
      <div class="t-toolbar__filters">
        <el-input
          v-model="queryParams.name"
          placeholder="姓名"
          clearable
          style="width: 150px"
          :prefix-icon="Search"
          @keyup.enter="handleQuery"
          @clear="handleQuery"
        />
        <el-input
          v-model="queryParams.phone"
          placeholder="手机号"
          clearable
          style="width: 160px"
          @keyup.enter="handleQuery"
          @clear="handleQuery"
        />
        <el-input
          v-model="queryParams.account"
          placeholder="账号"
          clearable
          style="width: 160px"
          @keyup.enter="handleQuery"
          @clear="handleQuery"
        />
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable
          style="width: 120px"
          @change="handleQuery"
        >
          <el-option label="启用" :value="1" />
          <el-option label="停用" :value="0" />
        </el-select>
      </div>
      <div class="t-toolbar__actions">
        <el-button
          type="danger"
          plain
          :disabled="selectedIds.length === 0"
          @click="handleBatchDisable"
        >批量禁用</el-button>
        <el-button @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <section class="t-card student-card">
      <el-table
        :data="tableData"
        v-loading="loading"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="46" align="center" />
        <el-table-column label="学员" min-width="150">
          <template #default="{ row }">
            <div class="student-cell">
              <span class="t-avatar student-cell__avatar">{{ row.name ? row.name.charAt(0) : '?' }}</span>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="account" label="账号" width="140" show-overflow-tooltip />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
              :loading="row._statusLoading"
              @change="(val) => handleStatusChange(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" min-width="160" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row.id)">编辑</el-button>
            <el-button link type="primary" size="small" @click="handleResetPassword(row.id)">重置密码</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <div class="t-empty">
            <el-icon :size="40"><User /></el-icon>
            <p class="t-empty__text">暂无学员</p>
          </div>
        </template>
      </el-table>

      <div class="t-pagination" v-if="total > 0">
        <span class="t-pagination__total">已选 <b>{{ selectedIds.length }}</b> 项 · 共 <b>{{ total }}</b> 条</span>
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
    </section>

    <StudentFormDialog
      v-model="dialogVisible"
      :student-id="editId"
      @success="fetchData"
    />
  </div>
</template>

<script setup>
import { Plus, Search, User } from '@element-plus/icons-vue'
import YubPageHeader from '@/components/YubPageHeader.vue'
import StudentFormDialog from '@/views/edu/student/StudentFormDialog.vue'
import { useStudentManagement } from '@/composables/edu/useStudentManagement'

const {
  loading, tableData, total, pageNum, pageSize, queryParams,
  dialogVisible, editId, selectedIds, fetchData, handleQuery,
  handleReset, handleAdd, handleEdit, handleDelete, handleStatusChange,
  handleBatchDisable, handleResetPassword, handleSelectionChange
} = useStudentManagement()
</script>

<style scoped>
.student-card {
  padding: 0;
  overflow: hidden;
}

.student-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.student-cell__avatar {
  width: 30px;
  height: 30px;
  font-size: 13px;
}
</style>
