import request from '@/utils/request'

export function getNewsPage(data) {
  return request.post('/edu/news/page', data)
}

export function getNewsDetail(id) {
  return request.get(`/edu/news/${id}`)
}

export function createNews(data) {
  return request.post('/edu/news', data)
}

export function updateNews(data) {
  return request.put('/edu/news', data)
}

export function deleteNews(id) {
  return request.delete(`/edu/news/${id}`)
}

export function getNewsCategoryList() {
  return request.get('/edu/news/category/list')
}

export function createNewsCategory(data) {
  return request.post('/edu/news/category', data)
}

export function updateNewsCategory(data) {
  return request.put('/edu/news/category', data)
}

export function deleteNewsCategory(id) {
  return request.delete(`/edu/news/category/${id}`)
}
