import request from '@/utils/request'

export function getMessagePage(data) {
  return request.post('/edu/message/page', data)
}

export function deleteMessage(id) {
  return request.delete(`/edu/message/${id}`)
}
