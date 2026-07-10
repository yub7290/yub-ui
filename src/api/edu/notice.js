import request from '@/utils/request'

export function getNoticePage(data) {
  return request.post('/edu/notice/page', data)
}

export function getNoticeDetail(id) {
  return request.get(`/edu/notice/${id}`)
}

export function getNoticeStats(id) {
  return request.get(`/edu/notice/${id}/stats`)
}

export function createNotice(data) {
  return request.post('/edu/notice', data)
}

export function updateNotice(data) {
  return request.put('/edu/notice', data)
}

export function deleteNotice(id) {
  return request.delete(`/edu/notice/${id}`)
}
