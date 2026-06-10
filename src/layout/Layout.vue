<template>
  <el-container class="layout-container">
    <el-aside width="220px">
      <Sidebar />
    </el-aside>
    <el-container>
      <el-header height="60px">
        <Navbar />
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import Sidebar from './Sidebar.vue'
import Navbar from './Navbar.vue'
</script>

<style scoped>
.layout-container {
  height: 100vh;
}
.el-aside {
  background-color: #304156;
  overflow-x: hidden;
}
.el-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}
.el-main {
  background-color: #f0f2f5;
}
</style>
