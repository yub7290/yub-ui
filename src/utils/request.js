import axios from 'axios'
import { getAccessToken, getRefreshToken, setAccessToken, clearToken } from './auth'
import { ElMessage } from 'element-plus'
import router from '@/router'

const service = axios.create({
  baseURL: '/api',
  timeout: 30000
})

let isRefreshing = false
let pendingRequests = []

function addPendingRequest(config) {
  return new Promise((resolve) => {
    pendingRequests.push({ config, resolve })
  })
}

function processPendingRequests(newToken) {
  pendingRequests.forEach(({ config, resolve }) => {
    config.headers.Authorization = 'Bearer ' + newToken
    resolve(service(config))
  })
  pendingRequests = []
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

service.interceptors.request.use(
  config => {
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
    // 跳过 JSON code 校验：blob 响应直接返回
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
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 防止连续重试死循环（最多1次）
      if (originalRequest._retryCount && originalRequest._retryCount >= 1) {
        clearToken()
        router.push('/login')
        return Promise.reject(error)
      }
      if (isRefreshing) {
        return addPendingRequest(originalRequest)
      }
      originalRequest._retry = true
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1
      isRefreshing = true
      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        clearToken()
        router.push('/login')
        return Promise.reject(error)
      }
      try {
        // 路径参数方式调用 /api/auth/refresh/{refreshToken}
        const res = await axios.post('/api/auth/refresh/' + refreshToken)
        const newToken = res.data.data.accessToken
        if (!newToken) throw new Error('刷新失败：返回数据为空')
        setAccessToken(newToken)
        processPendingRequests(newToken)
        return service(originalRequest)
      } catch (e) {
        clearToken()
        router.push('/login')
        return Promise.reject(e)
      } finally {
        isRefreshing = false
      }
    }
    // 优先显示后端返回的错误消息，否则使用 Axios 默认消息
    ElMessage.error(getErrorMessage(error))
    return Promise.reject(error)
  }
)

export default service
