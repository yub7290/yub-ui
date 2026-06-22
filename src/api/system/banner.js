import request from '@/utils/request'

/**
 * 分页查询Banner列表
 *
 * @param {object} data 分页查询参数
 * @returns {Promise}
 */
export function getBannerPage(data) {
  return request.post('/system/banner/page', data)
}

/**
 * 获取Banner详情
 *
 * @param {number} id Banner ID
 * @returns {Promise}
 */
export function getBannerDetail(id) {
  return request.get(`/system/banner/${id}`)
}

/**
 * 新增Banner
 *
 * @param {object} data Banner数据
 * @returns {Promise}
 */
export function createBanner(data) {
  return request.post('/system/banner', data)
}

/**
 * 编辑Banner
 *
 * @param {object} data Banner数据
 * @returns {Promise}
 */
export function updateBanner(data) {
  return request.put('/system/banner', data)
}

/**
 * 删除Banner
 *
 * @param {number} id Banner ID
 * @returns {Promise}
 */
export function deleteBanner(id) {
  return request.delete(`/system/banner/${id}`)
}
