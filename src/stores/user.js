import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getAccessToken, setAccessToken, setRefreshToken, clearToken } from '@/utils/auth'
import request from '@/utils/request'

export const useUserStore = defineStore('user', () => {
  const token = ref(getAccessToken() || '')
  const userInfo = ref(null)
  const menus = ref([])

  async function login(loginForm) {
    const res = await request.post('/auth/login', loginForm)
    const data = res.data
    setAccessToken(data.accessToken)
    setRefreshToken(data.refreshToken)
    token.value = data.accessToken
    userInfo.value = data.userInfo
    menus.value = data.menus
    return data
  }

  async function getUserInfo() {
    const res = await request.get('/auth/getUserInfo')
    userInfo.value = res.data.user
    menus.value = res.data.menus
    return res.data
  }

  async function logout() {
    try {
      await request.post('/auth/logout')
    } finally {
      clearToken()
      token.value = ''
      userInfo.value = null
      menus.value = []
    }
  }

  return { token, userInfo, menus, login, logout, getUserInfo }
})
