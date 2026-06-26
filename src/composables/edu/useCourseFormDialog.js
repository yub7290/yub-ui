import { ref, reactive, watch } from 'vue'
import { createCourse, updateCourse, getCourseDetail } from '@/api/edu/course'
import { getMajorTree } from '@/api/edu/major'
import { getTeacherOptions } from '@/api/edu/teacher'
import { uploadImage } from '@/api/edu/upload'
import { getDictOptions } from '@/api/system/dictData'
import { ElMessage } from 'element-plus'

/**
 * 课程表单对话框逻辑
 *
 * @param {object} props 组件 props
 * @param {Function} emit 组件 emit
 * @returns {object} 表单对话框响应式状态和方法
 */
export function useCourseFormDialog(props, emit) {
  const visible = ref(false)
  const isEdit = ref(false)
  const submitting = ref(false)
  const uploading = ref(false)
  const formRef = ref(null)

  const majorOptions = ref([])
  const courseTypeOptions = ref([
    { value: 0, label: '学练考' },
    { value: 1, label: '试题库' }
  ])
  const teacherOptions = ref([])
  const activeTab = ref('basic')

  // 两段式创建：先填名称/图片/专业 → 创建成功后转为完整编辑
  const isCreateMode = ref(true)
  const currentCourseId = ref(null)

  const formData = reactive({
    name: '',
    imageUrl: '',
    majorId: null,
    courseType: 0,
    status: 1,
    recommended: 0,
    sort: 0,
    learningObjectives: '',
    introduction: '',
    monthsRequired: null,
    totalPrice: null,
    isFree: 0,
    isFreeLimited: 0,
    freeStartTime: null,
    freeEndTime: null,
    allowTrial: 0,
    teacher: ''
  })

  const rules = {
    name: [
      { required: true, message: '请输入课程名称', trigger: 'blur' },
      { max: 200, message: '课程名称长度不能超过200个字符', trigger: 'blur' }
    ]
  }

  watch(() => props.modelValue, (val) => {
    visible.value = val
  })

  watch(visible, (val) => {
    emit('update:modelValue', val)
    if (val) {
      // 立即设置模式，避免编辑时闪烁"新增"
      isCreateMode.value = !props.courseId
      isEdit.value = !!props.courseId
    }
    if (!val) {
      resetForm()
    }
  })

  async function loadMajorOptions() {
    try {
      const res = await getMajorTree({})
      majorOptions.value = flattenTree(res.data || [])
    } catch {
      majorOptions.value = []
    }
  }

  async function loadCourseTypeOptions() {
    try {
      const res = await getDictOptions('edu_course_type')
      const data = res.data || []
      if (data.length > 0) {
        // dict API 可能返回字符串 value，统一转为数字
        courseTypeOptions.value = data.map(d => ({ value: Number(d.value), label: d.label }))
      }
    } catch {
      // 使用初始化的 fallback 值
    }
  }

  async function loadTeacherOptions() {
    try {
      const res = await getTeacherOptions()
      teacherOptions.value = res.data || []
    } catch {
      teacherOptions.value = []
    }
  }

  function flattenTree(tree) {
    const result = []
    function walk(list, level) {
      for (const item of list) {
        result.push({ ...item, _level: level })
        if (item.children && item.children.length) {
          walk(item.children, level + 1)
        }
      }
    }
    walk(tree, 0)
    return result
  }

  function formatMajorName(row) {
    if (!row) return ''
    const prefix = '　'.repeat(row._level || 0)
    return prefix + row.name
  }

  async function handleOpen() {
    await loadMajorOptions()
    await loadTeacherOptions()
    if (props.courseId) {
      // 编辑模式：加载完整数据，显示所有标签页
      isCreateMode.value = false
      isEdit.value = true
      currentCourseId.value = props.courseId
      await loadCourseTypeOptions()
      const res = await getCourseDetail(props.courseId)
      const data = res.data
      Object.assign(formData, {
        name: data.name || '',
        imageUrl: data.imageUrl || '',
        majorId: data.majorId || null,
        courseType: data.courseType ?? 0,
        status: data.status ?? 1,
        recommended: data.recommended ?? 0,
        sort: data.sort ?? 0,
        learningObjectives: data.learningObjectives || '',
        introduction: data.introduction || '',
        monthsRequired: data.monthsRequired || null,
        totalPrice: data.totalPrice || null,
        isFree: data.isFree ?? 0,
        isFreeLimited: data.isFreeLimited ?? 0,
        freeStartTime: data.freeStartTime || null,
        freeEndTime: data.freeEndTime || null,
        allowTrial: data.allowTrial ?? 0,
        teacher: data.teacher || ''
      })
    } else {
      // 新建模式：只显示名称/图片/专业
      isCreateMode.value = true
      isEdit.value = false
      currentCourseId.value = null
    }
  }

  function resetForm() {
    Object.assign(formData, {
      name: '', imageUrl: '', majorId: null,
      courseType: 0, status: 1, recommended: 0, sort: 0,
      learningObjectives: '', introduction: '',
      monthsRequired: null, totalPrice: null,
      isFree: 0, isFreeLimited: 0, freeStartTime: null, freeEndTime: null, allowTrial: 0,
      teacher: ''
    })
    isEdit.value = false
    isCreateMode.value = true
    currentCourseId.value = null
    activeTab.value = 'basic'
  }

  async function handleImageUpload(file) {
    uploading.value = true
    try {
      const res = await uploadImage(file, 'edu/course')
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
      if (isCreateMode.value) {
        // 新增模式：只保存名称/图片/专业，其余用默认值
        const payload = {
          name: formData.name,
          imageUrl: formData.imageUrl || null,
          majorId: formData.majorId,
          courseType: formData.courseType,
          status: formData.status,
          recommended: formData.recommended,
          sort: formData.sort
        }
        const res = await createCourse(payload)
        const newId = res.data

        // 创建成功后，切换到编辑模式，加载完整数据
        await Promise.all([
          loadCourseTypeOptions(),
          loadTeacherOptions()
        ])
        const detailRes = await getCourseDetail(newId)
        const data = detailRes.data
        Object.assign(formData, {
          name: data.name || '',
          imageUrl: data.imageUrl || '',
          majorId: data.majorId || null,
          courseType: data.courseType ?? 0,
          status: data.status ?? 1,
          recommended: data.recommended ?? 0,
          sort: data.sort ?? 0,
          learningObjectives: data.learningObjectives || '',
          introduction: data.introduction || '',
          monthsRequired: data.monthsRequired || null,
          totalPrice: data.totalPrice || null,
          isFree: data.isFree ?? 0,
          isFreeLimited: data.isFreeLimited ?? 0,
          freeStartTime: data.freeStartTime || null,
          freeEndTime: data.freeEndTime || null,
          allowTrial: data.allowTrial ?? 0,
          teacher: data.teacher || ''
        })
        isCreateMode.value = false
        isEdit.value = true
        currentCourseId.value = newId
        activeTab.value = 'basic'
        ElMessage.success('新增成功，请继续完善课程信息')
      } else {
        // 编辑模式：全字段更新
        const payload = {
          id: currentCourseId.value || props.courseId,
          name: formData.name,
          imageUrl: formData.imageUrl || null,
          majorId: formData.majorId,
          courseType: formData.courseType,
          status: formData.status,
          recommended: formData.recommended,
          sort: formData.sort,
          learningObjectives: formData.learningObjectives || null,
          introduction: formData.introduction || null,
          monthsRequired: formData.monthsRequired,
          totalPrice: formData.totalPrice,
          isFree: formData.isFree,
          isFreeLimited: formData.isFreeLimited,
          freeStartTime: formData.freeStartTime,
          freeEndTime: formData.freeEndTime,
          allowTrial: formData.allowTrial,
          teacher: formData.teacher || null
        }
        await updateCourse(payload)
        ElMessage.success('保存成功')
        visible.value = false
        emit('success')
      }
    } catch {
      // 错误已由 request.js 拦截器处理
    } finally {
      submitting.value = false
    }
  }

  return {
    visible,
    isCreateMode,
    currentCourseId,
    submitting,
    uploading,
    formRef,
    formData,
    rules,
    majorOptions,
    courseTypeOptions,
    teacherOptions,
    activeTab,
    handleOpen,
    handleSubmit,
    handleImageUpload,
    formatMajorName
  }
}
