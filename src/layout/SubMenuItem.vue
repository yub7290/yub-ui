<template>
  <!-- 按钮类型不渲染到侧边栏 -->
  <template v-if="menu.menuType !== 2">
    <!-- 目录/菜单（有可显示的子项） -->
    <el-sub-menu v-if="visibleChildren.length > 0" :index="menu.path || String(menu.id)">
      <template #title>
        <el-icon class="menu-icon"><component :is="menu.icon" /></el-icon>
        <span>{{ menu.name }}</span>
      </template>
      <SubMenuItem
        v-for="child in visibleChildren"
        :key="child.id"
        :menu="child"
      />
    </el-sub-menu>
    <!-- 叶子菜单项（没有可显示的子项） -->
    <el-menu-item v-else :index="menu.path || String(menu.id)">
      <el-icon class="menu-icon"><component :is="menu.icon" /></el-icon>
      <template #title>
        <span>{{ menu.name }}</span>
      </template>
    </el-menu-item>
  </template>
</template>

<script setup>
import { computed } from 'vue'
import SubMenuItem from './SubMenuItem.vue'

const props = defineProps({
  menu: { type: Object, required: true }
})

/** 过滤掉按钮类型（menuType=2）的子项 */
const visibleChildren = computed(() => {
  if (!props.menu.children || !props.menu.children.length) return []
  return props.menu.children.filter(c => c.menuType !== 2)
})
</script>
