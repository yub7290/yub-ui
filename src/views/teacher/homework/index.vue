<template>
  <div class="t-page">
    <YubPageHeader title="作业批改" subtitle="批阅学员提交的作业，查看得分与正确率" />

    <div class="t-toolbar">
      <div class="t-toolbar__filters">
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable
          style="width: 140px"
          @change="handleQuery"
        >
          <el-option label="待批改" :value="0" />
          <el-option label="批改中" :value="1" />
          <el-option label="已完成" :value="2" />
          <el-option label="失败" :value="3" />
        </el-select>
        <el-input
          v-model="queryParams.studentName"
          placeholder="搜索学员姓名"
          clearable
          style="width: 200px"
          :prefix-icon="Search"
          @keyup.enter="handleQuery"
          @clear="handleQuery"
        />
      </div>
      <div class="t-toolbar__actions">
        <el-button @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <section class="t-card homework-card">
      <el-table
        :data="tableData"
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column type="index" label="#" width="48" align="center" />
        <el-table-column label="学员" min-width="120">
          <template #default="{ row }">
            <div class="student-cell">
              <span class="t-avatar student-cell__avatar">{{ row.studentName ? row.studentName.charAt(0) : '?' }}</span>
              <span>{{ row.studentName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="courseName" label="课程" min-width="150" show-overflow-tooltip />
        <el-table-column label="提交" width="80" align="center">
          <template #default="{ row }">{{ parseImages(row.images).length }} 张</template>
        </el-table-column>
        <el-table-column prop="totalQuestions" label="总题数" width="80" align="center" />
        <el-table-column prop="correctCount" label="正确数" width="80" align="center" />
        <el-table-column label="得分率" width="100" align="center">
          <template #default="{ row }">
            <span class="score-rate" :class="scoreRateClass(row)">
              {{ row.totalQuestions > 0 ? Math.round((row.correctCount / row.totalQuestions) * 100) + '%' : '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="得分" width="80" align="center">
          <template #default="{ row }"><span class="score-num">{{ row.score }}</span></template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <span class="t-badge" :class="statusBadge(row.status)">{{ statusLabel(row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="提交时间" min-width="160" />
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleDetail(row.id)">详情</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <div class="t-empty">
            <el-icon :size="40"><EditPen /></el-icon>
            <p class="t-empty__text">暂无作业提交</p>
          </div>
        </template>
      </el-table>

      <div class="t-pagination" v-if="total > 0">
        <span class="t-pagination__total">共 <b>{{ total }}</b> 条数据</span>
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
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, EditPen } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import YubPageHeader from '@/components/YubPageHeader.vue'
import { getHomeworkPage, deleteHomework } from '@/api/edu/homework'

const router = useRouter()

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

const queryParams = reactive({ status: null, studentName: '' })

async function fetchData() {
  loading.value = true
  try {
    const res = await getHomeworkPage({
      queryParam: { ...queryParams },
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
    loading.value = false
  }
}

function handleQuery() {
  pageNum.value = 1
  fetchData()
}

function handleReset() {
  queryParams.status = null
  queryParams.studentName = ''
  pageNum.value = 1
  fetchData()
}

function parseImages(images) {
  if (!images) return []
  if (Array.isArray(images)) return images
  try { return JSON.parse(images) } catch { return [] }
}

function statusLabel(status) {
  return { 0: '待批改', 1: '批改中', 2: '已完成', 3: '失败' }[status] ?? '未知'
}

function statusBadge(status) {
  return { 0: 't-badge--amber', 1: 't-badge--blue', 2: 't-badge--green', 3: 't-badge--red' }[status] ?? 't-badge--gray'
}

function scoreRateClass(row) {
  if (!row.totalQuestions) return ''
  const rate = row.correctCount / row.totalQuestions
  if (rate >= 0.8) return 'excellent'
  if (rate >= 0.6) return 'good'
  return 'poor'
}

function handleDetail(id) {
  router.push(`/teacher/homework/${id}`)
}

async function handleDelete(id) {
  try {
    await ElMessageBox.confirm('确定要删除该作业批改记录吗？', '删除确认', { type: 'warning' })
    await deleteHomework(id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {}
}

onMounted(fetchData)
</script>

<style scoped>
.homework-card {
  padding: 0;
  overflow: hidden;
}

.student-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.student-cell__avatar {
  width: 28px;
  height: 28px;
  font-size: 12px;
}

.score-rate {
  font-weight: 600;
  font-size: 13px;
}
.score-rate.excellent { color: #0A7355; }
.score-rate.good { color: #B26A00; }
.score-rate.poor { color: #C0392B; }

.score-num {
  font-weight: 700;
  color: var(--t-accent-strong, #0A7355);
}
</style>
