import request from '@/utils/request'

/**
 * 分页查询用户列表
 *
 * @param {object} params 查询条件+分页参数
 * @returns {Promise}
 */
export function getUserPage(params) {
  return request.get('/system/user/page', { params })
}

/**
 * 获取用户详情
 *
 * @param {number} id 用户ID
 * @returns {Promise}
 */
export function getUserDetail(id) {
  return request.get(`/system/user/${id}`)
}

/**
 * 新增用户
 *
 * @param {object} data 用户信息
 * @returns {Promise}
 */
export function createUser(data) {
  return request.post('/system/user', data)
}

/**
 * 编辑用户
 *
 * @param {object} data 用户信息
 * @returns {Promise}
 */
export function updateUser(data) {
  return request.put('/system/user', data)
}

/**
 * 删除用户
 *
 * @param {number} id 用户ID
 * @returns {Promise}
 */
export function deleteUser(id) {
  return request.delete(`/system/user/${id}`)
}

/**
 * 重置密码
 *
 * @param {number} id 用户ID
 * @returns {Promise}
 */
export function resetPassword(id) {
  return request.put(`/system/user/${id}/password`)
}

/**
 * 启用/禁用用户
 *
 * @param {number} id 用户ID
 * @param {number} status 1=启用 0=禁用
 * @returns {Promise}
 */
export function changeUserStatus(id, status) {
  return request.put(`/system/user/${id}/status`, { status })
}
