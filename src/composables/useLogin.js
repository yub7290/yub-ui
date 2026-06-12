import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import smCrypto from 'sm-crypto'
import { getCaptcha, login } from '@/api/auth'

/**
 * 登录页逻辑
 *
 * @returns {object} 登录页响应式状态和方法
 */
export function useLogin() {
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
      const res = await getCaptcha()
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
      await refreshCaptcha()
      loginForm.captchaCode = ''
      // 错误已由 request.js 拦截器统一展示
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    refreshCaptcha()
  })

  return {
    formRef,
    loading,
    captchaImage,
    rememberMe,
    loginForm,
    rules,
    currentYear,
    handleLogin,
    refreshCaptcha
  }
}
