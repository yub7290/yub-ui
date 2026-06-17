import request from '@/utils/request'

export function getCategoryTree() {
  return request.get('/edu/knowledge/category/tree')
}

export function getCategoryDetail(id) {
  return request.get(`/edu/knowledge/category/${id}`)
}

export function createCategory(params) {
  return request.post('/edu/knowledge/category', null, { params })
}

export function updateCategory(id, params) {
  return request.put(`/edu/knowledge/category/${id}`, null, { params })
}

export function deleteCategory(id) {
  return request.delete(`/edu/knowledge/category/${id}`)
}
