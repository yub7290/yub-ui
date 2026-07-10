<template>
  <YubDialog v-model="visible" :title="isEdit ? '编辑试题' : '新增试题'" width="850px"
    destroy-on-close @open="handleOpen">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- ===== 题干（根据题型动态展示） ===== -->
      <el-tab-pane label="题干" name="question">
        <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
          <el-form-item label="试题类型" prop="questionType">
            <el-select v-model="formData.questionType" placeholder="请选择" style="width:300px" @change="initOptions">
              <el-option v-for="item in questionTypeOptions" :key="item.value" :label="item.label" :value="Number(item.value)" />
            </el-select>
          </el-form-item>
          <el-form-item label="题干" prop="content">
            <RichEditor v-model="formData.content" />
          </el-form-item>

          <!-- 单选题 / 多选题 -->
          <template v-if="formData.questionType === 0 || formData.questionType === 1">
            <el-divider content-position="left">{{ formData.questionType === 0 ? '选项（选择正确答案）' : '选项（勾选所有正确答案）' }}</el-divider>
            <div class="options-list">
              <div v-for="(opt, idx) in formData.options" :key="idx" class="option-row">
                <div class="option-label" :class="{ correct: opt.isCorrect === 1 }" @click="setCorrectAnswer(opt.label)">
                  <template v-if="formData.questionType === 0">
                    <el-radio :model-value="opt.isCorrect === 1" size="large">{{ opt.label }}</el-radio>
                  </template>
                  <template v-else>
                    <el-checkbox :model-value="opt.isCorrect === 1" size="large">{{ opt.label }}</el-checkbox>
                  </template>
                </div>
                <el-input v-model="opt.content" :placeholder="`选项 ${opt.label}`" maxlength="500" class="option-input" />
                <el-button link type="danger" size="small" @click="removeOption(idx)" :disabled="formData.options.length <= 1">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            <el-button type="primary" link size="small" @click="addOption" style="margin-top:8px">
              <el-icon><Plus /></el-icon> 添加选项
            </el-button>
          </template>

          <!-- 判断题 -->
          <template v-if="formData.questionType === 2">
            <el-divider content-position="left">正确答案</el-divider>
            <div class="judge-options">
              <div class="judge-option" :class="{ selected: formData.answer === 'true' }" @click="formData.answer = 'true'">
                <span class="judge-icon correct-icon">✓</span>
                <span>正确</span>
              </div>
              <div class="judge-option" :class="{ selected: formData.answer === 'false' }" @click="formData.answer = 'false'">
                <span class="judge-icon wrong-icon">✗</span>
                <span>错误</span>
              </div>
            </div>
          </template>

          <!-- 简答题 -->
          <template v-if="formData.questionType === 3">
            <el-divider content-position="left">参考答案</el-divider>
            <RichEditor v-model="formData.answer" />
          </template>

          <!-- 填空题 -->
          <template v-if="formData.questionType === 4">
            <el-divider content-position="left">填空答案</el-divider>
            <div class="options-list">
              <div v-for="(opt, idx) in formData.options" :key="idx" class="option-row">
                <span class="option-index">{{ idx + 1 }}.</span>
                <el-input v-model="opt.content" placeholder="输入答案" class="option-input" />
                <el-button link type="danger" size="small" @click="removeOption(idx)" :disabled="formData.options.length <= 1">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            <el-button type="primary" link size="small" @click="addOption" style="margin-top:8px">
              <el-icon><Plus /></el-icon> 添加空位
            </el-button>
          </template>
        </el-form>
      </el-tab-pane>

      <!-- ===== 基本信息 ===== -->
      <el-tab-pane label="基本信息" name="basic">
        <el-form label-width="100px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="难度">
                <el-rate v-model="formData.difficulty" :max="5" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="专业">
            <el-select v-model="formData.majorId" placeholder="请选择专业" clearable filterable style="width:100%"
              :disabled="!!props.defaultMajorId">
              <el-option v-for="item in majorOptions" :key="item.id" :label="formatMajorName(item)" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="课程">
            <el-select v-model="formData.courseId" placeholder="请选择课程" clearable filterable style="width:100%"
              :disabled="!!props.defaultCourseId">
              <el-option v-for="item in courseOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="章节">
            <el-tree-select v-model="formData.chapterId" :data="chapterTree" :props="{ label: 'name', value: 'id', children: 'children' }"
              placeholder="请选择章节" clearable check-strictly style="width:100%" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- ===== 解析 ===== -->
      <el-tab-pane label="解析" name="analysis">
        <RichEditor v-model="formData.analysis" />
      </el-tab-pane>

      <!-- ===== 知识点 ===== -->
      <el-tab-pane label="知识点" name="knowledge">
        <KnowledgePicker v-model="formData.knowledgePointIds" scope="global" />
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
    </template>
  </YubDialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import YubDialog from '@/components/YubDialog.vue'
import { getCoursePage } from '@/api/edu/course'
import { getChapterTree } from '@/api/edu/chapter'
import { useQuestionFormDialog } from '@/composables/edu/useQuestionFormDialog'
import RichEditor from '@/components/RichEditor.vue'
import KnowledgePicker from '@/components/edu/KnowledgePicker.vue'
import { Plus, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  questionId: { type: Number, default: null },
  defaultCourseId: { type: Number, default: null },
  defaultMajorId: { type: Number, default: null }
})

const emit = defineEmits(['update:modelValue', 'success'])

const {
  visible, isEdit, submitting, formRef, formData, rules,
  questionTypeOptions, majorOptions, activeTab,
  handleOpen, handleSubmit, formatMajorName,
  addOption, removeOption, setCorrectAnswer, initOptions
} = useQuestionFormDialog(props, emit)

// 课程选项（根据专业筛选）
const courseOptions = ref([])
const chapterTree = ref([])

watch(() => formData.majorId, async (val) => {
  if (val) {
    try {
      const res = await getCoursePage({ queryParam: { majorId: val }, pageParam: { pageNum: 1, pageSize: 999 } })
      courseOptions.value = res.data?.records || []
    } catch { courseOptions.value = [] }
    // 仅当专业变化时清空课程（非程序化预设）
    if (!props.defaultCourseId || props.defaultCourseId !== formData.courseId) {
      formData.courseId = null
      formData.chapterId = null
      chapterTree.value = []
    }
  } else {
    courseOptions.value = []
    formData.courseId = null
    formData.chapterId = null
    chapterTree.value = []
  }
})

watch(() => formData.courseId, async (val) => {
  if (val) {
    try {
      const res = await getChapterTree(val)
      chapterTree.value = res.data || []
    } catch { chapterTree.value = [] }
  } else {
    chapterTree.value = []
    formData.chapterId = null
  }
})
</script>

<style scoped>
.options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.option-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.option-label {
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  min-width: 50px;
  text-align: center;
}
.option-label.correct {
  background: #e8f5e9;
}
.option-input {
  flex: 1;
}
.judge-options {
  display: flex;
  gap: 20px;
}
.judge-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
  border: 2px solid #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}
.judge-option:hover {
  border-color: var(--el-color-primary);
}
.judge-option.selected {
  border-color: var(--el-color-primary);
  background: #f0fdf4;
}
.judge-icon {
  font-size: 24px;
  font-weight: bold;
}
.correct-icon { color: var(--el-color-primary); }
.wrong-icon { color: #f56c6c; }
.option-index {
  font-weight: bold;
  min-width: 24px;
  text-align: center;
}
</style>
