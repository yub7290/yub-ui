<template>
  <YubDialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    title="设置学员"
    width="740px"
    destroy-on-close
    @open="onOpen"
    class="member-dialog"
  >
    <div class="md-transfer">
      <!-- 左面板 -->
      <div class="md-panel">
        <div class="md-panel-header">
          <span class="md-panel-title">可选学员</span>
          <span class="md-panel-count">{{ filteredAvailable.length }}</span>
        </div>
        <div class="md-panel-search">
          <el-input
            v-model="availableSearch"
            placeholder="搜索姓名或学号..."
            clearable
            prefix-icon="Search"
            size="small"
          />
        </div>
        <div class="md-panel-list">
          <div
            v-for="item in filteredAvailable"
            :key="item.id"
            class="md-row"
            @click="addMember(item)"
          >
            <el-avatar :size="30" :src="item.avatar" class="md-avatar">
              {{ (item.name || '').charAt(0) }}
            </el-avatar>
            <div class="md-row-info">
              <span class="md-row-name">{{ item.name }}</span>
              <span class="md-row-sub">{{ item.studentNo }}</span>
            </div>
            <span class="md-row-action">+</span>
          </div>
          <div v-if="filteredAvailable.length === 0 && !loading" class="md-empty">
            {{ availableSearch ? '无匹配学员' : '暂无可选学员' }}
          </div>
        </div>
      </div>

      <!-- 中间箭头 -->
      <div class="md-arrow-col">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M6 10h8m0 0l-3-3m3 3l-3 3" stroke="#c9cdd4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>

      <!-- 右面板 -->
      <div class="md-panel">
        <div class="md-panel-header">
          <span class="md-panel-title">已有学员</span>
          <span class="md-panel-count md-panel-count--active">{{ selectedList.length }}</span>
        </div>
        <div class="md-panel-search">
          <el-input
            v-model="selectedSearch"
            placeholder="搜索姓名或学号..."
            clearable
            prefix-icon="Search"
            size="small"
          />
        </div>
        <div class="md-panel-list">
          <div
            v-for="item in filteredSelected"
            :key="item.id"
            class="md-row md-row--selected"
          >
            <el-avatar :size="30" :src="item.avatar" class="md-avatar md-avatar--active">
              {{ (item.name || '').charAt(0) }}
            </el-avatar>
            <div class="md-row-info">
              <span class="md-row-name">{{ item.name }}</span>
              <span class="md-row-sub">{{ item.studentNo }}</span>
            </div>
            <button class="md-row-remove" @click="removeMember(item)" title="移除">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </button>
          </div>
          <div v-if="filteredSelected.length === 0" class="md-empty">
            {{ selectedSearch ? '无匹配学员' : '暂无已有学员' }}
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
    </template>
  </YubDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import YubDialog from '@/components/YubDialog.vue'
import { getStudentPage } from '@/api/edu/student'
import { addMembers, removeMembers } from '@/api/edu/studentGroup'

