<template>
  <div class="dashboard">
    <!-- 顶部 KPI 指标 -->
    <el-row :gutter="16" class="stat-cards">
      <el-col :xs="12" :sm="12" :md="8" :lg="4" v-for="card in statCards" :key="card.key">
        <div class="stat-card">
          <div class="stat-body">
            <div class="stat-title">{{ card.title }}</div>
            <div class="stat-value">{{ animatedValues[card.key] || 0 }}</div>
          </div>
          <div class="stat-chip">
            <el-icon :size="22"><component :is="card.icon" /></el-icon>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 中部两栏 -->
    <el-row :gutter="16" class="middle-section">
      <!-- 左侧图表 -->
      <el-col :span="16" class="col-charts">
        <el-card class="dcard dcard--chart chart-main" shadow="never">
          <template #header>
            <div class="dcard__head">
              <span class="dcard__title">学员增长趋势</span>
              <el-tag size="small" type="info" effect="plain">近30天</el-tag>
            </div>
          </template>
          <v-chart v-if="dashboardData.studentGrowth.length" class="chart" :option="studentGrowthOption" autoresize />
          <div v-else class="chart-empty">
            <el-empty description="暂无数据" :image-size="56" />
          </div>
        </el-card>

        <div class="chart-row">
          <el-card class="dcard dcard--chart chart-half" shadow="never">
            <template #header>
              <div class="dcard__head">
                <span class="dcard__title">订单与收入</span>
                <el-tag size="small" type="info" effect="plain">近30天</el-tag>
              </div>
            </template>
            <v-chart v-if="dashboardData.orderAndIncome.length" class="chart" :option="orderIncomeOption" autoresize />
            <div v-else class="chart-empty">
              <el-empty description="暂无数据" :image-size="56" />
            </div>
          </el-card>

          <el-card class="dcard dcard--chart chart-half" shadow="never">
            <template #header>
              <div class="dcard__head">
                <span class="dcard__title">考试通过率</span>
                <el-tag size="small" type="info" effect="plain">本月</el-tag>
              </div>
            </template>
            <v-chart v-if="hasExamData" class="chart" :option="examPassOption" autoresize />
            <div v-else class="chart-empty">
              <el-empty description="暂无数据" :image-size="56" />
            </div>
          </el-card>
        </div>
      </el-col>

      <!-- 右侧工具区 -->
      <el-col :span="8" class="col-tools">
        <el-card class="dcard tool-todo" shadow="never">
          <template #header>
            <div class="dcard__head">
              <span class="dcard__title">待办事项</span>
              <el-badge v-if="todoCount > 0" :value="todoCount" class="tool-badge" type="danger" />
            </div>
          </template>
          <div class="todo-list">
            <div v-for="(item, index) in todoList" :key="index" class="todo-item" @click="handleTodoClick(item)">
              <div class="todo-text">{{ item.title }}</div>
              <div class="todo-right">
                <span v-if="item.count" class="todo-count">{{ item.count }}</span>
                <el-icon class="todo-arrow"><ArrowRight /></el-icon>
              </div>
            </div>
            <div v-if="!todoList.length" class="todo-empty">
              <el-icon :size="26" color="#c0c4cc"><Finished /></el-icon>
              <span>暂无待办事项</span>
            </div>
          </div>
        </el-card>

        <el-card class="dcard tool-quick" shadow="never">
          <template #header>
            <div class="dcard__head">
              <span class="dcard__title">快捷入口</span>
            </div>
          </template>
          <div class="quick-grid">
            <div v-for="entry in quickEntries" :key="entry.title" class="quick-item" @click="router.push(entry.path)">
              <div class="quick-chip">
                <el-icon :size="18" color="var(--c-accent)"><component :is="entry.icon" /></el-icon>
              </div>
              <span class="quick-label">{{ entry.title }}</span>
            </div>
          </div>
        </el-card>

        <el-card class="dcard tool-rank" shadow="never">
          <template #header>
            <div class="dcard__head">
              <span class="dcard__title">课程热度排行</span>
            </div>
          </template>
          <div class="rank-list">
            <div v-for="(course, index) in topCourses" :key="index" class="rank-item">
              <div class="rank-header">
                <span class="rank-name">
                  <span class="rank-index" :class="{ 'rank-top': index < 3 }">{{ index + 1 }}</span>
                  {{ course.name }}
                </span>
                <span class="rank-count">{{ course.studentCount }} 人</span>
              </div>
              <el-progress
                :percentage="getRankPercentage(course.studentCount)"
                :stroke-width="5"
                :show-text="false"
                :color="index < 3 ? '#409EFF' : '#C9CDD4'"
              />
            </div>
            <el-empty v-if="!topCourses.length" description="暂无数据" :image-size="56" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, LegendComponent, GridComponent
} from 'echarts/components'
import {
  Reading, User, EditPen, Avatar, Document,
  ShoppingCart, Finished, ArrowRight, UserFilled
} from '@element-plus/icons-vue'
import { getDashboardStats } from '@/api/system/dashboard'

