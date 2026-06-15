import request from '@/utils/request'

/**
 * 获取所有启用角色（下拉框用）
 *
 * @returns {Promise}
 */
export function getRoleOptions() {
  return request.get('/system/role/options')
}

/**
 * 分页查询角色列表
 *
 * @param {object} data 分页查询参数
 * @returns {Promise}
 */
export function getRolePage(data) {
  return request.post('/system/role/page', data)
}

/**
 * 获取角色详情
 *
 * @param {number} id 角色ID
 * @returns {Promise}
 */
export function getRoleDetail(id) {
  return request.get(`/system/role/${id}`)
}

/**
 * 新增角色
 *
 * @param {object} data 角色数据
 * @returns {Promise}
 */
export function createRole(data) {
  return request.post('/system/role', data)
}

/**
 * 编辑角色
 *
 * @param {object} data 角色数据
 * @returns {Promise}
 */
export function updateRole(data) {
  return request.put('/system/role', data)
}

/**
 * 删除角色
 *
 * @param {number} id 角色ID
 * @returns {Promise}
 */
export function deleteRole(id) {
  return request.delete(`/system/role/${id}`)
}

/**
 * 切换角色状态
 *
 * @param {number} id 角色ID
 * @param {number} status 状态（1=启用 0=禁用）
 * @returns {Promise}
 */
export function changeRoleStatus(id, status) {
  return request.put(`/system/role/${id}/status`, { status })
}
