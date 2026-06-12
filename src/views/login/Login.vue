<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-brand">
        <div class="brand-content">
          <div class="brand-logo-wrap">
            <img src="../../static/logo1.png" alt="智慧教育" class="brand-logo" />
            <span class="brand-name">智慧教育系统</span>
          </div>
          <div class="brand-slogan">
            <p class="slogan-text">智慧育人，启迪未来</p>
          </div>
        </div>
      </div>

      <div class="login-form-wrapper">
        <h2 class="form-title">账户登录</h2>

        <el-form
          ref="formRef"
          :model="loginForm"
          :rules="rules"
          size="large"
          class="login-form"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="account">
            <el-input
              v-model="loginForm.account"
              placeholder="请输入账号"
              :prefix-icon="User"
              autofocus
              clearable
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
              clearable
            />
          </el-form-item>

          <el-form-item prop="captchaCode">
            <div class="captcha-wrapper">
              <el-input
                v-model="loginForm.captchaCode"
                placeholder="验证码"
                :prefix-icon="Key"
                class="captcha-input"
                clearable
              />
              <img
                :src="captchaImage"
                class="captcha-img"
                @click="refreshCaptcha"
                alt="验证码"
                title="点击刷新验证码"
              />
            </div>
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              :loading="loading"
              class="login-btn"
              size="large"
              @click="handleLogin"
            >
              <span v-if="!loading">登 录</span>
            </el-button>
          </el-form-item>
        </el-form>

        <div class="form-footer">
          <span>© {{ currentYear }} 智慧教育系统</span>
          <span class="footer-divider">|</span>
          <span>技术支持团队</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { User, Lock, Key } from '@element-plus/icons-vue'
import smCrypto from 'sm-crypto'
import request from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)
const captchaImage = ref('')
const rememberMe = ref(localStorage.getItem('rememberAccount') === 'true')

const currentYear = computed(() => new Date().getFullYear())

const loginForm = reactive({
  account: localStorage.getItem('savedAccount') || '',
  password: '',
  captchaKey: '',
  captchaCode: ''
})

const rules = {
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  captchaCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
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
  if (loading.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    // SM3 加密密码后发送
    const encryptedPassword = smCrypto.sm3(loginForm.password)
    await userStore.login({ ...loginForm, password: encryptedPassword })
    await userStore.getUserInfo()
    ElMessage.success('登录成功')

    if (rememberMe.value) {
      localStorage.setItem('savedAccount', loginForm.account)
      localStorage.setItem('rememberAccount', 'true')
    } else {
      localStorage.removeItem('savedAccount')
      localStorage.removeItem('rememberAccount')
    }

    const redirect = router.currentRoute.value.query.redirect || '/'
    router.push(redirect)
  } catch (e) {
    refreshCaptcha()
    loginForm.captchaCode = ''
    // 错误已由 request.js 拦截器统一展示
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
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  min-height: 100dvh;
}

.login-card {
  display: flex;
  width: 800px;
  min-height: 500px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.10);
  overflow: hidden;
}

.login-brand {
  flex: 0 0 360px;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    url('../../static/login_left.png') center / cover no-repeat;
  position: relative;
}

.login-brand::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(56, 218, 166, 0.5);
}

.brand-content {
  position: relative;
  text-align: center;
  color: #fff;
  padding: 32px;
}

.brand-logo-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 48px;
}

.brand-logo {
  width: 56px;
  height: 56px;
  filter: brightness(0) invert(1);
}

.brand-name {
  font-size: 20px;
  font-weight: 600;
}

.brand-slogan {
  text-align: center;
}

.slogan-text {
  font-size: 16px;
  opacity: 0.85;
  margin: 0;
  line-height: 1.5;
  letter-spacing: 2px;
}

.login-form-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px;
}

.form-title {
  font-size: 22px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 28px 0;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.login-form :deep(.el-input__wrapper) {
  padding: 2px 12px;
  border-radius: 6px;
}

.login-form :deep(.el-input__inner) {
  height: 42px;
  font-size: 14px;
}

.captcha-wrapper {
  display: flex;
  width: 100%;
  gap: 12px;
}

.captcha-input {
  flex: 1;
}

.captcha-img {
  width: 120px;
  height: 42px;
  border-radius: 6px;
  cursor: pointer;
  object-fit: cover;
  border: 1px solid #dcdfe6;
  flex-shrink: 0;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  letter-spacing: 4px;
  border-radius: 6px;
  --el-button-bg-color: rgb(56, 218, 166);
  --el-button-border-color: rgb(56, 218, 166);
  --el-button-hover-bg-color: rgb(46, 198, 146);
  --el-button-hover-border-color: rgb(46, 198, 146);
  --el-button-active-bg-color: rgb(36, 178, 126);
  --el-button-active-border-color: rgb(36, 178, 126);
}

.form-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 12px;
  color: #b0b4c0;
}

.footer-divider {
  margin: 0 8px;
  opacity: 0.4;
}

@media (max-width: 768px) {
  .login-card {
    width: 90vw;
    flex-direction: column;
  }

  .login-brand {
    flex: none;
    height: 160px;
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .login-card {
    width: 100vw;
    min-height: 100vh;
    min-height: 100dvh;
    border-radius: 0;
    box-shadow: none;
  }

  .login-brand {
    height: 140px;
  }

  .brand-logo {
    width: 44px;
    height: 44px;
  }

  .brand-title {
    font-size: 18px;
  }

  .login-form-wrapper {
    padding: 28px 24px;
  }

  .captcha-img {
    width: 100px;
  }
}
</style>
