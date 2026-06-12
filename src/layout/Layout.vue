<template>
  <el-container class="layout-container">
    <el-aside :width="sidebarCollapsed ? '64px' : '220px'">
      <Sidebar :collapsed="sidebarCollapsed" @toggle-collapse="toggleSidebar" />
    </el-aside>
    <el-container>
      <el-header height="60px">
        <Navbar :collapsed="sidebarCollapsed" @toggle-collapse="toggleSidebar" />
      </el-header>
      <TagsView />
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'
import Navbar from './Navbar.vue'
import TagsView from './TagsView.vue'

const sidebarCollapsed = ref(false)

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}
.el-aside {
  transition: width 0.3s;
  overflow-x: hidden;
  background: transparent;
}
.el-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 60px !important;
}
.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>
