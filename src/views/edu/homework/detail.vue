<template>
  <div class="homework-detail" v-loading="pageLoading">
    <!-- 顶部概要 -->
    <el-card class="summary-card" shadow="never">
      <div class="card-accent"></div>
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

    <!-- 提交图片 -->
    <el-card v-if="parsedImages.length > 0" class="section-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>提交图片</span>
          <el-tag size="small">{{ parsedImages.length }} 张</el-tag>
        </div>
      </template>
      <div class="image-list">
        <div
          v-for="(img, idx) in parsedImages"
          :key="idx"
          class="image-item"
        >
          <el-image
            :src="img"
            fit="cover"
            :preview-src-list="parsedImages"
            :initial-index="idx"
            class="homework-image"
          />
        </div>
      </div>
    </el-card>

    <!-- 题目批改 -->
    <el-card v-if="detail.questions && detail.questions.length > 0" class="section-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>题目批改</span>
          <el-tag size="small">{{ detail.questions.length }} 题</el-tag>
        </div>
      </template>
      <div class="question-list">
        <el-card
          v-for="q in detail.questions"
          :key="q.questionNo"
          class="question-card"
          shadow="hover"
        >
          <div class="question-header">
            <span class="question-no">第 {{ q.questionNo }} 题</span>
            <el-tag :type="q.reviewStatus === 1 ? 'success' : 'warning'" size="small">
              {{ reviewStatusLabel(q.reviewStatus) }}
            </el-tag>
          </div>
          <div class="question-content">
            <p class="question-text">{{ q.questionContent }}</p>
          </div>
          <el-divider />
          <div class="answer-section">
            <div class="answer-item">
              <span class="answer-label">学员答案：</span>
              <span class="answer-value">{{ q.studentAnswer || '未作答' }}</span>
            </div>
            <div class="answer-item">
              <span class="answer-label">AI判定正确答案：</span>
              <span class="answer-value correct">{{ q.correctAnswer || '-' }}</span>
            </div>
            <div class="answer-item">
              <span class="answer-label">AI分析：</span>
              <span class="answer-value">{{ q.analysis || '-' }}</span>
            </div>
          </div>
          <el-divider />
          <div class="review-section">
            <h4>人工复查</h4>
            <el-form :model="q" label-width="110px" class="review-form">
              <el-form-item label="学员答案修正">
                <el-input
                  v-model="q._studentAnswer"
                  placeholder="AI识别错误时在此修正学员答案"
                  clearable
                />
              </el-form-item>
              <el-form-item label="判定结果">
                <el-radio-group v-model="q._isCorrect">
                  <el-radio :value="1">正确</el-radio>
                  <el-radio :value="0">错误</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="最终正确答案">
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
                  size="small"
                  :loading="q._saving"
                  @click="handleSaveReview(q)"
                  :style="{ backgroundColor: 'var(--el-color-success)', borderColor: 'var(--el-color-success)' }"
                >
                  保存复查
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { getHomeworkDetail, reviewQuestion } from '@/api/edu/homework'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const pageLoading = ref(false)
const detail = ref({})

/** 解析images JSON字符串为数组 */
function parseImages(images) {
  if (!images) return []
  if (Array.isArray(images)) return images
  try { return JSON.parse(images) } catch { return [] }
}

/** 解析后的图片列表 */
const parsedImages = computed(() => parseImages(detail.value.images))

/** 得分率 */
const scorePercent = computed(() => {
  if (!detail.value.totalQuestions || detail.value.totalQuestions === 0) return 0
  return Math.round((detail.value.correctCount / detail.value.totalQuestions) * 100)
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

/** 审核状态标签 */
function reviewStatusLabel(reviewStatus) {
  const map = { 0: '待复查', 1: '已复查' }
  return map[reviewStatus] ?? '未知'
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
    // 初始化复查编辑字段
    if (d.questions) {
      d.questions.forEach(q => {
        q._studentAnswer = q.studentAnswer || ''
        q._isCorrect = q.isCorrect ?? 0
        q._reviewAnswer = q.reviewAnswer || q.correctAnswer || ''
        q._reviewAnalysis = q.reviewAnalysis || q.analysis || ''
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

function handleBack() {
  router.push('/edu/homework')
}

onMounted(() => {
  fetchDetail()
})
</script>

<style scoped>
@import '@/assets/css/user-management.css';

.homework-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-card,
.section-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
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
  color: #1e293b;
}

.summary-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
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
  font-weight: 600;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.image-item {
  cursor: pointer;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.homework-image {
  width: 150px;
  height: 150px;
  display: block;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.question-card :deep(.el-card__header) {
  padding: 12px 20px;
  background: #f8fafc;
}

.question-card :deep(.el-card__body) {
  padding: 16px 20px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.question-no {
  font-weight: 600;
  color: var(--el-color-primary);
  font-size: 15px;
}

.question-text {
  color: #334155;
  line-height: 1.6;
  margin: 0;
}

.answer-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.answer-item {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.answer-label {
  color: #64748b;
  white-space: nowrap;
  min-width: 120px;
}

.answer-value {
  color: #1e293b;
}

.answer-value.correct {
  color: var(--el-color-primary);
  font-weight: 600;
}

.review-section h4 {
  margin: 0 0 12px;
  font-size: 14px;
  color: #475569;
}

.review-form {
  max-width: 600px;
}
</style>
