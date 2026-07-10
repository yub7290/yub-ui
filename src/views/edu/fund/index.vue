<template>
  <div class="fund-management">
    <!-- 搜索区 -->
    <el-card class="search-card" shadow="never">
      <div class="card-accent"></div>
      <el-form :model="queryParams" inline @submit.prevent="handleQuery">
        <el-form-item label="用户名">
          <el-input v-model="queryParams.userName" placeholder="请输入用户名" clearable @clear="handleQuery" />
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
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="userName" label="用户名" width="150" />
        <el-table-column prop="balance" label="可用余额" width="120">
          <template #default="{ row }">¥{{ row.balance?.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="totalRecharge" label="累计充值" width="120">
          <template #default="{ row }">¥{{ row.totalRecharge?.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="totalConsumption" label="累计消费" width="120">
          <template #default="{ row }">¥{{ row.totalConsumption?.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">查看明细</el-button>
          </template>
        </el-table-column>

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
import { List } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useFundManagement } from '@/composables/edu/useFundManagement'

const router = useRouter()
const { loading, tableData, total, pageNum, pageSize, queryParams, handleQuery, handleReset, handleSizeChange, handleCurrentChange } = useFundManagement()

function viewDetail(row) {
  router.push({ path: '/edu/fund/transaction', query: { userId: row.userId } })
}
</script>

<style scoped>
@import '@/assets/css/user-management.css';
.fund-management {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
