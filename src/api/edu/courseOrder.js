import request from '@/utils/request'

/**
 * 课程订单列表
 *
 * @param {object} data 分页查询参数
 * @returns {Promise}
 */
export function getCourseOrderPage(data) {
  return request.post('/edu/course-order/page', data)
}

/**
 * 课程订单退款
 *
 * @param {number} id 订单ID
 * @returns {Promise}
 */
export function refundCourseOrder(id) {
  return request.post(`/edu/course-order/${id}/refund`)
}
