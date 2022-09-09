import request from '@/utils/request'
import config from '@/api/config'

function getObjectValueByKey(key, obj) {
  const paths = key.split(/\./g)
  let currentObject = obj
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i]
    // eslint-disable-next-line no-prototype-builtins
    if (!currentObject.hasOwnProperty(path)) {
      currentObject = undefined
      break
    } else {
      currentObject = currentObject[path]
    }
  }
  return currentObject
}

export function requestByKey(key, params) {
  const requestConfig = getObjectValueByKey(key, config)
  if (requestConfig) {
    if (requestConfig.method.toLowerCase() === 'get') {
      return request({
        url: requestConfig.url,
        method: requestConfig.method,
        params: params
      })
    } else {
      return request({
        url: requestConfig.url,
        method: requestConfig.method,
        data: params
      })
    }
  } else {
    throw new Error(`接口key:${key}未定义配置!`)
  }
}

export default {
  requestByKey
}
