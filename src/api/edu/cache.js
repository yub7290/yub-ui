import request from '@/utils/request'

export function getCacheStats() {
  return request.get('/edu/cache/stats')
}

export function clearCache(prefix) {
  return request.delete('/edu/cache/clear', { params: { prefix } })
}

export function clearAllCache() {
  return request.delete('/edu/cache/clearAll')
}
