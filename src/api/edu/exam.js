import request from '@/utils/request'

export function getExamPage(data) {
  return request.post('/edu/exam/page', data)
}

export function getExamDetail(id) {
  return request.get(`/edu/exam/${id}`)
}

export function createExam(data) {
  return request.post('/edu/exam', data)
}

export function updateExam(data) {
  return request.put('/edu/exam', data)
}

export function deleteExam(id) {
  return request.delete(`/edu/exam/${id}`)
}

export function changeExamStatus(id, status) {
  return request.put(`/edu/exam/${id}/status`, { status })
}
