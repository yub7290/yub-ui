<template>
  <header class="teacher-navbar">
    <div class="navbar-left">
      <router-link to="/teacher/home" class="navbar-brand">
        <img src="../../static/logo1.png" alt="Logo" class="navbar-logo" />
        <span class="navbar-title">教师工作台</span>
      </router-link>
      <nav class="navbar-menu">
        <router-link
          v-for="menu in visibleMenus"
          :key="menu.path || menu.id"
          :to="menu.path || '#'"
          class="menu-item"
          active-class="menu-item--active"
        >
          {{ menu.name }}
        </router-link>
      </nav>
    </div>
    <div class="navbar-right">
      <el-dropdown trigger="click" @command="handleCommand">
        <div class="user-info">
          <el-avatar :size="32" :src="userInfo?.avatarUrl" class="user-avatar">
            {{ userInfo?.name?.charAt(0) }}
          </el-avatar>
          <span class="user-name">{{ userInfo?.name }}</span>
          <el-icon class="user-caret"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>个人中心
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup>
/**
 * 教师端顶部导航栏
 *
 * Logo + 水平菜单 + 用户下拉菜单
 * 菜单优先取后端返回，缺省时回落到教师端内置导航，保证可导航
 */
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ArrowDown, User, SwitchButton } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const props = defineProps({
  menus: { type: Array, default: () => [] }
})

const router = useRouter()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

/** 内置教师端导航（后端菜单缺省时回落） */
const DEFAULT_NAV = [
  { name: '工作台', path: '/teacher/home' },
  { name: '我的课程', path: '/teacher/course' },
  { name: '我的学生', path: '/teacher/student' },
  { name: '作业批改', path: '/teacher/homework' },
  { name: '课程公告', path: '/teacher/announcement' },
  { name: '考试管理', path: '/teacher/exam' },
  { name: '个人中心', path: '/teacher/profile' }
]

const visibleMenus = computed(() => {
  const fromBackend = (props.menus || []).filter(m => m.menuType !== 2 && m.path)
  return fromBackend.length ? fromBackend : DEFAULT_NAV
})

async function handleCommand(command) {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await userStore.logout()
      router.push('/teacher/login')
    } catch {
      // 取消
    }
  } else if (command === 'profile') {
    router.push('/teacher/profile')
  }
}
</script>

<style scoped>
.teacher-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 62px;
  padding: 0 28px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: saturate(180%) blur(12px);
  -webkit-backdrop-filter: saturate(180%) blur(12px);
  border-bottom: 1px solid var(--t-border, #ECEFEE);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 36px;
  min-width: 0;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}

.navbar-logo {
  width: 30px;
  height: 30px;
}

.navbar-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--t-text, #16201c);
  letter-spacing: 0.3px;
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: 2px;
  overflow-x: auto;
  scrollbar-width: none;
}

.navbar-menu::-webkit-scrollbar {
  display: none;
}

.menu-item {
  padding: 7px 14px;
  font-size: 14px;
  color: var(--t-text-2, #3d4843);
  text-decoration: none;
  border-radius: 999px;
  transition: all 0.18s ease;
  white-space: nowrap;
}

.menu-item:hover {
  color: var(--t-accent-strong, #0A7355);
  background: var(--t-accent-soft, #EEF8F3);
}

.menu-item--active {
  color: var(--t-accent-strong, #0A7355);
  background: var(--t-accent-soft, #EEF8F3);
  font-weight: 600;
}

.navbar-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 4px 12px 4px 4px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.18s ease;
}

.user-info:hover {
  background: var(--t-surface-2, #FBFCFB);
}

.user-avatar {
  background: var(--t-accent, #0c8e68);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
}

.user-name {
  font-size: 14px;
  color: var(--t-text, #16201c);
  font-weight: 500;
}

.user-caret {
  font-size: 12px;
  color: var(--t-text-faint, #AEB8B2);
}

@media (max-width: 640px) {
  .teacher-navbar {
    padding: 0 16px;
  }
  .navbar-left {
    gap: 16px;
  }
  .user-name {
    display: none;
  }
}
</style>
