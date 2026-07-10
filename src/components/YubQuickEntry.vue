<template>
  <router-link
    v-if="to"
    :to="to"
    class="yub-quick-entry"
  >
    <div class="entry-icon">
      <el-icon :size="24"><component :is="icon" /></el-icon>
    </div>
    <div class="entry-title">{{ title }}</div>
    <div v-if="description" class="entry-desc">{{ description }}</div>
    <span class="entry-arrow">
      <el-icon :size="14"><ArrowRight /></el-icon>
    </span>
  </router-link>

  <div v-else class="yub-quick-entry" @click="$emit('click')">
    <div class="entry-icon">
      <el-icon :size="24"><component :is="icon" /></el-icon>
    </div>
    <div class="entry-title">{{ title }}</div>
    <div v-if="description" class="entry-desc">{{ description }}</div>
    <span class="entry-arrow">
      <el-icon :size="14"><ArrowRight /></el-icon>
    </span>
  </div>
</template>

<script setup>
/**
 * 快捷入口卡片组件
 *
 * 简约风格：统一深绿点缀，悬停微抬升 + 箭头提示，无彩虹色
 */
import { ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  /** 图标组件 */
  icon: { type: [Object, String], required: true },
  /** 标题 */
  title: { type: String, required: true },
  /** 描述文字 */
  description: { type: String, default: '' },
  /** 路由地址 (有值时渲染为 router-link) */
  to: { type: [String, Object], default: '' }
})

defineEmits(['click'])
</script>

<style scoped>
.yub-quick-entry {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 26px 24px 22px;
  background: var(--t-surface, #fff);
  border: 1px solid var(--t-border, #ECEFEE);
  border-radius: var(--t-radius, 14px);
  box-shadow: var(--t-shadow-sm, 0 1px 2px rgba(16, 24, 20, 0.05));
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  text-decoration: none;
  color: inherit;
}

.yub-quick-entry:hover {
  transform: translateY(-3px);
  box-shadow: 0 2px 8px rgba(16, 24, 20, 0.07), 0 14px 32px rgba(16, 24, 20, 0.09);
  border-color: var(--t-accent, #0c8e68);
}

.entry-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  border-radius: 14px;
  background: var(--t-accent-soft, #EEF8F3);
  color: var(--t-accent-strong, #0A7355);
  transition: transform 0.2s ease, background 0.2s ease;
}

.yub-quick-entry:hover .entry-icon {
  transform: scale(1.05);
  background: var(--t-accent, #0c8e68);
  color: #fff;
}

.entry-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--t-text, #16201c);
}

.entry-desc {
  font-size: 12.5px;
  color: var(--t-text-muted, #8a958f);
  line-height: 1.5;
}

.entry-arrow {
  position: absolute;
  right: 18px;
  bottom: 18px;
  color: var(--t-text-faint, #AEB8B2);
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.2s ease;
}

.yub-quick-entry:hover .entry-arrow {
  opacity: 1;
  transform: translateX(0);
  color: var(--t-accent, #0c8e68);
}
</style>
