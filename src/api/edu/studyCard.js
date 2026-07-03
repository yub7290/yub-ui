import request from '@/utils/request'

/**
 * 分页查询学习卡列表
 *
 * @param {object} data 分页查询参数
 * @returns {Promise}
 */
export function getStudyCardPage(data) {
  return request.post('/edu/study-card/page', data)
}

/**
 * 获取学习卡详情
 *
 * @param {number} id 学习卡ID
 * @returns {Promise}
 */
export function getStudyCardDetail(id) {
  return request.get(`/edu/study-card/${id}`)
}

/**
 * 新增学习卡
 *
 * @param {object} data 学习卡数据
 * @returns {Promise}
 */
export function createStudyCard(data) {
  return request.post('/edu/study-card', data)
}

/**
 * 编辑学习卡
 *
 * @param {object} data 学习卡数据
 * @returns {Promise}
 */
export function updateStudyCard(data) {
  return request.put('/edu/study-card', data)
}

/**
 * 删除学习卡
 *
 * @param {number} id 学习卡ID
 * @returns {Promise}
 */
export function deleteStudyCard(id) {
  return request.delete(`/edu/study-card/${id}`)
}

/**
 * 切换学习卡状态
 *
 * @param {number} id 学习卡ID
 * @param {number} status 状态（1=启用 0=停用）
 * @returns {Promise}
 */
export function changeStudyCardStatus(id, status) {
  return request.put(`/edu/study-card/${id}/status`, { status })
}

/**
 * 分页查询学习卡实例列表
 *
 * @param {number} cardId 学习卡ID
 * @param {object} data 分页查询参数
 * @returns {Promise}
 */
export function getInstancePage(cardId, data) {
  return request.post(`/edu/study-card/${cardId}/instances/page`, data)
}

/**
 * 批量生成学习卡实例
 *
 * @param {number} cardId 学习卡ID
 * @param {number} count 生成数量
 * @returns {Promise}
 */
export function batchGenerateInstances(cardId, count) {
  return request.post(`/edu/study-card/${cardId}/instances/generate`, count)
}

/**
 * 回滚学习卡实例
 *
 * @param {number} instanceId 实例ID
 * @returns {Promise}
 */
export function rollbackInstance(instanceId) {
  return request.put(`/edu/study-card/instances/${instanceId}/rollback`)
}

/**
 * 切换学习卡实例启用状态
 *
 * @param {number} instanceId 实例ID
 * @param {number} status 状态（1=启用 0=停用）
 * @returns {Promise}
 */
export function toggleInstanceStatus(instanceId, status) {
  return request.put(`/edu/study-card/instances/${instanceId}/status`, { status })
}
