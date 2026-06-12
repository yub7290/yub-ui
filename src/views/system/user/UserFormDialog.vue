<template>
  <el-dialog
    :title="isEdit ? '编辑用户' : '新增用户'"
    v-model="visible"
    width="520px"
    :close-on-click-modal="false"
    @open="handleOpen"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <el-form-item label="账号" prop="account">
        <el-input v-model="formData.account" :disabled="isEdit" placeholder="请输入账号" maxlength="50" />
      </el-form-item>
      <el-form-item v-if="!isEdit" label="密码" prop="password">
        <el-input v-model="formData.password" type="password" show-password placeholder="请输入密码" maxlength="100" />
      </el-form-item>
      <el-form-item label="昵称" prop="nickName">
        <el-input v-model="formData.nickName" placeholder="请输入昵称" maxlength="50" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入手机号" maxlength="20" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" placeholder="请输入邮箱" maxlength="100" />
      </el-form-item>
      <el-form-item label="角色" prop="roleIds">
        <el-select v-model="formData.roleIds" multiple placeholder="请选择角色" style="width: 100%">
          <el-option
            v-for="role in roleOptions"
            :key="role.id"
            :label="role.name"
            :value="role.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-switch
          v-model="formData.status"
          :active-value="1"
          :inactive-value="0"
          active-text="启用"
          inactive-text="停用"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import smCrypto from 'sm-crypto'
import { getRoleOptions } from '@/api/system/role'
import { createUser, updateUser, getUserDetail } from '@/api/system/user'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  userId: { type: Number, default: null }
})
const emit = defineEmits(['update:modelValue', 'success'])

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
</script>
