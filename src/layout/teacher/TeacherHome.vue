<template>
  <div class="teacher-home">
    <!-- 欢迎区：留白编辑式面板，去渐变 -->
    <section class="welcome">
      <div class="welcome-bg" aria-hidden="true"></div>
      <div class="welcome-main">
        <p class="welcome-greeting">{{ greeting }}，{{ userInfo?.name || '老师' }}</p>
        <h1 class="welcome-title">今天，也从一堂好课开始</h1>
        <p class="welcome-date">{{ todayText }}</p>
      </div>
      <el-avatar :size="64" :src="userInfo?.avatarUrl" class="welcome-avatar">
        {{ userInfo?.name?.charAt(0) }}
      </el-avatar>
    </section>

    <!-- 数据概览 -->
    <section class="stat-grid">
      <YubStatCard
        :icon="Reading"
        title="我的课程"
        :value="stats.courseCount"
      />
      <YubStatCard
        :icon="UserFilled"
        title="我的学生"
        :value="stats.studentCount"
      />
      <YubStatCard
        :icon="EditPen"
        title="待批改作业"
        :value="stats.pendingHomework"
      />
      <YubStatCard
        :icon="Notification"
        title="课程公告"
        :value="stats.announcementCount"
      />
    </section>

    <!-- 快捷入口 -->
    <section class="entry-section">
      <h3 class="t-section-title">快捷入口</h3>
      <div class="entry-grid">
        <YubQuickEntry
          v-for="entry in quickEntries"
          :key="entry.title"
          :icon="entry.icon"
          :title="entry.title"
          :description="entry.desc"
          :to="entry.to"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
/**
 * 教师工作台首页
 *
 * 留白编辑式欢迎区 + 数据概览 + 快捷入口
 */
import { computed, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import {
  Reading, UserFilled, EditPen, Notification,
  Tickets, Bell, Medal
} from '@element-plus/icons-vue'
import YubStatCard from '@/components/YubStatCard.vue'
import YubQuickEntry from '@/components/YubQuickEntry.vue'
import { getCoursePage } from '@/api/edu/course'
import { getStudentPage } from '@/api/edu/student'
import { getHomeworkPage } from '@/api/edu/homework'
import { getAnnouncementPage } from '@/api/edu/announcement'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const stats = reactive({
  courseCount: 0,
  studentCount: 0,
  pendingHomework: 0,
  announcementCount: 0
})

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 9) return '早上好'
  if (h < 12) return '上午好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
})

const todayText = computed(() => {
  const d = new Date()
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日 · ${week}`
})

const quickEntries = [
  { icon: Reading, title: '我的课程', desc: '查看与管理课程', to: '/teacher/course' },
  { icon: UserFilled, title: '我的学生', desc: '查看学员信息', to: '/teacher/student' },
  { icon: EditPen, title: '作业批改', desc: '批改学员作业', to: '/teacher/homework' },
  { icon: Bell, title: '课程公告', desc: '发布课程通知', to: '/teacher/announcement' },
  { icon: Tickets, title: '考试管理', desc: '管理考试与试卷', to: '/teacher/exam' },
  { icon: Medal, title: '个人中心', desc: '查看教学档案', to: '/teacher/profile' }
]

/** 拉取概览数据（任一失败不影响其余） */
async function fetchStats() {
  const safe = async (fn) => {
    try {
      const res = await fn()
      const data = res.data
      if (Array.isArray(data)) return data.length
      return data?.total ?? data?.records?.length ?? 0
    } catch {
      return 0
    }
  }
  stats.courseCount = await safe(() => getCoursePage({ queryParam: {}, pageParam: { pageNum: 1, pageSize: 1 } }))
  stats.studentCount = await safe(() => getStudentPage({ queryParam: {}, pageParam: { pageNum: 1, pageSize: 1 } }))
  stats.pendingHomework = await safe(() => getHomeworkPage({ queryParam: { status: 0 }, pageParam: { pageNum: 1, pageSize: 1 } }))
  stats.announcementCount = await safe(() => getAnnouncementPage({ queryParam: {}, pageParam: { pageNum: 1, pageSize: 1 } }))
}

onMounted(fetchStats)
</script>

<style scoped>
.teacher-home {
  display: flex;
  flex-direction: column;
  gap: 26px;
}

/* ---------- 欢迎区 ---------- */
.welcome {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  padding: 40px 44px;
  background: var(--t-surface, #fff);
  border: 1px solid var(--t-border, #ECEFEE);
  border-radius: var(--t-radius-lg, 20px);
  box-shadow: var(--t-shadow, 0 1px 3px rgba(16, 24, 20, 0.04), 0 8px 24px rgba(16, 24, 20, 0.05));
  overflow: hidden;
}

.welcome-bg {
  position: absolute;
  right: -60px;
  top: -60px;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: var(--t-accent-soft, #EEF8F3);
  opacity: 0.7;
}

.welcome-main {
  position: relative;
  z-index: 1;
  min-width: 0;
}

.welcome-greeting {
  font-size: 14px;
  color: var(--t-accent-strong, #0A7355);
  font-weight: 600;
  margin: 0 0 6px;
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--t-text, #16201c);
  margin: 0;
  letter-spacing: 0.2px;
  line-height: 1.35;
}

.welcome-date {
  font-size: 13px;
  color: var(--t-text-muted, #8a958f);
  margin: 12px 0 0;
}

.welcome-avatar {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  background: var(--t-accent, #0c8e68);
  color: #fff;
  font-size: 24px;
  font-weight: 600;
  border: 3px solid var(--t-accent-soft, #EEF8F3);
  box-shadow: var(--t-shadow-sm, 0 1px 2px rgba(16, 24, 20, 0.05));
}

/* ---------- 统计区 ---------- */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 22px;
}

/* ---------- 快捷入口 ---------- */
.entry-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.entry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

@media (max-width: 900px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .welcome {
    padding: 24px 22px;
    flex-direction: column;
    align-items: flex-start;
  }
  .welcome-title {
    font-size: 22px;
  }
  .welcome-avatar {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .stat-grid {
    grid-template-columns: 1fr;
  }
}
</style>
