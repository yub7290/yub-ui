import request from '@/utils/request'
import { getAccessToken } from '@/utils/auth'

import { ElMessage } from 'element-plus'

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
  return request.post('/edu/upload/image', formData)
}

/**
 * 上传附件（通用文件，走后端中转）
 *
 * @param {File} file 文件对象
 * @param {string} directory 存储目录
 * @param {Function} onProgress 进度回调 (percent: number)
 * @returns {Promise<string>} 文件URL
 */
export function uploadFile(file, directory = 'edu/chapter/attachments', onProgress) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('directory', directory)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/edu/upload/file')
    xhr.timeout = 600000

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress?.(Math.round((e.loaded * 100) / e.total))
      }
    }

    xhr.onload = () => {
      try {
        const res = JSON.parse(xhr.responseText)
        if (res.code === 200) {
          resolve({ code: 200, data: res.data })
        } else {
          ElMessage.error(res.message || '文件上传失败')
          reject(new Error(res.message))
        }
      } catch {
        ElMessage.error('文件上传失败')
        reject(new Error('上传响应解析失败'))
      }
    }

    xhr.onerror = () => {
      ElMessage.error('网络错误，文件上传失败')
      reject(new Error('网络错误'))
    }
    xhr.ontimeout = () => {
      ElMessage.error('上传超时，请检查网络后重试')
      reject(new Error('上传超时'))
    }

    const token = getAccessToken()
    if (token) {
      xhr.setRequestHeader('Authorization', 'Bearer ' + token)
    }
    xhr.send(formData)
  })
}

/**
 * 上传视频到七牛云（浏览器直传，跳过后端中转）
 * 1. 从后端获取七牛云上传凭证
 * 2. 浏览器直传文件到七牛云 upload.qiniup.com
 * 3. 避免服务器带宽瓶颈，上传速度取决于用户网速
 *
 * @param {File} file 文件对象
 * @param {string} directory 存储目录
 * @param {Function} onProgress 进度回调 (percent: number)
 * @returns {Promise<string>} 视频URL
 */
export async function uploadVideo(file, directory = 'edu/videos', onProgress) {
  // 1. 从后端获取上传凭证
  const ext = file.name.split('.').pop() || 'mp4'
  const tokenRes = await request.get('/edu/upload/qiniu-token', {
    params: { directory, ext }
  })
  const { token, key, domain, uploadUrl } = tokenRes.data

  // 2. 浏览器直传七牛云
  const formData = new FormData()
  formData.append('file', file)
  formData.append('token', token)
  formData.append('key', key)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', uploadUrl)
    xhr.timeout = 600000

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress?.(Math.round((e.loaded * 100) / e.total))
      }
    }

    xhr.onload = () => {
      try {
        if (xhr.status === 200) {
          resolve({ code: 200, data: domain + '/' + key })
        } else {
          const err = JSON.parse(xhr.responseText)
          ElMessage.error(err.error || '视频上传失败')
          reject(new Error(err.error))
        }
      } catch {
        ElMessage.error('视频上传失败')
        reject(new Error('上传响应解析失败'))
      }
    }

    xhr.onerror = () => {
      ElMessage.error('网络错误，视频上传失败')
      reject(new Error('网络错误'))
    }
    xhr.ontimeout = () => {
      ElMessage.error('上传超时，请检查网络后重试')
      reject(new Error('上传超时'))
    }

    xhr.send(formData)
  })
}
