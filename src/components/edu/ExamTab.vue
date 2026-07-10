<template>
  <div class="exam-tab">
    <div class="tab-toolbar">
      <el-button type="primary" size="small" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增试卷
      </el-button>
      <el-button size="small" :disabled="!selectedIds.length" type="danger" @click="handleBatchDelete">
        批量删除
      </el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe style="width:100%"
      :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: 600 }"
      @selection-change="(rows) => selectedIds = rows.map(r => r.id)">
      <el-table-column type="selection" width="40" align="center" />
      <el-table-column type="index" label="#" width="40" align="center" />
      <el-table-column prop="title" label="试卷" min-width="160" />
      <el-table-column prop="totalScore" label="满分" width="60" align="center" />
      <el-table-column prop="duration" label="限时(分)" width="80" align="center" />
      <el-table-column prop="difficulty" label="难度" width="70" align="center">
        <template #default="{ row }"><span>{{ '★'.repeat(row.difficulty || 0) }}{{ '☆'.repeat(5 - (row.difficulty || 0)) }}</span></template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="70" align="center">
        <template #default="{ row }"><el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">{{ row.status === 1 ? '启用' : '停用' }}</el-tag></template>
      </el-table-column>
      <el-table-column label="操作" width="160" align="center">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row.id)">编辑</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty><el-empty description="暂无试卷" :image-size="60" /></template>
    </el-table>

    <div class="pagination-bar">
      <div class="pagination-left"><span class="total-text">共 <b>{{ total }}</b> 条数据</span></div>
      <div class="pagination-right">
        <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :total="total"
          :page-sizes="[5, 10, 20]" :pager-count="3" layout="sizes, prev, pager, next" background size="small"
          @size-change="fetchData" @current-change="fetchData" />
      </div>
    </div>

    <YubDialog
      :model-value="dialogVisible"
      :title="isEdit ? '编辑试卷' : '新增试卷'"
      width="800px"
      destroy-on-close
      :before-close="() => dialogVisible = false"
      @update:model-value="dialogVisible = $event"
      @open="handleOpen"
    >
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="基本信息" name="basic">
          <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="试卷标题" prop="title"><el-input v-model="formData.title" placeholder="请输入试卷标题" maxlength="200" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="副标题"><el-input v-model="formData.subtitle" placeholder="可选" maxlength="200" /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="所属专业">
                  <el-tree-select v-model="formData.majorId" :data="majorOptions" :props="{ label: 'name', value: 'id', children: 'children' }" placeholder="请选择" clearable check-strictly style="width:100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12"><el-form-item label="所属课程"><el-input :model-value="courseName" disabled placeholder="当前课程" /></el-form-item></el-col>
            </el-row>
            <el-form-item label="设置为结课考试">
              <el-checkbox v-model="formData.isFinalExam" :true-value="1" :false-value="0" />
              <span style="font-size:12px;color:#e6a23c;margin-left:8px">一个课程最多只能有一个结课考试，请谨慎选择</span>
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="8"><el-form-item label="难度"><el-rate v-model="formData.difficulty" :max="5" /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="考试时长"><el-input-number v-model="formData.duration" :min="1" :max="600" style="width:100%"><template #suffix>分钟</template></el-input-number></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="满分"><el-input-number v-model="formData.totalScore" :min="0" :step="10" style="width:100%"><template #suffix>分</template></el-input-number></el-form-item></el-col>
            </el-row>
            <el-form-item label="及格分"><el-input-number v-model="formData.passScore" :min="0" :max="formData.totalScore" :step="10" style="width:300px"><template #suffix>分</template></el-input-number></el-form-item>
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="最大参考次数"><el-input-number v-model="formData.maxAttempts" :min="0" :max="99" style="width:100%" /><span style="margin-left:6px;font-size:12px;color:#909399">0 表示不限</span></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="章节完成率准入(%)"><el-input-number v-model="formData.chapterPassRate" :min="0" :max="100" style="width:100%" /><span style="margin-left:6px;font-size:12px;color:#909399">学员章节完成率达到此值方可参加考试</span></el-form-item></el-col>
            </el-row>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="出题范围" name="range">
          <el-form label-width="140px">
            <el-form-item label="试卷满分">
              <el-input-number v-model="formData.totalScore" :min="1" :step="10" style="width:200px" />
              <span style="margin-left:8px;color:#909399;font-size:12px">分</span>
            </el-form-item>
            <el-form-item label="出题方式">
              <el-radio-group v-model="formData.questionRangeType">
                <el-radio :value="0">当前课程所有试题</el-radio>
                <el-radio :value="1">按章节出题</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-divider />

            <!-- 所有试题模式 -->
            <div v-if="formData.questionRangeType === 0">
              <div class="type-row" v-for="qt in questionTypes" :key="qt.value">
                <span class="type-tag">{{ qt.label }}</span>
                <el-input-number v-model="qt.count" :min="0" size="small" style="width:90px" />
                <span class="type-info">道</span>
                <span class="type-info" style="margin-left:4px">
                  （共 <b>{{ qt.maxCount || 0 }}</b> 道）
                </span>
                <span class="type-info"> 占总分 </span>
                <el-input-number v-model="qt.percent" :min="0" :max="100" size="small" style="width:80px" :step="5" />
                <span class="type-info">%，计 </span>
                <b class="calc-val">{{ typeActualScore(qt) }}</b>
                <span class="type-info"> 分，每道 </span>
                <el-input-number v-model="qt.scorePerQuestion" :min="0.5" :step="0.5" size="small" style="width:80px" />
                <span class="type-info"> 分</span>
              </div>
              <div class="range-check">
                <span>总分比例：<b>{{ totalPercent() }}%</b></span>
                <span v-if="totalPercent() !== 100" class="range-warning">⚠ 各题型占比之和必须为 100%</span>
                <span v-else class="range-ok">✓ 占比正确</span>
                <span style="margin-left:16px">计算总分：<b>{{ calcTotalScore() }}</b> 分</span>
                <span v-if="calcTotalScore() !== formData.totalScore" class="range-warning">⚠ 与满分 {{ formData.totalScore }} 分不符</span>
              </div>
            </div>

            <!-- 按章节出题模式 -->
            <div v-else>
              <div class="chapter-percent-row">
                <span class="range-subtitle">各题型占总分百分比</span>
                <span v-for="qt in questionTypes" :key="qt.value" class="ch-percent-item">
                  <span class="type-tag-sm">{{ qt.label }}</span>
                  <el-input-number v-model="qt.percent" :min="0" :max="100" size="small" style="width:70px" :step="5" />
                  <span class="type-info">%</span>
                </span>
                <span v-if="totalPercent() !== 100" class="range-warning" style="margin-left:8px">需合计 100%</span>
              </div>
              <el-divider />
              <div v-for="ch in chapterTree" :key="ch.id" class="ch-block">
                <div class="ch-title">{{ chapterLabel(ch) }}</div>
                <span v-for="qt in questionTypes" :key="qt.value" class="ch-type-item">
                  <span>{{ qt.label }}</span>
                  <el-input-number :model-value="getChapterCount(ch.id, qt.value)"
                    @update:model-value="(v) => setChapterCount(ch.id, qt.value, v)"
                    :min="0" size="small" style="width:70px" />
                  <span class="type-info">道</span>
                </span>
              </div>
            </div>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="简介" name="intro"><RichEditor v-model="formData.introduction" /></el-tab-pane>
        <el-tab-pane label="注意事项" name="notes"><RichEditor v-model="formData.notes" /></el-tab-pane>

        <el-tab-pane label="其他" name="other">
          <el-form label-width="100px">
            <el-form-item label="出卷人"><el-input v-model="formData.examiner" placeholder="请输入出卷人" maxlength="100" /></el-form-item>
            <el-form-item label="试卷logo">
              <div class="upload-wrapper">
                <el-upload :show-file-list="false" :before-upload="handleLogoUpload" accept="image/*" :disabled="uploading">
                  <el-button type="primary" :loading="uploading">{{ uploading ? '上传中...' : '选择图片' }}</el-button>
                </el-upload>
                <div v-if="formData.logo" class="upload-preview">
                  <el-image :src="formData.logo" style="width:80px;height:80px;border-radius:4px;margin-left:12px" fit="cover" :preview-src-list="[formData.logo]" />
                  <el-button link type="danger" size="small" @click="formData.logo = ''" style="margin-left:4px">删除</el-button>
                </div>
              </div>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </YubDialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { getExamPage, getExamDetail, createExam, updateExam, deleteExam } from '@/api/edu/exam'
