<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑学习卡' : '新增学习卡'"
    width="750px"
    :before-close="() => visible = false"
    @open="handleOpen"
    destroy-on-close
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="主题" prop="title">
            <el-input v-model="formData.title" placeholder="请输入学习卡主题" maxlength="100" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态">
            <el-switch
              v-model="formData.status"
              :active-value="1"
              :inactive-value="0"
              active-color="#38daa6"
              inactive-color="#cbd5e1"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="面额" prop="faceValue">
            <el-input-number v-model="formData.faceValue" :min="0" :precision="2" style="width: 100%">
              <template #prefix>¥</template>
            </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="可抵扣卡券">
            <el-input-number v-model="formData.couponDeduction" :min="0" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="数量(张)" prop="quantity">
            <el-input-number v-model="formData.quantity" :min="1" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="学习码长度">
            <el-input-number v-model="formData.studyCodeLength" :min="4" :max="32" style="width: 100%">
              <template #suffix>位字符</template>
            </el-input-number>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="密钥长度">
            <el-input-number v-model="formData.secretKeyLength" :min="4" :max="32" style="width: 100%">
              <template #suffix>位字符</template>
            </el-input-number>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="有效期" prop="validityStart">
            <el-date-picker
              v-model="validityRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
              @change="handleValidityChange"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="学习时长" prop="studyDuration">
            <el-input-number v-model="formData.studyDuration" :min="1" style="width: 60%" />
            <el-select v-model="formData.studyDurationUnit" style="width: 36%; margin-left: 4%">
              <el-option label="天" value="day" />
              <el-option label="个月" value="month" />
              <el-option label="年" value="year" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="说明">
        <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入说明" maxlength="500" />
      </el-form-item>

      <!-- 关联课程 -->
      <el-divider content-position="left">关联课程</el-divider>
      <el-form-item label="选择课程">
        <el-select
          v-model="selectedCourseIds"
          multiple
          filterable
          placeholder="请选择关联课程"
          style="width: 100%"
        >
          <el-option
            v-for="item in courseOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useStudyCardFormDialog } from '@/composables/edu/useStudyCardFormDialog'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  studyCardId: { type: Number, default: null }
})

const emit = defineEmits(['update:modelValue', 'success'])

const {
  visible, isEdit, submitting, formRef,
  formData, rules, courseOptions, selectedCourseIds,
  handleOpen, handleSubmit
} = useStudyCardFormDialog(props, emit)

/** 有效期日期范围（计算属性，用于双向绑定日期选择器） */
const validityRange = computed({
  get() {
    if (formData.validityStart && formData.validityEnd) {
      return [formData.validityStart, formData.validityEnd]
    }
    return null
  },
  set(val) {
    if (val) {
      formData.validityStart = val[0]
      formData.validityEnd = val[1]
    } else {
      formData.validityStart = null
      formData.validityEnd = null
    }
  }
})

function handleValidityChange(val) {
  if (val) {
    formData.validityStart = val[0]
    formData.validityEnd = val[1]
  } else {
    formData.validityStart = null
    formData.validityEnd = null
  }
}
</script>
