<template>
  <div class="yub-empty">
    <el-icon :size="64" class="empty-icon"><component :is="icon" /></el-icon>
    <p class="empty-text">{{ description }}</p>
    <slot />
  </div>
</template>

<script setup>
/**
 * 统一空状态组件
 *
 * 图标 + 描述文字 + 可选操作按钮
 * 用于表格空数据、列表空状态
 */
import { Box } from '@element-plus/icons-vue'

defineProps({
  /** 空状态图标 */
  icon: { type: [Object, String], default: Box },
  /** 描述文字 */
  description: { type: String, default: '暂无数据' }
})
</script>

<style scoped>
.yub-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  color: #d0d5dd;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 14px;
  color: #8c93a0;
  margin: 0 0 16px;
}
</style>