const props = defineProps({
  visible: Boolean,
  groupId: Number,
  selectedMembers: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:visible', 'success'])

const loading = ref(false)
const submitLoading = ref(false)
const availableSearch = ref('')
const selectedSearch = ref('')
const availableList = ref([])
const selectedList = ref([])

const filteredAvailable = computed(() => {
  const kw = availableSearch.value.toLowerCase()
  const selectedIds = new Set(selectedList.value.map(m => m.id))
  return availableList.value
    .filter(m => !selectedIds.has(m.id))
    .filter(m => !kw || (m.name || '').toLowerCase().includes(kw) || (m.studentNo || '').toLowerCase().includes(kw))
})

const filteredSelected = computed(() => {
  const kw = selectedSearch.value.toLowerCase()
  if (!kw) return selectedList.value
  return selectedList.value.filter(m => (m.name || '').toLowerCase().includes(kw) || (m.studentNo || '').toLowerCase().includes(kw))
})

watch(() => props.selectedMembers, (val) => {
  selectedList.value = (val || []).map(m => ({ ...m }))
}, { immediate: true })

function onOpen() {
  selectedList.value = (props.selectedMembers || []).map(m => ({ ...m }))
  availableSearch.value = ''
  selectedSearch.value = ''
  loadAvailable()
}

async function loadAvailable() {
  loading.value = true
  try {
    const res = await getStudentPage({ queryParam: {}, pageParam: { pageNum: 1, pageSize: 200 } })
    availableList.value = res.data?.records || []
  } catch { availableList.value = [] } finally { loading.value = false }
}

function addMember(member) {
  if (selectedList.value.some(m => m.id === member.id)) return
  selectedList.value.push({ ...member })
}

function removeMember(member) {
  selectedList.value = selectedList.value.filter(m => m.id !== member.id)
}

async function handleSubmit() {
  submitLoading.value = true
  try {
    const originalIds = new Set((props.selectedMembers || []).map(m => m.id))
    const currentIds = selectedList.value.map(m => m.id)
    const currentSet = new Set(currentIds)
    const toAdd = currentIds.filter(id => !originalIds.has(id))
    const toRemove = [...originalIds].filter(id => !currentSet.has(id))
    if (toAdd.length > 0) await addMembers(props.groupId, toAdd.map(id => ({ studentId: id })))
    if (toRemove.length > 0) await removeMembers(props.groupId, toRemove)
    ElMessage.success('学员设置成功')
    emit('update:visible', false)
    emit('success')
  } catch {} finally { submitLoading.value = false }
}
</script>

<style scoped>
.md-transfer {
  display: flex;
  gap: 0;
  height: 400px;
  border: 1px solid #e5e6eb;
  border-radius: 10px;
  overflow: hidden;
}

.md-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.md-panel-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 14px;
  background: #fafbfc;
  border-bottom: 1px solid #e5e6eb;
}

.md-panel-title {
  font-size: 13px;
  font-weight: 600;
  color: #1d2129;
}

.md-panel-count {
  font-size: 11px;
  font-weight: 600;
  color: #86909c;
  background: #f2f3f5;
  border-radius: 8px;
  padding: 0 6px;
  line-height: 18px;
}
.md-panel-count--active { background: #ecf5ff; color: #409eff; }

.md-panel-search {
  padding: 8px 10px;
  border-bottom: 1px solid #f2f3f5;
}
.md-panel-search :deep(.el-input__wrapper) {
  border-radius: 6px;
  background: #f7f8fa;
  box-shadow: none;
  border: 1px solid transparent;
  transition: border-color 0.2s, background 0.2s;
}
.md-panel-search :deep(.el-input__wrapper:hover),
.md-panel-search :deep(.el-input__wrapper.is-focus) {
  border-color: #c9cdd4;
  background: #fff;
}

.md-panel-list {
  flex: 1;
  overflow-y: auto;
}

.md-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  cursor: pointer;
  transition: background 0.12s;
  border-bottom: 1px solid #f7f8fa;
}
.md-row:last-child { border-bottom: none; }
.md-row:hover { background: #f5f7fa; }
.md-row--selected { cursor: default; }

.md-avatar {
  flex-shrink: 0;
  background: #f2f3f5;
  color: #86909c;
  font-size: 12px;
  font-weight: 600;
}
.md-avatar--active { background: #ecf5ff; color: #409eff; }

.md-row-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.md-row-name {
  font-size: 13px;
  font-weight: 500;
  color: #1d2129;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.md-row-sub {
  font-size: 11px;
  color: #86909c;
}

.md-row-action {
  font-size: 16px;
  font-weight: 500;
  color: #c9cdd4;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}
.md-row:hover .md-row-action { color: #409eff; background: #ecf5ff; }

.md-row-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 5px;
  background: transparent;
  color: #c9cdd4;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s, background 0.15s, color 0.15s;
  flex-shrink: 0;
}
.md-row:hover .md-row-remove { opacity: 1; }
.md-row-remove:hover { background: #fef0f0; color: #f56c6c; }

.md-arrow-col {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  flex-shrink: 0;
  background: #fafbfc;
  border-left: 1px solid #e5e6eb;
  border-right: 1px solid #e5e6eb;
}

.md-empty {
  padding: 32px 16px;
  text-align: center;
  font-size: 13px;
  color: #c9cdd4;
}
</style>
