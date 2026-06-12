import { ref, reactive, watch } from 'vue'
import smCrypto from 'sm-crypto'
import { getRoleOptions } from '@/api/system/role'
import { createUser, updateUser, getUserDetail } from '@/api/system/user'
import { ElMessage } from 'element-plus'

/**
 * 用户表单对话框逻辑
 *
 * @param {object} props 组件 props
 * @param {Function} emit 组件 emit
 * @returns {object} 表单对话框响应式状态和方法
 */
export function useUserFormDialog(props, emit) {
  const visible = ref(false)
  const isEdit = ref(false)
  const submitting = ref(false)
  const formRef = ref(null)
  const roleOptions = ref([])

  const formData = reactive({
    account: '',
    password: '',
    nickName: '',
    phone: '',
    email: '',
    status: 1,
    roleIds: []
  })

  /** 密码强度校验：大写、小写、数字、特殊字符至少满足三种 */
  function validatePasswordStrength(rule, value, callback) {
    if (!value) {
      callback(new Error('请输入密码'))
      return
    }
    let count = 0
    if (/[a-z]/.test(value)) count++
    if (/[A-Z]/.test(value)) count++
    if (/\d/.test(value)) count++
    if (/[^a-zA-Z0-9]/.test(value)) count++
    if (count >= 3) {
      callback()
    } else {
      callback(new Error('密码必须包含大写字母、小写字母、数字、特殊字符中至少三种'))
    }
  }

  const rules = {
    account: [
      { required: true, message: '请输入账号', trigger: 'blur' },
      { pattern: /^[a-zA-Z0-9_]+$/, message: '账号只能包含字母、数字和下划线', trigger: 'blur' },
      { max: 50, message: '账号长度不能超过50个字符', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, max: 100, message: '密码长度6-100个字符', trigger: 'blur' },
      { validator: validatePasswordStrength, trigger: 'blur' }
    ],
    nickName: [
      { required: true, message: '请输入昵称', trigger: 'blur' }
    ],
    phone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
    ],
    email: [
      { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
    ],
    roleIds: [
      { required: true, message: '请选择角色', trigger: 'change' }
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
    await loadRoleOptions()
    if (props.userId) {
      isEdit.value = true
      const res = await getUserDetail(props.userId)
      const data = res.data
      formData.account = data.account
      formData.nickName = data.nickName || ''
      formData.phone = data.phone || ''
      formData.email = data.email || ''
      formData.status = data.status
      formData.roleIds = data.roleIds || []
      formData.password = ''
    } else {
      isEdit.value = false
    }
  }

  async function loadRoleOptions() {
    try {
      const res = await getRoleOptions()
      roleOptions.value = res.data || []
    } catch {
      roleOptions.value = []
    }
  }

  function resetForm() {
    formData.account = ''
    formData.password = ''
    formData.nickName = ''
    formData.phone = ''
    formData.email = ''
    formData.status = 1
    formData.roleIds = []
    isEdit.value = false
    if (formRef.value) {
      formRef.value.resetFields()
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
      if (isEdit.value) {
        await updateUser({
          id: props.userId,
          nickName: formData.nickName,
          phone: formData.phone,
          email: formData.email,
          status: formData.status,
          roleIds: formData.roleIds
        })
        ElMessage.success('编辑成功')
      } else {
        const encryptedPassword = smCrypto.sm3(formData.password)
        await createUser({
          account: formData.account,
          password: encryptedPassword,
          nickName: formData.nickName,
          phone: formData.phone,
          email: formData.email,
          status: formData.status,
          roleIds: formData.roleIds
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
    formRef,
    roleOptions,
    formData,
    rules,
    handleOpen,
    handleSubmit
  }
}
