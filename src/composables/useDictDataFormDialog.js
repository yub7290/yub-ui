import { ref, reactive, watch } from 'vue'
import { createDictData, updateDictData, getDictDataDetail } from '@/api/system/dictData'
import { ElMessage } from 'element-plus'

export function useDictDataFormDialog(props, emit) {
  const visible = ref(false)
  const isEdit = ref(false)
  const submitting = ref(false)
  const formRef = ref(null)

  const formData = reactive({
    label: '',
    value: '',
    sort: 0,
    status: 1,
    remark: ''
  })

  const rules = {
    label: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
    value: [{ required: true, message: '请输入字典值', trigger: 'blur' }]
  }

  watch(() => props.modelValue, (val) => { visible.value = val })
  watch(visible, (val) => { emit('update:modelValue', val); if (!val) resetForm() })

  async function handleOpen() {
    if (props.dataId) {
      isEdit.value = true
      const res = await getDictDataDetail(props.dataId)
      const data = res.data
      formData.label = data.label
      formData.value = data.value
      formData.sort = data.sort || 0
      formData.status = data.status
      formData.remark = data.remark || ''
    } else {
      isEdit.value = false
      resetForm()
    }
  }

  function resetForm() {
    formData.label = ''; formData.value = ''; formData.sort = 0; formData.status = 1; formData.remark = ''
    isEdit.value = false; if (formRef.value) formRef.value.resetFields()
  }

  async function handleSubmit() {
    if (!formRef.value) return
    try { await formRef.value.validate() } catch { return }
    submitting.value = true
    try {
      if (isEdit.value) {
        await updateDictData({ id: props.dataId, ...formData })
        ElMessage.success('编辑成功')
      } else {
        await createDictData({ typeId: props.dictType.id, ...formData })
        ElMessage.success('新增成功')
      }
      visible.value = false
      emit('success')
    } catch { /* handled */ } finally { submitting.value = false }
  }

  return { visible, isEdit, submitting, formRef, formData, rules, handleOpen, handleSubmit }
}
