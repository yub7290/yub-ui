import { ref, reactive, watch } from 'vue'
import { createBanner, updateBanner, getBannerDetail } from '@/api/system/banner'
import { uploadImage } from '@/api/edu/upload'
import { ElMessage } from 'element-plus'

/**
 * Banner表单对话框逻辑
 *
 * @param {object} props 组件 props
 * @param {Function} emit 组件 emit
 * @returns {object} 表单对话框响应式状态和方法
 */
export function useBannerFormDialog(props, emit) {
  const visible = ref(false)
  const isEdit = ref(false)
  const submitting = ref(false)
  const uploading = ref(false)
  const formRef = ref(null)

  const formData = reactive({
    imageUrl: '',
    linkUrl: '',
    sort: 0,
    status: 1
  })

  const rules = {
    imageUrl: [
      { required: true, message: '请上传图片', trigger: 'change' },
      { max: 500, message: '图片URL长度不能超过500个字符', trigger: 'blur' }
    ],
    linkUrl: [
      { max: 500, message: '链接URL长度不能超过500个字符', trigger: 'blur' }
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
    if (props.bannerId) {
      isEdit.value = true
      try {
        const res = await getBannerDetail(props.bannerId)
        const data = res.data
        formData.imageUrl = data.imageUrl
        formData.linkUrl = data.linkUrl || ''
        formData.sort = data.sort || 0
        formData.status = data.status
      } catch {
        ElMessage.error('获取Banner详情失败')
        visible.value = false
      }
    } else {
      isEdit.value = false
    }
  }

  function resetForm() {
    formData.imageUrl = ''
    formData.linkUrl = ''
    formData.sort = 0
    formData.status = 1
    isEdit.value = false
    if (formRef.value) {
      formRef.value.resetFields()
    }
  }

  async function handleImageUpload(file) {
    // 校验文件大小不超过 2MB
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      ElMessage.warning('图片大小不能超过 2MB')
      return false
    }
    uploading.value = true
    try {
      const res = await uploadImage(file, 'banner')
      formData.imageUrl = res.data
      ElMessage.success('图片上传成功')
    } catch {
      // 错误已处理
    } finally {
      uploading.value = false
    }
    return false
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
        await updateBanner({
          id: props.bannerId,
          imageUrl: formData.imageUrl,
          linkUrl: formData.linkUrl,
          sort: formData.sort,
          status: formData.status
        })
        ElMessage.success('编辑成功')
      } else {
        await createBanner({
          imageUrl: formData.imageUrl,
          linkUrl: formData.linkUrl,
          sort: formData.sort,
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
    uploading,
    formRef,
    formData,
    rules,
    handleOpen,
    handleSubmit,
    handleImageUpload
  }
}
