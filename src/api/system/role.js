import request from '@/utils/request'

/**
 * 获取所有启用角色（下拉框用）
 *
 * @returns {Promise}
 */
export function getRoleOptions() {
  return request.get('/system/role/options')
}