import { getMajorTree } from '@/api/edu/major'
import { getChapterTree } from '@/api/edu/chapter'
import { uploadImage } from '@/api/edu/upload'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import RichEditor from '@/components/RichEditor.vue'
import YubDialog from '@/components/YubDialog.vue'

const props = defineProps({ courseId: { type: Number, default: null }, courseName: { type: String, default: '' } })
const emit = defineEmits(['change'])

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(5)
const selectedIds = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const submitting = ref(false)
const uploading = ref(false)
const formRef = ref(null)
const activeTab = ref('basic')
const majorOptions = ref([])
const chapterTree = ref([])
const totalQuestionCount = ref(0)
const questionTypes = ref([])
const chapterConfigs = reactive({})

const formData = reactive({
  title: '', subtitle: '', majorId: null, courseId: null,
  isFinalExam: 0, status: 1, recommended: 0, difficulty: 3,
  duration: 60, totalScore: 100, passScore: 60, questionRangeType: 0,
  introduction: '', notes: '', examiner: '', logo: '',
  maxAttempts: 0, chapterPassRate: 0
})

const formRules = { title: [{ required: true, message: '请输入试卷标题', trigger: 'blur' }] }

// ====== 出题范围计算 ======
function totalPercent() {
  return questionTypes.value.reduce((s, qt) => s + (qt.percent || 0), 0)
}

