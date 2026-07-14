<template>
  <YubDialog v-model="visible" :title="isEdit ? '编辑分类' : '新增分类'" width="480px" destroy-on-close>
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="90px">
      <el-form-item label="分类名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入分类名称" maxlength="50" />
      </el-form-item>
      <el-form-item label="排序">
        <el-input-number v-model="formData.sortOrder" :min="0" :max="999" />
      </el-form-item>
      <el-form-item label="状态">
        <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
    </template>
  </YubDialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import {
  createNewsCategory, updateNewsCategory
} from '@/api/edu/news'
import { ElMessage } from 'element-plus'
import YubDialog from '@/components/YubDialog.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  /** 编辑时传入的分类对象；为 null 表示新增 */
  editCategory: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue', 'success'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const isEdit = computed(() => !!props.editCategory)
const formRef = ref(null)
const submitting = ref(false)
const formData = reactive({ name: '', sortOrder: 0, status: 1 })

watch(() => props.modelValue, (open) => {
  if (open) {
    if (props.editCategory) {
      const c = props.editCategory
      Object.assign(formData, {
        name: c.name || '',
        sortOrder: c.sortOrder ?? 0,
        status: c.status ?? 1
      })
    } else {
      Object.assign(formData, { name: '', sortOrder: 0, status: 1 })
    }
    formRef.value && formRef.value.clearValidate()
  }
})

const formRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

function handleSubmit() {
  if (!formRef.value) return
  formRef.value.validate().then(() => {
    submitting.value = true
    const payload = { ...formData }
    if (isEdit.value) payload.id = props.editCategory.id
    const req = isEdit.value ? updateNewsCategory(payload) : createNewsCategory(payload)
    req.then(() => {
      ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
      visible.value = false
      emit('success')
    }).catch(() => {}).finally(() => { submitting.value = false })
  }).catch(() => {})
}
</script>
