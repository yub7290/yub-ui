import request from '@/utils/request'

/**
 * 获取验证码
 *
 * @returns {Promise}
 */
export function getCaptcha() {
  return request.get('/auth/captcha')
}

/**
 * 登录
 *
 * @param {object} data 登录表单 { account, password, captchaKey, captchaCode }
 * @returns {Promise}
 */
export function login(data) {
  return request.post('/auth/login', data)
}

/**
 * 获取当前用户信息
 *
 * @returns {Promise}
 */
export function getUserInfo() {
  return request.get('/auth/getUserInfo')
}

/**
 * 登出
 *
 * @returns {Promise}
 */
export function logout() {
  return request.post('/auth/logout')
}

/**
 * 刷新令牌
 *
 * @param {string} refreshToken 刷新令牌
 * @returns {Promise}
 */
export function refreshToken(refreshToken) {
  return request.post('/auth/refresh/' + refreshToken)
}
