import request from '@/utils/request'

export function getPricePlanList(courseId) {
  return request.get(`/edu/course/price-plan/list/${courseId}`)
}

export function createPricePlan(data) {
  return request.post('/edu/course/price-plan', data)
}

export function updatePricePlan(data) {
  return request.put('/edu/course/price-plan', data)
}

export function deletePricePlan(id) {
  return request.delete(`/edu/course/price-plan/${id}`)
}
