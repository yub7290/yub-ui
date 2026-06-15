import request from '@/utils/request'

/**
 * 获取菜单树
 *
 * @param {object} params 查询参数 { name, status }
 * @returns {Promise}
 */
export function getMenuTree(params) {
  return request.get('/system/menu/tree', { params })
}

/**
 * 获取菜单详情
 *
 * @param {number} id 菜单ID
 * @returns {Promise}
 */
export function getMenuDetail(id) {
  return request.get(`/system/menu/${id}`)
}

/**
 * 新增菜单
 *
 * @param {object} data 菜单数据
 * @returns {Promise}
 */
export function createMenu(data) {
  return request.post('/system/menu', data)
}

/**
 * 编辑菜单
 *
 * @param {object} data 菜单数据
 * @returns {Promise}
 */
export function updateMenu(data) {
  return request.put('/system/menu', data)
}

/**
 * 删除菜单
 *
 * @param {number} id 菜单ID
 * @returns {Promise}
 */
export function deleteMenu(id) {
  return request.delete(`/system/menu/${id}`)
}

/**
 * 切换菜单状态
 *
 * @param {number} id 菜单ID
 * @param {number} status 状态（1=启用 0=禁用）
 * @returns {Promise}
 */
export function changeMenuStatus(id, status) {
  return request.put(`/system/menu/${id}/status`, { status })
}
