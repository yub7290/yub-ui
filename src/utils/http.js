import request from './request'

/**
 * 统一请求封装，供视图层直接调用。
 * 约定（与 views 中的调用方式保持一致）：
 *   http.get(url, params)    -> request.get(url, { params })
 *   http.post(url, data)     -> request.post(url, data)
 *   http.put(url, data)      -> request.put(url, data)
 *   http.delete(url, data)   -> request.delete(url, { data })
 * request 实例已内置 baseURL('/api')、token 注入与 401 刷新拦截。
 */
export const http = {
  get(url, params = {}) {
    return request.get(url, { params })
  },
  post(url, data = {}) {
    return request.post(url, data)
  },
  put(url, data = {}) {
    return request.put(url, data)
  },
  delete(url, data = {}) {
    return request.delete(url, { data })
  },
}

export default http
