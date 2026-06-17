import request from '@/utils/request'

/**
 * 上传图片到七牛云（回退到本地存储）
 *
 * @param {File} file 文件对象
 * @param {string} directory 存储目录
 * @returns {Promise<string>} 图片URL
 */
export function uploadImage(file, directory = 'edu/images') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('directory', directory)
  // 不手动设置 Content-Type，让浏览器自动添加 multipart boundary
  return request.post('/edu/upload/image', formData)
}
