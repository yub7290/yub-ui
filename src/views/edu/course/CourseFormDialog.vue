<template>
  <el-dialog
    v-model="visible"
    :title="isCreateMode ? '新增课程' : '编辑课程'"
    :width="isCreateMode ? '500px' : '900px'"
    :before-close="() => visible = false"
    @open="handleOpen"
    destroy-on-close
  >
    <div v-if="isCreateMode" class="create-form">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="课程名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入课程名称" maxlength="200" />
        </el-form-item>
        <el-form-item label="课程图片">
          <div class="upload-wrapper">
            <el-upload :show-file-list="false" :before-upload="handleImageUpload" accept="image/*" :disabled="uploading">
              <el-button type="primary" :loading="uploading">{{ uploading ? '上传中...' : '选择图片' }}</el-button>
            </el-upload>
            <div class="upload-preview" v-if="formData.imageUrl">
              <el-image :src="formData.imageUrl" style="width:120px;height:80px;border-radius:4px;margin-left:12px" fit="cover" :preview-src-list="[formData.imageUrl]" />
              <el-button link type="danger" size="small" @click="formData.imageUrl = ''" style="margin-left:4px">删除</el-button>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="所属专业">
          <el-select v-model="formData.majorId" placeholder="请选择专业" clearable filterable style="width:100%">
            <el-option v-for="item in majorOptions" :key="item.id" :label="formatMajorName(item)" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <div v-else class="edit-form">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="基本信息" name="basic">
          <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="课程名称" prop="name">
                  <el-input v-model="formData.name" placeholder="请输入课程名称" maxlength="200" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="课程图片">
                  <div class="upload-wrapper">
                    <el-upload :show-file-list="false" :before-upload="handleImageUpload" accept="image/*" :disabled="uploading">
                      <el-button type="primary" :loading="uploading">{{ uploading ? '上传中...' : '选择图片' }}</el-button>
                    </el-upload>
                    <div class="upload-preview" v-if="formData.imageUrl">
                      <el-image :src="formData.imageUrl" style="width:120px;height:80px;border-radius:4px;margin-left:12px" fit="cover" :preview-src-list="[formData.imageUrl]" />
                      <el-button link type="danger" size="small" @click="formData.imageUrl = ''" style="margin-left:4px">删除</el-button>
                    </div>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="所属专业">
                  <el-select v-model="formData.majorId" placeholder="请选择专业" clearable filterable style="width:100%">
                    <el-option v-for="item in majorOptions" :key="item.id" :label="formatMajorName(item)" :value="item.id" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="课程类型" prop="courseType">
                  <el-select v-model="formData.courseType" placeholder="请选择" style="width:100%">
                    <el-option v-for="item in courseTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="排序">
                  <el-input-number v-model="formData.sort" :min="0" style="width:100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="教师">
              <el-select v-model="formData.teacher" placeholder="请选择教师" clearable filterable style="width:100%">
                <el-option v-for="item in teacherOptions" :key="item.id" :label="item.name" :value="item.name" />
              </el-select>
            </el-form-item>
            <el-form-item label="学习目标">
              <RichEditor v-model="formData.learningObjectives" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="简介" name="intro">
          <RichEditor v-model="formData.introduction" />
        </el-tab-pane>

        <el-tab-pane label="资费" name="pricing">
          <PricePlanTab
            v-if="currentCourseId"
            :course-id="currentCourseId"
            v-model:is-free="formData.isFree"
            v-model:is-free-limited="formData.isFreeLimited"
            v-model:free-start-time="formData.freeStartTime"
            v-model:free-end-time="formData.freeEndTime"
            v-model:allow-trial="formData.allowTrial"
          />
          <el-empty v-else description="请先保存课程后管理资费" :image-size="80" />
        </el-tab-pane>

        <el-tab-pane label="章节" name="chapter">
          <ChapterTab v-if="currentCourseId" :course-id="currentCourseId" />
          <el-empty v-else description="请先保存课程后管理章节" :image-size="80" />
        </el-tab-pane>

        <el-tab-pane label="试题" name="question">
          <QuestionTab v-if="currentCourseId" :course-id="currentCourseId" :default-major-id="formData.majorId" />
          <el-empty v-else description="请先保存课程后管理试题" :image-size="80" />
        </el-tab-pane>

        <el-tab-pane label="试卷/考试" name="exam">
          <ExamTab v-if="currentCourseId" :course-id="currentCourseId" :course-name="formData.name" />
          <el-empty v-else description="请先保存课程后管理试卷" :image-size="80" />
        </el-tab-pane>

        <el-tab-pane label="知识点" name="knowledge">
          <KnowledgeTab v-if="currentCourseId" :course-id="currentCourseId" />
          <el-empty v-else description="请先保存课程后管理知识点" :image-size="80" />
        </el-tab-pane>

        <el-tab-pane label="公告" name="announcement">
          <AnnouncementTab v-if="currentCourseId" :course-id="currentCourseId" />
          <el-empty v-else description="请先保存课程后管理公告" :image-size="80" />
        </el-tab-pane>

        <el-tab-pane label="留言" name="message">
          <MessageTab v-if="currentCourseId" :course-id="currentCourseId" />
          <el-empty v-else description="请先保存课程后管理留言" :image-size="80" />
        </el-tab-pane>

        <el-tab-pane label="AI助教" name="ai">
          <AiConfigTab v-if="currentCourseId" :course-id="currentCourseId" />
          <el-empty v-else description="请先保存课程后配置AI助教" :image-size="80" />
        </el-tab-pane>
      </el-tabs>
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button v-if="isCreateMode" type="primary" :loading="submitting" @click="handleSubmit">保存并继续</el-button>
      <el-button v-else type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { useCourseFormDialog } from '@/composables/edu/useCourseFormDialog'
import RichEditor from '@/components/RichEditor.vue'
import ChapterTab from '@/components/edu/ChapterTab.vue'
import QuestionTab from '@/components/edu/QuestionTab.vue'
import KnowledgeTab from '@/components/edu/KnowledgeTab.vue'
import ExamTab from '@/components/edu/ExamTab.vue'
import AnnouncementTab from '@/components/edu/AnnouncementTab.vue'
import PricePlanTab from '@/components/edu/PricePlanTab.vue'
import MessageTab from '@/components/edu/MessageTab.vue'
import AiConfigTab from '@/components/edu/AiConfigTab.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  courseId: { type: Number, default: null }
})

const emit = defineEmits(['update:modelValue', 'success'])

const {
  visible, isCreateMode, currentCourseId,
  submitting, uploading, formRef,
  formData, rules, majorOptions, courseTypeOptions, teacherOptions, activeTab,
  handleOpen, handleSubmit, handleImageUpload, formatMajorName
} = useCourseFormDialog(props, emit)
</script>

<style scoped>
.upload-wrapper { display: flex; align-items: flex-start; }
.upload-preview { display: flex; align-items: center; }
</style>
