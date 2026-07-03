import request from '@/utils/request'

/**
 * 分页查询积分商品列表
 *
 * @param {object} data 分页查询参数
 * @returns {Promise}
 */
export function getPointsProductPage(data) {
  return request.post('/edu/points-product/page', data)
}

/**
 * 获取积分商品详情
 *
 * @param {number} id 积分商品ID
 * @returns {Promise}
 */
export function getPointsProductDetail(id) {
  return request.get(`/edu/points-product/${id}`)
}

/**
 * 新增积分商品
 *
 * @param {object} data 积分商品数据
 * @returns {Promise}
 */
export function createPointsProduct(data) {
  return request.post('/edu/points-product', data)
}

/**
 * 编辑积分商品
 *
 * @param {object} data 积分商品数据
 * @returns {Promise}
 */
export function updatePointsProduct(data) {
  return request.put('/edu/points-product', data)
}

/**
 * 删除积分商品
 *
 * @param {number} id 积分商品ID
 * @returns {Promise}
 */
export function deletePointsProduct(id) {
  return request.delete(`/edu/points-product/${id}`)
}

/**
 * 切换商品状态
 *
 * @param {number} id     商品ID
 * @param {number} status 状态（1=启用 0=停用）
 * @returns {Promise}
 */
export function changePointsProductStatus(id, status) {
  return request.put(`/edu/points-product/${id}/status`, { status })
}

/**
 * 获取学习卡下拉列表
 *
 * @returns {Promise}
 */
export function getStudyCardOptions() {
  return request.get('/edu/points-product/study-cards')
}
