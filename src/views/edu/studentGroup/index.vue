<template>
  <div class="student-group-page">
    <!-- 搜索区 -->
    <el-card class="search-card" shadow="never">
      <div class="card-accent"></div>
      <el-form inline>
        <el-form-item label="学员组名称">
          <el-input v-model="queryParams.name" placeholder="请输入学员组名称" clearable @input="handleQuery" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 主体内容区 -->
    <div class="split-layout">
    <!-- 左侧：学员组列表 -->
    <div class="group-list-panel">
      <div class="panel-header">
        <div class="panel-title-row">
          <span class="panel-title">学员组</span>
          <span class="group-count">{{ tableData.length }}</span>
        </div>
        <el-button type="primary" size="small" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增
        </el-button>
      </div>
      <div class="group-items" v-loading="loading">
        <div
          v-for="item in tableData"
          :key="item.id"
          class="group-item"
          :class="{ active: currentGroupId === item.id }"
          @click="selectGroup(item)"
        >
          <div class="group-item-indicator"></div>
          <div class="group-item-body">
            <div class="group-item-top">
              <span class="group-item-name">{{ item.name }}</span>
              <div class="group-item-actions" @click.stop>
                <el-icon class="act-icon" @click="handleEdit(item.id)"><Edit /></el-icon>
                <el-icon class="act-icon danger" @click="handleDelete(item.id)"><Delete /></el-icon>
              </div>
            </div>
            <div class="group-item-meta">
              <span class="meta-badge">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 1c-3.315 0-6 1.79-6 4v1h12v-1c0-2.21-2.685-4-6-4Z"/></svg>
                {{ item.memberCount || 0 }}
              </span>
              <span class="meta-badge">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-9ZM3.5 3a.5.5 0 0 0-.5.5V12c0 .28.22.5.5.5h9a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-9Z"/></svg>
                {{ item.courseCount || 0 }}
              </span>
            </div>
          </div>
        </div>
        <div v-if="!loading && tableData.length === 0" class="empty-list">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect x="8" y="12" width="32" height="24" rx="3" stroke="#c9cdd4" stroke-width="2"/><path d="M16 22h16M16 28h10" stroke="#c9cdd4" stroke-width="2" stroke-linecap="round"/></svg>
          <span>暂无学员组</span>
        </div>
      </div>
    </div>

    <!-- 右侧：选中学员组详情 -->
    <div class="group-detail-panel" v-if="currentGroup">
      <div class="detail-header">
        <div>
          <h2 class="detail-title">{{ currentGroup.name }}</h2>
          <p class="detail-desc" v-if="currentGroup.description">{{ currentGroup.description }}</p>
        </div>
        <div class="detail-stats">
          <div class="stat-item">
            <span class="stat-num">{{ groupMembers.length }}</span>
            <span class="stat-label">成员</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num">{{ groupCourses.length }}</span>
            <span class="stat-label">课程</span>
          </div>
        </div>
      </div>

      <!-- 成员 -->
      <div class="detail-card">
        <div class="card-header">
          <h3 class="card-title">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 1c-3.315 0-6 1.79-6 4v1h12v-1c0-2.21-2.685-4-6-4Z"/></svg>
            成员
          </h3>
          <el-button type="primary" size="small" plain @click="showMemberDialog">设置学员</el-button>
        </div>
        <div class="card-body">
          <div class="member-avatars" v-if="groupMembers.length > 0">
            <div
              v-for="member in groupMembers"
              :key="member.id"
              class="member-chip"
              @click="goToStudentDetail(member.id)"
            >
              <el-avatar :size="36" :src="member.avatar" class="member-avatar">
                {{ member.studentName ? member.studentName.charAt(0) : '' }}
              </el-avatar>
              <span class="member-chip-name">{{ member.studentName }}</span>
              <svg class="member-arrow" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3 2l4 3-4 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
          </div>
          <div v-else class="card-empty">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="14" r="6" stroke="#c9cdd4" stroke-width="2"/><path d="M8 30c0-4 4.5-7 10-7s10 3 10 7" stroke="#c9cdd4" stroke-width="2" stroke-linecap="round"/></svg>
            <span>暂无成员，点击上方按钮添加</span>
          </div>
        </div>
      </div>

      <!-- 课程 -->
      <div class="detail-card">
        <div class="card-header">
          <h3 class="card-title">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-9ZM3.5 3a.5.5 0 0 0-.5.5V12c0 .28.22.5.5.5h9a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-9Z"/></svg>
            课程
          </h3>
          <el-button type="primary" size="small" plain @click="showCourseDialog">设置课程</el-button>
        </div>
        <div class="card-body">
          <div v-if="groupCourses.length > 0" class="course-items">
            <div
              v-for="(course, index) in groupCourses"
              :key="course.id"
              class="course-row"
              :class="{ 'drag-over': dragOverIndex === index }"
              draggable="true"
              @dragstart="onDragStart(index)"
              @dragover.prevent="onDragOver(index)"
              @dragleave="onDragLeave"
              @drop="onDrop(index)"
              @dragend="onDragEnd"
            >
              <span class="course-drag-handle">
                <svg width="10" height="14" viewBox="0 0 10 14" fill="none"><circle cx="3" cy="3" r="1.2" fill="currentColor"/><circle cx="7" cy="3" r="1.2" fill="currentColor"/><circle cx="3" cy="7" r="1.2" fill="currentColor"/><circle cx="7" cy="7" r="1.2" fill="currentColor"/><circle cx="3" cy="11" r="1.2" fill="currentColor"/><circle cx="7" cy="11" r="1.2" fill="currentColor"/></svg>
              </span>
              <span class="course-index">{{ index + 1 }}</span>
              <span class="course-label">{{ course.courseName }}</span>
              <div class="course-row-actions">
                <button class="row-btn danger" title="移除" @click="removeCourse(course)">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                </button>
              </div>
            </div>
          </div>
          <div v-else class="card-empty">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><rect x="8" y="8" width="20" height="20" rx="3" stroke="#c9cdd4" stroke-width="2"/><path d="M14 18h8M18 14v8" stroke="#c9cdd4" stroke-width="2" stroke-linecap="round"/></svg>
            <span>暂无课程，点击上方按钮添加</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="group-detail-panel empty-state" v-else>
      <div class="empty-hero">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none"><rect x="12" y="18" width="40" height="28" rx="4" stroke="#d0d5dd" stroke-width="2.5"/><path d="M22 30h20M22 38h12" stroke="#d0d5dd" stroke-width="2.5" stroke-linecap="round"/><circle cx="50" cy="14" r="6" fill="#e8f3ff" stroke="#409eff" stroke-width="2"/></svg>
        <p>选择左侧学员组查看详情</p>
      </div>
    </div>

    <!-- 新增/编辑学员组弹窗 -->
    <YubDialog v-model="dialogVisible" :title="editId ? '编辑学员组' : '新增学员组'" width="480px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="组名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入学员组名称" maxlength="100" />
        </el-form-item>
        <el-form-item label="组说明" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入组说明" maxlength="500" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="formData.sortOrder" :min="0" :max="999" controls-position="right" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
      </template>
    </YubDialog>

    <CourseDialog v-model:visible="courseDialogVisible" :group-id="currentGroupId" :selected-courses="groupCourses" @success="onCourseDialogSuccess" />
    <MemberDialog v-model:visible="memberDialogVisible" :group-id="currentGroupId" :selected-members="groupMembers" @success="onMemberDialogSuccess" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Search, Top, Bottom } from '@element-plus/icons-vue'