use([
  CanvasRenderer, LineChart, BarChart, PieChart,
  TitleComponent, TooltipComponent, LegendComponent, GridComponent
])

const router = useRouter()

/** KPI 指标（顶部 6 个：4 个核心总量 + 2 个运营指标） */
const statCards = [
  { key: 'courseCount', title: '课程总数', icon: Reading },
  { key: 'studentCount', title: '学员总数', icon: User },
  { key: 'teacherCount', title: '教师总数', icon: Avatar },
  { key: 'questionCount', title: '试题总数', icon: Document },
  { key: 'todayNewStudents', title: '今日新增', icon: UserFilled },
  { key: 'pendingOrderCount', title: '待处理订单', icon: ShoppingCart }
]

/** 快捷入口 */
const quickEntries = [
  { title: '新建课程', icon: Reading, path: '/edu/course' },
  { title: '新建试卷', icon: EditPen, path: '/edu/exam' },
  { title: '管理学员', icon: User, path: '/edu/student' },
  { title: '查看订单', icon: ShoppingCart, path: '/edu/fund/course-order' }
]

/** 动画数值 */
const animatedValues = reactive({})
const animationTimers = []

function animateValue(key, target) {
  const duration = 800
  const steps = 30
  const increment = target / steps
  let current = 0
  let step = 0
  const timer = setInterval(() => {
    step++
    current = Math.min(Math.round(increment * step), target)
    animatedValues[key] = current
    if (step >= steps) {
      animatedValues[key] = target
      clearInterval(timer)
    }
  }, duration / steps)
  animationTimers.push(timer)
}

/** 主数据 */
const dashboardData = reactive({
  studentGrowth: [],
  orderAndIncome: [],
  examPassRate: { passed: 0, failed: 0, pending: 0 },
  topCourses: [],
  recentLogins: [],
  recentOperations: []
})

const topCourses = computed(() => dashboardData.topCourses)
const hasExamData = computed(() => {
  const d = dashboardData.examPassRate
  return d.passed > 0 || d.failed > 0 || d.pending > 0
})

function getRankPercentage(count) {
  const max = topCourses.value.length ? topCourses.value[0].studentCount : 1
  return Math.round((count / max) * 100)
}

/** 待办事项 */
const todoList = reactive([])
const todoCount = computed(() => todoList.reduce((sum, item) => sum + (item.count || 0), 0))

function handleTodoClick(item) {
  if (item.path) router.push(item.path)
}

