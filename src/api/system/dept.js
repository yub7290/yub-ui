import request from '@/utils/request'

/**
 * 获取部门树
 *
 * @param {object} params 查询参数（name, status）
 * @returns {Promise}
 */
export function getDeptTree(params) {
  return request.get('/system/dept/tree', { params })
}

/**
 * 获取部门详情
 *
 * @param {number} id 部门ID
 * @returns {Promise}
 */
export function getDeptDetail(id) {
  return request.get(`/system/dept/${id}`)
}

/**
 * 新增部门
 *
 * @param {object} data 部门数据
 * @returns {Promise}
 */
export function createDept(data) {
  return request.post('/system/dept', data)
}

/**
 * 编辑部门
 *
 * @param {object} data 部门数据
 * @returns {Promise}
 */
export function updateDept(data) {
  return request.put('/system/dept', data)
}

/**
 * 删除部门
 *
 * @param {number} id 部门ID
 * @returns {Promise}
 */
export function deleteDept(id) {
  return request.delete(`/system/dept/${id}`)
}

/**
 * 切换部门状态
 *
 * @param {number} id 部门ID
 * @param {number} status 状态（1=启用 0=禁用）
 * @returns {Promise}
 */
export function changeDeptStatus(id, status) {
  return request.put(`/system/dept/${id}/status`, { status })
}