import YubDialog from '@/components/YubDialog.vue'
import { useStudentGroupManagement } from '@/composables/edu/useStudentGroupManagement'
import { createStudentGroup, updateStudentGroup, deleteStudentGroup, getStudentGroupDetail, removeCourses, sortCourses } from '@/api/edu/studentGroup'
import CourseDialog from './CourseDialog.vue'
import MemberDialog from './MemberDialog.vue'

const {
  loading, tableData, total, pageNum, pageSize,
  queryParams, fetchData, handleQuery: doQuery, handleReset
} = useStudentGroupManagement()

const router = useRouter()
const currentGroupId = ref(null)
const currentGroup = ref(null)
const groupMembers = ref([])
const groupCourses = ref([])
const dialogVisible = ref(false)
const editId = ref(null)
const formRef = ref(null)
const submitLoading = ref(false)
const courseDialogVisible = ref(false)
const memberDialogVisible = ref(false)

const formData = reactive({ name: '', description: '', sortOrder: 0, status: 1 })
const formRules = { name: [{ required: true, message: '请输入学员组名称', trigger: 'blur' }] }

function handleQuery() { pageNum.value = 1; doQuery() }

async function selectGroup(item) {
  currentGroupId.value = item.id
  await loadGroupDetail(item.id)
}

