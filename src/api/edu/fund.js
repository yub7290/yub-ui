import request from '@/utils/request'

/**
 * 用户资金列表
 *
 * @param {object} data 分页查询参数
 * @returns {Promise}
 */
export function getUserFundPage(data) {
  return request.post('/edu/fund/page', data)
}

/**
 * 用户资金详情
 *
 * @param {number} userId 用户ID
 * @returns {Promise}
 */
export function getUserFundDetail(userId) {
  return request.get(`/edu/fund/${userId}`)
}

/**
 * 交易流水查询
 *
 * @param {object} data 分页查询参数
 * @returns {Promise}
 */
export function getTransactionPage(data) {
  return request.post('/edu/fund/transaction/page', data)
}