/** 图表配置 — 学员增长趋势 */
const studentGrowthOption = computed(() => {
  const data = dashboardData.studentGrowth
  return {
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#eee', textStyle: { color: '#303133' } },
    grid: { top: 16, right: 18, bottom: 28, left: 42 },
    xAxis: { type: 'category', data: data.map(d => d.date), boundaryGap: false, axisLine: { lineStyle: { color: '#e6e8eb' } }, axisLabel: { color: '#8a94a6', fontSize: 10 } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f2f3f5' } }, axisLabel: { color: '#8a94a6', fontSize: 10 } },
    series: [{
      type: 'line', data: data.map(d => d.count), smooth: true, symbol: 'circle', symbolSize: 5,
      lineStyle: { color: '#409EFF', width: 2 }, itemStyle: { color: '#409EFF' },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(64,158,255,0.16)' }, { offset: 1, color: 'rgba(64,158,255,0.01)' }] } }
    }]
  }
})

/** 图表配置 — 订单与收入 */
const orderIncomeOption = computed(() => {
  const data = dashboardData.orderAndIncome
  return {
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#eee', textStyle: { color: '#303133' } },
    legend: { data: ['订单数', '收入'], bottom: 0, textStyle: { color: '#8a94a6', fontSize: 10 } },
    grid: { top: 16, right: 48, bottom: 48, left: 42 },
    xAxis: { type: 'category', data: data.map(d => d.date), axisLine: { lineStyle: { color: '#e6e8eb' } }, axisLabel: { color: '#8a94a6', fontSize: 10 } },
    yAxis: [
      { type: 'value', name: '订单数', nameTextStyle: { color: '#8a94a6', fontSize: 10 }, splitLine: { lineStyle: { color: '#f2f3f5' } }, axisLabel: { color: '#8a94a6', fontSize: 10 } },
      { type: 'value', name: '收入(元)', nameTextStyle: { color: '#8a94a6', fontSize: 10 }, splitLine: { show: false }, axisLabel: { color: '#8a94a6', fontSize: 10 } }
    ],
    series: [
      { name: '订单数', type: 'bar', data: data.map(d => d.orderCount), itemStyle: { color: '#409EFF', borderRadius: [3, 3, 0, 0] }, barWidth: 12 },
      { name: '收入', type: 'line', yAxisIndex: 1, data: data.map(d => d.income), smooth: true, symbol: 'circle', symbolSize: 5, lineStyle: { color: '#E6A23C', width: 2 }, itemStyle: { color: '#E6A23C' } }
    ]
  }
})

/** 图表配置 — 考试通过率 */
const examPassOption = computed(() => {
  const data = dashboardData.examPassRate
  const total = data.passed + data.failed + data.pending
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, textStyle: { color: '#8a94a6', fontSize: 10 } },
    series: [{
      type: 'pie', radius: ['38%', '64%'], center: ['50%', '42%'],
      label: {
        show: true, position: 'center',
        formatter: `{a|${total}}\n{b|总数}`,
        rich: { a: { fontSize: 22, fontWeight: 'bold', color: '#1d2129', lineHeight: 28 }, b: { fontSize: 11, color: '#8a94a6', lineHeight: 18 } }
      },
      emphasis: { label: { show: true } },
      labelLine: { show: false },
      data: [
        { value: data.passed, name: '通过', itemStyle: { color: '#67C23A' } },
        { value: data.failed, name: '未通过', itemStyle: { color: '#F56C6C' } },
        { value: data.pending, name: '待批阅', itemStyle: { color: '#E6A23C' } }
      ]
    }]
  }
})

/** 数据加载 */
onMounted(async () => {
  try {
    const res = await getDashboardStats()
    const data = res.data
    statCards.forEach(card => animateValue(card.key, data[card.key] || 0))
    Object.assign(dashboardData, {
      studentGrowth: data.studentGrowth || [],
      orderAndIncome: data.orderAndIncome || [],
      examPassRate: data.examPassRate || { passed: 0, failed: 0, pending: 0 },
      topCourses: data.topCourses || [],
      recentLogins: data.recentLogins || [],
      recentOperations: data.recentOperations || []
    })
    todoList.splice(0, todoList.length,
      { title: '待批改作业', count: data.pendingHomeworkCount || 0, path: (data.pendingHomeworkCount || 0) > 0 ? '/edu/homework' : null },
      { title: '待处理订单', count: data.pendingOrderCount || 0, path: (data.pendingOrderCount || 0) > 0 ? '/edu/fund/course-order' : null }
    )
  } catch { /* 保留默认值 */ }
})

onBeforeUnmount(() => animationTimers.forEach(t => clearInterval(t)))
</script>

<style scoped>
.dashboard {
  /* 设计令牌：中性留白 + 单一蓝色强调，去渐变、克制阴影 */
  --c-accent: #409EFF;
  --c-accent-soft: #ECF5FF;
  --c-surface: #FFFFFF;
  --c-border: #ECEEF1;
  --c-border-strong: #E3E6EA;
  --c-text: #1D2129;
  --c-text-2: #5C6573;
  --c-muted: #8A94A6;
  --c-radius: 12px;
  --c-radius-sm: 10px;
  --c-shadow: 0 1px 2px rgba(16, 24, 20, 0.04);
  --c-shadow-hover: 0 6px 20px rgba(16, 24, 20, 0.06);
  --c-font: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif;

  height: 100%;
  padding: 20px 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: var(--theme-page-bg, #f0f2f5);
  font-family: var(--c-font);
  color: var(--c-text);
}

/* ======== KPI 卡片 ======== */
.stat-cards { flex-shrink: 0; }

.stat-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 84px;
  padding: 0 20px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--c-radius);
  box-shadow: var(--c-shadow);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  border-color: var(--c-accent);
  box-shadow: var(--c-shadow-hover);
}

