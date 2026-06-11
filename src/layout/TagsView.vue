<template>
  <div class="tags-view">
    <el-tag
      v-for="tag in tags"
      :key="tag.path"
      :closable="!tag.affix"
      :type="tag.path === currentPath ? '' : 'info'"
      :effect="tag.path === currentPath ? 'dark' : 'plain'"
      @click="switchTag(tag)"
      @close="closeTag(tag)"
    >
      {{ tag.title }}
    </el-tag>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tags = ref([
  { title: '仪表盘', path: '/dashboard', affix: true }
])

const currentPath = computed(() => route.path)

watch(
  () => route.path,
  (newPath) => {
    const exists = tags.value.some(tag => tag.path === newPath)
    if (!exists && route.meta?.title) {
      tags.value.push({
        title: route.meta.title,
        path: newPath,
        affix: false
      })
    }
  },
  { immediate: true }
)

function switchTag(tag) {
  router.push(tag.path)
}

function closeTag(tag) {
  const index = tags.value.indexOf(tag)
  tags.value.splice(index, 1)
  if (tag.path === currentPath.value) {
    const next = tags.value[index] || tags.value[index - 1]
    if (next) {
      router.push(next.path)
    }
  }
}
</script>

<style scoped>
.tags-view {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #e6e6e6;
  overflow-x: auto;
}

.tags-view .el-tag {
  cursor: pointer;
  border-radius: 3px;
  white-space: nowrap;
}
</style>
