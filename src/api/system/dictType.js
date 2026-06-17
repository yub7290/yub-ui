import request from '@/utils/request'

/**
 * 分页查询字典类型列表
 */
export function getDictTypePage(data) {
  return request.post('/system/dict/type/page', data)
}

/**
 * 获取字典类型详情
 */
export function getDictTypeDetail(id) {
  return request.get(`/system/dict/type/${id}`)
}

/**
 * 新增字典类型
 */
export function createDictType(data) {
  return request.post('/system/dict/type', data)
}

/**
 * 编辑字典类型
 */
export function updateDictType(data) {
  return request.put('/system/dict/type', data)
}

/**
 * 删除字典类型
 */
export function deleteDictType(id) {
  return request.delete(`/system/dict/type/${id}`)
}

/**
 * 切换字典类型状态
 */
export function changeDictTypeStatus(id, status) {
  return request.put(`/system/dict/type/${id}/status`, { status })
}
