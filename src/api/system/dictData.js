import request from '@/utils/request'

/**
 * 分页查询字典数据列表
 */
export function getDictDataPage(data) {
  return request.post('/system/dict/data/page', data)
}

/**
 * 获取字典数据详情
 */
export function getDictDataDetail(id) {
  return request.get(`/system/dict/data/${id}`)
}

/**
 * 新增字典数据
 */
export function createDictData(data) {
  return request.post('/system/dict/data', data)
}

/**
 * 编辑字典数据
 */
export function updateDictData(data) {
  return request.put('/system/dict/data', data)
}

/**
 * 删除字典数据
 */
export function deleteDictData(id) {
  return request.delete(`/system/dict/data/${id}`)
}

/**
 * 根据字典类型编码获取字典选项列表
 */
export function getDictOptions(code) {
  return request.get(`/system/dict/data/options/${code}`)
}
