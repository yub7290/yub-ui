import request from '@/utils/request'

/**
 * 回收站 API
 */

// ========== 专业回收 ==========

export function getRecycleMajorList() {
  return request.get('/edu/recycle/major')
}

export function restoreMajor(id) {
  return request.put(`/edu/recycle/major/${id}/restore`)
}

export function deleteMajorRecycle(id) {
  return request.delete(`/edu/recycle/major/${id}`)
}

// ========== 课程回收 ==========

export function getRecycleCourseList() {
  return request.get('/edu/recycle/course')
}

export function restoreCourse(id) {
  return request.put(`/edu/recycle/course/${id}/restore`)
}

export function deleteCourseRecycle(id) {
  return request.delete(`/edu/recycle/course/${id}`)
}

// ========== 试题回收 ==========

export function getRecycleQuestionList() {
  return request.get('/edu/recycle/question')
}

export function restoreQuestion(id) {
  return request.put(`/edu/recycle/question/${id}/restore`)
}

export function deleteQuestionRecycle(id) {
  return request.delete(`/edu/recycle/question/${id}`)
}

// ========== 试卷回收 ==========

export function getRecycleExamList() {
  return request.get('/edu/recycle/exam')
}

export function restoreExam(id) {
  return request.put(`/edu/recycle/exam/${id}/restore`)
}

export function deleteExamRecycle(id) {
  return request.delete(`/edu/recycle/exam/${id}`)
}