function typeActualScore(qt) {
  return Math.round(((qt.percent || 0) / 100) * (formData.totalScore || 100))
}

function typeQuestionCount(qt) {
  const score = typeActualScore(qt)
  const perQ = qt.scorePerQuestion || 1
  return perQ > 0 ? Math.round(score / perQ) : 0
}

function calcTotalScore() {
  return questionTypes.value.reduce((s, qt) => s + typeActualScore(qt), 0)
}

// 章节出题计算
function chTypePercent(chapterId, qt) {
  const count = getChapterCount(chapterId, qt.value)
  const totalQ = questionTypes.value.reduce((s, q) => s + typeQuestionCount(q), 0) || 1
  return totalQ > 0 ? Math.round((count / totalQ) * 100) : 0
}

function chTypeScore(chapterId, qt) {
  return getChapterCount(chapterId, qt.value) * (qt.scorePerQuestion || 0)
}

function chTypeScorePerQuestion(chapterId, qt) {
  return qt.scorePerQuestion || 0
}

function getChapterCount(chapterId, questionType) {
  return chapterConfigs[`${chapterId}_${questionType}`]?.count ?? 0
}
function setChapterCount(chapterId, questionType, val) {
  const key = `${chapterId}_${questionType}`
  if (!chapterConfigs[key]) chapterConfigs[key] = { chapterId, questionType, count: 0 }
  chapterConfigs[key].count = val
}

function flattenTree(tree, r = []) { tree.forEach(i => { r.push(i); if (i.children?.length) flattenTree(i.children, r) }); return r }

function chapterLabel(ch) { 
  let label = ch.name
  // 扁平化找序号
  function findOrder(node, target, path = []) {
    if (node.id === target) return path
    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        const result = findOrder(node.children[i], target, [...path, i + 1])
        if (result) return result
      }
    }
    return null
  }
  for (const root of chapterTree.value) {
    const order = findOrder(root, ch.id, [])
    if (order && order.length > 0) {
      label = order.join('.') + '. ' + ch.name
      break
    }
  }
  return label
}

async function loadMajorOptions() { try { const r = await getMajorTree({}); majorOptions.value = r.data || [] } catch { majorOptions.value = [] } }
async function loadChapterTree() { if (!props.courseId) return; try { const r = await getChapterTree(props.courseId); chapterTree.value = r.data || [] } catch { chapterTree.value = [] } }

