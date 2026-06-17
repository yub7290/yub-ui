import request from '@/utils/request'

export function getAnnouncementPage(data) {
  return request.post('/edu/announcement/page', data)
}

export function getAnnouncementDetail(id) {
  return request.get(`/edu/announcement/${id}`)
}

export function createAnnouncement(data) {
  return request.post('/edu/announcement', data)
}

export function updateAnnouncement(data) {
  return request.put('/edu/announcement', data)
}

export function deleteAnnouncement(id) {
  return request.delete(`/edu/announcement/${id}`)
}
