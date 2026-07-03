import request from '@/utils/request'

/**
 * 分页查询积分订单列表
 *
 * @param {object} data 分页查询参数
 * @returns {Promise}
 */
export function getPointsOrderPage(data) {
  return request.post('/edu/points-order/page', data)
}

/**
 * 获取积分订单详情
 *
 * @param {number} id 订单ID
 * @returns {Promise}
 */
export function getPointsOrderDetail(id) {
  return request.get(`/edu/points-order/${id}`)
}

/**
 * 根据兑换码查询订单
 *
 * @param {string} exchangeCode 兑换码
 * @returns {Promise}
 */
export function getPointsOrderByCode(exchangeCode) {
  return request.get(`/edu/points-order/by-code/${exchangeCode}`)
}

/**
 * 核销兑换码
 *
 * @param {object} data 兑换码数据
 * @returns {Promise}
 */
export function verifyExchangeCode(data) {
  return request.post('/edu/points-order/verify', data)
}

/**
 * 发货
 *
 * @param {number} id 订单ID
 * @param {object} data 快递信息
 * @returns {Promise}
 */
export function shipPointsOrder(id, data) {
  return request.put(`/edu/points-order/${id}/ship`, data)
}