function goToStudentDetail(id) { router.push(`/edu/student/${id}/growth`) }

async function loadGroupDetail(id) {
  try {
    const res = await getStudentGroupDetail(id)
    currentGroup.value = res.data
    groupMembers.value = res.data?.members || []
    groupCourses.value = res.data?.courses || []
  } catch {
    currentGroup.value = null
    groupMembers.value = []
    groupCourses.value = []
  }
}

function handleAdd() {
  editId.value = null
  Object.assign(formData, { name: '', description: '', sortOrder: 0, status: 1 })
  dialogVisible.value = true
}

function handleEdit(id) {
  editId.value = id
  const item = tableData.value.find(g => g.id === id)
  if (item) Object.assign(formData, { name: item.name, description: item.description || '', sortOrder: item.sortOrder || 0, status: item.status })
  dialogVisible.value = true
}

async function handleDelete(id) {
  try {
    await ElMessageBox.confirm('确定要删除该学员组吗？', '删除确认', { type: 'warning' })
    await deleteStudentGroup(id)
    ElMessage.success('删除成功')
    if (currentGroupId.value === id) {
      currentGroupId.value = null; currentGroup.value = null
      groupMembers.value = []; groupCourses.value = []
    }
    fetchData()
  } catch {}
}

async function submitForm() {
  try { await formRef.value.validate() } catch { return }
  submitLoading.value = true
  try {
    if (editId.value) {
      await updateStudentGroup({ id: editId.value, ...formData })
      ElMessage.success('编辑成功')
    } else {
      await createStudentGroup({ ...formData })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch {} finally { submitLoading.value = false }
}

function showCourseDialog() { courseDialogVisible.value = true }
function showMemberDialog() { memberDialogVisible.value = true }

function refreshDetail() {
  if (currentGroupId.value) { loadGroupDetail(currentGroupId.value); fetchData() }
}
function onCourseDialogSuccess() { refreshDetail() }
function onMemberDialogSuccess() { refreshDetail() }

// ========== 拖拽排序 ==========
const dragIndex = ref(null)
const dragOverIndex = ref(null)

function onDragStart(index) { dragIndex.value = index }
function onDragOver(index) { dragOverIndex.value = index }
function onDragLeave() { dragOverIndex.value = null }

function onDrop(targetIndex) {
  const sourceIndex = dragIndex.value
  if (sourceIndex === null || sourceIndex === targetIndex) return
  const list = [...groupCourses.value]
  const [moved] = list.splice(sourceIndex, 1)
  list.splice(targetIndex, 0, moved)
  groupCourses.value = list
  persistCourseSort()
}

function onDragEnd() {
  dragIndex.value = null
  dragOverIndex.value = null
}

async function persistCourseSort() {
  const courseIds = groupCourses.value.map(c => c.id || c.courseId)
  try {
    await sortCourses(currentGroupId.value, courseIds)
  } catch { /* silent */ }
}

async function removeCourse(course) {
  try {
    await ElMessageBox.confirm('确定要移除该课程吗？', '移除确认', { type: 'warning' })
    await removeCourses(currentGroupId.value, [course.id || course.courseId])
    ElMessage.success('课程已移除')
    refreshDetail()
  } catch {}
}

onMounted(() => { fetchData() })
</script>

<style scoped>
@import '@/assets/css/user-management.css';

.student-group-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  gap: 16px;
  box-sizing: border-box;
}

/* ========== LEFT PANEL ========== */
.group-list-panel {
  width: 300px;
  min-width: 300px;
  flex: 1;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px 12px;
}

.panel-title-row { display: flex; align-items: center; gap: 8px; }

.panel-title {
  font-size: 15px;
  font-weight: 700;
  color: #1d2129;
  letter-spacing: -0.01em;
}

.group-count {
  font-size: 11px;
  font-weight: 600;
  color: #86909c;
  background: #f2f3f5;
  border-radius: 10px;
  padding: 1px 7px;
  line-height: 18px;
}

.group-items { flex: 1; overflow-y: auto; padding: 0 8px 8px; }

.group-item {
  display: flex;
  align-items: stretch;
  padding: 0;
  margin-bottom: 2px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
  overflow: hidden;
}
.group-item:hover { background: #f7f8fa; }
.group-item.active { background: #e8f3ff; }

.group-item-indicator {
  width: 3px;
  flex-shrink: 0;
  background: transparent;
  border-radius: 0 2px 2px 0;
  transition: background 0.2s;
}
.group-item.active .group-item-indicator { background: #409eff; }

.group-item-body {
  flex: 1;
  min-width: 0;
  padding: 10px 10px 10px 12px;
}

.group-item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.group-item-name {
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-item-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;
}
.group-item:hover .group-item-actions { opacity: 1; }

.act-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  font-size: 13px;
  color: #86909c;
  transition: background 0.15s, color 0.15s;
}
.act-icon:hover { background: #f2f3f5; color: #409eff; }
.act-icon.danger:hover { background: #fef0f0; color: #f56c6c; }

.group-item-meta {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.meta-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: #86909c;
}

/* ========== EMPTY LIST ========== */
.empty-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 48px 0;
  color: #c9cdd4;
  font-size: 13px;
}

/* ========== RIGHT PANEL ========== */
.group-detail-panel {
  flex: 1;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  padding: 28px 36px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.group-detail-panel.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #c9cdd4;
  font-size: 14px;
}

.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f2f3f5;
}

.detail-title {
  font-size: 22px;
  font-weight: 700;
  color: #1d2129;
  margin: 0;
  letter-spacing: -0.02em;
}

.detail-desc {
  font-size: 14px;
  color: #86909c;
  margin: 6px 0 0;
  line-height: 1.5;
}

.detail-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  background: #f7f8fa;
  border-radius: 10px;
  flex-shrink: 0;
}

.stat-item { text-align: center; }
.stat-num {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #1d2129;
  line-height: 1.2;
}
.stat-label {
  font-size: 12px;
  color: #86909c;
  margin-top: 2px;
}
.stat-divider {
  width: 1px;
  height: 28px;
  background: #e5e6eb;
}

/* ========== DETAIL CARDS ========== */
.detail-card {
  margin-bottom: 20px;
  border: 1px solid #f2f3f5;
  border-radius: 10px;
  overflow: hidden;
  transition: box-shadow 0.2s;
}
.detail-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.04); }

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: #fafbfc;
  border-bottom: 1px solid #f2f3f5;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
}
.card-title svg { color: #86909c; }

.card-body { padding: 18px; }

.card-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 28px 0;
  color: #c9cdd4;
  font-size: 13px;
}

