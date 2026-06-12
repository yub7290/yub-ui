<template>
  <div class="navbar">
    <div class="navbar-left">
      <el-icon class="collapse-btn" @click="emit('toggleCollapse')" :size="20">
        <Fold v-if="!collapsed" />
        <Expand v-else />
      </el-icon>
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/dashboard' }">
          <el-icon :size="14"><HomeFilled /></el-icon>
          <span class="bc-text">首页</span>
        </el-breadcrumb-item>
        <el-breadcrumb-item v-if="route.meta.title">
          <span class="bc-text bc-active">{{ route.meta.title }}</span>
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
import { useUserStore } from '@/stores/user'
import { UserFilled, HomeFilled, SwitchButton } from '@element-plus/icons-vue'

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
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background: #fff;
  position: relative;
}

/* 底部渐变装饰线 */
.navbar::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #38daa6 0%, #5ee8c0 50%, transparent 100%);
  opacity: 0.6;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  cursor: pointer;
  color: #64748b;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.2s;
}

.collapse-btn:hover {
  color: #38daa6;
  background: rgba(56, 218, 166, 0.08);
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
  font-weight: 600;
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
  border-radius: 8px;
  transition: all 0.2s;
}

.navbar-icon:hover {
  color: #38daa6;
  background: rgba(56, 218, 166, 0.08);
}

.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px 4px 4px;
  border-radius: 20px;
  transition: all 0.2s;
}

.user-info:hover {
  background: rgba(56, 218, 166, 0.06);
}

.user-avatar {
  border: 2px solid #e2e8f0;
  transition: border-color 0.2s;
  background: #e2e8f0;
}

.user-info:hover .user-avatar {
  border-color: #38daa6;
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
  color: #38daa6;
}
</style>
