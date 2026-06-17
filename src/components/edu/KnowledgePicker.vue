<template>
  <div class="knowledge-picker">
    <el-row :gutter="12">
      <el-col :span="10">
        <div class="picker-panel">
          <div class="picker-panel-title">分类</div>
          <el-tree ref="treeRef" :data="categoryTree" :props="{ label: 'name', children: 'children' }"
            node-key="id" highlight-current :expand-on-click-node="false"
            @node-click="onCategoryClick" class="picker-tree" />
        </div>
      </el-col>
      <el-col :span="14">
        <div class="picker-panel">
          <div class="picker-panel-title">知识点（勾选关联）</div>
          <div class="kp-list" v-if="selectedCategoryId">
            <el-checkbox-group v-model="selectedIds" @change="emitChange">
              <div v-for="kp in knowledgePoints" :key="kp.id" class="kp-item">
                <el-checkbox :label="kp.id">{{ kp.title }}</el-checkbox>
              </div>
            </el-checkbox-group>
            <el-empty v-if="knowledgePoints.length === 0" description="该分类下暂无知识点" :image-size="40" />
          </div>
          <div v-else class="picker-placeholder">请先在左侧选择分类</div>
        </div>
      </el-col>
    </el-row>
    <div class="picker-footer">
      <span class="selected-count">已选 {{ selectedIds.length }} 个知识点</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { getCategoryTree } from '@/api/edu/knowledgeCategory'
import { getKnowledgeListByCategory } from '@/api/edu/knowledgePoint'

const props = defineProps({
  modelValue: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue'])

const categoryTree = ref([])
const selectedCategoryId = ref(null)
const knowledgePoints = ref([])
const selectedIds = ref([])

// 用标志位防止循环：isInternal=true 表示当前 selectedIds 变化来自用户点击，不需要再同步
let isInternal = false

// 从父组件接收初始值（仅首次设置）
watch(() => props.modelValue, (val) => {
  if (!isInternal) {
    selectedIds.value = [...(val || [])]
  }
}, { immediate: true })

function emitChange() {
  isInternal = true
  emit('update:modelValue', selectedIds.value)
  // 下一帧复位标志
  setTimeout(() => { isInternal = false }, 0)
}

async function loadCategoryTree() {
  try {
    const res = await getCategoryTree()
    categoryTree.value = res.data || []
  } catch { categoryTree.value = [] }
}

async function onCategoryClick(data) {
  selectedCategoryId.value = data.id
  try {
    const res = await getKnowledgeListByCategory(data.id)
    knowledgePoints.value = res.data || []
  } catch { knowledgePoints.value = [] }
}

onMounted(() => { loadCategoryTree() })
</script>

<style scoped>
.knowledge-picker { min-height: 300px; }
.picker-panel { border: 1px solid #ebeef5; border-radius: 4px; overflow: hidden; }
.picker-panel-title { padding: 8px 12px; background: #f8fafc; border-bottom: 1px solid #ebeef5; font-size: 13px; font-weight: 600; color: #475569; }
.picker-tree { padding: 4px 0; max-height: 300px; overflow-y: auto; }
.kp-list { max-height: 300px; overflow-y: auto; padding: 8px 12px; }
.kp-item { padding: 4px 0; }
.picker-placeholder { padding: 40px; text-align: center; color: #c0c4cc; }
.picker-footer { margin-top: 8px; text-align: right; }
.selected-count { font-size: 12px; color: #909399; }
</style>
