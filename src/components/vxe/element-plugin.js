/**
 * 检查触发源是否属于目标节点
 */
function getEventTargetNode(evnt, container, className) {
  let targetElem
  let target = evnt.target
  while (target && target.nodeType && target !== document) {
    if (className && target.className && target.className.split && target.className.split(' ').indexOf(className) > -1) {
      targetElem = target
    } else if (target === container) {
      return { flag: className ? !!targetElem : true, container, targetElem: targetElem }
    }
    target = target.parentNode
  }
  return { flag: false }
}

/**
 * 事件兼容性处理
 */
function handleClearEvent(params, e) {
  const bodyElem = document.body
  const evnt = params.$event || e
  if (
    // 远程搜索
    getEventTargetNode(evnt, bodyElem, 'el-autocomplete-suggestion').flag ||
    // 下拉框
    getEventTargetNode(evnt, bodyElem, 'el-select-dropdown').flag ||
    // 级联
    getEventTargetNode(evnt, bodyElem, 'el-cascader__dropdown').flag ||
    getEventTargetNode(evnt, bodyElem, 'el-cascader-menus').flag ||
    // 日期
    getEventTargetNode(evnt, bodyElem, 'el-time-panel').flag ||
    getEventTargetNode(evnt, bodyElem, 'el-picker-panel').flag ||
    // 颜色
    getEventTargetNode(evnt, bodyElem, 'el-color-dropdown').flag ||
    // el-dropdown-menu
    getEventTargetNode(evnt, bodyElem, 'el-dropdown-menu').flag
  ) {
    return false
  }
}

/**
 * 基于 vxe-table 表格的适配插件，用于兼容 element-ui 组件库
 */
export const VXETablePluginElement = {
  install({ interceptor, renderer }) {
    interceptor.add('event.clearFilter', handleClearEvent)
    interceptor.add('event.clearActived', handleClearEvent)
    interceptor.add('event.clearAreas', handleClearEvent)
  }
}

export default VXETablePluginElement
