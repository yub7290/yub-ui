import { ref, reactive, watch } from 'vue'
import { createTeacherTitle, updateTeacherTitle, getTeacherTitleDetail } from '@/api/edu/teacherTitle'
import { ElMessage } from 'element-plus'

/**
 * 教师职称表单对话框逻辑
 *
 * @param {object} props 组件 props
 * @param {Function} emit 组件 emit
 * @returns {object} 表单对话框响应式状态和方法
 */
export function useTeacherTitleFormDialog(props, emit) {
  const visible = ref(false)
  const isEdit = ref(false)
  const submitting = ref(false)
  const formRef = ref(null)

  const formData = reactive({
    name: '',
    remark: '',
    status: 1
  })

  const rules = {
    name: [
      { required: true, message: '请输入职称名称', trigger: 'blur' },
      { max: 100, message: '职称名称长度不能超过100个字符', trigger: 'blur' }
    ],
    remark: [
      { max: 500, message: '备注长度不能超过500个字符', trigger: 'blur' }
    ]
  }

  watch(() => props.modelValue, (val) => {
    visible.value = val
  })

  watch(visible, (val) => {
    emit('update:modelValue', val)
    if (!val) {
      resetForm()
    }
  })

  async function handleOpen() {
    if (props.titleId) {
      isEdit.value = true
      const res = await getTeacherTitleDetail(props.titleId)
      const data = res.data
      formData.name = data.name
      formData.remark = data.remark || ''
      formData.status = data.status
    } else {
      isEdit.value = false
      resetForm()
    }
  }

  function resetForm() {
    formData.name = ''
    formData.remark = ''
    formData.status = 1
    isEdit.value = false
    if (formRef.value) {
      formRef.value.resetFields()
    }
  }

  async function handleSubmit() {
    if (!formRef.value) return
    try {
      await formRef.value.validate()
    } catch {
      return
    }
    submitting.value = true
    try {
      if (isEdit.value) {
        await updateTeacherTitle({
          id: props.titleId,
          name: formData.name,
          remark: formData.remark,
          status: formData.status
        })
        ElMessage.success('编辑成功')
      } else {
        await createTeacherTitle({
          name: formData.name,
          remark: formData.remark,
          status: formData.status
        })
        ElMessage.success('新增成功')
      }
      visible.value = false
      emit('success')
    } catch {
      // 错误已由 request.js 拦截器处理
    } finally {
      submitting.value = false
    }
  }

  return {
    visible,
    isEdit,
    submitting,
    formRef,
    formData,
    rules,
    handleOpen,
    handleSubmit
  }
}
