<template>
  <div class="teacher-layout">
    <TeacherNavbar :menus="menus" />
    <main class="teacher-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
/**
 * 教师端主布局
 *
 * 无侧边栏，顶部水平导航 + 内容区
 * 专为教师个人维度操作设计
 */
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import TeacherNavbar from './TeacherNavbar.vue'

const userStore = useUserStore()
const menus = computed(() => userStore.menus || [])
</script>

<style scoped>
.teacher-layout {
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--t-page-bg, #F6F8F7);
}

.teacher-main {
  padding: 28px 40px 48px;
  max-width: 1560px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .teacher-main {
    padding: 18px 16px 32px;
  }
}
</style>
