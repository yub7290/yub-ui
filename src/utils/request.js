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
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message))
    }
    return res
  },
  async error => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return addPendingRequest(originalRequest)
      }
      originalRequest._retry = true
      isRefreshing = true
      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        clearToken()
        router.push('/login')
        return Promise.reject(error)
      }
      try {
        const res = await axios.post('/api/auth/refresh', { refreshToken })
        const newToken = res.data.data.accessToken
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
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default service
