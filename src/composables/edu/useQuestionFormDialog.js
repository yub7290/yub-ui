import { ref, reactive, watch } from 'vue'
import { createQuestion, updateQuestion, getQuestionDetail } from '@/api/edu/question'
import { getMajorTree } from '@/api/edu/major'
import { getDictOptions } from '@/api/system/dictData'
import { ElMessage } from 'element-plus'

const labelLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

export function useQuestionFormDialog(props, emit) {
  const visible = ref(false)
  const isEdit = ref(false)
  const submitting = ref(false)
  const formRef = ref(null)
  const activeTab = ref('question')

  const questionTypeOptions = ref([])
  const majorOptions = ref([])

  const formData = reactive({
    questionType: 0,
    content: '',
    difficulty: 3,
    status: 1,
    majorId: null,
    courseId: null,
    chapterId: null,
    analysis: '',
    knowledgePoints: '',
    answer: '',
    options: []
  })

  const rules = {
    questionType: [{ required: true, message: '请选择试题类型', trigger: 'change' }],
    content: [{ required: true, message: '请输入题干', trigger: 'blur' }],
    difficulty: [{ required: true, message: '请选择难度', trigger: 'change' }]
  }

  watch(() => props.modelValue, (val) => { visible.value = val })
  watch(visible, (val) => {
    emit('update:modelValue', val)
    if (!val) resetForm()
  })

  async function loadOptions() {
    try {
      const [typeRes, majorRes] = await Promise.all([
        getDictOptions('edu_question_type'),
        getMajorTree({})
      ])
      questionTypeOptions.value = typeRes.data || []
      majorOptions.value = flattenTree(majorRes.data || [])
    } catch {
      questionTypeOptions.value = []
      majorOptions.value = []
    }
  }

  function flattenTree(tree) {
    const result = []
    function walk(list, level) {
      for (const item of list) {
        result.push({ ...item, _level: level })
        if (item.children && item.children.length) walk(item.children, level + 1)
      }
    }
    walk(tree, 0)
    return result
  }

  function formatMajorName(row) {
    if (!row) return ''
    return '　'.repeat(row._level || 0) + row.name
  }

  async function handleOpen() {
    await loadOptions()
    if (props.questionId) {
      isEdit.value = true
      const res = await getQuestionDetail(props.questionId)
      const data = res.data
      formData.questionType = data.questionType ?? 0
      formData.content = data.content || ''
      formData.difficulty = data.difficulty ?? 3
      formData.status = data.status ?? 1
      formData.majorId = data.majorId || null
      formData.courseId = data.courseId || null
      formData.chapterId = data.chapterId || null
      formData.analysis = data.analysis || ''
      formData.knowledgePoints = data.knowledgePoints || ''
      formData.answer = data.answer || ''
      formData.options = (data.options || []).map(o => ({
        label: o.label,
        content: o.content,
        isCorrect: o.isCorrect || 0
      }))
      // 确保选项至少有一个
      if ((data.questionType === 0 || data.questionType === 1) && formData.options.length === 0) {
        initOptions()
      }
    } else {
      isEdit.value = false
      // 从父组件传入默认值（QuestionTab 在课程上下文中用）
      if (props.defaultCourseId) formData.courseId = props.defaultCourseId
      if (props.defaultMajorId) formData.majorId = props.defaultMajorId
      initOptions()
    }
  }

  function initOptions() {
    if (formData.questionType === 0 || formData.questionType === 1) {
      formData.options = [
        { label: 'A', content: '', isCorrect: 0 },
        { label: 'B', content: '', isCorrect: 0 },
        { label: 'C', content: '', isCorrect: 0 },
        { label: 'D', content: '', isCorrect: 0 }
      ]
    } else if (formData.questionType === 4) {
      formData.options = [{ label: '', content: '', isCorrect: 1 }]
    } else {
      formData.options = []
    }
  }

  function addOption() {
    if (formData.questionType === 0 || formData.questionType === 1) {
      const label = labelLetters[formData.options.length] || String.fromCharCode(65 + formData.options.length)
      formData.options.push({ label, content: '', isCorrect: 0 })
    } else if (formData.questionType === 4) {
      formData.options.push({ label: '', content: '', isCorrect: 1 })
    }
  }

  function removeOption(index) {
    if (formData.options.length <= 1) {
      ElMessage.warning('至少保留一个选项')
      return
    }
    formData.options.splice(index, 1)
    // 重新编号 单选/多选
    if (formData.questionType === 0 || formData.questionType === 1) {
      formData.options.forEach((o, i) => { o.label = labelLetters[i] || String.fromCharCode(65 + i) })
    }
  }

  function setCorrectAnswer(label) {
    // 单选：只有一个正确答案
    if (formData.questionType === 0) {
      formData.options.forEach(o => { o.isCorrect = o.label === label ? 1 : 0 })
    }
    // 多选：切换
    else if (formData.questionType === 1) {
      const opt = formData.options.find(o => o.label === label)
      if (opt) opt.isCorrect = opt.isCorrect ? 0 : 1
    }
  }

  function resetForm() {
    formData.questionType = 0
    formData.content = ''
    formData.difficulty = 3
    formData.status = 1
    formData.majorId = null
    formData.courseId = null
    formData.chapterId = null
    formData.analysis = ''
    formData.knowledgePoints = ''
    formData.answer = ''
    formData.options = []
    isEdit.value = false
    activeTab.value = 'question'
    if (formRef.value) formRef.value.resetFields()
  }

  async function handleSubmit() {
    if (!formRef.value) return
    try { await formRef.value.validate() } catch { return }

    submitting.value = true
    try {
      const payload = {
        questionType: formData.questionType,
        content: formData.content,
        difficulty: formData.difficulty,
        status: formData.status,
        majorId: formData.majorId || null,
        courseId: formData.courseId || null,
        chapterId: formData.chapterId || null,
        analysis: formData.analysis || null,
        knowledgePoints: formData.knowledgePoints || null,
        answer: formData.answer || null,
        options: formData.options.length > 0 ? formData.options : null
      }

      if (isEdit.value) {
        payload.id = props.questionId
        await updateQuestion(payload)
        ElMessage.success('编辑成功')
      } else {
        await createQuestion(payload)
        ElMessage.success('新增成功')
      }
      visible.value = false
      emit('success')
    } catch {
      // 错误已处理
    } finally {
      submitting.value = false
    }
  }

  return {
    visible, isEdit, submitting, formRef, formData, rules,
    questionTypeOptions, majorOptions, activeTab,
    handleOpen, handleSubmit, formatMajorName,
    addOption, removeOption, setCorrectAnswer, initOptions
  }
}