// 从试题库获取当前课程各题型题目数量
// 注意: 使用 pageSize:1000 是一个近似方案，如果课程试题超过1000条会不准确
// TODO: 后端应提供 /edu/question/count-by-type?courseId=xxx 专用接口
async function loadQuestionPerType() {
  if (!props.courseId) return
  try {
    const { getQuestionPage } = await import('@/api/edu/question')
    // 查询课程所有试题（限制1000条）
    const r = await getQuestionPage({ 
      queryParam: { courseId: props.courseId }, 
      pageParam: { pageNum: 1, pageSize: 1000 } 
    })
    const records = r.data?.records || []
    // 按题型计数
    const counts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 }
    records.forEach(q => { if (counts[q.questionType] !== undefined) counts[q.questionType]++ })
    totalQuestionCount.value = records.length
    for (const qt of questionTypes.value) {
      qt.maxCount = counts[qt.value] || 0
    }
  } catch { /* noop */ }
}

async function handleOpen() {
  await loadMajorOptions()
  if (editId.value) {
    try {
      const r = await getExamDetail(editId.value); const d = r.data
      Object.assign(formData, {
        title: d.title || '', subtitle: d.subtitle || '', majorId: d.majorId || null, courseId: d.courseId,
        isFinalExam: d.isFinalExam ?? 0, status: d.status ?? 1, recommended: d.recommended ?? 0, difficulty: d.difficulty ?? 3,
        duration: d.duration ?? 60, totalScore: d.totalScore ?? 100, passScore: d.passScore ?? 60, questionRangeType: d.questionRangeType ?? 0,
        introduction: d.introduction || '', notes: d.notes || '', examiner: d.examiner || '', logo: d.logo || '',
        maxAttempts: d.maxAttempts ?? 0, chapterPassRate: d.chapterPassRate ?? 0
      })
      for (const tc of d.typeConfigs || []) { 
        const qt = questionTypes.value.find(q => q.value === tc.questionType); 
        if (qt) { 
          qt.count = tc.questionCount; 
          qt.scorePerQuestion = tc.scorePerQuestion
          qt.percent = formData.totalScore > 0 ? Math.round((tc.questionCount * tc.scorePerQuestion) / formData.totalScore * 100) : 0
        } 
      }
      Object.keys(chapterConfigs).forEach(k => delete chapterConfigs[k])
      for (const cc of d.chapterConfigs || []) { chapterConfigs[`${cc.chapterId}_${cc.questionType}`] = { chapterId: cc.chapterId, questionType: cc.questionType, count: cc.questionCount } }
    } catch { ElMessage.error('加载试卷详情失败') }
  } else {
    formData.courseId = props.courseId
    for (const qt of questionTypes.value) { qt.count = 0; qt.scorePerQuestion = 0; qt.percent = 0 }
    Object.keys(chapterConfigs).forEach(k => delete chapterConfigs[k])
  }
}

async function handleSubmit() {
  if (!formRef.value) return; try { await formRef.value.validate() } catch { return }
  submitting.value = true
  try {
    const payload = { ...formData, typeConfigs: [], chapterConfigs: [] }
    payload.typeConfigs = questionTypes.value.filter(qt => typeQuestionCount(qt) > 0).map(qt => ({ 
      questionType: qt.value, questionCount: typeQuestionCount(qt), scorePerQuestion: qt.scorePerQuestion || 0 
    }))
    if (formData.questionRangeType === 1) Object.values(chapterConfigs).forEach(cfg => { if (cfg.count > 0) payload.chapterConfigs.push(cfg) })
    if (isEdit.value) { payload.id = editId.value; await updateExam(payload); ElMessage.success('编辑成功') }
    else { await createExam(payload); ElMessage.success('新增成功') }
    dialogVisible.value = false; await fetchData(); emit('change')
  } catch { /**/ } finally { submitting.value = false }
}

async function handleLogoUpload(file) {
  uploading.value = true
  try { const r = await uploadImage(file, 'edu/exam'); formData.logo = r.data; ElMessage.success('上传成功') } catch {/**/}
  finally { uploading.value = false }
  return false
}

function handleAdd() {
  editId.value = null; isEdit.value = false; activeTab.value = 'basic'
  Object.assign(formData, { title: '', subtitle: '', majorId: null, courseId: props.courseId, isFinalExam: 0, status: 1, recommended: 0, difficulty: 3, duration: 60, totalScore: 100, passScore: 60, questionRangeType: 0, introduction: '', notes: '', examiner: '', logo: '', maxAttempts: 0, chapterPassRate: 0 })
  for (const qt of questionTypes.value) { qt.count = 0; qt.scorePerQuestion = 0; qt.percent = 0 }
  Object.keys(chapterConfigs).forEach(k => delete chapterConfigs[k])
  loadChapterTree(); dialogVisible.value = true
}

