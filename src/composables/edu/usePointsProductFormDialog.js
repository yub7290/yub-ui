import { ref, reactive, watch } from 'vue'
import { createPointsProduct, updatePointsProduct, getPointsProductDetail, getStudyCardOptions } from '@/api/edu/pointsProduct'
import { uploadImage } from '@/api/edu/upload'
import { ElMessage } from 'element-plus'

/**
 * 积分商品表单对话框逻辑
 *
 * @param {object} props 组件 props
 * @param {Function} emit 组件 emit
 * @returns {object} 表单对话框响应式状态和方法
 */
export function usePointsProductFormDialog(props, emit) {
  const visible = ref(false)
  const isEdit = ref(false)
  const submitting = ref(false)
  const uploading = ref(false)
  const formRef = ref(null)
  const studyCardOptions = ref([])

  const formData = reactive({
    name: '',
    productType: 1,
    studyCardId: null,
    imageUrl: '',
    requiredPoints: 0,
    stockCount: 0
  })

  const rules = {
    name: [
      { required: true, message: '请输入商品名称', trigger: 'blur' }
    ],
    requiredPoints: [
      { required: true, message: '请输入所需积分', trigger: 'blur' },
      { type: 'number', min: 0, message: '所需积分不能小于0', trigger: 'blur' }
    ],
    studyCardId: [
      { required: true, message: '请选择学习卡', trigger: 'change' }
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

  watch(() => formData.productType, (val) => {
    if (val === 2) {
      formData.imageUrl = ''
      formData.stockCount = 0
    }
  })

  async function loadStudyCardOptions() {
    try {
      const res = await getStudyCardOptions()
      studyCardOptions.value = res.data || []
    } catch {
      studyCardOptions.value = []
    }
  }

  async function handleOpen() {
    await loadStudyCardOptions()
    if (props.productId) {
      isEdit.value = true
      const res = await getPointsProductDetail(props.productId)
      const data = res.data
      Object.assign(formData, {
        name: data.name || '',
        productType: data.productType ?? 1,
        studyCardId: data.studyCardId ?? null,
        imageUrl: data.imageUrl || '',
        requiredPoints: data.requiredPoints ?? 0,
        stockCount: data.stockCount ?? 0
      })
    } else {
      isEdit.value = false
    }
  }

  function resetForm() {
    Object.assign(formData, {
      name: '',
      productType: 1,
      studyCardId: null,
      imageUrl: '',
      requiredPoints: 0,
      stockCount: 0
    })
    isEdit.value = false
    studyCardOptions.value = []
  }

  function handleStudyCardChange(cardId) {
    const card = studyCardOptions.value.find(c => c.id === cardId)
    if (card) {
      formData.name = card.title
      formData.imageUrl = ''
      formData.stockCount = 0
    }
  }

  async function handleImageUpload(file) {
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      ElMessage.warning('图片大小不能超过 2MB')
      return false
    }
    uploading.value = true
    try {
      const res = await uploadImage(file, 'edu/points-product')
      formData.imageUrl = res.data
      ElMessage.success('图片上传成功')
    } catch {
      // 错误已处理
    } finally {
      uploading.value = false
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
      const payload = {
        name: formData.name,
        productType: formData.productType,
        studyCardId: formData.productType === 2 ? formData.studyCardId : null,
        imageUrl: formData.imageUrl,
        requiredPoints: formData.requiredPoints,
        stockCount: formData.stockCount
      }

      if (isEdit.value) {
        payload.id = props.productId
        await updatePointsProduct(payload)
        ElMessage.success('保存成功')
      } else {
        await createPointsProduct(payload)
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
    studyCardOptions,
    handleOpen,
    handleSubmit,
    handleImageUpload,
    handleStudyCardChange
  }
}
