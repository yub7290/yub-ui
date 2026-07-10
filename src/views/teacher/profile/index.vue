<template>
  <div class="t-page">
    <YubPageHeader title="个人中心" subtitle="查看你的教学档案与账户信息" />

    <div class="profile-grid">
      <!-- 档案卡 -->
      <section class="t-card profile-card">
        <div class="profile-head">
          <el-avatar :size="76" :src="userInfo?.avatarUrl" class="profile-avatar">
            {{ userInfo?.name?.charAt(0) }}
          </el-avatar>
          <div class="profile-id">
            <div class="profile-name">{{ userInfo?.name || '教师' }}</div>
            <span class="t-badge t-badge--green">教师</span>
          </div>
        </div>

        <el-divider />

        <ul class="profile-meta">
          <li v-if="userInfo?.account">
            <el-icon><User /></el-icon><span class="meta-k">账号</span><span class="meta-v">{{ userInfo.account }}</span>
          </li>
          <li v-if="userInfo?.email">
            <el-icon><Message /></el-icon><span class="meta-k">邮箱</span><span class="meta-v">{{ userInfo.email }}</span>
          </li>
          <li v-if="userInfo?.phone">
            <el-icon><Phone /></el-icon><span class="meta-k">手机</span><span class="meta-v">{{ userInfo.phone }}</span>
          </li>
          <li v-if="userInfo?.teacherTitle || userInfo?.title">
            <el-icon><Medal /></el-icon><span class="meta-k">职称</span>
            <span class="meta-v">{{ userInfo.teacherTitle || userInfo.title }}</span>
          </li>
          <li v-if="userInfo?.deptName">
            <el-icon><OfficeBuilding /></el-icon><span class="meta-k">部门</span><span class="meta-v">{{ userInfo.deptName }}</span>
          </li>
          <li v-if="userInfo?.createTime">
            <el-icon><Calendar /></el-icon><span class="meta-k">注册</span><span class="meta-v">{{ userInfo.createTime }}</span>
          </li>
        </ul>
      </section>

      <!-- 教学概览 -->
      <section class="t-card overview-card">
        <div class="card-head">
          <h3 class="t-card__title">教学概览</h3>
        </div>
        <div class="overview-links">
          <router-link to="/teacher/course" class="ov-link">
            <span class="ov-link__icon ov-link__icon--1"><el-icon><Reading /></el-icon></span>
            <span class="ov-link__title">我的课程</span>
            <span class="ov-link__arrow"><el-icon><ArrowRight /></el-icon></span>
          </router-link>
          <router-link to="/teacher/student" class="ov-link">
            <span class="ov-link__icon ov-link__icon--2"><el-icon><UserFilled /></el-icon></span>
            <span class="ov-link__title">我的学生</span>
            <span class="ov-link__arrow"><el-icon><ArrowRight /></el-icon></span>
          </router-link>
          <router-link to="/teacher/homework" class="ov-link">
            <span class="ov-link__icon ov-link__icon--3"><el-icon><EditPen /></el-icon></span>
            <span class="ov-link__title">作业批改</span>
            <span class="ov-link__arrow"><el-icon><ArrowRight /></el-icon></span>
          </router-link>
          <router-link to="/teacher/announcement" class="ov-link">
            <span class="ov-link__icon ov-link__icon--4"><el-icon><Bell /></el-icon></span>
            <span class="ov-link__title">课程公告</span>
            <span class="ov-link__arrow"><el-icon><ArrowRight /></el-icon></span>
          </router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import {
  User, Message, Phone, Medal, OfficeBuilding, Calendar,
  Reading, UserFilled, EditPen, Bell, ArrowRight
} from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import YubPageHeader from '@/components/YubPageHeader.vue'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
</script>

<style scoped>
.profile-grid {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 18px;
  align-items: start;
}

.profile-card {
  padding: 26px 26px 22px;
}

.profile-head {
  display: flex;
  align-items: center;
  gap: 18px;
}

.profile-avatar {
  background: var(--t-accent, #0c8e68);
  color: #fff;
  font-size: 28px;
  font-weight: 600;
  border: 3px solid var(--t-accent-soft, #EEF8F3);
}

.profile-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--t-text, #16201c);
  margin-bottom: 8px;
}

.profile-meta {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.profile-meta li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.profile-meta .el-icon {
  color: var(--t-accent-strong, #0A7355);
}

.meta-k {
  color: var(--t-text-muted, #8a958f);
  width: 42px;
  flex-shrink: 0;
}

.meta-v {
  color: var(--t-text, #16201c);
  font-weight: 500;
}

.overview-card {
  padding: 0;
}

.card-head {
  padding: 18px 22px;
  border-bottom: 1px solid var(--t-border, #ECEFEE);
}

.overview-links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}

.ov-link {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 22px 24px;
  text-decoration: none;
  color: var(--t-text, #16201c);
  border-right: 1px solid var(--t-border, #ECEFEE);
  border-bottom: 1px solid var(--t-border, #ECEFEE);
  transition: background 0.18s ease;
}

.ov-link:nth-child(2n) {
  border-right: none;
}

.ov-link:hover {
  background: var(--t-surface-2, #FBFCFB);
}

.ov-link__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  color: #fff;
  flex-shrink: 0;
}

.ov-link__icon--1 { background: #0C8E68; }
.ov-link__icon--2 { background: #2F8F6B; }
.ov-link__icon--3 { background: #B26A00; }
.ov-link__icon--4 { background: #2563EB; }

.ov-link__title {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
}

.ov-link__arrow {
  color: var(--t-text-faint, #AEB8B2);
  transition: transform 0.18s ease, color 0.18s ease;
}

.ov-link:hover .ov-link__arrow {
  transform: translateX(3px);
  color: var(--t-accent, #0c8e68);
}

@media (max-width: 860px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .overview-links {
    grid-template-columns: 1fr;
  }
  .ov-link {
    border-right: none;
  }
}
</style>
