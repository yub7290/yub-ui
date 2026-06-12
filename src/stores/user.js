import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getAccessToken, setAccessToken, setRefreshToken, clearToken } from '@/utils/auth'
import { login as loginApi, getUserInfo as getUserInfoApi, logout as logoutApi } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(getAccessToken() || '')
  const userInfo = ref(null)
  const menus = ref([])

  async function login(loginForm) {
    const res = await loginApi(loginForm)
    const data = res.data
    setAccessToken(data.accessToken)
    setRefreshToken(data.refreshToken)
    token.value = data.accessToken
    // 注意：登录响应只返回 accessToken/refreshToken
    // 用户信息需通过 getUserInfo() 单独获取
    return data
  }

  async function getUserInfo() {
    const res = await getUserInfoApi()
    userInfo.value = res.data.user
    menus.value = res.data.menus
    return res.data
  }

  async function logout() {
    try {
      await logoutApi()
    } finally {
      clearToken()
      token.value = ''
      userInfo.value = null
      menus.value = []
    }
  }

  return { token, userInfo, menus, login, logout, getUserInfo }
})
