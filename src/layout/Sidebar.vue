<template>
  <div class="sidebar" :class="{ collapsed }">
    <!-- Logo 区域 -->
    <div class="sidebar-header">
      <div class="logo-wrap">
        <img src="@/static/logo1.png" alt="智慧教育" class="logo-img" />
        <transition name="fade">
          <span v-show="!collapsed" class="brand-text">智慧教育系统</span>
        </transition>
      </div>
    </div>

    <!-- 菜单（可滚动） -->
    <div class="sidebar-menu-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="collapsed"
        background-color="transparent"
        text-color="rgba(255,255,255,0.68)"
        active-text-color="#fff"
        router
        class="sidebar-menu"
      >
        <SubMenuItem
          v-for="menu in menus"
          :key="menu.id"
          :menu="menu"
        />
      </el-menu>
    </div>

    <!-- 底部折叠按钮 -->
    <div class="sidebar-footer">
      <el-icon class="collapse-trigger" @click="$emit('toggleCollapse')" :size="18">
        <Fold v-if="!collapsed" />
        <Expand v-else />
      </el-icon>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { Fold, Expand } from '@element-plus/icons-vue'
import SubMenuItem from './SubMenuItem.vue'

defineProps({
  collapsed: Boolean
})

defineEmits(['toggleCollapse'])

const route = useRoute()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)
const menus = computed(() => userStore.menus)
</script>

<style scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--theme-sidebar-bg, linear-gradient(180deg, #1a2332 0%, #0f1724 100%));
  transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  width: 220px;
  overflow: hidden;
  position: relative;
}

.sidebar.collapsed {
  width: 64px;
}

/* ===== Logo 区域 ===== */
.sidebar-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  padding: 0 12px;
}

.logo-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  white-space: nowrap;
}

.logo-img {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  filter: brightness(0) invert(1);
}

.brand-text {
  color: #fff;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 1px;
  white-space: nowrap;
  background: linear-gradient(90deg, var(--theme-sidebar-active-text, #409EFF), var(--theme-sidebar-active-text, #409EFF));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ===== 菜单滚动区域 ===== */
.sidebar-menu-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 隐藏滚动条但保留滚动功能 */
.sidebar-menu-wrapper::-webkit-scrollbar {
  width: 0;
}

/* ===== 菜单 ===== */
.sidebar-menu {
  border-right: none !important;
  padding: 8px 0;
}

/* 一级菜单项 */
.sidebar-menu :deep(.el-menu-item) {
  height: 46px;
  line-height: 46px;
  margin: 2px 8px;
  border-radius: 8px;
  padding: 0 12px !important;
  transition: all 0.2s ease;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background: var(--theme-sidebar-hover, rgba(64,158,255,0.08)) !important;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: var(--theme-sidebar-active, rgba(64,158,255,0.15)) !important;
  color: var(--theme-sidebar-active-text, #fff) !important;
  position: relative;
}

/* 激活菜单左侧灯条 */
.sidebar-menu :deep(.el-menu-item.is-active::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: var(--theme-sidebar-active-text, #409EFF);
  border-radius: 0 3px 3px 0;
  box-shadow: 0 0 8px rgba(64,158,255,0.4);
}

/* 子菜单 */
.sidebar-menu :deep(.el-sub-menu__title) {
  height: 46px;
  line-height: 46px;
  margin: 2px 8px;
  border-radius: 8px;
  padding: 0 12px !important;
  transition: all 0.2s ease;
}

.sidebar-menu :deep(.el-sub-menu__title:hover) {
  background: var(--theme-sidebar-hover, rgba(64,158,255,0.08)) !important;
}

.sidebar-menu :deep(.el-menu--inline) {
  background: rgba(0, 0, 0, 0.15) !important;
  border-radius: 8px;
  margin: 2px 8px;
  padding: 4px 0;
}

.sidebar-menu :deep(.el-menu--inline > .el-menu-item) {
  margin: 2px 8px;
  padding-left: 12px !important;
  height: 40px;
  line-height: 40px;
  font-size: 13px;
}

.sidebar-menu :deep(.el-menu--inline .el-sub-menu .el-menu--inline .el-menu-item) {
  padding-left: 36px !important;
}

/* 图标样式 */
.menu-icon {
  font-size: 18px;
  margin-right: 6px;
  color: rgba(255, 255, 255, 0.55);
  transition: color 0.2s;
}

.el-menu-item.is-active .menu-icon {
  color: var(--theme-sidebar-active-text, #409EFF);
}

.el-sub-menu.is-active > .el-sub-menu__title .menu-icon {
  color: var(--theme-sidebar-active-text, #409EFF);
}

/* 折叠态 */
.sidebar.collapsed :deep(.el-menu-item) {
  margin: 2px 6px;
  padding: 0 8px !important;
  border-radius: 8px;
}

.sidebar.collapsed :deep(.el-menu-item.is-active::before) {
  display: none;
}

.sidebar.collapsed :deep(.el-sub-menu__title) {
  margin: 2px 6px;
  padding: 0 8px !important;
  border-radius: 8px;
}

/* ===== 底部折叠按钮 ===== */
.sidebar-footer {
  flex-shrink: 0;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.collapse-trigger {
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.collapse-trigger:hover {
  color: var(--theme-sidebar-active-text, #409EFF);
  background: var(--theme-sidebar-hover, rgba(64,158,255,0.08));
}

/* ===== 品牌文字动画 ===== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
