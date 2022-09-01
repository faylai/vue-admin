import request from '@/utils/request'
import config from '@/api/config'

function getObjectValueByKey(key, obj) {
  const paths = key.split(/\./g)
  let currentObject = obj
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i]
    if (!currentObject.hasOwn(path)) {
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
    return request({
      url: requestConfig.url,
      method: requestConfig.method,
      params: params
    })
  } else {
    throw new Error(`接口key:${key}未定义配置!`)
  }
}

export default {
  requestByKey
}
