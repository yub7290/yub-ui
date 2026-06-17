import { ref, reactive, watch } from 'vue'
import { createDictType, updateDictType, getDictTypeDetail } from '@/api/system/dictType'
import { ElMessage } from 'element-plus'

export function useDictTypeFormDialog(props, emit) {
  const visible = ref(false)
  const isEdit = ref(false)
  const submitting = ref(false)
  const formRef = ref(null)

  const formData = reactive({
    name: '',
    code: '',
    sort: 0,
    status: 1,
    description: ''
  })

  const rules = {
    name: [
      { required: true, message: '请输入字典名称', trigger: 'blur' },
      { max: 100, message: '名称长度不能超过100个字符', trigger: 'blur' }
    ],
    code: [
      { required: true, message: '请输入字典编码', trigger: 'blur' },
      { max: 100, message: '编码长度不能超过100个字符', trigger: 'blur' }
    ],
    description: [{ max: 500, message: '描述长度不能超过500个字符', trigger: 'blur' }]
  }

  watch(() => props.modelValue, (val) => { visible.value = val })
  watch(visible, (val) => { emit('update:modelValue', val); if (!val) resetForm() })

  async function handleOpen() {
    if (props.dictTypeId) {
      isEdit.value = true
      const res = await getDictTypeDetail(props.dictTypeId)
      const data = res.data
      formData.name = data.name
      formData.code = data.code
      formData.sort = data.sort || 0
      formData.status = data.status
      formData.description = data.description || ''
    } else { isEdit.value = false; resetForm() }
  }

  function resetForm() {
    formData.name = ''; formData.code = ''; formData.sort = 0; formData.status = 1; formData.description = ''
    isEdit.value = false; if (formRef.value) formRef.value.resetFields()
  }

  async function handleSubmit() {
    if (!formRef.value) return
    try { await formRef.value.validate() } catch { return }
    submitting.value = true
    try {
      if (isEdit.value) {
        await updateDictType({ id: props.dictTypeId, name: formData.name, code: formData.code, sort: formData.sort, status: formData.status, description: formData.description })
        ElMessage.success('编辑成功')
      } else {
        await createDictType({ name: formData.name, code: formData.code, sort: formData.sort, status: formData.status, description: formData.description })
        ElMessage.success('新增成功')
      }
      visible.value = false
      emit('success')
    } catch { /* handled */ } finally { submitting.value = false }
  }

  return { visible, isEdit, submitting, formRef, formData, rules, handleOpen, handleSubmit }
}
