<template>
  <div class="placeholder-page">
    <el-empty description="功能开发中..." :image-size="120">
      <template #image>
        <el-icon :size="120" color="#cbd5e1"><Tools /></el-icon>
      </template>
    </el-empty>
  </div>
</template>

<script setup>
import { Tools } from '@element-plus/icons-vue'
</script>

<style scoped>
.placeholder-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 200px);
}
</style>
