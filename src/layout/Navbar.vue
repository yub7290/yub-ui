<template>
  <div class="navbar">
    <div class="navbar-left">
      <el-icon class="collapse-btn" @click="emit('toggleCollapse')" :size="20">
        <Fold v-if="!collapsed" />
        <Expand v-else />
      </el-icon>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-if="route.meta.title">{{ route.meta.title }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="navbar-right">
      <el-icon class="navbar-icon" @click="toggleFullscreen" :size="18">
        <FullScreen />
      </el-icon>
      <el-dropdown @command="handleCommand">
        <span class="user-info">
          <el-avatar :size="32" :icon="UserFilled" />
          <span class="username">{{ userStore.userInfo?.nickName || '管理员' }}</span>
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人中心</el-dropdown-item>
            <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { UserFilled } from '@element-plus/icons-vue'

const props = defineProps({
  collapsed: Boolean
})
const emit = defineEmits(['toggleCollapse'])

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

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
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  cursor: pointer;
  color: #606266;
}

.collapse-btn:hover {
  color: #409EFF;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.navbar-icon {
  cursor: pointer;
  color: #606266;
}

.navbar-icon:hover {
  color: #409EFF;
}

.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-size: 14px;
  color: #303133;
}
</style>
