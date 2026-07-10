<template>
  <div class="yub-stat-card">
    <div class="stat-icon">
      <el-icon :size="22"><component :is="icon" /></el-icon>
    </div>
    <div class="stat-info">
      <div class="stat-value">{{ displayValue }}</div>
      <div class="stat-title">{{ title }}</div>
    </div>
    <div v-if="trend !== undefined" class="stat-trend" :class="trendClass">
      <el-icon :size="13">
        <Top v-if="trend > 0" />
        <Bottom v-else-if="trend < 0" />
      </el-icon>
      <span>{{ Math.abs(trend) }}%</span>
    </div>
  </div>
</template>

<script setup>
/**
 * 统计卡片组件
 *
 * 简约风格：统一深绿点缀，无彩虹色、无渐变
 * 图标 + 数值 + 标题 + 可选趋势（绿升红降，语义色）
 */
import { computed } from 'vue'
import { Top, Bottom } from '@element-plus/icons-vue'

const props = defineProps({
  /** 图标组件 (Element Plus 图标) */
  icon: { type: [Object, String], required: true },
  /** 标题文本 */
  title: { type: String, required: true },
  /** 数值 */
  value: { type: [Number, String], default: 0 },
  /** 趋势百分比 (正数上升，负数下降) */
  trend: { type: Number, default: undefined }
})

const displayValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString()
  }
  return props.value
})

const trendClass = computed(() => ({
  'trend-up': props.trend > 0,
  'trend-down': props.trend < 0
}))
</script>

<style scoped>
.yub-stat-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 26px 28px;
  background: var(--t-surface, #fff);
  border: 1px solid var(--t-border, #ECEFEE);
  border-radius: var(--t-radius, 14px);
  box-shadow: var(--t-shadow, 0 1px 3px rgba(16, 24, 20, 0.04), 0 8px 24px rgba(16, 24, 20, 0.05));
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  position: relative;
}

.yub-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(16, 24, 20, 0.06), 0 12px 30px rgba(16, 24, 20, 0.08);
  border-color: var(--t-border-strong, #E0E4E2);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 13px;
  flex-shrink: 0;
  background: var(--t-accent-soft, #EEF8F3);
  color: var(--t-accent-strong, #0A7355);
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--t-text, #16201c);
  line-height: 1.15;
  letter-spacing: -0.5px;
}

.stat-title {
  font-size: 13px;
  color: var(--t-text-muted, #8a958f);
  margin-top: 4px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 600;
  position: absolute;
  top: 16px;
  right: 18px;
}

.trend-up {
  color: #0A7355;
}

.trend-down {
  color: #C0392B;
}
</style>
