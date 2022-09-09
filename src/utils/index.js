import lodash from 'lodash'
import Vue from 'vue'

export const createScope = (function() {
  const stateMap = new WeakMap()
  return function(parentComponent, key, defaultScope) {
    // console.log('stateMap', key, stateMap)
    if (!stateMap.has(parentComponent)) {
      stateMap.set(parentComponent, new Map())
      parentComponent.$on('hook:beforeDestroy', function() {
        stateMap.delete(parentComponent)
        // console.log('delete stateMap', stateMap)
      })
    }
    const map = stateMap.get(parentComponent)
    if (!map.has(key)) {
      const state = Vue.observable(defaultScope)
      map.set(key, state)
    }
    return map.get(key)
  }
})()

// empty function
export function noop() {
}

/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0 || !time) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string')) {
      if ((/^[0-9]+$/.test(time))) {
        // support "1548221490638"
        time = parseInt(time)
      } else {
        // support safari
        // https://stackoverflow.com/questions/4310953/invalid-date-in-safari
        time = time.replace(new RegExp(/-/gm), '/')
      }
    }

    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    return value.toString().padStart(2, '0')
  })
  return time_str
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ')
  if (!search) {
    return {}
  }
  const obj = {}
  const searchArr = search.split('&')
  searchArr.forEach(v => {
    const index = v.indexOf('=')
    if (index !== -1) {
      const name = v.substring(0, index)
      const val = v.substring(index + 1, v.length)
      obj[name] = val
    }
  })
  return obj
}

export function isStringEmpty(str) {
  const fStr = String(str).trim()
  return fStr === '' || fStr === 'undefined' || fStr === 'null' || fStr === 'Infinity'
}

export function validObjEmpty(obj) {
  if (lodash.isEmpty(obj)) {
    return true
  } else {
    return lodash.reduce(lodash.keys(obj), function(key, mem) {
      return mem && isStringEmpty(obj[key])
    }, true)
  }
}

export function normalizeSlots(slots, context) {
  return Object.keys(slots).reduce(function(arr, key) {
    slots[key].forEach(function(vnode) {
      if (!vnode.context) {
        slots[key].context = context
      }
      if (!vnode.data) {
        vnode.data = {}
      }
      vnode.data.slot = key
    })
    return arr.concat(slots[key])
  }, [])
}

export function beforeFunction(targetFn, beforeFn) {
  targetFn = targetFn || noop()
  beforeFn = beforeFn || noop()
  return function() {
    const args = [].slice.call(arguments, 0)
    beforeFn.apply(this, args)
    targetFn.apply(this, args)
  }
}

export function afterFunction(targetFn, afterFn) {
  targetFn = targetFn || noop()
  afterFn = afterFn || noop()
  return function() {
    const args = [].slice.call(arguments, 0)
    targetFn.apply(this, args)
    afterFn.apply(this, args)
  }
}
