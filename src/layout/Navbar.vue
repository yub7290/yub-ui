<template>
  <div class="navbar">
    <div class="navbar-left">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/dashboard' }">
          <el-icon :size="14"><HomeFilled /></el-icon>
          <span class="bc-text">首页</span>
        </el-breadcrumb-item>
        <el-breadcrumb-item
          v-for="item in breadcrumbItems"
          :key="item.path || item.name"
        >
          <span class="bc-text" :class="{ 'bc-active': !item.children }">{{ item.name }}</span>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="navbar-right">
      <el-tooltip content="全屏" placement="bottom" :show-after="400">
        <el-icon class="navbar-icon" @click="toggleFullscreen" :size="18">
          <FullScreen />
        </el-icon>
      </el-tooltip>

      <el-dropdown @command="handleCommand" trigger="click">
        <span class="user-info">
          <el-avatar :size="34" :icon="UserFilled" class="user-avatar" />
          <span class="username">{{ userStore.userInfo?.nickName || '管理员' }}</span>
          <el-icon class="arrow-down"><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile" :icon="User">个人中心</el-dropdown-item>
            <el-dropdown-item divided command="logout" :icon="SwitchButton">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import {
  UserFilled, HomeFilled, SwitchButton,
  FullScreen, User, ArrowDown
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

/**
 * 根据菜单树构建面包屑路径
 * 递归查找当前路由 path，返回从顶层父菜单到当前的完整路径链
 */
const breadcrumbItems = computed(() => {
  if (route.name === 'Dashboard') return []

  const menus = userStore.menus || []
  const currentPath = route.path

  function findPath(items, target) {
    for (const item of items) {
      if (item.path === target) return [item]
      if (item.children?.length) {
        const childPath = findPath(item.children, target)
        if (childPath) return [item, ...childPath]
      }
    }
    return null
  }

  const chain = findPath(menus, currentPath)
  if (chain) {
    return chain.map(m => ({ name: m.name, path: m.path, children: m.children?.length }))
  }

  // 兜底: 使用 route.meta.title
  return route.meta?.title && route.name !== 'Dashboard'
    ? [{ name: route.meta.title, path: route.path }]
    : []
})

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

async function handleCommand(command) {
  if (command === 'logout') {
    await userStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.navbar {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background: #fff;
  position: relative;
}

.navbar::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--theme-navbar-border, rgba(0, 0, 0, 0.06));
}

.navbar-left {
  display: flex;
  align-items: center;
}

.breadcrumb {
  display: flex;
  align-items: center;
}

.bc-text {
  font-size: 14px;
  color: #64748b;
  margin-left: 4px;
}

.bc-active {
  color: #1e293b;
  font-weight: 500;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.navbar-icon {
  cursor: pointer;
  color: #64748b;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s;
}

.navbar-icon:hover {
  color: #409EFF;
  background: rgba(64, 158, 255, 0.08);
}

.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px 4px 4px;
  border-radius: 8px;
  background: #f5f7fa;
  transition: all 0.2s;
}

.user-info:hover {
  background: rgba(64, 158, 255, 0.06);
}

.user-avatar {
  border: 2px solid #e2e8f0;
  transition: border-color 0.2s;
  background: #e2e8f0;
}

.user-info:hover .user-avatar {
  border-color: #409EFF;
}

.username {
  font-size: 14px;
  color: #334155;
  font-weight: 500;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.arrow-down {
  color: #94a3b8;
  font-size: 12px;
  transition: transform 0.2s;
}

.user-info:hover .arrow-down {
  color: #409EFF;
}
</style>
