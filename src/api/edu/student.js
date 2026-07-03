import request from '@/utils/request'

/**
 * 分页查询学员列表
 *
 * @param {object} data 查询条件+分页参数
 * @returns {Promise}
 */
export function getStudentPage(data) {
  return request.post('/edu/student/page', data)
}

/**
 * 获取学员详情
 *
 * @param {number} id 学员ID
 * @returns {Promise}
 */
export function getStudentDetail(id) {
  return request.get(`/edu/student/${id}`)
}

/**
 * 新增学员
 *
 * @param {object} data 学员信息
 * @returns {Promise}
 */
export function createStudent(data) {
  return request.post('/edu/student', data)
}

/**
 * 编辑学员
 *
 * @param {object} data 学员信息
 * @returns {Promise}
 */
export function updateStudent(data) {
  return request.put('/edu/student', data)
}

/**
 * 删除学员
 *
 * @param {number} id 学员ID
 * @returns {Promise}
 */
export function deleteStudent(id) {
  return request.delete(`/edu/student/${id}`)
}

/**
 * 批量删除学员
 *
 * @param {number[]} ids 学员ID列表
 * @returns {Promise}
 */
export function deleteStudentBatch(ids) {
  return request.delete('/edu/student/batch', { data: ids })
}

/**
 * 切换学员状态
 *
 * @param {number} id 学员ID
 * @param {number} status 1=启用 0=禁用
 * @returns {Promise}
 */
export function changeStudentStatus(id, status) {
  return request.put(`/edu/student/${id}/status`, { status })
}

/**
 * 批量禁用学员
 *
 * @param {number[]} ids 学员ID列表
 * @returns {Promise}
 */
export function batchDisableStudents(ids) {
  return request.put('/edu/student/batch-disable', ids)
}

/**
 * 重置学员密码
 *
 * @param {number} id 学员ID
 * @returns {Promise}
 */
export function resetStudentPassword(id) {
  return request.put(`/edu/student/${id}/reset-password`)
}

export function getStudentGrowthHome(id) {
  return request.get(`/edu/student/${id}/growth/home`)
}

export function getStudentGrowthWeekReports(id) {
  return request.get(`/edu/student/${id}/growth/week-reports`)
}

export function getStudentGrowthSubjects(id) {
  return request.get(`/edu/student/${id}/growth/subjects`)
}

export function getStudentGrowthSubjectGraph(id, subject) {
  return request.get(`/edu/student/${id}/growth/subject-graph`, { params: { subject } })
}

export function getStudentGrowthWeekPlan(id, weekIndex = 0) {
  return request.get(`/edu/student/${id}/growth/week-plan`, { params: { weekIndex } })
}