.stat-body { min-width: 0; }

.stat-title {
  font-size: 13px;
  color: var(--c-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-value {
  margin-top: 6px;
  font-size: 26px;
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: 0.3px;
  color: var(--c-text);
}

.stat-chip {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: var(--c-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--c-accent-soft);
  color: var(--c-accent);
}

/* ======== 中部两栏 ======== */
.middle-section {
  flex: 1;
  min-height: 0;
}

.col-charts,
.col-tools {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.col-charts > .chart-main { flex: 1.1; min-height: 0; }
.chart-row { display: flex; gap: 16px; flex: 1; min-height: 0; }
.chart-half { flex: 1; min-width: 0; }

.col-tools > .tool-todo { flex: 0.6; min-height: 0; }
.col-tools > .tool-quick { flex: none; }
.col-tools > .tool-rank { flex: 1; min-height: 0; }

/* ======== 通用卡片 ======== */
.dcard {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--c-radius);
  box-shadow: var(--c-shadow);
  transition: box-shadow 0.25s ease;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.dcard:hover { box-shadow: var(--c-shadow-hover); }

.dcard :deep(.el-card__header) {
  padding: 14px 18px;
  border-bottom: 1px solid var(--c-border);
  flex-shrink: 0;
}

.dcard :deep(.el-card__body) {
  padding: 16px 18px;
  flex: 1;
  min-height: 0;
}

.dcard__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dcard__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text);
}

.dcard__title::before {
  content: '';
  width: 3px;
  height: 13px;
  border-radius: 2px;
  background: var(--c-accent);
}

/* ======== 图表 ======== */
.dcard--chart :deep(.el-card__body) {
  padding: 8px 12px 12px;
  display: flex;
}

.chart {
  flex: 1;
  width: 100%;
  min-height: 0;
}

.chart-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
}

/* ======== 待办事项 ======== */
.tool-badge :deep(.el-badge__content) { font-size: 11px; }

.todo-list { display: flex; flex-direction: column; }

.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 0;
  border-bottom: 1px solid #f2f3f5;
  cursor: pointer;
  transition: background 0.18s ease;
}

.todo-item:last-child { border-bottom: none; }

.todo-item:hover {
  background: #f7f9fb;
  margin: 0 -18px;
  padding-left: 18px;
  padding-right: 18px;
}

.todo-text { font-size: 13px; color: var(--c-text-2); }

.todo-right { display: flex; align-items: center; gap: 8px; }

.todo-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--c-accent);
}

.todo-arrow { color: #c0c4cc; font-size: 14px; }

.todo-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 24px 0;
  color: var(--c-muted);
  font-size: 12px;
}

/* ======== 快捷入口 ======== */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 4px;
  border: 1px solid var(--c-border);
  border-radius: var(--c-radius-sm);
  cursor: pointer;
  transition: border-color 0.18s ease, background 0.18s ease;
}

.quick-item:hover {
  border-color: var(--c-accent);
  background: var(--c-accent-soft);
}

.quick-chip {
  width: 38px;
  height: 38px;
  border-radius: var(--c-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--c-accent-soft);
}

.quick-label { font-size: 12px; color: var(--c-text-2); }

/* ======== 课程排行 ======== */
.rank-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

.rank-item { display: flex; flex-direction: column; gap: 6px; }

.rank-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rank-name {
  font-size: 13px;
  color: var(--c-text-2);
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--c-muted);
  background: #f0f2f5;
  flex-shrink: 0;
}

.rank-top {
  color: #fff;
  background: var(--c-accent);
}

.rank-count {
  font-size: 12px;
  color: var(--c-muted);
  flex-shrink: 0;
}

/* ======== 响应式 ======== */
@media (max-width: 1200px) {
  .col-charts { flex: 1 1 100%; }
  .col-tools { flex: 1 1 100%; }
  .middle-section { flex-direction: column; }
}
</style>
