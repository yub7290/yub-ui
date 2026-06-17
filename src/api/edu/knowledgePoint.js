import request from '@/utils/request'

export function getKnowledgePage(data) {
  return request.post('/edu/knowledge/point/page', data)
}

export function getKnowledgeDetail(id) {
  return request.get(`/edu/knowledge/point/${id}`)
}

export function createKnowledge(data) {
  return request.post('/edu/knowledge/point', data)
}

export function updateKnowledge(data) {
  return request.put('/edu/knowledge/point', data)
}

export function deleteKnowledge(id) {
  return request.delete(`/edu/knowledge/point/${id}`)
}

export function getKnowledgeListByCategory(categoryId) {
  return request.get(`/edu/knowledge/point/list-by-category/${categoryId}`)
}