/* ========== MEMBER AVATARS ========== */
.member-avatars {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.member-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px 6px 6px;
  border: 1px solid #e5e6eb;
  border-radius: 20px;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}
.member-chip:hover {
  border-color: #bad8fa;
  background: #f5f9ff;
  box-shadow: 0 2px 8px rgba(64,158,255,0.1);
}

.member-avatar {
  background: #e8f3ff;
  color: #409eff;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.member-chip-name {
  font-size: 13px;
  font-weight: 500;
  color: #1d2129;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-arrow {
  color: #c9cdd4;
  flex-shrink: 0;
  transition: color 0.2s, transform 0.2s;
}
.member-chip:hover .member-arrow { color: #409eff; transform: translateX(2px); }

/* ========== COURSE LIST ========== */
.course-items { display: flex; flex-direction: column; gap: 1px; }

.course-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 6px;
  transition: background 0.15s;
}
.course-row:hover { background: #f7f8fa; }
.course-row.drag-over { background: #ecf5ff; border-top: 2px solid #409eff; }

.course-drag-handle {
  display: flex;
  align-items: center;
  color: #c9cdd4;
  cursor: grab;
  flex-shrink: 0;
  transition: color 0.15s;
}
.course-drag-handle:hover { color: #86909c; }
.course-row:active .course-drag-handle { cursor: grabbing; }

.course-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: #f2f3f5;
  font-size: 12px;
  font-weight: 600;
  color: #86909c;
  flex-shrink: 0;
}
.course-row:hover .course-index { background: #e8f3ff; color: #409eff; }

.course-label {
  flex: 1;
  font-size: 14px;
  color: #1d2129;
}

.course-row-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
}
.course-row:hover .course-row-actions { opacity: 1; }

.row-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #86909c;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.row-btn:hover { background: #f2f3f5; color: #409eff; }
.row-btn.danger:hover { background: #fef0f0; color: #f56c6c; }
</style>
