import request from '@/utils/request'

/**
 * 获取课程AI助教配置
 *
 * @param {number} courseId 课程ID
 * @returns {Promise}
 */
export function getAiConfig(courseId) {
  return request.get(`/edu/ai/config/${courseId}`)
}

/**
 * 保存AI助教配置
 *
 * @param {object} data 配置数据
 * @returns {Promise}
 */
export function saveAiConfig(data) {
  return request.post('/edu/ai/config', data)
}
