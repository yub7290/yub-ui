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
 * 删除作业批改记录
 *
 * @param {number} id 作业批改ID
 * @returns {Promise}
 */
export function deleteHomework(id) {
  return request.delete(`/edu/homework/${id}`)
}
