import { ref, reactive, watch } from 'vue'
import { createStudent, updateStudent, getStudentDetail } from '@/api/edu/student'
import { getDictOptions } from '@/api/system/dictData'
import { uploadImage } from '@/api/edu/upload'
import { ElMessage } from 'element-plus'
import { pinyin } from 'pinyin-pro'

/**
 * 学员表单对话框逻辑
 *
 * 四个标签页：基本信息、联系方式、更多信息、个人介绍
 *
 * @param {object} props 组件 props
 * @param {Function} emit 组件 emit
 * @returns {object} 表单对话框响应式状态和方法
 */
export function useStudentFormDialog(props, emit) {
  const visible = ref(false)
  const isEdit = ref(false)
  const submitting = ref(false)
  const formRef = ref(null)
  const activeTab = ref('basic')
  const avatarUrl = ref('')
  const computedAge = ref(null)

  // 下拉选项数据
  const genderOptions = ref([])
  const educationOptions = ref([])
  const nationalityOptions = ref([])
  const nativePlaceOptions = ref([])

  const formData = reactive({
    avatarUrl: '',
    account: '',
    name: '',
    pinyinAbbr: '',
    studentNo: '',
    groupId: null,
    gender: 0,
    idCard: '',
    phone: '',
    phonePublic: 1,
    fixedPhone: '',
    fixedPhonePublic: 1,
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
    school: '',
    nationality: '',
    signature: '',
    bio: '',
    status: 1
  })

  const rules = {
    account: [
      { required: true, message: '请输入账号', trigger: 'blur' },
      { pattern: /^[a-zA-Z0-9_]+$/, message: '账号只能包含字母、数字和下划线', trigger: 'blur' },
      { max: 50, message: '账号长度不能超过50个字符', trigger: 'blur' }
    ],
    name: [
      { max: 50, message: '姓名长度不能超过50个字符', trigger: 'blur' }
    ],
    gender: [
      { required: true, message: '请选择性别', trigger: 'change' }
    ],
    phone: [
      { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
    ],
    emergencyPhone: [
      { pattern: /^1[3-9]\d{9}$/, message: '紧急电话格式不正确', trigger: 'blur' }
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

  // 监听出生年月变化自动计算年龄
  watch(() => formData.birthDate, (newDate) => {
    if (newDate) {
      const birth = new Date(newDate)
      const now = new Date()
      let age = now.getFullYear() - birth.getFullYear()
      const monthDiff = now.getMonth() - birth.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
        age--
      }
      computedAge.value = age
    } else {
      computedAge.value = null
    }
  })

  async function loadOptions() {
    try {
      const [genderRes, eduRes, natRes, placeRes] = await Promise.all([
        getDictOptions('gender'),
        getDictOptions('education'),
        getDictOptions('nationality'),
        getDictOptions('native_place')
      ])
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
    computedAge.value = null
    await loadOptions()
    if (props.studentId) {
      isEdit.value = true
      const res = await getStudentDetail(props.studentId)
      const data = res.data
      Object.assign(formData, {
        avatarUrl: data.avatarUrl || '',
        account: data.account || '',
        name: data.name || '',
        pinyinAbbr: data.pinyinAbbr || '',
        studentNo: data.studentNo || '',
        groupId: data.groupId ?? null,
        gender: data.gender ?? 0,
        idCard: data.idCard || '',
        phone: data.phone || '',
        phonePublic: data.phonePublic ?? 1,
        fixedPhone: data.fixedPhone || '',
        fixedPhonePublic: data.fixedPhonePublic ?? 1,
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
        school: data.school || '',
        nationality: data.nationality || '',
        signature: data.signature || '',
        bio: data.bio || '',
        status: data.status
      })
      avatarUrl.value = data.avatarUrl || ''
      // 计算年龄
      if (data.birthDate) {
        const birth = new Date(data.birthDate)
        const now = new Date()
        let age = now.getFullYear() - birth.getFullYear()
        const monthDiff = now.getMonth() - birth.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
          age--
        }
        computedAge.value = age
      }
    } else {
      isEdit.value = false
      resetForm()
    }
  }

  /** 头像上传 */
  async function handleAvatarUpload(event) {
    const file = event.target?.files?.[0]
    if (!file) return
    try {
      const res = await uploadImage(file, 'edu/avatars')
      avatarUrl.value = res.data
      formData.avatarUrl = res.data
      ElMessage.success('头像上传成功')
    } catch {
      ElMessage.error('头像上传失败')
    }
  }

  function resetForm() {
    Object.keys(formData).forEach(key => {
      if (key === 'status') formData[key] = 1
      else if (key === 'gender') formData[key] = 0
      else if (key === 'phonePublic' || key === 'fixedPhonePublic') formData[key] = 1
      else if (key === 'groupId') formData[key] = null
      else if (key === 'birthDate') formData[key] = null
      else formData[key] = ''
    })
    avatarUrl.value = ''
    computedAge.value = null
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
        payload.id = props.studentId
        await updateStudent(payload)
        ElMessage.success('编辑成功')
      } else {
        // 新建时使用默认密码（SM3(admin123) 的哈希值）
        payload.password = '667c756cf9334e328a56e44e906245c8e214c655a160f18fdb84d79c209c49cf'
        await createStudent(payload)
        ElMessage.success('新增成功')
      }
      visible.value = false
      emit('success')
    } catch { /* 错误已由 request.js 拦截器处理 */ } finally { submitting.value = false }
  }

  return {
    visible, isEdit, submitting, formRef, activeTab, avatarUrl, computedAge,
    genderOptions, educationOptions, nationalityOptions, nativePlaceOptions,
    formData, rules,
    handleOpen, handleSubmit, handleAvatarUpload, generatePinyinAbbr
  }
}
