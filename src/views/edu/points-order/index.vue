<template>
  <div class="points-order-management">
    <!-- 搜索区 -->
    <el-card class="search-card" shadow="never">
      <div class="card-accent"></div>
      <el-form :model="queryParams" inline>
        <el-form-item label="订单编号">
          <el-input v-model="queryParams.orderNo" placeholder="订单编号" clearable style="width: 180px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="兑换码">
          <el-input v-model="queryParams.exchangeCode" placeholder="兑换码" clearable style="width: 150px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="待处理" :value="0" />
            <el-option label="已发货" :value="1" />
            <el-option label="已签收" :value="2" />
            <el-option label="已核销" :value="3" />
            <el-option label="已取消" :value="4" />
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
        <div class="table-title">积分订单列表</div>
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
        <el-table-column prop="orderNo" label="订单编号" min-width="180" show-overflow-tooltip />
        <el-table-column prop="productName" label="商品名称" min-width="140" show-overflow-tooltip />
        <el-table-column label="兑换方式" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="exchangeTypeTag(row.exchangeType)" size="small">
              {{ exchangeTypeLabel(row.exchangeType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="receiverName" label="收货人" width="100" align="center" />
        <el-table-column label="快递信息" min-width="160">
          <template #default="{ row }">
            <template v-if="row.expressCompany">
              <span>{{ row.expressCompany }}</span>
              <br />
              <span style="color: #909399; font-size: 12px">{{ row.expressNo || '-' }}</span>
            </template>
            <span v-else style="color: #c0c4cc">-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" size="small">
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="170">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleDetail(row)">查看详情</el-button>
            <el-button
              v-if="row.status === 0 && row.exchangeType === 2"
              link type="primary" size="small"
              @click="handleShip(row)"
            >发货</el-button>
            <el-button
              v-if="row.status === 0 && row.exchangeType === 1"
              link type="primary" size="small"
              style="color: var(--el-color-primary)"
              @click="handleVerify(row)"
            >核销</el-button>
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
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </div>

    <!-- 发货对话框 -->
    <OrderShipDialog
      v-model="shipDialogVisible"
      @confirm="handleShipConfirm"
    />

    <!-- 订单详情对话框 -->
    <YubDialog title="订单详情" v-model="detailDialogVisible" width="520px" destroy-on-close>
      <el-descriptions v-if="detailOrder" :column="2" border>
        <el-descriptions-item label="订单编号" :span="2">{{ detailOrder.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="商品名称" :span="2">{{ detailOrder.productName }}</el-descriptions-item>
        <el-descriptions-item label="消耗积分">{{ detailOrder.pointsCost }}</el-descriptions-item>
        <el-descriptions-item label="兑换方式">{{ exchangeTypeLabel(detailOrder.exchangeType) }}</el-descriptions-item>
        <el-descriptions-item label="兑换码" :span="2" v-if="detailOrder.exchangeCode">
          <el-tag type="warning" size="small">{{ detailOrder.exchangeCode }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="收货人" v-if="detailOrder.receiverName">{{ detailOrder.receiverName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话" v-if="detailOrder.receiverPhone">{{ detailOrder.receiverPhone }}</el-descriptions-item>
        <el-descriptions-item label="收货地址" :span="2" v-if="detailOrder.receiverAddress">{{ detailOrder.receiverAddress }}</el-descriptions-item>
        <el-descriptions-item label="快递公司" v-if="detailOrder.expressCompany">{{ detailOrder.expressCompany }}</el-descriptions-item>
        <el-descriptions-item label="快递单号" v-if="detailOrder.expressNo">{{ detailOrder.expressNo }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusTag(detailOrder.status)" size="small">{{ statusLabel(detailOrder.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(detailOrder.createTime) }}</el-descriptions-item>
      </el-descriptions>
    </YubDialog>
  </div>
</template>

<script setup>
import dayjs from 'dayjs'
import { List } from '@element-plus/icons-vue'
import YubDialog from '@/components/YubDialog.vue'
import { usePointsOrderManagement } from '@/composables/edu/usePointsOrderManagement'
import OrderShipDialog from './OrderShipDialog.vue'
import { verifyExchangeCode } from '@/api/edu/pointsOrder'
import { ElMessage, ElMessageBox } from 'element-plus'

const {
  loading, tableData, total, pageNum, pageSize, queryParams,
  shipDialogVisible,
  detailDialogVisible, detailOrder,
  fetchData, handleQuery, handleReset, handleDetail, handleShip, handleShipConfirm
} = usePointsOrderManagement()

function formatDateTime(date) {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '-'
}

/** 兑换方式标签 */
function exchangeTypeLabel(type) {
  const map = { 1: '线下兑换', 2: '邮寄' }
  return map[type] || '未知'
}

function exchangeTypeTag(type) {
  const map = { 1: 'warning', 2: 'primary' }
  return map[type] || 'info'
}

/** 状态标签 */
function statusLabel(status) {
  const map = { 0: '待处理', 1: '已发货', 2: '已签收', 3: '已核销', 4: '已取消' }
  return map[status] || '未知'
}

function statusTag(status) {
  const map = { 0: 'warning', 1: '', 2: 'success', 3: 'info', 4: 'danger' }
  return map[status] || 'info'
}

/** 核销操作 */
function handleVerify(row) {
  ElMessageBox.confirm(
    `确定核销订单 ${row.orderNo} 吗？核销后不可恢复。`,
    '核销确认',
    { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }
  ).then(async () => {
    try {
      await verifyExchangeCode({ orderNo: row.orderNo, exchangeCode: row.exchangeCode })
      ElMessage.success('核销成功')
      fetchData()
    } catch {
      // 错误已由 request 拦截器处理
    }
  }).catch(() => {})
}
</script>

<style scoped>
@import '@/assets/css/user-management.css';
.points-order-management {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
