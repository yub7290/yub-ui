<template>
  <YubDialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    title="设置课程"
    width="600px"
    destroy-on-close
    @open="onOpen"
    class="course-dialog"
  >
    <div class="cd-body">
      <!-- 可选课程 -->
      <div class="cd-section">
        <div class="cd-section-head">
          <span class="cd-section-title">可选课程</span>
          <span class="cd-section-count">{{ filteredCourses.length }}</span>
        </div>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索课程名称..."
          clearable
          prefix-icon="Search"
          class="cd-search"
        />
        <div class="cd-options" v-loading="searchLoading">
          <div
            v-for="course in filteredCourses"
            :key="course.id"
            class="cd-option"
            @click="addCourse(course)"
          >
            <div class="cd-option-info">
              <span class="cd-option-dot"></span>
              <span class="cd-option-name">{{ course.name }}</span>
            </div>
            <span class="cd-option-add">+ 添加</span>
          </div>
          <div v-if="!searchLoading && filteredCourses.length === 0" class="cd-empty">
            {{ searchKeyword ? '无匹配课程' : '暂无可选课程' }}
          </div>
        </div>
      </div>

      <!-- 已选课程 -->
      <div class="cd-section">
        <div class="cd-section-head">
          <span class="cd-section-title">已选课程</span>
          <span class="cd-section-count">{{ selectedList.length }}</span>
        </div>
        <div class="cd-selected" v-if="selectedList.length > 0">
          <div v-for="(course, index) in selectedList" :key="course.id || course.courseId" class="cd-selected-item">
            <span class="cd-selected-index">{{ index + 1 }}</span>
            <span class="cd-selected-name">{{ course.courseName }}</span>
            <button class="cd-selected-remove" @click="removeCourse(course)" title="移除">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </button>
          </div>
        </div>
        <div v-else class="cd-empty-placeholder">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="4" y="4" width="20" height="20" rx="3" stroke="#d0d5dd" stroke-width="1.5"/><path d="M10 14h8M14 10v8" stroke="#d0d5dd" stroke-width="1.5" stroke-linecap="round"/></svg>
          <span>点击左侧课程添加</span>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import YubDialog from '@/components/YubDialog.vue'
import { getCoursePage } from '@/api/edu/course'
import { addCourses, removeCourses } from '@/api/edu/studentGroup'

