import request from '@/utils/request'

/**
 * 获取积分设置
 *
 * @returns {Promise}
 */
export function getPointsSettings() {
  return request.get('/edu/points-setting')
}

/**
 * 保存积分设置
 *
 * @param {object} data 积分设置数据
 * @returns {Promise}
 */
export function savePointsSettings(data) {
  return request.put('/edu/points-setting', data)
}
