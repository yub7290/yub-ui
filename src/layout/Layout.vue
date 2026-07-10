<template>
  <el-container class="layout-container">
    <el-aside :width="sidebarCollapsed ? '64px' : '220px'">
      <Sidebar :collapsed="sidebarCollapsed" />
    </el-aside>
    <el-container class="layout-right">
      <el-header height="60px">
        <Navbar />
      </el-header>
      <TagsView v-if="!route.meta?.hideTagsView" />
      <el-main :class="{ 'dashboard-main': route.meta?.hideTagsView }">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './Sidebar.vue'
import Navbar from './Navbar.vue'
import TagsView from './TagsView.vue'

const route = useRoute()
const sidebarCollapsed = ref(false)
</script>

<style scoped>
.layout-container {
  height: 100vh;
  overflow: hidden;
  background-color: var(--theme-page-bg, #f0f2f5);
}

.layout-right {
  overflow: hidden;
}

.el-aside {
  transition: width 0.3s;
  overflow: hidden;
  background: transparent;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 60px !important;
  flex-shrink: 0;
}

.el-main {
  flex: 1;
  overflow: auto;
  background-color: var(--theme-page-bg, #f0f2f5);
  padding: 0;
}

.el-main.dashboard-main {
  overflow: hidden;
  padding: 0;
}
</style>