const props = defineProps({
  visible: Boolean,
  groupId: Number,
  selectedCourses: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:visible', 'success'])

const searchLoading = ref(false)
const submitLoading = ref(false)
const searchKeyword = ref('')
const allCourses = ref([])
const selectedList = ref([])

watch(() => props.selectedCourses, (val) => {
  selectedList.value = (val || []).map(c => ({ ...c }))
}, { immediate: true })

const filteredCourses = computed(() => {
  const selectedIds = new Set(selectedList.value.map(c => c.id || c.courseId))
  const kw = searchKeyword.value.toLowerCase()
  return allCourses.value
    .filter(c => !selectedIds.has(c.id))
    .filter(c => !kw || c.name.toLowerCase().includes(kw))
})

function onOpen() {
  selectedList.value = (props.selectedCourses || []).map(c => ({ ...c }))
  searchKeyword.value = ''
  loadAllCourses()
}

async function loadAllCourses() {
  searchLoading.value = true
  try {
    const res = await getCoursePage({ queryParam: {}, pageParam: { pageNum: 1, pageSize: 100 } })
    allCourses.value = res.data?.records || []
  } catch { allCourses.value = [] } finally { searchLoading.value = false }
}

function addCourse(course) {
  if (selectedList.value.some(c => (c.id || c.courseId) === course.id)) return
  selectedList.value.push({ id: course.id, courseId: course.id, courseName: course.name, sortOrder: selectedList.value.length })
}

async function removeCourse(course) {
  const courseId = course.id || course.courseId
  const inBackend = (props.selectedCourses || []).some(c => (c.id || c.courseId) === courseId)
  if (inBackend) {
    try {
      await ElMessageBox.confirm('确定要移除该课程吗？', '移除确认', { type: 'warning' })
      await removeCourses(props.groupId, [courseId])
      ElMessage.success('课程已移除')
      selectedList.value = selectedList.value.filter(c => (c.id || c.courseId) !== courseId)
    } catch {}
  } else {
    selectedList.value = selectedList.value.filter(c => c.id !== courseId)
  }
}

async function handleSubmit() {
  submitLoading.value = true
  try {
    const originalIds = new Set((props.selectedCourses || []).map(c => c.id || c.courseId))
    const currentIds = selectedList.value.map(c => c.id || c.courseId)
    const currentSet = new Set(currentIds)
    const toAdd = currentIds.filter(id => !originalIds.has(id))
    const toRemove = [...originalIds].filter(id => !currentSet.has(id))
    if (toAdd.length > 0) await addCourses(props.groupId, toAdd.map((id, i) => ({ courseId: id, sortOrder: i })))
    if (toRemove.length > 0) await removeCourses(props.groupId, toRemove)
    ElMessage.success('课程设置成功')
    emit('update:visible', false)
    emit('success')
  } catch {} finally { submitLoading.value = false }
}
</script>

<style scoped>
.cd-body { display: flex; flex-direction: column; gap: 16px; }

.cd-section {
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  overflow: hidden;
}

.cd-section-head {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: #fafbfc;
  border-bottom: 1px solid #e5e6eb;
}

.cd-section-title {
  font-size: 13px;
  font-weight: 600;
  color: #1d2129;
}

.cd-section-count {
  font-size: 11px;
  font-weight: 600;
  color: #86909c;
  background: #f2f3f5;
  border-radius: 8px;
  padding: 0 6px;
  line-height: 18px;
}

.cd-search { padding: 8px 10px; }
.cd-search :deep(.el-input__wrapper) {
  border-radius: 6px;
  background: #f7f8fa;
  box-shadow: none;
  border: 1px solid transparent;
  transition: border-color 0.2s, background 0.2s;
}
.cd-search :deep(.el-input__wrapper:hover),
.cd-search :deep(.el-input__wrapper.is-focus) {
  border-color: #c9cdd4;
  background: #fff;
}

.cd-options {
  max-height: 180px;
  overflow-y: auto;
}

.cd-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  cursor: pointer;
  transition: background 0.12s;
}
.cd-option:hover { background: #f5f7fa; }

.cd-option-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.cd-option-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d0d5dd;
  flex-shrink: 0;
  transition: background 0.2s;
}
.cd-option:hover .cd-option-dot { background: #409eff; }

.cd-option-name {
  font-size: 13px;
  color: #1d2129;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cd-option-add {
  font-size: 12px;
  font-weight: 500;
  color: #409eff;
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 4px;
}
.cd-option:hover .cd-option-add { opacity: 1; }
.cd-option:hover .cd-option-add:hover { background: #ecf5ff; }

.cd-empty {
  padding: 20px;
  text-align: center;
  font-size: 13px;
  color: #c9cdd4;
}

.cd-selected {
  max-height: 160px;
  overflow-y: auto;
}

.cd-selected-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 14px;
  transition: background 0.12s;
}
.cd-selected-item:hover { background: #f5f7fa; }

.cd-selected-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 5px;
  background: #ecf5ff;
  color: #409eff;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.cd-selected-name {
  flex: 1;
  font-size: 13px;
  color: #1d2129;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cd-selected-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #c9cdd4;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s, background 0.15s, color 0.15s;
  flex-shrink: 0;
}
.cd-selected-item:hover .cd-selected-remove { opacity: 1; }
.cd-selected-remove:hover { background: #fef0f0; color: #f56c6c; }

.cd-empty-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 24px;
  color: #c9cdd4;
  font-size: 13px;
}
</style>
