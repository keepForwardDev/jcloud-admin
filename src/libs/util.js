import cookies from './util.cookies'
import db from './util.db'
import log from './util.log'
import {
  Message
} from 'element-ui'
const util = {
  cookies,
  db,
  log
}

/**
 * @description 更新标题
 * @param {String} title 标题
 */
util.title = function (titleText) {
  const processTitle = process.env.VUE_APP_TITLE || 'D2Admin'
  window.document.title = `${processTitle}${titleText ? ` | ${titleText}` : ''}`
}

/**
 * @description 打开新页面
 * @param {String} url 地址
 */
util.open = function (url) {
  var a = document.createElement('a')
  a.setAttribute('href', url)
  a.setAttribute('target', '_blank')
  a.setAttribute('id', 'd2admin-link-temp')
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(document.getElementById('d2admin-link-temp'))
}

/**
 * 描述 校验文件个数
 * @author luoyong
 * @date 2021-09-14
 * @param {Array} fileList 文件列表
 * @param {Number} limit 最大个数
 * @returns {Promise}
 */
export function validFileLimit (fileList, limit = 1) {
  if (fileList.length > limit) {
    Message.warning(`一次只能上传${limit}个文件！`)
    return Promise.reject(Error(`一次只能上传${limit}个文件！`))
  } else {
    return Promise.resolve(`校验文件个数通过~`)
  }
}

/**
 * 描述 校验文件大小
 * @author luoyong
 * @date 2021-09-14
 * @param {Array} fileList 文件列表
 * @param {Number} sizeLimit=2 最大容量
 * @returns {Promise}
 */
export function validFileSize (fileList, sizeLimit = 2) {
  const validList = fileList.map((file) => {
    if (file.size / 1024 / 1024 > sizeLimit) {
      Message.warning(`文件大小不得超过${sizeLimit}M！`)
      return Promise.reject(Error(`文件大小不得超过${sizeLimit}M`))
    } else {
      return Promise.resolve(`校验文件大小通过~`)
    }
  })
  return Promise.all(validList)
}

/**
 * 描述 校验文件类型
 * @author luoyong
 * @date 2021-09-16
 * @param {Array} fileList 文件列表
 * @param {Array} typelist 类型列表
 * @returns {Promise}
 */
export function validFileType (fileList, typelist) {
  const validList = fileList.map((file) => {
    const index = file.name.lastIndexOf('.')
    const ext = file.name.slice(index + 1).toLowerCase()
    if (typelist.includes(ext)) {
      return Promise.resolve(`校验文件类型通过~`)
    } else {
      Message.warning(`文件类型限制为${typelist.join(',')}`)
      return Promise.reject(Error(`文件类型限制为${typelist.join(',')}`))
    }
  })
  return Promise.all(validList)
}

export default util
