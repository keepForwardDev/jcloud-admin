import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import store from '@/store/index'
import router from '@/router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 请求超时时间，10s
const requestTimeOut = 30 * 10000000
const success = 200
// 提示信息显示时长
const messageDuration = 5 * 1000

// 系统全局请求对象
const service = axios.create({
  baseURL: process.env.VUE_APP_API,
  timeout: requestTimeOut,
  responseType: 'json',
  validateStatus (status) {
    return status === success
  }
})

service.interceptors.request.use(
  config => {
    const _config = config
    try {
      _config.headers['x-requested-with'] = 'XMLHttpRequest' // 全部设置为ajax请求
    } catch (e) {
      console.error(e)
    }
    return _config
  },
  error => {
    console.log(error)
    return Promise.reject(error)
  }
)

// HTTPresponse拦截
service.interceptors.response.use(res => {
  const status = Number(res.status) || 200
  const message = res.data === undefined ? '请求失败' : res.data.msg
  const code = res.data === undefined ? '' : res.data.code
  if (status !== 200) {
    Message({
      message: message,
      type: 'error'
    })
    return
  }
  if (code === 0) { // 登录
    if (!store.state.d2admin.setting.openUnLoginBox) {
      store.state.d2admin.setting.openUnLoginBox = true
      MessageBox.alert('请重新登录后操作', '温馨提示', {
        confirmButtonText: '确定',
        showClose: false,
        callback: action => {
          store.state.d2admin.setting.openUnLoginBox = false
          router.push('/login')
        }
      })
    }
    return res.data
  }
  return res.data
}, error => {
  if (error.response) {
    const errorMessage = error.response.data === null ? '系统内部异常，请联系网站管理员' : error.response.data.msg
    switch (error.response.status) {
      case 404:
        Message({
          message: '很抱歉，资源未找到',
          type: 'error',
          duration: messageDuration
        })
        break
      case 403:
        Message({
          message: '很抱歉，您暂无该操作权限',
          type: 'error',
          duration: messageDuration
        })
        break
      case 401:
        Message({
          message: '很抱歉，认证已失效，请重新登录',
          type: 'error',
          duration: messageDuration
        })
        break
      default:
        if (errorMessage === 'refresh token无效') {
          MessageBox.alert('登录已过期，请重新登录', '温馨提示', {
            confirmButtonText: '确定',
            showClose: false,
            callback: action => {
              router.push('/login')
            }
          })
        } else {
          Message({
            message: errorMessage,
            type: 'error',
            duration: messageDuration
          })
        }
        break
    }
  }
  return Promise.reject(error)
})

const request = {
  login (url, params) {
    var url = url + '?' + tansParams(params)
    return service.post(url, params, {
      transformRequest: [(params) => {
        return tansParams(params)
      }]
    })
  },
  post (url, params, header) {
    const config = {
      transformRequest: [(params) => {
        return tansParams(params)
      }],
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
    if (header) {
      config.headers = Object.assign({}, config.headers, header)
    }
    return service.post(url, params, config)
  },
  postJson (url, params) {
    return service.post(url, params)
  },
  putJson (url, params) {
    return service.put(url, params)
  },
  put (url, params) {
    return service.put(url, params, {
      transformRequest: [(params) => {
        return tansParams(params)
      }],
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  },
  get (url, params) {
    let _params
    if (Object.is(params, undefined)) {
      _params = ''
    } else {
      _params = '?'
      for (const key in params) {
        // eslint-disable-next-line no-prototype-builtins
        if (params.hasOwnProperty(key) && params[key] !== null) {
          _params += `${key}=${params[key]}&`
        }
      }
    }
    return service.get(`${url}${_params}`)
  },
  delete (url, params) {
    let _params
    if (Object.is(params, undefined)) {
      _params = ''
    } else {
      _params = '?'
      for (const key in params) {
        // eslint-disable-next-line no-prototype-builtins
        if (params.hasOwnProperty(key) && params[key] !== null) {
          _params += `${key}=${params[key]}&`
        }
      }
    }
    return service.delete(`${url}${_params}`)
  },
  downloadByGet (url, params, filename) {
    var headersParam = {}
    // if(getExpireTime){
    //     headersParam['Authorization']='Bearer ' + getToken();
    // }
    if (!filename) {
      const index = url.lastIndexOf('\/')
      filename = url.substring(index + 1, url.length)
    }
    NProgress.start()
    return service.get(url, params, {
      transformRequest: [(params) => {
        return tansParams(params)
      }],
      responseType: 'blob',
      headers: headersParam
    }).then((r) => {
      const content = r.data
      const blob = new Blob([content])
      if ('download' in document.createElement('a')) {
        const elink = document.createElement('a')
        elink.download = filename
        elink.style.display = 'none'
        elink.href = URL.createObjectURL(blob)
        document.body.appendChild(elink)
        elink.click()
        URL.revokeObjectURL(elink.href)
        document.body.removeChild(elink)
      } else {
        navigator.msSaveBlob(blob, filename)
      }
      NProgress.done()
    }).catch((r) => {
      console.error(r)
      NProgress.done()
      Message({
        message: '下载失败',
        type: 'error',
        duration: messageDuration
      })
    })
  },
  download (url, params, filename) {
    NProgress.start()
    return service.post(url, params, {
      transformRequest: [(params) => {
        return tansParams(params)
      }],
      responseType: 'blob'
    }).then((r) => {
      const content = r.data
      const blob = new Blob([content])
      if ('download' in document.createElement('a')) {
        const elink = document.createElement('a')
        elink.download = filename
        elink.style.display = 'none'
        elink.href = URL.createObjectURL(blob)
        document.body.appendChild(elink)
        elink.click()
        URL.revokeObjectURL(elink.href)
        document.body.removeChild(elink)
      } else {
        navigator.msSaveBlob(blob, filename)
      }
      NProgress.done()
    }).catch((r) => {
      console.error(r)
      NProgress.done()
      Message({
        message: '下载失败',
        type: 'error',
        duration: messageDuration
      })
    })
  },
  downloadGet (url, params, filename) {
    NProgress.start()
    return service.get(url, params, {
      transformRequest: [(params) => {
        return tansParams(params)
      }],
      responseType: 'blob'
    }).then((r) => {
      const content = r.data
      const blob = new Blob([content])
      if ('download' in document.createElement('a')) {
        const elink = document.createElement('a')
        elink.download = filename
        elink.style.display = 'none'
        elink.href = URL.createObjectURL(blob)
        document.body.appendChild(elink)
        elink.click()
        URL.revokeObjectURL(elink.href)
        document.body.removeChild(elink)
      } else {
        navigator.msSaveBlob(blob, filename)
      }
      NProgress.done()
    }).catch((r) => {
      console.error(r)
      NProgress.done()
      Message({
        message: '下载失败',
        type: 'error',
        duration: messageDuration
      })
    })
  },
  upload (url, params) {
    return service.post(url, params, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

function tansParams (params) {
  let result = ''
  Object.keys(params).forEach((key) => {
    if (!Object.is(params[key], undefined) && !Object.is(params[key], null)) {
      result += encodeURIComponent(key) + '=' + encodeURIComponent(params[key]) + '&'
    }
  })
  return result
}
export default request
