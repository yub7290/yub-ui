import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getAccessToken, setAccessToken,
  setRefreshToken, getRefreshToken,
  clearToken, getRole, setRole, removeRole
} from '@/utils/auth'
import { login as loginApi, getUserInfo as getUserInfoApi, logout as logoutApi } from '@/api/auth'
import {
  teacherLogin as teacherLoginApi,
  getTeacherUserInfo as getTeacherUserInfoApi,
  teacherLogout as teacherLogoutApi
} from '@/api/edu/teacherAuth'
import { setTheme, clearTheme } from '@/utils/theme'

export const useUserStore = defineStore('user', () => {
  // 双端用户态分角色缓存，避免切换角色时串号或显示旧身份
  const adminUserInfo = ref(null)
  const teacherUserInfo = ref(null)
  const adminMenus = ref([])
  const teacherMenus = ref([])
  const activeRole = ref(getRole())
  const token = ref(getAccessToken() || '')

  /**
   * 当前 UI 活跃角色对应的用户信息 / 菜单
   * 由路由守卫在切换路由时设置 activeRole，这里按角色返回对应缓存
   */
  const userInfo = computed(() =>
    activeRole.value === 'TEACHER' ? teacherUserInfo.value : adminUserInfo.value
  )
  const menus = computed(() =>
    activeRole.value === 'TEACHER' ? teacherMenus.value : adminMenus.value
  )

  /**
   * 设置当前会话身份，并应用主题
   * 单会话单身份模型：身份即当前标签页登录的角色，存入 sessionStorage
   */
  function setActiveRoleState(role) {
    activeRole.value = role
    setRole(role)
    setTheme(role)
  }

  /**
   * 管理员登录
   *
   * @param {object} loginForm 登录表单
   * @returns {Promise<object>} token 数据
   */
  async function login(loginForm) {
    const res = await loginApi(loginForm)
    const data = res.data
    setActiveRoleState('ADMIN')
    setAccessToken(data.accessToken)
    setRefreshToken(data.refreshToken)
    token.value = data.accessToken
    return data
  }

  /**
   * 教师登录
   *
   * @param {object} loginForm 登录表单
   * @returns {Promise<object>} token 数据
   */
  async function loginAsTeacher(loginForm) {
    const res = await teacherLoginApi(loginForm)
    const data = res.data
    setActiveRoleState('TEACHER')
    setAccessToken(data.accessToken)
    setRefreshToken(data.refreshToken)
    token.value = data.accessToken
    return data
  }

  /**
   * 获取当前管理员用户信息
   *
   * @returns {Promise<object>} 用户信息和菜单
   */
  async function getUserInfo() {
    const res = await getUserInfoApi()
    adminUserInfo.value = res.data.user
    adminMenus.value = res.data.menus
    return res.data
  }

  /**
   * 获取当前教师用户信息
   *
   * @returns {Promise<object>} 教师用户信息和菜单
   */
  async function getTeacherUserInfo() {
    const res = await getTeacherUserInfoApi()
    teacherUserInfo.value = res.data.user
    teacherMenus.value = res.data.menus
    return res.data
  }

  /**
   * 确保指定角色的用户信息已加载（按需加载，已加载则跳过）
   * 路由守卫在角色切换或刷新页面后调用，避免重复请求与旧身份残留
   *
   * @param {'ADMIN'|'TEACHER'} role 角色
   */
  async function ensureUserInfo(role) {
    if (role === 'TEACHER') {
      if (!teacherUserInfo.value) {
        await getTeacherUserInfo()
      }
    } else {
      if (!adminUserInfo.value) {
        await getUserInfo()
      }
    }
  }

  /**
   * 登出（管理员和教师通用）
   * 单会话单身份：清空当前标签页的整个会话（token + 身份），
   * 调用对应角色的登出端点，确保后端 refresh token 集合被清理、access token 入黑名单。
   */
  async function logout() {
    const currentRole = activeRole.value || 'ADMIN'
    try {
      if (currentRole === 'TEACHER') {
        await teacherLogoutApi().catch(() => {})
      } else {
        await logoutApi().catch(() => {})
      }
    } finally {
      // 清空当前会话的全部登录态
      clearToken()
      if (currentRole === 'TEACHER') {
        teacherUserInfo.value = null
        teacherMenus.value = []
      } else {
        adminUserInfo.value = null
        adminMenus.value = []
      }
      removeRole()
      clearTheme()
      activeRole.value = null
      token.value = ''
    }
  }

  return {
    token, userInfo, menus, activeRole,
    login, loginAsTeacher, logout,
    getUserInfo, getTeacherUserInfo, ensureUserInfo,
    setActiveRoleState
  }
})
