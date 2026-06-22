<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <div class="stat-card card-blue">
          <div class="stat-info">
            <div class="stat-title">课程总数</div>
            <div class="stat-value">{{ stats.courseCount }}</div>
          </div>
          <div class="stat-icon">
            <el-icon :size="48"><Reading /></el-icon>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card card-green">
          <div class="stat-info">
            <div class="stat-title">学员总数</div>
            <div class="stat-value">{{ stats.studentCount }}</div>
          </div>
          <div class="stat-icon">
            <el-icon :size="48"><User /></el-icon>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card card-orange">
          <div class="stat-info">
            <div class="stat-title">今日考试</div>
            <div class="stat-value">{{ stats.examCount }}</div>
          </div>
          <div class="stat-icon">
            <el-icon :size="48"><EditPen /></el-icon>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card card-purple">
          <div class="stat-info">
            <div class="stat-title">系统访问</div>
            <div class="stat-value">{{ stats.accessCount }}</div>
          </div>
          <div class="stat-icon">
            <el-icon :size="48"><Monitor /></el-icon>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-card class="welcome-card">
      <h3>欢迎使用微厦在线学习考试系统</h3>
      <p>超级管理员后台</p>
    </el-card>

    <el-card class="chart-placeholder">
      <template #header>
        <span>数据概览（图表开发中...）</span>
      </template>
      <div class="chart-area">
        <el-empty description="图表区域，待后续集成 ECharts" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { getDashboardStats } from '@/api/system/dashboard'

const stats = reactive({
  courseCount: 0,
  studentCount: 0,
  examCount: 0,
  accessCount: 0
})

onMounted(async () => {
  try {
    const res = await getDashboardStats()
    const data = res.data
    stats.courseCount = data.courseCount || 0
    stats.studentCount = data.studentCount || 0
    stats.examCount = data.examCount || 0
    stats.accessCount = data.accessCount || 0
  } catch {
    // 保留默认值 0
  }
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.card-blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-green {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: #333;
}

.card-orange {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: #333;
}

.card-purple {
  background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
  color: #333;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  opacity: 0.85;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
}

.stat-icon {
  opacity: 0.6;
}

.welcome-card {
  margin-bottom: 20px;
}

.welcome-card h3 {
  margin: 0 0 8px;
}

.chart-placeholder {
  margin-bottom: 20px;
}

.chart-area {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
