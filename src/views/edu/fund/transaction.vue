<template>
  <div class="transaction-management">
    <!-- 搜索区 -->
    <el-card class="search-card" shadow="never">
      <div class="card-accent"></div>
      <el-form :model="queryParams" inline @submit.prevent="handleQuery">
        <el-form-item label="用户名">
          <el-input v-model="queryParams.userName" placeholder="请输入用户名" clearable @clear="handleQuery" />
        </el-form-item>
        <el-form-item label="交易类型">
          <el-select v-model="queryParams.transactionType" placeholder="全部" clearable @change="handleQuery">
            <el-option label="充值" value="RECHARGE" />
            <el-option label="课程购买" value="COURSE_PURCHASE" />
            <el-option label="退款" value="REFUND" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="onDateChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <div class="table-wrapper">
      <el-table
        :data="tableData"
        v-loading="loading"
        border
        stripe
        style="width: 100%"
        :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: 600 }"
      >
        <el-table-column prop="id" label="交易ID" width="100" />
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column label="交易类型" width="120">
          <template #default="{ row }">
            <el-tag :type="typeTagType(row.transactionType)" size="small">
              {{ typeLabel(row.transactionType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="120">
          <template #default="{ row }">
            <span :style="{ color: row.amount >= 0 ? 'var(--el-color-success)' : '#f56c6c' }">
              {{ row.amount >= 0 ? '+' : '' }}¥{{ Math.abs(row.amount).toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="交易后余额" width="120">
          <template #default="{ row }">¥{{ row.balanceAfter?.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="description" label="交易描述" min-width="250" show-overflow-tooltip />
        <el-table-column prop="createTime" label="交易时间" width="180" />

        <template #empty>
          <div class="empty-state">
            <el-icon :size="56" color="#cbd5e1"><List /></el-icon>
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
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { List } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'
import { useTransactionManagement } from '@/composables/edu/useTransactionManagement'

const route = useRoute()
const dateRange = ref(null)

const { loading, tableData, total, pageNum, pageSize, queryParams, handleQuery, handleReset, handleSizeChange, handleCurrentChange, setUserId } = useTransactionManagement()

onMounted(() => {
  if (route.query.userId) {
    setUserId(Number(route.query.userId))
  }
})

function onDateChange(val) {
  if (val) {
    queryParams.startTime = val[0]
    queryParams.endTime = val[1]
  } else {
    queryParams.startTime = ''
    queryParams.endTime = ''
  }
  handleQuery()
}

function typeLabel(type) {
  const map = { RECHARGE: '充值', COURSE_PURCHASE: '课程购买', REFUND: '退款' }
  return map[type] || type
}

function typeTagType(type) {
  const map = { RECHARGE: 'success', COURSE_PURCHASE: '', REFUND: 'warning' }
  return map[type] || 'info'
}
</script>

<style scoped>
@import '@/assets/css/user-management.css';
.transaction-management {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
