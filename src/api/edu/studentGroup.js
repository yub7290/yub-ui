import request from '@/utils/request'

/**
 * 分页查询学员组列表
 *
 * @param {object} data 查询条件+分页参数
 * @returns {Promise}
 */
export function getStudentGroupPage(data) {
  return request.post('/edu/student-group/page', data)
}

/**
 * 获取学员组详情
 *
 * @param {number} id 学员组ID
 * @returns {Promise}
 */
export function getStudentGroupDetail(id) {
  return request.get(`/edu/student-group/${id}`)
}

/**
 * 新增学员组
 *
 * @param {object} data 学员组信息
 * @returns {Promise}
 */
export function createStudentGroup(data) {
  return request.post('/edu/student-group', data)
}

/**
 * 编辑学员组
 *
 * @param {object} data 学员组信息
 * @returns {Promise}
 */
export function updateStudentGroup(data) {
  return request.put('/edu/student-group', data)
}

/**
 * 删除学员组
 *
 * @param {number} id 学员组ID
 * @returns {Promise}
 */
export function deleteStudentGroup(id) {
  return request.delete(`/edu/student-group/${id}`)
}

/**
 * 切换学员组状态
 *
 * @param {number} id 学员组ID
 * @param {number} status 1=启用 0=禁用
 * @returns {Promise}
 */
export function changeStudentGroupStatus(id, status) {
  return request.put(`/edu/student-group/${id}/status`, { status })
}

/**
 * 为学员组添加课程
 *
 * @param {number} id 学员组ID
 * @param {Array} courses 课程列表 [{courseId, sortOrder}]
 * @returns {Promise}
 */
export function addCourses(id, courses) {
  return request.post(`/edu/student-group/${id}/courses`, courses)
}

/**
 * 移除学员组课程
 *
 * @param {number} id 学员组ID
 * @param {Array} courseIds 课程ID列表
 * @returns {Promise}
 */
export function removeCourses(id, courseIds) {
  return request.delete(`/edu/student-group/${id}/courses`, { data: courseIds })
}

/**
 * 为学员组添加学员
 *
 * @param {number} id 学员组ID
 * @param {Array} members 学员列表 [{studentId}]
 * @returns {Promise}
 */
export function addMembers(id, members) {
  return request.post(`/edu/student-group/${id}/members`, members)
}

/**
 * 移除学员组学员
 *
 * @param {number} id 学员组ID
 * @param {Array} studentIds 学员ID列表
 * @returns {Promise}
 */
export function removeMembers(id, studentIds) {
  return request.delete(`/edu/student-group/${id}/members`, { data: studentIds })
}

/**
 * 学员组课程排序
 *
 * @param {number} id 学员组ID
 * @param {Array} courseIds 按新顺序排列的课程ID列表
 * @returns {Promise}
 */
export function sortCourses(id, courseIds) {
  return request.put(`/edu/student-group/${id}/courses/sort`, courseIds)
}
