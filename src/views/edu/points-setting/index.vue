<template>
  <div class="points-setting-management">
    <!-- 设置卡片 -->
    <el-card class="search-card" shadow="never">
      <div class="card-accent"></div>
      <div class="card-title">积分设置</div>

      <el-form :model="formData" label-width="120px" style="max-width: 700px; margin-top: 20px">
        <!-- 注册积分 -->
        <div class="setting-row">
          <div class="setting-label">注册积分</div>
          <div class="setting-body">
            <div class="setting-desc">初次注册，送 <el-input-number v-model="formData.points_register" :min="0" size="small" style="width: 120px; margin: 0 8px" /> 积分，（注册即得积分）</div>
          </div>
        </div>

        <!-- 登录积分 -->
        <div class="setting-row">
          <div class="setting-label">登录积分</div>
          <div class="setting-body">
            <div class="setting-desc">每次登录增加 <el-input-number v-model="formData.points_login" :min="0" size="small" style="width: 120px; margin: 0 8px" /> 积分，每天最多 <el-input-number v-model="formData.points_login_daily_max" :min="0" size="small" style="width: 120px; margin: 0 8px" /> 积分</div>
          </div>
        </div>

        <!-- 分享积分 -->
        <div class="setting-row">
          <div class="setting-label">分享积分</div>
          <div class="setting-body">
            <div class="setting-desc">分享链接每次访问增加 <el-input-number v-model="formData.points_share" :min="0" size="small" style="width: 120px; margin: 0 8px" /> 积分，每天最多 <el-input-number v-model="formData.points_share_daily_max" :min="0" size="small" style="width: 120px; margin: 0 8px" /> 积分</div>
          </div>
        </div>

        <!-- 分享注册 -->
        <div class="setting-row">
          <div class="setting-label">分享注册</div>
          <div class="setting-body">
            <div class="setting-desc">通过分享链接每注册一位加 <el-input-number v-model="formData.points_share_register" :min="0" size="small" style="width: 120px; margin: 0 8px" /> 积分，每天最多 <el-input-number v-model="formData.points_share_register_daily_max" :min="0" size="small" style="width: 120px; margin: 0 8px" /> 积分</div>
          </div>
        </div>

        <!-- 积分兑换 -->
        <div class="setting-row">
          <div class="setting-label">积分兑换</div>
          <div class="setting-body">
            <div class="setting-desc">每 <el-input-number v-model="formData.points_exchange_rate" :min="0" size="small" style="width: 120px; margin: 0 8px" /> 积分，兑换1个卡券（卡券可以购买课程，但不可以提现）</div>
          </div>
        </div>

        <div class="setting-actions">
          <el-button type="primary" :loading="submitting" @click="handleSave">保存修改</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getPointsSettings, savePointsSettings } from '@/api/edu/pointsSetting'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const submitting = ref(false)

const formData = reactive({
  points_register: 0,
  points_login: 0,
  points_login_daily_max: 0,
  points_share: 0,
  points_share_daily_max: 0,
  points_share_register: 0,
  points_share_register_daily_max: 0,
  points_exchange_rate: 0
})

onMounted(() => {
  fetchSettings()
})

async function fetchSettings() {
  loading.value = true
  try {
    const res = await getPointsSettings()
    if (res.data) {
      Object.keys(formData).forEach(key => {
        if (res.data[key] !== undefined && res.data[key] !== null) {
          formData[key] = Number(res.data[key]) || 0
        }
      })
    }
  } catch {
    // 错误已由 request.js 拦截器处理
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  submitting.value = true
  try {
    await savePointsSettings({ ...formData })
    ElMessage.success('保存成功')
    fetchSettings()
  } catch {
    // 错误已由 request.js 拦截器处理
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
@import '@/assets/css/user-management.css';
.points-setting-management {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: calc(100vh - 140px);
  padding: 0;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}
.setting-row {
  display: flex;
  align-items: flex-start;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
}
.setting-row:last-of-type {
  border-bottom: none;
}
.setting-label {
  width: 100px;
  flex-shrink: 0;
  font-weight: 500;
  color: #334155;
  padding-top: 4px;
}
.setting-body {
  flex: 1;
}
.setting-desc {
  font-size: 14px;
  color: #64748b;
  line-height: 32px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.setting-actions {
  margin-top: 24px;
  padding-left: 120px;
}
</style>
