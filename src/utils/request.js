import axios from 'axios'
import {
  getAccessToken, getRefreshToken, setAccessToken, setRefreshToken,
  clearToken, resolveRoleByUrl
} from './auth'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { clearTheme } from './theme'

const service = axios.create({
  baseURL: '/api',
  timeout: 120000
})

/**
 * 每个角色独立的刷新锁与等待队列。
 * 双端可能同时进入刷新流程，必须按角色隔离，避免用一端的新 token 去重放另一端的请求。
 */
const refreshing = { ADMIN: false, TEACHER: false }
const pendingRequests = { ADMIN: [], TEACHER: [] }

function addPendingRequest(role, config) {
  config._retry = true
  return new Promise((resolve, reject) => {
    pendingRequests[role].push({ config, resolve, reject })
  })
}

function processPendingRequests(role, newToken) {
  pendingRequests[role].forEach(({ config, resolve, reject }) => {
    if (newToken) {
      config.headers.Authorization = 'Bearer ' + newToken
      resolve(service(config))
    } else {
      reject(new Error('刷新失败'))
    }
  })
  pendingRequests[role] = []
}

/**
 * 提取后端错误消息（优先使用后端返回的 message）
 */
function getErrorMessage(error) {
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.message) {
    return error.message
  }
  return '网络错误'
}

/**
 * 根据角色返回对应的 Token 刷新端点
 */
function getRefreshUrl(role, refreshToken) {
  return role === 'TEACHER'
    ? '/api/teacher/auth/refresh/' + refreshToken
    : '/api/auth/refresh/' + refreshToken
}

/**
 * 清除当前会话的认证状态（单会话单身份：清掉即整端登出）
 */
function clearRoleState() {
  clearToken()
  clearTheme()
}

/**
 * 跳转到与请求角色匹配的登录页
 */
function redirectToLogin(role, originalRequest) {
  // 跳回当前页面路由（而非触发 401 的 API 地址），登录成功后由登录页带回
  const currentPath = router.currentRoute?.value?.fullPath
    || (role === 'TEACHER' ? '/teacher/home' : '/')
  const loginPath = role === 'TEACHER' ? '/teacher/login' : '/login'
  router.push({ path: loginPath, query: { redirect: currentPath } })
}

service.interceptors.request.use(
  config => {
    // 单会话单身份模型：当前标签页的 session 只持有一个身份，
    // 直接附加会话 token 即可，无需按 URL 推断角色。
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = 'Bearer ' + token
    }
    return config
  },
  error => Promise.reject(error)
)

service.interceptors.response.use(
  response => {
    const res = response.data
    if (response.config.responseType === 'blob') {
      return res
    }
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message))
    }
    return res
  },
  async error => {
    const originalRequest = error.config
    if (error.response?.status === 401 && originalRequest) {
      // 按"触发 401 的那个请求"的 URL 推导角色，确保刷新的是正确的一端
      const role = resolveRoleByUrl(originalRequest.url)

      // 已尝试过刷新仍 401：该角色登录态彻底失效
      if (originalRequest._retry) {
        clearRoleState()
        ElMessage.error('登录已失效，请重新登录')
        redirectToLogin(role, originalRequest)
        return Promise.reject(error)
      }

      if (refreshing[role]) {
        return addPendingRequest(role, originalRequest)
      }

      originalRequest._retry = true
      refreshing[role] = true

      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        clearRoleState()
        ElMessage.error('登录已失效，请重新登录')
        redirectToLogin(role, originalRequest)
        refreshing[role] = false
        return Promise.reject(error)
      }

      try {
        const refreshUrl = getRefreshUrl(role, refreshToken)
        const res = await axios.post(refreshUrl)
        const refreshData = res.data
        if (!refreshData || refreshData.code !== 200 || !refreshData.data) {
          throw new Error(refreshData?.message || '刷新失败：返回数据为空')
        }
        const { accessToken, refreshToken: newRefreshToken } = refreshData.data
        // 修复：后端做了 refresh token 轮转，必须同时持久化新的 access 与 refresh，
        // 否则旧 refresh 已被服务端移除，下一次刷新必然失败
        setAccessToken(accessToken)
        setRefreshToken(newRefreshToken)
        processPendingRequests(role, accessToken)
        return service(originalRequest)
      } catch (e) {
        clearRoleState()
        processPendingRequests(role, null)
        ElMessage.error('登录已失效，请重新登录')
        redirectToLogin(role, originalRequest)
        return Promise.reject(e)
      } finally {
        refreshing[role] = false
      }
    }
    ElMessage.error(getErrorMessage(error))
    return Promise.reject(error)
  }
)

export default service
