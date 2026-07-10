<template>
  <div class="tags-view">
    <div class="tags-wrapper">
      <el-tag
        v-for="tag in tags"
        :key="tag.path"
        :closable="!tag.affix"
        :type="tag.path === currentPath ? '' : 'info'"
        :effect="tag.path === currentPath ? 'dark' : 'plain'"
        class="tag-item"
        @click="switchTag(tag)"
        @close="closeTag(tag)"
      >
        {{ tag.title }}
      </el-tag>
    </div>
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
  padding: 6px 16px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  min-height: 36px;
}

.tags-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
}

.tags-wrapper::-webkit-scrollbar {
  display: none;
}

.tag-item {
  cursor: pointer;
  border-radius: 4px;
  white-space: nowrap;
  transition: all 0.15s ease;
  font-size: 12px;
  height: 26px;
  line-height: 26px;
  padding: 0 10px;
}

.tag-item:hover {
  opacity: 0.85;
}
</style>
