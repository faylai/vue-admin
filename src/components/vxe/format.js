import XEUtils from 'xe-utils'

const EMPTYString = '-'
// 自定义全局的格式化处理函数
export default function init(VXETable) {
  VXETable.formats.mixin({
    formatLabelValue({ cellValue }, list) {
      const found = (list || []).find(item => item.value === cellValue)
      if (found) {
        return found.label || EMPTYString
      } else {
        return EMPTYString
      }
    },
    // 格式化下拉选项
    formatSelect({ cellValue }, list) {
      const item = list.find(item => item.value === cellValue)
      return item ? item.label : EMPTYString
    },
    // 格式化日期，默认 yyyy-MM-dd HH:mm:ss
    formatDate({ cellValue }, format) {
      return XEUtils.toDateString(cellValue, format || 'yyyy-MM-dd HH:mm:ss')
    },
    // 四舍五入金额，每隔3位逗号分隔，默认2位数
    formatAmount({ cellValue }, digits = 2) {
      return XEUtils.commafy(XEUtils.toNumber(cellValue), { digits })
    },
    // 格式化银行卡，默认每4位空格隔开
    formatBankcard({ cellValue }) {
      return XEUtils.commafy(XEUtils.toValueString(cellValue), { spaceNumber: 4, separator: ' ' })
    },
    // 四舍五入,默认两位数
    formatFixedNumber({ cellValue }, digits = 2) {
      return XEUtils.toFixed(XEUtils.round(cellValue, digits), digits)
    },
    // 向下舍入,默认两位数
    formatCutNumber({ cellValue }, digits = 2) {
      return XEUtils.toFixed(XEUtils.floor(cellValue, digits), digits)
    }
  })
}

