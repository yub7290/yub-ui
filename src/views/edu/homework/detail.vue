<template>
  <div class="homework-detail" v-loading="pageLoading">
    <!-- 顶部概览 -->
    <el-card class="summary-card" shadow="never">
      <div class="summary-header">
        <div class="summary-left">
          <el-button text @click="handleBack">
            <el-icon><ArrowLeft /></el-icon>返回列表
          </el-button>
          <h3 class="summary-title">作业批改详情</h3>
        </div>
        <div class="summary-right">
          <el-tag :type="statusTagType(detail.status)" size="default">
            {{ statusLabel(detail.status) }}
          </el-tag>
        </div>
      </div>
      <el-divider />
      <div class="summary-stats">
        <div class="stat-item">
          <span class="stat-label">学员</span>
          <span class="stat-value">{{ detail.studentName || '-' }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">课程</span>
          <span class="stat-value">{{ detail.courseName || '-' }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总题数</span>
          <span class="stat-value">{{ detail.totalQuestions ?? '-' }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">正确数</span>
          <span class="stat-value" :style="{ color: 'var(--el-color-success)' }">{{ detail.correctCount ?? '-' }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">得分率</span>
          <span class="stat-value">{{ scorePercent }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">提交时间</span>
          <span class="stat-value">{{ formatDateTime(detail.createTime) }}</span>
        </div>
      </div>
    </el-card>

    <!-- 提交图片总览 -->
    <el-card v-if="parsedImages.length > 0" class="section-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon class="card-title-icon"><Picture /></el-icon>
            提交图片
          </span>
          <el-tag size="small">{{ parsedImages.length }} 张</el-tag>
        </div>
      </template>
      <div class="image-grid">
        <div
          v-for="(img, idx) in parsedImages"
          :key="idx"
          class="image-thumb"
        >
          <el-image
            :src="img"
            :preview-src-list="parsedImages"
            :initial-index="idx"
            preview-teleported
            fit="cover"
            class="thumb-image"
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
                <span>图片加载失败</span>
                <a :href="img" target="_blank" rel="noopener noreferrer" class="error-link">查看原图</a>
              </div>
            </template>
          </el-image>
          <div class="image-index">第 {{ idx + 1 }} 张</div>
        </div>
      </div>
    </el-card>

    <!-- 题目批改 -->
    <el-card v-if="detail.questions && detail.questions.length > 0" class="section-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon class="card-title-icon"><Document /></el-icon>
            题目批改
            <el-tag size="small" class="title-count">{{ detail.questions.length }} 题</el-tag>
          </span>

          <!-- 常态工具栏 -->
          <div v-if="!batchMode" class="toolbar">
            <span class="review-progress">已复查 {{ reviewedCount }} / {{ totalCount }}</span>
            <el-button type="primary" :icon="Check" @click="openAutoReview">一键复查</el-button>
            <el-button type="danger" plain :icon="Delete" @click="toggleBatchMode">批量删除</el-button>
          </div>

          <!-- 批量模式工具栏 -->
          <div v-else class="toolbar">
            <span class="batch-count">已选 {{ selectedIds.length }} 项</span>
            <el-button @click="toggleAll">{{ allSelected ? '取消全选' : '全选' }}</el-button>
            <el-button
              type="danger"
              :disabled="selectedIds.length === 0"
              @click="openDeleteConfirm"
            >
              删除选中 ({{ selectedIds.length }})
            </el-button>
            <el-button @click="toggleBatchMode">取消</el-button>
          </div>
        </div>
      </template>
      <el-collapse v-model="activeNames" class="question-collapse">
        <el-collapse-item
          v-for="q in detail.questions"
          :key="q.questionNo"
          :name="q.questionNo"
          class="question-collapse-item"
          :class="{ reviewed: q.reviewStatus === 1 }"
        >
          <template #title>
            <div class="question-title-row">
              <div class="question-title-left">
                <el-checkbox
                  v-if="batchMode"
                  class="q-checkbox"
                  :model-value="selectedIds.includes(q.id)"
                  @click.stop
                  @change="(val) => onToggle(q.id, val)"
                />
                <span class="question-no">第 {{ q.questionNo }} 题</span>
                <div class="question-summary">
                  <div class="qs-col" :title="q.questionContent || '题目为空'">
                    <span class="qs-label">题目</span>
                    <span class="qs-value">{{ q.questionContent || '-' }}</span>
                  </div>
                  <div class="qs-col" :title="q.studentAnswer || '学员答案未识别'">
                    <span class="qs-label">学员答案</span>
                    <span class="qs-value">{{ q.studentAnswer || '未识别' }}</span>
                  </div>
                  <div class="qs-col" :title="q.correctAnswer || 'AI识别答案为空'">
                    <span class="qs-label">AI识别答案</span>
                    <span class="qs-value">{{ q.correctAnswer || '-' }}</span>
                  </div>
                </div>
              </div>
              <div class="question-tags">
                <el-tag
                  :type="q.isCorrect === 1 ? 'success' : q.isCorrect === 0 ? 'danger' : 'info'"
                  size="small"
                  effect="light"
                >
                  {{ q.isCorrect === 1 ? 'AI判定正确' : q.isCorrect === 0 ? 'AI判定错误' : '未判定' }}
                </el-tag>
                <el-tag :type="q.reviewStatus === 1 ? 'success' : 'warning'" size="small" effect="plain">
                  {{ q.reviewStatus === 1 ? '已复查' : '待复查' }}
                </el-tag>
              </div>
            </div>
          </template>

          <div class="question-detail">
            <!-- 题目内容 -->
            <div class="question-content-box">
              <div class="section-label">题目内容</div>
              <div class="question-text">{{ q.questionContent || '-' }}</div>
            </div>

            <!-- 对应手写图片 -->
            <div v-if="q._sourceImage" class="source-image-section">
              <div class="section-label">对应手写图片</div>
              <div class="source-image-wrap">
                <el-image
                  :src="q._sourceImage"
                  :preview-src-list="[q._sourceImage]"
                  preview-teleported
                  fit="contain"
                  class="source-image"
                >
                  <template #error>
                    <div class="image-error">
                      <el-icon><Picture /></el-icon>
                      <span>手写图片加载失败</span>
                      <a :href="q._sourceImage" target="_blank" rel="noopener noreferrer" class="error-link">查看原图</a>
                    </div>
                  </template>
                </el-image>
              </div>
            </div>

            <!-- AI 识别结果 -->
            <div class="ai-result-section">
              <div class="section-label">
                <el-icon class="section-label-icon"><MagicStick /></el-icon>
                AI 识别结果
              </div>
              <div class="answer-grid">
                <div class="answer-block">
                  <div class="answer-block-label">学员答案</div>
                  <div class="answer-block-value">{{ q.studentAnswer || '未识别到答案' }}</div>
                </div>
                <div class="answer-block correct">
                  <div class="answer-block-label">AI 判定正确答案</div>
                  <div class="answer-block-value">{{ q.correctAnswer || '-' }}</div>
                </div>
                <div class="answer-block analysis">
                  <div class="answer-block-label">AI 分析</div>
                  <div class="answer-block-value">{{ q.analysis || '-' }}</div>
                </div>
              </div>
            </div>

            <!-- 人工复查 -->
            <div class="review-section">
              <div class="section-label">
                <el-icon class="section-label-icon"><EditPen /></el-icon>
                人工复查
              </div>
              <el-form :model="q" label-width="100px" class="review-form">
                <el-form-item label="学员答案">
                  <el-input
                    v-model="q._studentAnswer"
                    placeholder="AI 识别错误时在此修正学员答案"
                    clearable
                  />
                </el-form-item>
                <el-form-item label="判定结果">
                  <el-radio-group v-model="q._isCorrect">
                    <el-radio :value="1">正确</el-radio>
                    <el-radio :value="0">错误</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="最终答案">
                  <el-input
                    v-model="q._reviewAnswer"
                    placeholder="确认或修正正确答案"
                    clearable
                  />
                </el-form-item>
                <el-form-item label="复查分析">
                  <el-input
                    v-model="q._reviewAnalysis"
                    type="textarea"
                    :rows="2"
                    placeholder="确认或修正批改分析"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button
                    type="primary"
                    :loading="q._saving"
                    @click="handleSaveReview(q)"
                  >
                    保存复查
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-card>

    <!-- 一键复查确认框 -->
    <el-dialog v-model="reviewAutoVisible" title="一键复查确认" width="640px" append-to-body>
      <div class="review-auto-tip">
        以下 <b>{{ autoReviewCount }}</b> 道「AI 判定正确」的题目将被标记为已复查（采用 AI 判定答案），请确认后通过：
      </div>
      <div class="review-auto-list">
        <div v-for="q in reviewAutoList" :key="q.id" class="review-auto-item">
          <div class="review-auto-no">第 {{ q.questionNo }} 题</div>
          <div class="ra-row">
            <span class="ra-label">题目</span>
            <span class="ra-value">{{ q.questionContent || '-' }}</span>
          </div>
          <div class="ra-row">
            <span class="ra-label">学员答案</span>
            <span class="ra-value">{{ q.studentAnswer || '未识别到答案' }}</span>
          </div>
          <div class="ra-row">
            <span class="ra-label">AI识别答案</span>
            <span class="ra-value highlight">{{ q.correctAnswer || '-' }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="reviewAutoVisible = false">取消</el-button>
        <el-button type="primary" :loading="autoReviewLoading" @click="confirmAutoReview">
          确认复查
        </el-button>
      </template>
    </el-dialog>

    <!-- 批量删除确认框 -->
    <el-dialog v-model="deleteConfirmVisible" title="批量删除确认" width="520px" append-to-body>
      <div class="del-tip">
        确认删除选中的 <b>{{ selectedIds.length }}</b> 道题目？删除后<b>不可恢复</b>，系统将自动重算统计：
      </div>
      <div class="del-preview">
        <div class="del-preview-row">
          <span>总题数</span>
          <span>{{ detail.totalQuestions }} → <b>{{ deletePreview.newTotal }}</b></span>
        </div>
        <div class="del-preview-row">
          <span>正确数</span>
          <span>{{ detail.correctCount }} → <b>{{ deletePreview.newCorrect }}</b></span>
        </div>
        <div class="del-preview-row">
          <span>得分率</span>
          <span>{{ scorePercent }}% → <b>{{ deletePreview.newScore }}%</b></span>
        </div>
      </div>
      <template #footer>
        <el-button @click="deleteConfirmVisible = false">取消</el-button>
        <el-button type="danger" :loading="deleteLoading" @click="confirmDelete">
          确认删除
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Picture, Document, MagicStick, EditPen, Check, Delete } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { getHomeworkDetail, reviewQuestion, autoReviewCorrect, batchDeleteQuestions } from '@/api/edu/homework'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const pageLoading = ref(false)
const detail = ref({})
const activeNames = ref([])

/* ===== 一键复查 / 批量删除 状态 ===== */
const batchMode = ref(false)
const selectedIds = ref([])
const reviewAutoVisible = ref(false)
const deleteConfirmVisible = ref(false)
const autoReviewLoading = ref(false)
const deleteLoading = ref(false)

/** 解析images JSON字符串为数组 */
function parseImages(images) {
  if (!images) return []
  if (Array.isArray(images)) return images
  try {
    const parsed = JSON.parse(images)
    return Array.isArray(parsed) ? parsed : [parsed]
  } catch {
    return []
  }
}

/** 将图片URL补全为可访问地址 */
function resolveImageUrl(url) {
  if (!url || typeof url !== 'string') return ''
  const trimmed = url.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/$/, '')
  const path = trimmed.startsWith('/') ? trimmed : '/' + trimmed
  return baseUrl + path
}

/** 解析后的提交图片列表 */
const parsedImages = computed(() =>
  parseImages(detail.value.images)
    .map(resolveImageUrl)
    .filter(url => url)
)

/** 得分率 */
const scorePercent = computed(() => {
  if (!detail.value.totalQuestions || detail.value.totalQuestions === 0) return 0
  return Math.round((detail.value.correctCount / detail.value.totalQuestions) * 100)
})

/** 题目总数 */
const totalCount = computed(() =>
  detail.value.questions ? detail.value.questions.length : 0
)
/** 已复查题数 */
const reviewedCount = computed(() =>
  detail.value.questions
    ? detail.value.questions.filter(q => q.reviewStatus === 1).length
    : 0
)
/** 可一键复查的题目（AI 判定正确） */
const reviewAutoList = computed(() =>
  detail.value.questions ? detail.value.questions.filter(q => q.isCorrect === 1) : []
)
const autoReviewCount = computed(() => reviewAutoList.value.length)
/** 是否全选 */
const allSelected = computed(() => totalCount.value > 0 && selectedIds.value.length === totalCount.value)
/** 批量删除后的统计预览（后端重算口径一致） */
const deletePreview = computed(() => {
  const total = detail.value.totalQuestions || 0
  const correct = detail.value.correctCount || 0
  const selCorrect = detail.value.questions
    ? detail.value.questions.filter(q => selectedIds.value.includes(q.id) && q.isCorrect === 1).length
    : 0
  const newTotal = Math.max(0, total - selectedIds.value.length)
  const newCorrect = Math.max(0, correct - selCorrect)
  const newScore = newTotal > 0 ? Math.round((newCorrect / newTotal) * 100) : 0
  return { newTotal, newCorrect, newScore }
})

/** 批改状态标签映射 */
function statusLabel(status) {
  const map = { 0: '待批改', 1: '批改中', 2: '已完成', 3: '失败' }
  return map[status] ?? '未知'
}

/** 批改状态标签颜色 */
function statusTagType(status) {
  const map = { 0: 'warning', 1: 'primary', 2: 'success', 3: 'danger' }
  return map[status] ?? 'info'
}

/** 格式化日期时间 */
function formatDateTime(date) {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '-'
}

/** 加载详情 */
async function fetchDetail() {
  const id = route.params.id
  if (!id) return
  pageLoading.value = true
  try {
    const res = await getHomeworkDetail(id)
    const d = res.data || {}
    // 初始化复查编辑字段与图片解析
    if (d.questions) {
      d.questions.forEach(q => {
        q._studentAnswer = q.studentAnswer || ''
        q._isCorrect = q.isCorrect ?? 0
        q._reviewAnswer = q.reviewAnswer || q.correctAnswer || ''
        q._reviewAnalysis = q.reviewAnalysis || q.analysis || ''
        q._sourceImage = resolveImageUrl(q.sourceImage)
      })
    }
    detail.value = d
  } catch {
    detail.value = {}
  } finally {
    pageLoading.value = false
  }
}

/** 保存单题复查 */
async function handleSaveReview(q) {
  q._saving = true
  try {
    await reviewQuestion({
      questionId: q.id,
      isCorrect: q._isCorrect,
      studentAnswer: q._studentAnswer || undefined,
      reviewAnswer: q._reviewAnswer,
      reviewAnalysis: q._reviewAnalysis
    })
    // 回写到原始字段
    q.studentAnswer = q._studentAnswer || q.studentAnswer
    q.isCorrect = q._isCorrect
    q.reviewAnswer = q._reviewAnswer
    q.reviewAnalysis = q._reviewAnalysis
    q.reviewStatus = 1
    ElMessage.success('复查保存成功')
  } catch {
    // 错误已处理
  } finally {
    q._saving = false
  }
}

/* ===== 一键复查 ===== */
/** 打开一键复查确认框（展示题目/学员答案/AI答案供教师确认） */
function openAutoReview() {
  if (autoReviewCount.value === 0) {
    ElMessage.warning('当前没有 AI 判定正确的题目可复查')
    return
  }
  reviewAutoVisible.value = true
}

/** 确认一键复查：仅 AI 判定正确的题标记为已复查，采用 AI 答案 */
async function confirmAutoReview() {
  autoReviewLoading.value = true
  try {
    const res = await autoReviewCorrect({ correctionId: detail.value.id })
    const n = res.data || autoReviewCount.value
    ElMessage.success(`已复查 ${n} 道题目`)
    reviewAutoVisible.value = false
    await fetchDetail()
  } catch {
    // 错误已处理
  } finally {
    autoReviewLoading.value = false
  }
}

/* ===== 批量删除 ===== */
/** 切换批量模式 */
function toggleBatchMode() {
  batchMode.value = !batchMode.value
  if (!batchMode.value) selectedIds.value = []
}

/** 切换单题勾选 */
function onToggle(id, val) {
  if (val) {
    if (!selectedIds.value.includes(id)) selectedIds.value.push(id)
  } else {
    selectedIds.value = selectedIds.value.filter(x => x !== id)
  }
}

/** 全选 / 取消全选 */
function toggleAll() {
  selectedIds.value = allSelected.value ? [] : detail.value.questions.map(q => q.id)
}

/** 打开批量删除确认框 */
function openDeleteConfirm() {
  if (selectedIds.value.length === 0) return
  deleteConfirmVisible.value = true
}

/** 确认批量删除：物理删除 + 后端重算统计 */
async function confirmDelete() {
  deleteLoading.value = true
  try {
    await batchDeleteQuestions({ ids: selectedIds.value })
    ElMessage.success(`已删除 ${selectedIds.value.length} 道题目`)
    deleteConfirmVisible.value = false
    batchMode.value = false
    selectedIds.value = []
    await fetchDetail()
  } catch {
    // 错误已处理
  } finally {
    deleteLoading.value = false
  }
}

function handleBack() {
  router.push('/edu/homework')
}

onMounted(() => {
  fetchDetail()
})
</script>

<style scoped>
.homework-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  padding-bottom: 40px;
}

.summary-card,
.section-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.summary-card :deep(.el-card__body),
.section-card :deep(.el-card__body) {
  padding: 24px;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.summary-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-label {
  font-size: 12px;
  color: #94a3b8;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1e293b;
  font-size: 15px;
}

.card-title-icon {
  color: var(--el-color-primary);
  font-size: 16px;
}

/* 提交图片总览 */
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.image-thumb {
  position: relative;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  transition: box-shadow 0.2s ease;
}

.image-thumb:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.thumb-image {
  width: 100%;
  height: 120px;
  display: block;
}

.image-index {
  padding: 6px 8px;
  text-align: center;
  font-size: 12px;
  color: #64748b;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
}

/* 题目折叠列表 */
.question-collapse {
  border: none;
}

.question-collapse :deep(.el-collapse-item__header) {
  height: auto;
  padding: 16px 20px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  margin-bottom: 12px;
  transition: background 0.2s ease;
}

.question-collapse :deep(.el-collapse-item__header.is-active) {
  background: #fff;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  margin-bottom: 0;
  border-bottom: none;
}

.question-collapse :deep(.el-collapse-item__wrap) {
  border: 1px solid #e5e7eb;
  border-top: none;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
}

.question-collapse :deep(.el-collapse-item__content) {
  padding: 20px;
  padding-bottom: 24px;
}

.question-collapse-item.reviewed :deep(.el-collapse-item__header) {
  border-left: 4px solid var(--el-color-success);
}

.question-collapse-item:not(.reviewed) :deep(.el-collapse-item__header) {
  border-left: 4px solid var(--el-color-warning);
}

.question-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  padding-right: 12px;
}

.question-title-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
  overflow: hidden;
}

.question-no {
  font-weight: 600;
  color: var(--el-color-primary);
  font-size: 15px;
  flex-shrink: 0;
}

.question-summary {
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.qs-col {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex: 1 1 0;
  max-width: 260px;
}

.qs-label {
  flex-shrink: 0;
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

.qs-value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: #334155;
}

.question-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* 题目详情内容 */
.question-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 分区标题 */
.section-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 10px;
}

.section-label-icon {
  color: var(--el-color-primary);
  font-size: 14px;
}

.question-content-box {
  padding: 16px 18px;
  background: #f8fafc;
  border-radius: 8px;
}

.question-text {
  color: #334155;
  line-height: 1.7;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 手写图片 */
.source-image-section {
  padding: 16px 18px;
  background: #f8fafc;
  border-radius: 8px;
}

.source-image-wrap {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  display: inline-block;
  max-width: 100%;
}

.source-image {
  width: 320px;
  height: 220px;
  display: block;
  cursor: zoom-in;
}

/* AI 识别结果 */
.ai-result-section {
  padding: 16px 18px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.answer-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.answer-block {
  padding: 14px 16px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
}

.answer-block.correct {
  background: #f0f9ff;
  border-color: #bae6fd;
}

.answer-block.analysis {
  background: #fafaf9;
  border-color: #e7e5e4;
}

.answer-block-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 500;
}

.answer-block-value {
  color: #1e293b;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.answer-block.correct .answer-block-value {
  color: #0284c7;
  font-weight: 500;
}

/* 人工复查 */
.review-section {
  padding: 18px;
  background: #fafafa;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
}

.review-form {
  max-width: 640px;
}

/* 图片加载失败兜底 */
.image-error {
  width: 100%;
  height: 100%;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #94a3b8;
  background: #f8fafc;
  font-size: 12px;
  padding: 12px;
  box-sizing: border-box;
  text-align: center;
}

.image-error .el-icon {
  font-size: 24px;
}

.error-link {
  color: var(--el-color-primary);
  text-decoration: none;
  font-size: 12px;
  word-break: break-all;
}

.error-link:hover {
  text-decoration: underline;
}

/* ===== 工具栏 / 批量模式 ===== */
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-count {
  margin-left: 8px;
}

.review-progress {
  font-size: 13px;
  color: #64748b;
}

.batch-count {
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
}

.q-checkbox {
  margin-right: 8px;
}

/* 一键复查弹框 */
.review-auto-tip {
  font-size: 13px;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 12px;
}

.review-auto-tip b {
  color: var(--el-color-primary);
}

.review-auto-list {
  max-height: 360px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-auto-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 14px;
  background: #f8fafc;
}

.review-auto-no {
  font-weight: 600;
  color: var(--el-color-primary);
  margin-bottom: 8px;
  font-size: 13px;
}

.ra-row {
  display: flex;
  gap: 10px;
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 4px;
}

.ra-label {
  flex: 0 0 76px;
  color: #64748b;
}

.ra-value {
  flex: 1;
  color: #1e293b;
  white-space: pre-wrap;
  word-break: break-word;
}

.ra-value.highlight {
  color: #0284c7;
  font-weight: 500;
}

/* 批量删除预览 */
.del-tip {
  font-size: 13px;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 12px;
}

.del-tip b {
  color: var(--el-color-danger);
}

.del-preview {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.del-preview-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #334155;
}

.del-preview-row b {
  color: var(--el-color-danger);
}

/* 响应式 */
@media (max-width: 768px) {
  .homework-detail {
    padding: 16px;
  }

  .summary-stats {
    gap: 20px;
  }

  .question-title-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .question-title-left {
    width: 100%;
  }

  .question-summary {
    gap: 12px;
  }

  .qs-col {
    max-width: 100%;
  }

  .source-image {
    width: 100%;
    height: auto;
  }
}
</style>
