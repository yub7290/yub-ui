<template>
  <div class="sidebar">
    <div class="logo">
      <span class="logo-text" v-show="!collapsed">微厦学习系统</span>
      <span class="logo-icon" v-show="collapsed">学</span>
    </div>
    <el-menu
      :default-active="activeMenu"
      :collapse="collapsed"
      background-color="transparent"
      text-color="rgba(255,255,255,0.75)"
      active-text-color="#fff"
      router
    >
      <template v-for="menu in menus" :key="menu.id">
        <el-sub-menu v-if="menu.children && menu.children.length" :index="menu.path || String(menu.id)">
          <template #title>
            <el-icon><component :is="menu.icon" /></el-icon>
            <span>{{ menu.name }}</span>
          </template>
          <el-menu-item
            v-for="child in menu.children"
            :key="child.id"
            :index="child.path"
          >
            <el-icon><component :is="child.icon" /></el-icon>
            <span>{{ child.name }}</span>
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item v-else :index="menu.path || String(menu.id)">
          <el-icon><component :is="menu.icon" /></el-icon>
          <template #title>
            <span>{{ menu.name }}</span>
          </template>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

defineProps({
  collapsed: Boolean
})

const route = useRoute()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)
const menus = computed(() => userStore.menus)
</script>

<style scoped>
.sidebar {
  height: 100%;
  background: linear-gradient(180deg, #304156 0%, #3a8ee6 100%);
  transition: width 0.3s;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  width: v-bind(collapsed ? '64px' : '220px');
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.logo-text {
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  white-space: nowrap;
}

.logo-icon {
  color: #fff;
  font-size: 22px;
  font-weight: bold;
}

.el-menu {
  border-right: none;
  flex: 1;
}

.el-menu :deep(.el-menu-item) {
  border-left: 3px solid transparent;
}

.el-menu :deep(.el-menu-item.is-active) {
  border-left-color: #fff;
  background: rgba(255, 255, 255, 0.15) !important;
}

.el-menu :deep(.el-sub-menu__title:hover),
.el-menu :deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
}
</style>
