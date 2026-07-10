<template>
  <YubDialog
    v-model="visible"
    :title="isEdit ? '编辑职称' : '新增职称'"
    width="500px"
    @open="handleOpen"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <el-form-item label="职称名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入职称名称" maxlength="100" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-switch
          v-model="formData.status"
          :active-value="1"
          :inactive-value="0"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        确定
      </el-button>
    </template>
  </YubDialog>
</template>

<script setup>
import YubDialog from '@/components/YubDialog.vue'
import { useTeacherTitleFormDialog } from '@/composables/edu/useTeacherTitleFormDialog'

const props = defineProps({
  modelValue: Boolean,
  titleId: { type: Number, default: null }
})
const emit = defineEmits(['update:modelValue', 'success'])

const {
  visible, isEdit, submitting, formRef,
  formData, rules, handleOpen, handleSubmit
} = useTeacherTitleFormDialog(props, emit)
</script>
