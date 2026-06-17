import request from '@/utils/request'

/**
 * 分页查询课程列表
 *
 * @param {object} data 分页查询参数
 * @returns {Promise}
 */
export function getCoursePage(data) {
  return request.post('/edu/course/page', data)
}

/**
 * 获取课程详情
 *
 * @param {number} id 课程ID
 * @returns {Promise}
 */
export function getCourseDetail(id) {
  return request.get(`/edu/course/${id}`)
}

/**
 * 获取课程综述
 *
 * @param {number} id 课程ID
 * @returns {Promise}
 */
export function getCourseOverview(id) {
  return request.get(`/edu/course/${id}/overview`)
}

/**
 * 新增课程
 *
 * @param {object} data 课程数据
 * @returns {Promise}
 */
export function createCourse(data) {
  return request.post('/edu/course', data)
}

/**
 * 编辑课程
 *
 * @param {object} data 课程数据
 * @returns {Promise}
 */
export function updateCourse(data) {
  return request.put('/edu/course', data)
}

/**
 * 删除课程
 *
 * @param {number} id 课程ID
 * @returns {Promise}
 */
export function deleteCourse(id) {
  return request.delete(`/edu/course/${id}`)
}

/**
 * 切换课程状态
 *
 * @param {number} id 课程ID
 * @param {number} status 状态（1=启用 0=禁用）
 * @returns {Promise}
 */
export function changeCourseStatus(id, status) {
  return request.put(`/edu/course/${id}/status`, { status })
}

/**
 * 设置推荐课程
 *
 * @param {number} id 课程ID
 * @param {number} recommended 是否推荐（1=是 0=否）
 * @returns {Promise}
 */
export function setCourseRecommended(id, recommended) {
  return request.put(`/edu/course/${id}/recommended`, { status: recommended })
}
