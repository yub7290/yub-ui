import request from '@/utils/request'

/**
 * 获取专业树
 *
 * @param {object} params 查询参数（name, status）
 * @returns {Promise}
 */
export function getMajorTree(params) {
  return request.get('/edu/major/tree', { params })
}

/**
 * 获取专业详情
 *
 * @param {number} id 专业ID
 * @returns {Promise}
 */
export function getMajorDetail(id) {
  return request.get(`/edu/major/${id}`)
}

/**
 * 新增专业
 *
 * @param {object} data 专业数据
 * @returns {Promise}
 */
export function createMajor(data) {
  return request.post('/edu/major', data)
}

/**
 * 编辑专业
 *
 * @param {object} data 专业数据
 * @returns {Promise}
 */
export function updateMajor(data) {
  return request.put('/edu/major', data)
}

/**
 * 删除专业
 *
 * @param {number} id 专业ID
 * @returns {Promise}
 */
export function deleteMajor(id) {
  return request.delete(`/edu/major/${id}`)
}

/**
 * 切换专业状态
 *
 * @param {number} id 专业ID
 * @param {number} status 状态（1=启用 0=禁用）
 * @returns {Promise}
 */
export function changeMajorStatus(id, status) {
  return request.put(`/edu/major/${id}/status`, { status })
}

/**
 * 切换推荐状态
 *
 * @param {number} id 专业ID
 * @param {number} recommended 推荐（1=是 0=否）
 * @returns {Promise}
 */
export function changeMajorRecommended(id, recommended) {
  return request.put(`/edu/major/${id}/recommended`, { status: recommended })
}
