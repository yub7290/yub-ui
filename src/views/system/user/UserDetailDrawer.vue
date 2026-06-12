<template>
  <el-drawer v-model="visible" title="用户详情" size="450px" @open="handleOpen">
    <template v-if="detail">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="账号">{{ detail.account }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ detail.nickName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ detail.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ detail.email || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detail.status === 1 ? 'success' : 'info'" size="small">
            {{ detail.status === 1 ? '启用' : '停用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="最后登录时间">{{ detail.lastLoginTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="最后登录IP">{{ detail.lastLoginIp || '-' }}</el-descriptions-item>
        <el-descriptions-item label="登录次数">{{ detail.loginCount ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ detail.updateTime || '-' }}</el-descriptions-item>
      </el-descriptions>
    </template>
    <div v-else class="loading-wrapper">
      <el-icon :size="32" class="is-loading"><Loading /></el-icon>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getUserDetail } from '@/api/system/user'

const props = defineProps({
  modelValue: Boolean,
  userId: { type: Number, default: null }
})
const emit = defineEmits(['update:modelValue'])

const visible = ref(false)
const detail = ref(null)

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (!val) {
    detail.value = null
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

/**
 * 抽屉打开时加载用户详情
 */
async function handleOpen() {
  if (!props.userId) return
  try {
    const res = await getUserDetail(props.userId)
    detail.value = res.data
  } catch {
    // 错误已由 request.js 拦截器处理
  }
}
</script>

<style scoped>
.loading-wrapper {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}
</style>
