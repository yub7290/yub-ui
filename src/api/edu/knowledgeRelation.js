import request from '@/utils/request'

export function getRelationList(knowledgeId) {
  return request({
    url: `/edu/knowledge/relation/list/${knowledgeId}`,
    method: 'get'
  })
}

export function getAllRelations() {
  return request({
    url: '/edu/knowledge/relation/all',
    method: 'get'
  })
}

export function createRelation(data) {
  return request({
    url: '/edu/knowledge/relation',
    method: 'post',
    data
  })
}

export function updateRelation(data) {
  return request({
    url: '/edu/knowledge/relation',
    method: 'put',
    data
  })
}

export function deleteRelation(id) {
  return request({
    url: `/edu/knowledge/relation/${id}`,
    method: 'delete'
  })
}