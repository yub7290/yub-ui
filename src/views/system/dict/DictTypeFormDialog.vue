<template>
  <el-dialog :title="isEdit ? '编辑字典类型' : '新增字典类型'" v-model="visible" width="500px" :close-on-click-modal="false" @open="handleOpen">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item label="字典名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入字典名称" maxlength="100" />
      </el-form-item>
      <el-form-item label="字典编码" prop="code">
        <el-input v-model="formData.code" :disabled="isEdit" placeholder="请输入字典编码" maxlength="100" />
      </el-form-item>
      <el-form-item label="排序">
        <el-input-number v-model="formData.sort" :min="0" style="width: 100%" />
      </el-form-item>
      <el-form-item label="状态">
        <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入描述" maxlength="500" show-word-limit />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { useDictTypeFormDialog } from '@/composables/useDictTypeFormDialog'
const props = defineProps({ modelValue: Boolean, dictTypeId: { type: Number, default: null } })
const emit = defineEmits(['update:modelValue', 'success'])
const { visible, isEdit, submitting, formRef, formData, rules, handleOpen, handleSubmit } = useDictTypeFormDialog(props, emit)
</script>
