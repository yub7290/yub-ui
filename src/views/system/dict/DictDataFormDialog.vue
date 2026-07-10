<template>
  <YubDialog
    v-model="visible"
    :title="isEdit ? '编辑字典数据' : '新增字典数据'"
    width="500px"
    destroy-on-close
    @open="handleOpen"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <el-form-item label="字典标签" prop="label">
        <el-input v-model="formData.label" placeholder="请输入字典标签" maxlength="100" />
      </el-form-item>
      <el-form-item label="字典值" prop="value">
        <el-input v-model="formData.value" placeholder="请输入字典值" maxlength="100" />
      </el-form-item>
      <el-form-item label="排序">
        <el-input-number v-model="formData.sort" :min="0" style="width: 100%" />
      </el-form-item>
      <el-form-item label="状态">
        <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="formData.remark" type="textarea" :rows="2" placeholder="请输入备注" maxlength="500" show-word-limit />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
    </template>
  </YubDialog>
</template>

<script setup>
import YubDialog from '@/components/YubDialog.vue'
import { useDictDataFormDialog } from '@/composables/useDictDataFormDialog'
const props = defineProps({ modelValue: Boolean, dictType: { type: Object, default: null }, dataId: { type: Number, default: null } })
const emit = defineEmits(['update:modelValue', 'success'])
const { visible, isEdit, submitting, formRef, formData, rules, handleOpen, handleSubmit } = useDictDataFormDialog(props, emit)
</script>
