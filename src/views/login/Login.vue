<template>
  <div class="login-container">
    <div class="login-bg">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>
    <div class="login-card">
      <div class="login-header">
        <h2 class="login-title">微厦学习系统</h2>
        <p class="login-subtitle">在线学习考试平台</p>
      </div>
      <el-form ref="formRef" :model="loginForm" :rules="rules" size="large">
        <el-form-item prop="account">
          <el-input v-model="loginForm.account" placeholder="请输入账号">
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password @keyup.enter="handleLogin">
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="captchaCode">
          <el-row :gutter="12" style="width:100%">
            <el-col :span="14">
              <el-input v-model="loginForm.captchaCode" placeholder="验证码">
                <template #prefix>
                  <el-icon><Key /></el-icon>
                </template>
              </el-input>
            </el-col>
            <el-col :span="10">
              <img :src="captchaImage" class="captcha-img" @click="refreshCaptcha" alt="验证码" />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" style="width:100%" size="large" round @click="handleLogin">
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
      </el-form>
      <div class="login-footer">
        <span>&copy; 2026 微厦学习系统</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)
const captchaImage = ref('')

const loginForm = reactive({
  account: '',
  password: '',
  captchaKey: '',
  captchaCode: ''
})

const rules = {
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  captchaCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

async function refreshCaptcha() {
  try {
    const res = await request.get('/auth/captcha')
    captchaImage.value = res.data.image
    loginForm.captchaKey = res.data.key
  } catch {
    // ignore
  }
}

async function handleLogin() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    await userStore.login(loginForm)
    await userStore.getUserInfo()
    ElMessage.success('登录成功')
    router.push('/')
  } catch {
    refreshCaptcha()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refreshCaptcha()
})
</script>

<style scoped>
.login-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #0c3483 0%, #1a6b3c 50%, #0c3483 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.login-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  animation: orbFloat 20s ease-in-out infinite;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: #00b894;
  top: -10%;
  left: -10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: #0984e3;
  bottom: -15%;
  right: -10%;
  animation-delay: -7s;
}

.orb-3 {
  width: 300px;
  height: 300px;
  background: #00cec9;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -14s;
}

@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

.login-card {
  position: relative;
  width: 420px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #0c3483, #1a6b3c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-subtitle {
  margin: 8px 0 0;
  color: #909399;
  font-size: 14px;
}

.login-footer {
  text-align: center;
  margin-top: 16px;
  color: #c0c4cc;
  font-size: 12px;
}

.captcha-img {
  width: 100%;
  height: 40px;
  cursor: pointer;
  border-radius: 4px;
}
</style>
