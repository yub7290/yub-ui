import { ref, reactive, watch } from 'vue'
import { createTeacher, updateTeacher, getTeacherDetail } from '@/api/edu/teacher'
import { getTeacherTitleOptions } from '@/api/edu/teacherTitle'
import { getDictOptions } from '@/api/system/dictData'
import { uploadImage } from '@/api/edu/upload'
import { ElMessage } from 'element-plus'
import { pinyin } from 'pinyin-pro'

/**
 * 教师表单对话框逻辑
 *
 * 四个标签页：基本信息、联系方式、详细信息、个人介绍
 *
 * @param {object} props 组件 props
 * @param {Function} emit 组件 emit
 * @returns {object} 表单对话框响应式状态和方法
 */
export function useTeacherFormDialog(props, emit) {
  const visible = ref(false)
  const isEdit = ref(false)
  const submitting = ref(false)
  const formRef = ref(null)
  const activeTab = ref('basic')
  const avatarUrl = ref('')

  // 下拉选项数据
  const titleOptions = ref([])
  const genderOptions = ref([])
  const educationOptions = ref([])
  const nationalityOptions = ref([])
  const nativePlaceOptions = ref([])

  const formData = reactive({
    avatarUrl: '',
    account: '',
    name: '',
    titleId: null,
    pinyinAbbr: '',
    gender: null,
    phone: '',
    idCard: '',
    status: 1,
    rating: 5,
    fixedPhone: '',
    email: '',
    qq: '',
    wechat: '',
    address: '',
    mailingAddress: '',
    zipCode: '',
    emergencyContact: '',
    emergencyPhone: '',
    birthDate: null,
    education: '',
    major: '',
    nativePlace: '',
    workUnit: '',
    nationality: '',
    signature: '',
    bio: ''
  })

  const rules = {
    account: [
      { required: true, message: '请输入账号', trigger: 'blur' },
      { pattern: /^[a-zA-Z0-9_]+$/, message: '账号只能包含字母、数字和下划线', trigger: 'blur' },
      { max: 50, message: '账号长度不能超过50个字符', trigger: 'blur' }
    ],
    name: [
      { required: true, message: '请输入姓名', trigger: 'blur' }
    ],
    titleId: [
      { required: true, message: '请选择职称', trigger: 'change' }
    ],
    gender: [
      { required: true, message: '请选择性别', trigger: 'change' }
    ],
    phone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
    ],
    idCard: [
      { min: 18, max: 18, message: '身份证号长度为18位', trigger: 'blur' }
    ],
    email: [
      { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
    ]
  }

  watch(() => props.modelValue, (val) => { visible.value = val })
  watch(visible, (val) => {
    emit('update:modelValue', val)
    if (!val) resetForm()
  })

  async function loadOptions() {
    try {
      const [titleRes, genderRes, eduRes, natRes, placeRes] = await Promise.all([
        getTeacherTitleOptions(),
        getDictOptions('gender'),
        getDictOptions('education'),
        getDictOptions('nationality'),
        getDictOptions('native_place')
      ])
      titleOptions.value = titleRes.data || []
      genderOptions.value = genderRes.data || []
      educationOptions.value = eduRes.data || []
      nationalityOptions.value = natRes.data || []
      nativePlaceOptions.value = placeRes.data || []
    } catch {
      // 错误已处理
    }
  }

  /** 自动生成拼音缩写 */
  function generatePinyinAbbr(name) {
    if (!name) return ''
    try {
      return pinyin(name, { pattern: 'first', toneType: 'none', type: 'string' }).toUpperCase()
    } catch {
      return ''
    }
  }

  /** 监听姓名变化自动填充拼音缩写（仅新建模式且用户未手动修改时） */
  watch(() => formData.name, (newName) => {
    if (!isEdit.value && !formData.pinyinAbbr) {
      formData.pinyinAbbr = generatePinyinAbbr(newName)
    }
  })

  async function handleOpen() {
    activeTab.value = 'basic'
    avatarUrl.value = ''
    await loadOptions()
    if (props.teacherId) {
      isEdit.value = true
      const res = await getTeacherDetail(props.teacherId)
      const data = res.data
      Object.assign(formData, {
        avatarUrl: data.avatarUrl || '',
        account: data.account,
        name: data.name || '',
        titleId: data.titleId ?? null,
        pinyinAbbr: data.pinyinAbbr || '',
        gender: data.gender ?? null,
        phone: data.phone || '',
        idCard: data.idCard || '',
        status: data.status,
        rating: data.rating ?? 5,
        fixedPhone: data.fixedPhone || '',
        email: data.email || '',
        qq: data.qq || '',
        wechat: data.wechat || '',
        address: data.address || '',
        mailingAddress: data.mailingAddress || '',
        zipCode: data.zipCode || '',
        emergencyContact: data.emergencyContact || '',
        emergencyPhone: data.emergencyPhone || '',
        birthDate: data.birthDate || null,
        education: data.education || '',
        major: data.major || '',
        nativePlace: data.nativePlace || '',
        workUnit: data.workUnit || '',
        nationality: data.nationality || '',
        signature: data.signature || '',
        bio: data.bio || ''
      })
      avatarUrl.value = data.avatarUrl || ''
    } else {
      isEdit.value = false
      resetForm()
    }
  }

  /** 头像上传（含前置校验） */
  async function handleAvatarUpload(event) {
    const file = event.target?.files?.[0]
    if (!file) return
    // 前置校验：大小 ≤5MB
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      ElMessage.error('文件大小不能超过 5MB')
      event.target.value = ''
      return
    }
    // 前置校验：仅允许 JPG/JPEG/PNG/GIF
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      ElMessage.error('仅支持 JPG/JPEG/PNG/GIF 格式的图片')
      event.target.value = ''
      return
    }
    try {
      const res = await uploadImage(file, 'edu/avatars')
      avatarUrl.value = res.data
      formData.avatarUrl = res.data
      ElMessage.success('头像上传成功')
    } catch {
      ElMessage.error('头像上传失败')
    } finally {
      // 清空 input，允许重复选择同一文件
      event.target.value = ''
    }
  }

  function resetForm() {
    Object.keys(formData).forEach(key => {
      if (key === 'status') formData[key] = 1
      else if (key === 'rating') formData[key] = 5
      else if (key === 'titleId' || key === 'gender') formData[key] = null
      else if (key === 'birthDate') formData[key] = null
      else formData[key] = ''
    })
    avatarUrl.value = ''
    isEdit.value = false
    if (formRef.value) formRef.value.resetFields()
  }

  async function handleSubmit() {
    if (!formRef.value) return
    try { await formRef.value.validate() } catch { return }
    submitting.value = true
    try {
      const payload = { ...formData }
      if (isEdit.value) {
        payload.id = props.teacherId
        await updateTeacher(payload)
        ElMessage.success('编辑成功')
      } else {
        // 新建时不传密码，后端自动分配默认密码
        // 默认密码为 123456
        delete payload.password
        await createTeacher(payload)
        ElMessage.success('新增成功')
      }
      visible.value = false
      emit('success')
    } catch { /* 错误已由 request.js 拦截器处理 */ } finally { submitting.value = false }
  }

  return {
    visible, isEdit, submitting, formRef, activeTab, avatarUrl,
    titleOptions, genderOptions, educationOptions, nationalityOptions, nativePlaceOptions,
    formData, rules,
    handleOpen, handleSubmit, handleAvatarUpload, generatePinyinAbbr
  }
}
