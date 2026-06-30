import request from '@/utils/request'

/**
 * 获取课程章节树
 *
 * @param {number} courseId 课程ID
 * @returns {Promise}
 */
export function getChapterTree(courseId) {
  return request.get(`/edu/chapter/tree/${courseId}`)
}

/**
 * 获取章节详情
 *
 * @param {number} id 章节ID
 * @returns {Promise}
 */
export function getChapterDetail(id) {
  return request.get(`/edu/chapter/${id}`)
}

/**
 * 新增章节
 *
 * @param {object} data 章节数据
 * @returns {Promise}
 */
export function createChapter(data) {
  return request.post('/edu/chapter', data)
}

/**
 * 编辑章节
 *
 * @param {object} data 章节数据
 * @returns {Promise}
 */
export function updateChapter(data) {
  return request.put('/edu/chapter', data)
}

/**
 * 删除章节
 *
 * @param {number} id 章节ID
 * @returns {Promise}
 */
export function deleteChapter(id) {
  return request.delete(`/edu/chapter/${id}`)
}

/**
 * 获取章节已关联知识点 ID 列表
 *
 * @param {number} id 章节ID
 * @returns {Promise}
 */
export function getChapterKnowledgeIds(id) {
  return request.get(`/edu/chapter/${id}/knowledge`)
}

/**
 * 保存章节关联知识点
 *
 * @param {number} id 章节ID
 * @param {number[]} data 知识点ID数组
 * @returns {Promise}
 */
export function saveChapterKnowledge(id, data) {
  return request.put(`/edu/chapter/${id}/knowledge`, data)
}
