import request from '@/utils/request'

/**
 * 分页查询教师列表
 *
 * @param {object} data 查询条件+分页参数
 * @returns {Promise}
 */
export function getTeacherPage(data) {
  return request.post('/edu/teacher/page', data)
}

/**
 * 获取教师详情
 *
 * @param {number} id 教师ID
 * @returns {Promise}
 */
export function getTeacherDetail(id) {
  return request.get(`/edu/teacher/${id}`)
}

/**
 * 新增教师
 *
 * @param {object} data 教师信息
 * @returns {Promise}
 */
export function createTeacher(data) {
  return request.post('/edu/teacher', data)
}

/**
 * 编辑教师
 *
 * @param {object} data 教师信息
 * @returns {Promise}
 */
export function updateTeacher(data) {
  return request.put('/edu/teacher', data)
}

/**
 * 删除教师
 *
 * @param {number} id 教师ID
 * @returns {Promise}
 */
export function deleteTeacher(id) {
  return request.delete(`/edu/teacher/${id}`)
}

/**
 * 批量删除教师
 *
 * @param {number[]} ids 教师ID列表
 * @returns {Promise}
 */
export function deleteTeacherBatch(ids) {
  return request.delete('/edu/teacher/batch', { data: ids })
}

/**
 * 重置教师密码
 *
 * @param {number} id 教师ID
 * @returns {Promise}
 */
export function resetTeacherPassword(id) {
  return request.put(`/edu/teacher/${id}/password`)
}

/**
 * 切换教师状态
 *
 * @param {number} id 教师ID
 * @param {number} status 1=启用 0=禁用
 * @returns {Promise}
 */
export function changeTeacherStatus(id, status) {
  return request.put(`/edu/teacher/${id}/status`, { status })
}

/**
 * 获取所有启用教师（下拉框用）
 *
 * @returns {Promise}
 */
export function getTeacherOptions() {
  return request.get('/edu/teacher/options')
}

/**
 * 设置教师推荐状态
 *
 * @param {number} id 教师ID
 * @param {number} recommended 推荐状态（1=推荐 0=不推荐）
 * @returns {Promise}
 */
export function setTeacherRecommended(id, recommended) {
  return request.put(`/edu/teacher/${id}/recommended`, null, { params: { recommended } })
}
