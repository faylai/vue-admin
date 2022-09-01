import AsyncValidator from 'async-validator'
import _ from 'lodash'

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {
  const valid_map = ['admin', 'editor']
  return valid_map.indexOf(str.trim()) >= 0
}

/**
 * validate email
 * @param email
 * @returns {boolean}
 */
export function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(email)
}

// rangeNumber --- 校验数字 支持 min max 参数
// params:numberType --- 数字类型 默认number 可选integer
AsyncValidator.register('rangeNumber', (rule, value, callback) => {
  if (_.isEmpty(value)) {
    callback()
    return
  }
  const _rule = { ...rule }
  delete _rule.validator
  _rule.type = rule.numberType || 'number'
  const validator = new AsyncValidator({ myRule: _rule })
  const model = { myRule: value }
  const number = parseFloat(value)
  if (value === number) {
    model.myRule = number
  }
  validator.validate(model, (errors, fields) => {
    if (errors) {
      callback(errors[0].message)
    } else {
      callback()
    }
  })
})

// 编辑表格验证
AsyncValidator.register('fieldGrid', (rule, value, callback) => {
  if (value && value.error) {
    const message = rule.gridMsg || translate('wms.tableFillErrorTip')
    callback(new Error(message))
  } else {
    if (rule.hasOwn('minRow') && rule.minRow >= 1) {
      if (value && value.all && value.all.filter(item => !validObjEmpty(item)).length < rule.minRow) {
        callback(new Error(rule.message || translate('wms.leastAddRowTip', [rule.minRow])))
      } else {
        callback()
      }
    } else {
      callback()
    }
  }

})
