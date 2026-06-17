import { ref, reactive, watch, computed } from 'vue'
import { createMajor, updateMajor, getMajorDetail } from '@/api/edu/major'
import { uploadImage } from '@/api/edu/upload'
import { ElMessage } from 'element-plus'

/**
 * 专业表单对话框逻辑
 *
 * @param {object} props 组件 props
 * @param {Function} emit 组件 emit
 * @returns {object} 表单对话框响应式状态和方法
 */
export function useMajorFormDialog(props, emit) {
  const visible = ref(false)
  const isEdit = ref(false)
  const submitting = ref(false)
  const uploading = ref(false)
  const formRef = ref(null)
  const activeTab = ref('basic')

  const formData = reactive({
    parentId: 0,
    name: '',
    alias: '',
    status: 1,
    recommended: 0,
    description: '',
    imageUrl: '',
    detail: '',
    sort: 0
  })

  const rules = {
    name: [
      { required: true, message: '请输入专业名称', trigger: 'blur' },
      { max: 100, message: '专业名称长度不能超过100个字符', trigger: 'blur' }
    ],
    alias: [
      { max: 100, message: '别名长度不能超过100个字符', trigger: 'blur' }
    ],
    description: [
      { max: 500, message: '说明长度不能超过500个字符', trigger: 'blur' }
    ]
  }

  /** 上级专业名称显示 */
  const parentName = computed(() => {
    if (!props.majorTree || props.majorTree.length === 0) return ''
    const findName = (list, id) => {
      for (const item of list) {
        if (item.id === id) return item.name
        if (item.children) {
          const found = findName(item.children, id)
          if (found) return found
        }
      }
      return ''
    }
    if (formData.parentId === 0) return '顶级专业'
    return findName(props.majorTree, formData.parentId) || '顶级专业'
  })

  watch(() => props.modelValue, (val) => {
    visible.value = val
  })

  watch(visible, (val) => {
    emit('update:modelValue', val)
    if (!val) {
      resetForm()
    }
  })

  // 监听 editMajorId 变化
  watch(() => props.editMajorId, (val) => {
    if (val !== null && val !== undefined) {
      if (typeof val === 'string' && val.startsWith('add_')) {
        const parentId = parseInt(val.replace('add_', ''), 10)
        formData.parentId = parentId
      }
    }
  })

  async function handleOpen() {
    if (props.editMajorId) {
      if (typeof props.editMajorId === 'string' && props.editMajorId.startsWith('add_')) {
        // 新增模式
        isEdit.value = false
        const parentId = parseInt(props.editMajorId.replace('add_', ''), 10)
        formData.parentId = parentId
      } else {
        // 编辑模式
        isEdit.value = true
        const res = await getMajorDetail(props.editMajorId)
        const data = res.data
        formData.parentId = data.parentId
        formData.name = data.name
        formData.alias = data.alias || ''
        formData.status = data.status
        formData.recommended = data.recommended || 0
        formData.description = data.description || ''
        formData.imageUrl = data.imageUrl || ''
        formData.detail = data.detail || ''
        formData.sort = data.sort || 0
      }
    }
  }

  function resetForm() {
    formData.parentId = 0
    formData.name = ''
    formData.alias = ''
    formData.status = 1
    formData.recommended = 0
    formData.description = ''
    formData.imageUrl = ''
    formData.detail = ''
    formData.sort = 0
    isEdit.value = false
    activeTab.value = 'basic'
    if (formRef.value) {
      formRef.value.resetFields()
    }
  }

  async function handleImageUpload(file) {
    uploading.value = true
    try {
      const res = await uploadImage(file, 'edu/major')
      formData.imageUrl = res.data
      ElMessage.success('图片上传成功')
    } catch {
      // 错误已处理
    } finally {
      uploading.value = false
    }
    return false // 阻止默认上传
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
        await updateMajor({
          id: props.editMajorId,
          parentId: formData.parentId,
          name: formData.name,
          alias: formData.alias || null,
          status: formData.status,
          recommended: formData.recommended,
          description: formData.description || null,
          imageUrl: formData.imageUrl || null,
          detail: formData.detail || null,
          sort: formData.sort
        })
        ElMessage.success('编辑成功')
      } else {
        await createMajor({
          parentId: formData.parentId,
          name: formData.name,
          alias: formData.alias || null,
          status: formData.status,
          recommended: formData.recommended,
          description: formData.description || null,
          imageUrl: formData.imageUrl || null,
          detail: formData.detail || null,
          sort: formData.sort
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
    uploading,
    formRef,
    formData,
    rules,
    parentName,
    activeTab,
    handleOpen,
    handleSubmit,
    handleImageUpload
  }
}
