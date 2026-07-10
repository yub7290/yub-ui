<template>
  <div class="login-container">
    <div class="login-card">
      <!-- 左侧品牌区 -->
      <div class="login-brand">
        <div class="brand-content">
          <div class="brand-logo-wrap">
            <img src="../../static/logo1.png" alt="教师工作台" class="brand-logo" />
            <span class="brand-name">教师工作台</span>
          </div>
          <div class="brand-slogan">
            <p class="slogan-text">教书育人，成就未来</p>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="login-form-wrapper">
        <h2 class="form-title">教师登录</h2>

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
          <router-link to="/login" class="portal-link">← 管理员登录</router-link>
          <span class="footer-divider">|</span>
          <span>&copy; {{ currentYear }} 智慧教育系统</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 教师登录页面
 *
 * 独立于管理员登录，使用绿色系主题
 * 验证码接口与管理端共用（/auth/captcha）
 * 登录接口为教师端专属（/teacher/auth/login）
 */
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { User, Lock, Key } from '@element-plus/icons-vue'
import smCrypto from 'sm-crypto'
import { getCaptcha } from '@/api/auth'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref(null)
const loading = ref(false)
const captchaImage = ref('')
const currentYear = computed(() => new Date().getFullYear())

/** 登录表单 */
const loginForm = reactive({
  account: '',
  password: '',
  captchaKey: '',
  captchaCode: ''
})

/** 表单校验规则 */
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

/**
 * 获取验证码（与管理端共用验证码接口）
 */
async function refreshCaptcha() {
  try {
    const res = await getCaptcha()
    captchaImage.value = res.data.image
    loginForm.captchaKey = res.data.key
  } catch {
    // 验证码加载失败不阻断页面
  }
}

/**
 * 处理教师登录
 *
 * 密码使用 SM3 哈希后提交
 * 登录成功后存储 token 并跳转首页
 */
async function handleLogin() {
  if (loading.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    // SM3 加密密码后发送
    const encryptedPassword = smCrypto.sm3(loginForm.password)
    await userStore.loginAsTeacher({ ...loginForm, password: encryptedPassword })
    await userStore.getTeacherUserInfo()
    ElMessage.success('登录成功')
    const redirect = router.currentRoute.value.query.redirect || '/'
    router.push(redirect)
  } catch {
    // 错误已由 request.js 拦截器统一展示
    await refreshCaptcha()
    loginForm.captchaCode = ''
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refreshCaptcha()
})
</script>

<style scoped>
@import '@/assets/css/login.css';

.login-container {
  background-color: var(--t-page-bg, #F6F8F7);
}

/* 品牌区：纯色深绿 + 细纹理，去渐变 */
.login-brand {
  background: #0B6E52;
}

.login-brand::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.10) 1px, transparent 1px);
  background-size: 22px 22px;
  opacity: 0.5;
}

.login-btn {
  --el-button-bg-color: #0C8E68;
  --el-button-border-color: #0C8E68;
  --el-button-hover-bg-color: #0a7d5c;
  --el-button-hover-border-color: #0a7d5c;
  --el-button-active-bg-color: #0A7355;
  --el-button-active-border-color: #0A7355;
}
</style>
