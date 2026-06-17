import request from '@/utils/request'

/**
 * 分页查询教师职称列表
 *
 * @param {object} data 分页查询参数
 * @returns {Promise}
 */
export function getTeacherTitlePage(data) {
  return request.post('/edu/teacher-title/page', data)
}

/**
 * 获取教师职称详情
 *
 * @param {number} id 职称ID
 * @returns {Promise}
 */
export function getTeacherTitleDetail(id) {
  return request.get(`/edu/teacher-title/${id}`)
}

/**
 * 新增教师职称
 *
 * @param {object} data 职称数据
 * @returns {Promise}
 */
export function createTeacherTitle(data) {
  return request.post('/edu/teacher-title', data)
}

/**
 * 编辑教师职称
 *
 * @param {object} data 职称数据
 * @returns {Promise}
 */
export function updateTeacherTitle(data) {
  return request.put('/edu/teacher-title', data)
}

/**
 * 删除教师职称
 *
 * @param {number} id 职称ID
 * @returns {Promise}
 */
export function deleteTeacherTitle(id) {
  return request.delete(`/edu/teacher-title/${id}`)
}

/**
 * 切换职称状态
 *
 * @param {number} id 职称ID
 * @param {number} status 状态（1=启用 0=禁用）
 * @returns {Promise}
 */
export function changeTeacherTitleStatus(id, status) {
  return request.put(`/edu/teacher-title/${id}/status`, { status })
}

/**
 * 获取所有启用职称（下拉框用）
 *
 * @returns {Promise}
 */
export function getTeacherTitleOptions() {
  return request.get('/edu/teacher-title/options')
}
