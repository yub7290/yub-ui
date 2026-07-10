import request from '@/utils/request'

/**
 * 教师登录
 *
 * @param {object} data 登录表单 { account, password, captchaKey, captchaCode }
 * @returns {Promise}
 */
export function teacherLogin(data) {
  return request.post('/teacher/auth/login', data)
}

/**
 * 获取教师用户信息
 *
 * @returns {Promise}
 */
export function getTeacherUserInfo() {
  return request.get('/teacher/auth/getUserInfo')
}

/**
 * 教师 Token 刷新
 *
 * @param {string} refreshToken 刷新令牌
 * @returns {Promise}
 */
export function teacherRefreshToken(refreshToken) {
  return request.post(`/teacher/auth/refresh/${refreshToken}`)
}

/**
 * 教师登出
 *
 * 清除后端 refresh token 集合并将当前 access token 加入黑名单
 * @returns {Promise}
 */
export function teacherLogout() {
  return request.post('/teacher/auth/logout')
}
