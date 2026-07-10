<template>
  <div class="yub-page-header">
    <div class="header-left">
      <h2 class="header-title">{{ title }}</h2>
      <p v-if="subtitle" class="header-subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.default" class="header-right">
      <slot />
    </div>
  </div>
</template>

<script setup>
/**
 * 统一页头组件
 *
 * 标题 + 摘要 + 右侧操作按钮区
 * 大气留白，标题左侧细强调线
 */
defineProps({
  /** 页头标题 */
  title: { type: String, required: true },
  /** 副标题/摘要 */
  subtitle: { type: String, default: '' }
})
</script>

<style scoped>
.yub-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.header-left {
  min-width: 0;
  padding-left: 12px;
  position: relative;
}

.header-left::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 18px;
  border-radius: 2px;
  background: var(--t-accent, #0c8e68);
}

.header-title {
  font-size: 19px;
  font-weight: 600;
  color: var(--t-text, #16201c);
  margin: 0;
  line-height: 1.35;
  letter-spacing: 0.2px;
}

.header-subtitle {
  font-size: 13px;
  color: var(--t-text-muted, #8a958f);
  margin: 4px 0 0;
  line-height: 1.5;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
</style>