async function handleEdit(id) { editId.value = id; isEdit.value = true; activeTab.value = 'basic'; await loadChapterTree(); dialogVisible.value = true }
async function handleDelete(id) { try { await ElMessageBox.confirm('确定要删除该试卷吗？', '删除确认', { type: 'warning' }); await deleteExam(id); ElMessage.success('删除成功'); fetchData() } catch {/**/} }
async function handleBatchDelete() {
  if (!selectedIds.value.length) return
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 条试卷吗？`, '批量删除确认', { type: 'warning' })
    const results = await Promise.allSettled(selectedIds.value.map(id => deleteExam(id)))
    const failed = results.filter(r => r.status === 'rejected').length
    if (failed > 0) {
      ElMessage.warning(`${failed} 条删除失败，其余成功`)
    } else {
      ElMessage.success('批量删除成功')
    }
    selectedIds.value = []
    fetchData()
  } catch { /* cancel */ }
}

async function fetchData() {
  if (!props.courseId) return; loading.value = true
  try { const r = await getExamPage({ queryParam: { courseId: props.courseId }, pageParam: { pageNum: pageNum.value, pageSize: pageSize.value } }); const d = r.data; tableData.value = d.records || []; total.value = d.total || 0 }
  catch { tableData.value = []; total.value = 0 } finally { loading.value = false }
}

watch(() => props.courseId, (val) => { if (val) { fetchData(); loadChapterTree(); loadQuestionPerType() } }, { immediate: true })

function initQuestionTypes() {
  questionTypes.value = [
    { value: 0, label: '单选题', count: 0, maxCount: 0, scorePerQuestion: 1, percent: 20 },
    { value: 1, label: '多选题', count: 0, maxCount: 0, scorePerQuestion: 2, percent: 10 },
    { value: 2, label: '判断题', count: 0, maxCount: 0, scorePerQuestion: 1, percent: 10 },
    { value: 3, label: '简答题', count: 0, maxCount: 0, scorePerQuestion: 5, percent: 30 },
    { value: 4, label: '填空题', count: 0, maxCount: 0, scorePerQuestion: 2, percent: 30 }
  ]
}
onMounted(() => { initQuestionTypes() })
</script>
<style scoped>
.exam-tab { min-height: 300px; }
.tab-toolbar { margin-bottom: 12px; display: flex; gap: 8px; }
.pagination-bar { display: flex; justify-content: space-between; align-items: center; padding: 12px 0 0; }
.total-text { font-size: 13px; color: #64748b; }
.total-text b { color: var(--el-color-primary); font-weight: 700; }
.range-hint { font-size: 13px; color: #64748b; margin-bottom: 4px; }
.upload-wrapper { display: flex; align-items: flex-start; }
.upload-preview { display: flex; align-items: center; }
.type-row { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; padding: 6px 0; }
.type-tag { display: inline-block; min-width: 60px; font-weight: 600; font-size: 13px; color: #1e293b; }
.type-tag-sm { font-size: 12px; font-weight: 500; margin-right: 2px; }
.type-info { font-size: 13px; color: #475569; white-space: nowrap; }
.calc-val { color: var(--el-color-primary); font-size: 13px; }
.range-check { padding: 8px 0 0; font-size: 13px; }
.range-warning { color: #f56c6c; margin-left: 8px; font-weight: 500; }
.range-ok { color: var(--el-color-primary); margin-left: 8px; }
.chapter-percent-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 8px; }
.range-subtitle { font-weight: 600; font-size: 13px; color: #1e293b; min-width: 140px; }
.ch-percent-item { display: inline-flex; align-items: center; gap: 2px; }
.ch-block { margin-bottom: 10px; padding: 8px; background: #f8fafc; border-radius: 4px; }
.ch-title { font-weight: 600; font-size: 13px; margin-bottom: 6px; padding-left: 4px; border-left: 3px solid var(--el-color-primary); }
.ch-type-item { display: inline-flex; align-items: center; gap: 4px; margin-right: 12px; margin-bottom: 4px; font-size: 13px; }
</style>
