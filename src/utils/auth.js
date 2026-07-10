/**
 * Token 管理工具（单会话单身份模型）
 *
 * 设计要点：
 * - 登录态存入 sessionStorage（按标签页隔离，关闭 Tab 即失效）
 * - 每个标签页 = 一个会话 = 一个身份（管理员 ADMIN 或 教师 TEACHER）
 * - 天然按 Tab 隔离，不同标签页互不影响，不会跨 Tab 串号
 * - 同一浏览器开多个标签页可分别登录不同身份，实现"双端同时在线"
 */

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const ROLE_KEY = 'role'

/* ---------------- AccessToken ---------------- */

export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function removeAccessToken() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
}

/* ---------------- RefreshToken ---------------- */

export function getRefreshToken() {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setRefreshToken(token) {
  sessionStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export function removeRefreshToken() {
  sessionStorage.removeItem(REFRESH_TOKEN_KEY)
}

/* ---------------- 当前会话身份 ---------------- */

export function getRole() {
  return sessionStorage.getItem(ROLE_KEY)
}

export function setRole(role) {
  if (role === 'ADMIN' || role === 'TEACHER') {
    sessionStorage.setItem(ROLE_KEY, role)
  }
}

export function removeRole() {
  sessionStorage.removeItem(ROLE_KEY)
}

/* ---------------- 复合操作 ---------------- */

/**
 * 是否已登录（存在 accessToken 且已知身份）
 * @returns {boolean}
 */
export function isLoggedIn() {
  return !!getAccessToken() && !!getRole()
}

/**
 * 清空当前会话的全部登录态（access + refresh + role）
 */
export function clearToken() {
  removeAccessToken()
  removeRefreshToken()
  removeRole()
}

/**
 * 根据请求 URL 推导当前请求所属的角色。
 *
 * 单会话单身份模型下，正常情况下直接返回当前会话身份即可。
 * 保留 URL 兜底：当会话身份因异常缺失时，按路径特征推断，
 * 以避免选错刷新端点 / 刷新队列。
 *
 * @param {string} [url] 请求地址（相对或绝对）
 * @returns {'ADMIN'|'TEACHER'} 角色
 */
export function resolveRoleByUrl(url) {
  const sessionRole = getRole()
  if (sessionRole === 'ADMIN' || sessionRole === 'TEACHER') {
    return sessionRole
  }
  // 兜底：会话身份未知时按 URL 推断
  if (url && url.indexOf('/teacher') !== -1) {
    return 'TEACHER'
  }
  if (url && (url.indexOf('/system/') !== -1 || url.indexOf('/auth/') !== -1)) {
    return 'ADMIN'
  }
  return 'ADMIN'
}
