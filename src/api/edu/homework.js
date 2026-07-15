import request from '@/utils/request'

/**
 * 分页查询作业批改列表
 *
 * @param {object} data 查询条件+分页参数
 * @returns {Promise}
 */
export function getHomeworkPage(data) {
  return request.post('/edu/homework/page', data)
}

/**
 * 获取作业批改详情
 *
 * @param {number} id 作业批改ID
 * @returns {Promise}
 */
export function getHomeworkDetail(id) {
  return request.get(`/edu/homework/detail/${id}`)
}

/**
 * 批改题目
 *
 * @param {object} data 批改信息
 * @returns {Promise}
 */
export function reviewQuestion(data) {
  return request.post('/edu/homework/review', data)
}

/**
 * 一键复查：将 AI 判定正确的题目批量标记为已复查
 *
 * @param {object} data { correctionId }
 * @returns {Promise} 已复查题数
 */
export function autoReviewCorrect(data) {
  return request.post('/edu/homework/review/auto', data)
}

/**
 * 批量删除作业题目（物理删除，不可恢复，后端自动重算统计）
 *
 * @param {object} data { ids: number[] }
 * @returns {Promise}
 */
export function batchDeleteQuestions(data) {
  return request.post('/edu/homework/question/batch-delete', data)
}

/**
 * 删除作业批改记录
 *
 * @param {number} id 作业批改ID
 * @returns {Promise}
 */
export function deleteHomework(id) {
  return request.delete(`/edu/homework/${id}`)
}
