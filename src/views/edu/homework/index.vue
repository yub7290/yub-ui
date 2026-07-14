<template>
  <div class="homework-page">
    <!-- 搜索区 -->
    <el-card class="search-card" shadow="never">
      <div class="card-accent"></div>
      <div class="filter-bar">
        <div class="filter-left">
          <el-select v-model="queryParams.status" placeholder="状态" clearable style="width: 120px" @change="handleQuery">
            <el-option label="待批改" :value="0" />
            <el-option label="批改中" :value="1" />
            <el-option label="已完成" :value="2" />
            <el-option label="失败" :value="3" />
          </el-select>
          <span class="filter-tag" v-if="selectedStudentName || selectedGroupName">
            {{ selectedStudentName || selectedGroupName }}
            <span class="filter-clear" @click="clearStudentFilter">✕</span>
          </span>
        </div>
        <div class="filter-right">
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </div>
    </el-card>

    <!-- 主体内容区 -->
    <div class="split-layout">
      <!-- 左侧：学员组 + 学员树 -->
      <aside class="tree-panel">
        <div class="panel-header">
          <div class="panel-title-row">
            <span class="panel-title">学员组</span>
            <span class="badge">{{ groups.length }}</span>
          </div>
          <el-input
            v-model="groupSearch"
            placeholder="搜索学员组..."
            clearable
            prefix-icon="Search"
            class="group-search"
          />
        </div>

        <div class="tree-scroll" v-loading="groupsLoading">
          <div
            class="tree-node"
            :class="{ active: !selectedStudentId && !selectedGroupId }"
            @click="clearStudentFilter"
          >
            <div class="node-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 1c-3.315 0-6 1.79-6 4v1h12v-1c0-2.21-2.685-4-6-4Z"/></svg>
            </div>
            <span class="node-label">全部学员</span>
          </div>

          <div v-for="group in filteredGroups" :key="group.id" class="tree-group">
            <div
              class="tree-node group-node"
              :class="{ active: selectedGroupId === group.id && !selectedStudentId, expanded: expandedGroups.has(group.id) }"
              @click="toggleGroup(group)"
            >
              <span class="expand-arrow" :class="{ open: expandedGroups.has(group.id) }">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3 2l4 3-4 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
              <div class="node-icon group-icon">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-9ZM3.5 3a.5.5 0 0 0-.5.5V12c0 .28.22.5.5.5h9a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-9Z"/></svg>
              </div>
              <span class="node-label">{{ group.name }}</span>
              <span class="node-count">{{ group.memberCount || 0 }}</span>
            </div>

            <div v-if="expandedGroups.has(group.id)" class="tree-children" v-loading="loadingMembers.has(group.id)">
              <div
                v-for="member in group._members"
                :key="member.id"
                class="tree-node member-node"
                :class="{ active: selectedStudentId === member.id }"
                @click.stop="selectStudent(group.id, member)"
              >
                <div class="member-avatar">
                  {{ member.studentName ? member.studentName.charAt(0) : '?' }}
                </div>
                <span class="node-label">{{ member.studentName }}</span>
                <span class="member-no" v-if="member.studentNo">{{ member.studentNo }}</span>
              </div>
              <div v-if="group._members && group._members.length === 0 && !loadingMembers.has(group.id)" class="tree-empty">
                暂无成员
              </div>
            </div>
          </div>

          <div v-if="!groupsLoading && filteredGroups.length === 0" class="tree-empty-state">
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none"><rect x="8" y="12" width="32" height="24" rx="3" stroke="#c9cdd4" stroke-width="2"/><path d="M16 22h16M16 28h10" stroke="#c9cdd4" stroke-width="2" stroke-linecap="round"/></svg>
            <span>暂无学员组</span>
          </div>
        </div>
      </aside>

      <!-- 右侧：作业列表 -->
      <main class="list-panel">
        <div class="table-header">
          <div class="table-title">作业批改列表</div>
        </div>

      <!-- 数据表格 -->
      <div class="table-wrapper">
        <el-table
          :data="tableData"
          v-loading="listLoading"
          border
          stripe
          style="width: 100%"
          :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: 600 }"
          row-class-name="table-row"
        >
          <el-table-column type="index" label="#" width="50" align="center" />
          <el-table-column prop="studentName" label="学员" min-width="100">
            <template #default="{ row }">
              <div class="student-cell">
                <div class="student-avatar">{{ row.studentName ? row.studentName.charAt(0) : '?' }}</div>
                <span>{{ row.studentName }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="courseName" label="课程" min-width="140" show-overflow-tooltip />
          <el-table-column label="提交" width="80" align="center">
            <template #default="{ row }">
              {{ parseImages(row.images).length }} 张
            </template>
          </el-table-column>
          <el-table-column prop="totalQuestions" label="总题数" width="70" align="center" />
          <el-table-column prop="correctCount" label="正确数" width="70" align="center" />
          <el-table-column label="得分率" width="90" align="center">
            <template #default="{ row }">
              <span class="score-rate" :class="getScoreRateClass(row)">
                {{ row.totalQuestions > 0 ? Math.round((row.correctCount / row.totalQuestions) * 100) + '%' : '-' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="score" label="得分" width="70" align="center">
            <template #default="{ row }">
              <span class="score-num">{{ row.score }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="90" align="center">
            <template #default="{ row }">
              <span class="status-tag" :class="statusClass(row.status)">{{ statusLabel(row.status) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="提交时间" width="160">
            <template #default="{ row }">
              {{ formatDateTime(row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleDetail(row.id)">详情</el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
            </template>
          </el-table-column>

          <template #empty>
            <div class="empty-state">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect x="8" y="12" width="32" height="24" rx="3" stroke="#cbd5e1" stroke-width="2"/><path d="M16 22h16M16 28h10" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/></svg>
              <p>暂无数据</p>
            </div>
          </template>
        </el-table>
      </div>

      <!-- 分页栏 -->
      <div class="pagination-bar">
        <div class="pagination-left">
          <span class="total-text">共 <b>{{ total }}</b> 条数据</span>
        </div>
        <div class="pagination-right">
          <el-pagination
            v-model:current-page="pageNum"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50]"
            :total="total"
            :pager-count="5"
            layout="sizes, prev, pager, next, jumper"
            background
            @size-change="fetchData"
            @current-change="fetchData"
          />
        </div>
      </div>
    </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { getHomeworkPage, deleteHomework } from '@/api/edu/homework'
import { getStudentGroupPage, getStudentGroupDetail } from '@/api/edu/studentGroup'

const router = useRouter()

// ========== 左侧学员组树 ==========
const groups = ref([])
const groupsLoading = ref(false)
const groupSearch = ref('')
const expandedGroups = ref(new Set())
const loadingMembers = ref(new Set())
const selectedGroupId = ref(null)
const selectedStudentId = ref(null)
const selectedStudentName = ref('')
const selectedGroupName = ref('')

const filteredGroups = computed(() => {
  if (!groupSearch.value) return groups.value
  const keyword = groupSearch.value.toLowerCase()
  return groups.value.filter(g => g.name.toLowerCase().includes(keyword))
})

async function loadGroups() {
  groupsLoading.value = true
  try {
    const res = await getStudentGroupPage({
      queryParam: {},
      pageParam: { pageNum: 1, pageSize: 200 }
    })
    groups.value = (res.data?.records || []).map(g => ({ ...g, _members: null }))
  } catch {
    groups.value = []
  } finally {
    groupsLoading.value = false
  }
}

async function toggleGroup(group) {
  if (expandedGroups.value.has(group.id)) {
    expandedGroups.value.delete(group.id)
    return
  }
  expandedGroups.value.add(group.id)
  // 懒加载成员
  if (!group._members) {
    loadingMembers.value.add(group.id)
    try {
      const res = await getStudentGroupDetail(group.id)
      group._members = (res.data?.members || []).filter(m => m != null)
    } catch {
      group._members = []
    } finally {
      loadingMembers.value.delete(group.id)
    }
  }
  // 选中该组（显示该组所有学员的作业）
  selectedGroupId.value = group.id
  selectedStudentId.value = null
  selectedStudentName.value = ''
  selectedGroupName.value = group.name
  handleQuery()
}

function selectStudent(groupId, member) {
  selectedGroupId.value = groupId
  selectedStudentId.value = member.id
  selectedStudentName.value = member.studentName
  selectedGroupName.value = ''
  handleQuery()
}

function clearStudentFilter() {
  selectedGroupId.value = null
  selectedStudentId.value = null
  selectedStudentName.value = ''
  selectedGroupName.value = ''
  handleQuery()
}

// ========== 右侧作业列表 ==========
const listLoading = ref(false)
const tableData = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

const queryParams = reactive({
  courseId: null,
  studentName: '',
  status: null
})

async function fetchData() {
  listLoading.value = true
  try {
    const queryParam = { ...queryParams }
    if (selectedStudentId.value) {
      queryParam.studentId = selectedStudentId.value
    } else if (selectedGroupId.value) {
      queryParam.groupId = selectedGroupId.value
    }
    const res = await getHomeworkPage({
      queryParam,
      pageParam: { pageNum: pageNum.value, pageSize: pageSize.value }
    })
    const data = res.data
    if (Array.isArray(data)) {
      tableData.value = data
      total.value = data.length
    } else {
      tableData.value = data.list || data.records || []
      total.value = data.total || 0
    }
  } catch {
    tableData.value = []
    total.value = 0
  } finally {
    listLoading.value = false
  }
}

function handleQuery() {
  pageNum.value = 1
  fetchData()
}

function handleReset() {
  queryParams.courseId = null
  queryParams.studentName = ''
  queryParams.status = null
  clearStudentFilter()
}

function parseImages(images) {
  if (!images) return []
  if (Array.isArray(images)) return images
  try { return JSON.parse(images) } catch { return [] }
}

function statusLabel(status) {
  const map = { 0: '待批改', 1: '批改中', 2: '已完成', 3: '失败' }
  return map[status] ?? '未知'
}

function statusClass(status) {
  const map = { 0: 'pending', 1: 'processing', 2: 'done', 3: 'failed' }
  return map[status] ?? ''
}

function getScoreRateClass(row) {
  if (!row.totalQuestions) return ''
  const rate = row.correctCount / row.totalQuestions
  if (rate >= 0.8) return 'excellent'
  if (rate >= 0.6) return 'good'
  return 'poor'
}

function formatDateTime(date) {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '-'
}

async function handleDetail(id) {
  router.push(`/edu/homework/${id}`)
}

async function handleDelete(id) {
  try {
    await ElMessageBox.confirm('确定要删除该作业批改记录吗？', '删除确认', { type: 'warning' })
    await deleteHomework(id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {}
}

onMounted(() => { loadGroups(); fetchData() })
</script>

<style scoped>
@import '@/assets/css/user-management.css';

/* ========== PAGE LAYOUT ========== */

.split-layout {
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

/* ========== LEFT PANEL ========== */
.tree-panel {
  width: 280px;
  min-width: 280px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  padding: 16px 14px 10px;
  border-bottom: 1px solid #f2f3f5;
}

.panel-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.panel-title {
  font-size: 15px;
  font-weight: 700;
  color: #1d2129;
}

.badge {
  font-size: 11px;
  font-weight: 600;
  color: #86909c;
  background: #f2f3f5;
  border-radius: 10px;
  padding: 1px 7px;
  line-height: 18px;
}

.group-search :deep(.el-input__wrapper) {
  border-radius: 6px;
  background: #f7f8fa;
  box-shadow: none;
  border: 1px solid transparent;
  transition: border-color 0.2s, background 0.2s;
}
.group-search :deep(.el-input__wrapper:hover),
.group-search :deep(.el-input__wrapper.is-focus) {
  border-color: #c9cdd4;
  background: #fff;
}

.tree-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 6px 8px;
}

/* ========== TREE NODES ========== */
.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
  user-select: none;
}
.tree-node:hover { background: #f7f8fa; }
.tree-node.active { background: #e8f3ff; }

.node-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #f0f5ff;
  color: #409eff;
  flex-shrink: 0;
}
.group-icon { background: #f0f5ff; }

.node-label {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: #1d2129;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-count {
  font-size: 11px;
  color: #86909c;
  background: #f2f3f5;
  border-radius: 8px;
  padding: 1px 6px;
  flex-shrink: 0;
}

.expand-arrow {
  display: flex;
  align-items: center;
  color: #c9cdd4;
  transition: transform 0.2s, color 0.2s;
  flex-shrink: 0;
}
.expand-arrow.open { transform: rotate(90deg); color: #409eff; }

.tree-children {
  padding-left: 20px;
}

.member-node {
  padding: 6px 10px;
  gap: 6px;
}

.member-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e8f3ff;
  color: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.member-no {
  font-size: 11px;
  color: #c9cdd4;
  flex-shrink: 0;
}

.tree-empty {
  padding: 12px 10px;
  font-size: 12px;
  color: #c9cdd4;
  text-align: center;
}

.tree-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 0;
  color: #c9cdd4;
  font-size: 13px;
}

/* ========== RIGHT PANEL ========== */
.list-panel {
  flex: 1;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #f2f3f5;
  flex-shrink: 0;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.list-title {
  font-size: 16px;
  font-weight: 700;
  color: #1d2129;
  margin: 0;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  background: #ecf5ff;
  color: #409eff;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.filter-clear {
  cursor: pointer;
  margin-left: 2px;
  opacity: 0.6;
  transition: opacity 0.15s;
}
.filter-clear:hover { opacity: 1; }

.filter-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

/* ========== TABLE CELLS ========== */
.student-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.student-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #e8f3ff;
  color: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.score-rate {
  font-weight: 600;
  font-size: 13px;
}
.score-rate.excellent { color: #059669; }
.score-rate.good { color: #d97706; }
.score-rate.poor { color: #dc2626; }

.score-num {
  font-weight: 700;
  color: #409eff;
}

/* ========== STATUS TAGS ========== */
.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}
.status-tag.pending { background: #fef3c7; color: #d97706; }
.status-tag.processing { background: #dbeafe; color: #2563eb; }
.status-tag.done { background: #d1fae5; color: #059669; }
.status-tag.failed { background: #fee2e2; color: #dc2626; }

/* ========== EMPTY STATE ========== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 0;
  color: #cbd5e1;
}

/* ========== PAGINATION ========== */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid #f2f3f5;
  flex-shrink: 0;
}

.total-text {
  font-size: 13px;
  color: #86909c;
}
.total-text b {
  color: #1d2129;
  font-weight: 600;
}
</style>
