<template>
  <div class="points-verify-page">
    <el-card class="verify-card" shadow="never">
      <div class="card-accent"></div>
      <div class="verify-content">
        <h2 class="verify-title">兑换核销</h2>
        <p class="verify-desc">输入8位兑换码，查询并核销线下兑换订单</p>

        <div class="verify-input-wrap">
          <el-input
            v-model="exchangeCode"
            placeholder="请输入8位兑换码"
            size="large"
            maxlength="8"
            class="verify-input"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" size="large" :loading="searching" @click="handleSearch" style="margin-left: 12px">
            查询
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 查询结果 -->
    <el-card v-if="orderInfo" class="result-card" shadow="never">
      <div class="card-accent"></div>
      <div class="result-header">
        <h3 class="result-title">订单信息</h3>
        <el-tag :type="statusTag(orderInfo.status)" size="small">{{ statusLabel(orderInfo.status) }}</el-tag>
      </div>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单编号">{{ orderInfo.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="商品名称">{{ orderInfo.productName }}</el-descriptions-item>
        <el-descriptions-item label="兑换用户">{{ orderInfo.userName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="兑换时间">{{ formatDateTime(orderInfo.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="消耗积分">{{ orderInfo.pointsCost }}</el-descriptions-item>
        <el-descriptions-item label="兑换码">
          <el-tag type="warning" size="small">{{ orderInfo.exchangeCode }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="收货人" v-if="orderInfo.receiverName">{{ orderInfo.receiverName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话" v-if="orderInfo.receiverPhone">{{ orderInfo.receiverPhone }}</el-descriptions-item>
        <el-descriptions-item label="收货地址" :span="2" v-if="orderInfo.receiverAddress">{{ orderInfo.receiverAddress }}</el-descriptions-item>
      </el-descriptions>

      <div class="verify-action" v-if="orderInfo.status === 0">
        <el-button type="success" size="large" :loading="verifying" @click="handleVerify">
          确认核销
        </el-button>
      </div>
      <div class="verify-action" v-else>
        <el-alert :title="orderInfo.status === 3 ? '该订单已核销' : '该订单当前状态不可核销'" type="info" show-icon :closable="false" />
      </div>
    </el-card>

    <!-- 查询无结果 -->
    <el-card v-if="searched && !orderInfo && !searching" class="result-card" shadow="never">
      <el-empty description="未找到该兑换码对应的订单" />
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { verifyExchangeCode, getPointsOrderByCode } from '@/api/edu/pointsOrder'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

const exchangeCode = ref('')
const searching = ref(false)
const verifying = ref(false)
const searched = ref(false)
const orderInfo = ref(null)

function formatDateTime(date) {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '-'
}

function statusLabel(status) {
  const map = { 0: '待处理', 1: '已发货', 2: '已签收', 3: '已核销', 4: '已取消' }
  return map[status] || '未知'
}

function statusTag(status) {
  const map = { 0: 'warning', 1: '', 2: 'success', 3: 'info', 4: 'danger' }
  return map[status] || 'info'
}

async function handleSearch() {
  const code = exchangeCode.value.trim()
  if (!code) {
    ElMessage.warning('请输入兑换码')
    return
  }
  if (code.length !== 8) {
    ElMessage.warning('兑换码为8位字符')
    return
  }

  searching.value = true
  searched.value = false
  orderInfo.value = null
  try {
    const res = await getPointsOrderByCode(code)
    orderInfo.value = res.data || null
    searched.value = true
  } catch {
    orderInfo.value = null
    searched.value = true
  } finally {
    searching.value = false
  }
}

async function handleVerify() {
  if (!orderInfo.value) return

  try {
    await ElMessageBox.confirm(
      `确定核销订单 ${orderInfo.value.orderNo} 吗？核销后不可恢复。`,
      '核销确认',
      { type: 'warning', confirmButtonText: '确定核销', cancelButtonText: '取消' }
    )
  } catch {
    return
  }

  verifying.value = true
  try {
    await verifyExchangeCode({
      exchangeCode: exchangeCode.value.trim()
    })
    ElMessage.success('核销成功')
    orderInfo.value.status = 3
  } catch {
    // 错误已由 request 拦截器处理
  } finally {
    verifying.value = false
  }
}
</script>

<style scoped>
@import '@/assets/css/user-management.css';
.points-verify-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 16px;
}
.verify-card {
  position: relative;
}
.verify-content {
  padding: 20px 0;
}
.verify-title {
  font-size: 22px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}
.verify-desc {
  font-size: 14px;
  color: #94a3b8;
  margin: 0 0 24px 0;
}
.verify-input-wrap {
  display: flex;
  align-items: center;
}
.verify-input {
  max-width: 320px;
}
.verify-input :deep(.el-input__inner) {
  font-size: 18px;
  letter-spacing: 3px;
  font-weight: 600;
}
.result-card {
  position: relative;
}
.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.result-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}
.verify-action {
  margin-top: 20px;
  text-align: center;
}
</style>
