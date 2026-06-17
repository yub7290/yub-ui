import request from '@/utils/request'

/**
 * 分页查询试题列表
 *
 * @param {object} data 分页查询参数
 * @returns {Promise}
 */
export function getQuestionPage(data) {
  return request.post('/edu/question/page', data)
}

/**
 * 获取试题详情
 *
 * @param {number} id 试题ID
 * @returns {Promise}
 */
export function getQuestionDetail(id) {
  return request.get(`/edu/question/${id}`)
}

/**
 * 新增试题
 *
 * @param {object} data 试题数据
 * @returns {Promise}
 */
export function createQuestion(data) {
  return request.post('/edu/question', data)
}

/**
 * 编辑试题
 *
 * @param {object} data 试题数据
 * @returns {Promise}
 */
export function updateQuestion(data) {
  return request.put('/edu/question', data)
}

/**
 * 删除试题
 *
 * @param {number} id 试题ID
 * @returns {Promise}
 */
export function deleteQuestion(id) {
  return request.delete(`/edu/question/${id}`)
}

/**
 * 切换试题状态
 *
 * @param {number} id 试题ID
 * @param {number} status 状态（1=启用 0=禁用）
 * @returns {Promise}
 */
export function changeQuestionStatus(id, status) {
  return request.put(`/edu/question/${id}/status`, { status })
}
