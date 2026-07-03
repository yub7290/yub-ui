import { ref, reactive, watch } from 'vue'
import { createStudyCard, updateStudyCard, getStudyCardDetail } from '@/api/edu/studyCard'
import { getCoursePage } from '@/api/edu/course'
import { ElMessage } from 'element-plus'

/**
 * 学习卡表单对话框逻辑
 *
 * @param {object} props 组件 props
 * @param {Function} emit 组件 emit
 * @returns {object} 表单对话框响应式状态和方法
 */
export function useStudyCardFormDialog(props, emit) {
  const visible = ref(false)
  const isEdit = ref(false)
  const submitting = ref(false)
  const formRef = ref(null)

  /** 关联课程选项 */
  const courseOptions = ref([])
  const selectedCourseIds = ref([])

  const formData = reactive({
    title: '',
    faceValue: null,
    couponDeduction: null,
    quantity: null,
    status: 1,
    validityStart: null,
    validityEnd: null,
    studyDuration: null,
    studyDurationUnit: 'month',
    description: '',
    studyCodeLength: 8,
    secretKeyLength: 6
  })

  const rules = {
    title: [
      { required: true, message: '请输入学习卡主题', trigger: 'blur' },
      { max: 100, message: '主题长度不能超过100个字符', trigger: 'blur' }
    ],
    faceValue: [
      { required: true, message: '请输入面额', trigger: 'blur' }
    ],
    quantity: [
      { required: true, message: '请输入数量', trigger: 'blur' }
    ],
    validityStart: [
      { required: true, message: '请选择有效期开始时间', trigger: 'change' }
    ],
    validityEnd: [
      { required: true, message: '请选择有效期结束时间', trigger: 'change' }
    ],
    studyDuration: [
      { required: true, message: '请输入学习时长', trigger: 'blur' }
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

  /** 加载可选课程列表 */
  async function loadCourseOptions() {
    try {
      const res = await getCoursePage({
        queryParam: {},
        pageParam: { pageNum: 1, pageSize: 1000 }
      })
      courseOptions.value = (res.data?.records || []).map(c => ({ id: c.id, name: c.name }))
    } catch {
      courseOptions.value = []
    }
  }

  async function handleOpen() {
    await loadCourseOptions()
    if (props.studyCardId) {
      isEdit.value = true
      const res = await getStudyCardDetail(props.studyCardId)
      const data = res.data
      Object.assign(formData, {
        title: data.title || '',
        faceValue: data.amount ?? null,
        couponDeduction: data.couponDeductible ?? null,
        quantity: data.quantity ?? null,
        status: data.status ?? 1,
        validityStart: data.validStartDate || null,
        validityEnd: data.validEndDate || null,
        studyDuration: data.studyDuration ?? null,
        studyDurationUnit: data.studyDurationUnit === '月' ? 'month' : data.studyDurationUnit === '天' ? 'day' : 'month',
        description: data.description || '',
        studyCodeLength: data.cardCodeLength ?? 8,
        secretKeyLength: data.secretCodeLength ?? 6
      })
      selectedCourseIds.value = data.courseIds || []
    } else {
      isEdit.value = false
    }
  }

  function resetForm() {
    Object.assign(formData, {
      title: '',
      faceValue: null,
      couponDeduction: null,
      quantity: null,
      status: 1,
      validityStart: null,
      validityEnd: null,
      studyDuration: null,
      studyDurationUnit: 'month',
      description: '',
      studyCodeLength: 8,
      secretKeyLength: 6
    })
    selectedCourseIds.value = []
    isEdit.value = false
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
        title: formData.title,
        amount: formData.faceValue,
        couponDeductible: formData.couponDeduction || 0,
        quantity: formData.quantity,
        status: formData.status,
        validStartDate: formData.validityStart,
        validEndDate: formData.validityEnd,
        studyDuration: formData.studyDuration,
        studyDurationUnit: formData.studyDurationUnit === 'month' ? '月' : '天',
        description: formData.description || '',
        cardCodeLength: formData.studyCodeLength,
        secretCodeLength: formData.secretKeyLength,
        courseIds: selectedCourseIds.value
      }

      if (isEdit.value) {
        payload.id = props.studyCardId
        await updateStudyCard(payload)
        ElMessage.success('保存成功')
      } else {
        await createStudyCard(payload)
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
    courseOptions,
    selectedCourseIds,
    handleOpen,
    handleSubmit
  }
}
