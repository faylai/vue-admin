import XEUtils from 'xe-utils'

function isEmptyValue(cellValue) {
  return cellValue === null || cellValue === undefined || cellValue === ''
}

function getModelProp(renderOpts) {
  return 'value'
}

function getModelEvent(renderOpts) {
  return 'input'
}

function getChangeEvent(renderOpts) {
  let type = 'change'
  switch (renderOpts.name) {
    case 'ElAutocomplete':
      type = 'select'
      break
    case 'ElInput':
    case 'ElInputNumber':
      type = 'input'
      break
  }
  return type
}

function parseDate(value, props) {
  return value && props.valueFormat ? XEUtils.toStringDate(value, props.valueFormat) : value
}

function getFormatDate(value, props, defaultFormat) {
  return XEUtils.toDateString(parseDate(value, props), props.format || defaultFormat)
}

function getFormatDates(values, props, separator, defaultFormat) {
  return XEUtils.map(values, (date) => getFormatDate(date, props, defaultFormat)).join(separator)
}

function equalDaterange(cellValue, data, props, defaultFormat) {
  cellValue = getFormatDate(cellValue, props, defaultFormat)
  return cellValue >= getFormatDate(data[0], props, defaultFormat) && cellValue <= getFormatDate(data[1], props, defaultFormat)
}

function getCellEditFilterProps(renderOpts, params, value, defaultProps) {
  const { vSize } = params.$table
  return XEUtils.assign(vSize ? { size: vSize } : {}, defaultProps, renderOpts.props, { [getModelProp(renderOpts)]: value })
}

function getItemProps(renderOpts, params, value, defaultProps) {
  const { vSize } = params.$form
  return XEUtils.assign(vSize ? { size: vSize } : {}, defaultProps, renderOpts.props, { [getModelProp(renderOpts)]: value })
}

function formatText(cellValue) {
  return '' + (isEmptyValue(cellValue) ? '' : cellValue)
}

function getCellLabelVNs(h, renderOpts, params, cellLabel) {
  const { placeholder } = renderOpts
  return [
    h('span', {
      class: 'vxe-cell--label'
    }, placeholder && isEmptyValue(cellLabel)
      ? [
        h('span', {
          class: 'vxe-cell--placeholder'
        }, formatText(placeholder))
      ]
      : formatText(cellLabel))
  ]
}

function getNativeOns(renderOpts, params) {
  const { nativeEvents } = renderOpts
  const nativeOns = {}
  XEUtils.objectEach(nativeEvents, (func, key) => {
    nativeOns[key] = function(...args) {
      func(params, ...args)
    }
  })
  return nativeOns
}

function getOns(renderOpts, params, inputFunc, changeFunc) {
  const { events } = renderOpts
  const modelEvent = getModelEvent(renderOpts)
  const changeEvent = getChangeEvent(renderOpts)
  const isSameEvent = changeEvent === modelEvent
  const ons = {}
  XEUtils.objectEach(events, (func, key) => {
    ons[key] = function(...args) {
      func(params, ...args)
    }
  })
  if (inputFunc) {
    ons[modelEvent] = function(targetEvnt) {
      inputFunc(targetEvnt)
      if (events && events[modelEvent]) {
        events[modelEvent](params, targetEvnt)
      }
      if (isSameEvent && changeFunc) {
        changeFunc(targetEvnt)
      }
    }
  }
  if (!isSameEvent && changeFunc) {
    ons[changeEvent] = function(...args) {
      changeFunc(...args)
      if (events && events[changeEvent]) {
        events[changeEvent](params, ...args)
      }
    }
  }
  return ons
}

function getEditOns(renderOpts, params) {
  const { $table, row, column } = params
  return getOns(renderOpts, params, (value) => {
    // 处理 model 值双向绑定
    XEUtils.set(row, column.property, value)
  }, () => {
    // 处理 change 事件相关逻辑
    $table.updateStatus(params)
  })
}

function getFilterOns(renderOpts, params, option, changeFunc) {
  return getOns(renderOpts, params, (value) => {
    // 处理 model 值双向绑定
    option.data = value
  }, changeFunc)
}

function getItemOns(renderOpts, params) {
  const { $form, data, property } = params
  return getOns(renderOpts, params, (value) => {
    // 处理 model 值双向绑定
    XEUtils.set(data, property, value)
  }, () => {
    // 处理 change 事件相关逻辑
    $form.updateStatus(params)
  })
}

function matchCascaderData(index, list, values, labels) {
  const val = values[index]
  if (list && values.length > index) {
    XEUtils.each(list, (item) => {
      if (item.value === val) {
        labels.push(item.label)
        matchCascaderData(++index, item.children, values, labels)
      }
    })
  }
}

function getSelectCellValue(renderOpts, params) {
  const { options = [], optionGroups, props = {}, optionProps = {}, optionGroupProps = {}} = renderOpts
  const { row, column } = params
  const $table = params.$table
  const labelProp = optionProps.label || 'label'
  const valueProp = optionProps.value || 'value'
  const groupOptions = optionGroupProps.options || 'options'
  const cellValue = XEUtils.get(row, column.property)
  const colid = column.id
  let rest
  let cellData
  if (props.filterable) {
    const fullAllDataRowMap = $table.fullAllDataRowMap
    const cacheCell = fullAllDataRowMap.has(row)
    if (cacheCell) {
      rest = fullAllDataRowMap.get(row)
      cellData = rest.cellData
      if (!cellData) {
        cellData = fullAllDataRowMap.get(row).cellData = {}
      }
    }
    if (rest && cellData[colid] && cellData[colid].value === cellValue) {
      return cellData[colid].label
    }
  }
  if (!isEmptyValue(cellValue)) {
    const selectlabel = XEUtils.map(props.multiple ? cellValue : [cellValue], optionGroups
      ? (value) => {
        let selectItem
        for (let index = 0; index < optionGroups.length; index++) {
          selectItem = XEUtils.find(optionGroups[index][groupOptions], (item) => item[valueProp] === value)
          if (selectItem) {
            break
          }
        }
        return selectItem ? selectItem[labelProp] : value
      }
      : (value) => {
        const selectItem = XEUtils.find(options, (item) => item[valueProp] === value)
        return selectItem ? selectItem[labelProp] : value
      }).join(', ')
    if (cellData && options && options.length) {
      cellData[colid] = { value: cellValue, label: selectlabel }
    }
    return selectlabel
  }
  return ''
}

function getCascaderCellValue(renderOpts, params) {
  const { props = {}} = renderOpts
  const { row, column } = params
  const cellValue = XEUtils.get(row, column.property)
  const values = cellValue || []
  const labels = []
  matchCascaderData(0, props.options, values, labels)
  return (props.showAllLevels === false ? labels.slice(labels.length - 1, labels.length) : labels).join(` ${props.separator || '/'} `)
}

function getDatePickerCellValue(renderOpts, params) {
  const { props = {}} = renderOpts
  const { row, column } = params
  const { rangeSeparator = '-' } = props
  let cellValue = XEUtils.get(row, column.property)
  switch (props.type) {
    case 'week':
      cellValue = getFormatDate(cellValue, props, 'yyyywWW')
      break
    case 'month':
      cellValue = getFormatDate(cellValue, props, 'yyyy-MM')
      break
    case 'year':
      cellValue = getFormatDate(cellValue, props, 'yyyy')
      break
    case 'dates':
      cellValue = getFormatDates(cellValue, props, ', ', 'yyyy-MM-dd')
      break
    case 'daterange':
      cellValue = getFormatDates(cellValue, props, ` ${rangeSeparator} `, 'yyyy-MM-dd')
      break
    case 'datetimerange':
      cellValue = getFormatDates(cellValue, props, ` ${rangeSeparator} `, 'yyyy-MM-dd HH:ss:mm')
      break
    case 'monthrange':
      cellValue = getFormatDates(cellValue, props, ` ${rangeSeparator} `, 'yyyy-MM')
      break
    default:
      cellValue = getFormatDate(cellValue, props, 'yyyy-MM-dd')
  }
  return cellValue
}

function getTimePickerCellValue(renderOpts, params) {
  const { props = {}} = renderOpts
  const { row, column } = params
  const { isRange, format = 'hh:mm:ss', rangeSeparator = '-' } = props
  let cellValue = XEUtils.get(row, column.property)
  if (cellValue && isRange) {
    cellValue = XEUtils.map(cellValue, (date) => XEUtils.toDateString(parseDate(date, props), format)).join(` ${rangeSeparator} `)
  }
  return XEUtils.toDateString(parseDate(cellValue, props), format)
}

function createEditRender(defaultProps) {
  return function(h, renderOpts, params) {
    const { row, column } = params
    const { attrs } = renderOpts
    const cellValue = XEUtils.get(row, column.property)
    return [
      h(renderOpts.name, {
        attrs,
        props: getCellEditFilterProps(renderOpts, params, cellValue, defaultProps),
        on: getEditOns(renderOpts, params),
        nativeOn: getNativeOns(renderOpts, params)
      })
    ]
  }
}

function defaultButtonEditRender(h, renderOpts, params) {
  const { attrs } = renderOpts
  return [
    h('el-button', {
      attrs,
      props: getCellEditFilterProps(renderOpts, params, null),
      on: getOns(renderOpts, params),
      nativeOn: getNativeOns(renderOpts, params)
    }, cellText(h, renderOpts.content))
  ]
}

function defaultButtonsEditRender(h, renderOpts, params) {
  return renderOpts.children.map((childRenderOpts) => defaultButtonEditRender(h, childRenderOpts, params)[0])
}

function createFilterRender(defaultProps) {
  return function(h, renderOpts, params) {
    const { column } = params
    const { name, attrs } = renderOpts
    const nativeOn = getNativeOns(renderOpts, params)
    return [
      h('div', {
        class: 'vxe-table--filter-element-wrapper'
      }, column.filters.map((option, oIndex) => {
        const optionValue = option.data
        return h(name, {
          key: oIndex,
          attrs,
          props: getCellEditFilterProps(renderOpts, params, optionValue, defaultProps),
          on: getFilterOns(renderOpts, params, option, () => {
            // 处理 change 事件相关逻辑
            handleConfirmFilter(params, !!option.data, option)
          }),
          nativeOn
        })
      }))
    ]
  }
}

function handleConfirmFilter(params, checked, option) {
  const { $panel } = params
  $panel.changeOption({}, checked, option)
}

/**
 * 模糊匹配
 * @param params
 */
function defaultFuzzyFilterMethod(params) {
  const { option, row, column } = params
  const { data } = option
  const cellValue = XEUtils.get(row, column.property)
  return XEUtils.toValueString(cellValue).indexOf(data) > -1
}

/**
 * 精确匹配
 * @param params
 */
function defaultExactFilterMethod(params) {
  const { option, row, column } = params
  const { data } = option
  const cellValue = XEUtils.get(row, column.property)
  /* eslint-disable eqeqeq */
  return cellValue === data
}

function renderOptions(h, options, optionProps) {
  const labelProp = optionProps.label || 'label'
  const valueProp = optionProps.value || 'value'
  return XEUtils.map(options, (item, oIndex) => {
    return h('el-option', {
      key: oIndex,
      props: {
        value: item[valueProp],
        label: item[labelProp],
        disabled: item.disabled
      }
    })
  })
}

function cellText(h, cellValue) {
  return [formatText(cellValue)]
}

function createFormItemRender(defaultProps) {
  return function(h, renderOpts, params) {
    const { data, property } = params
    const { name } = renderOpts
    const { attrs } = renderOpts
    const itemValue = XEUtils.get(data, property)
    return [
      h(name, {
        attrs,
        props: getItemProps(renderOpts, params, itemValue, defaultProps),
        on: getItemOns(renderOpts, params),
        nativeOn: getNativeOns(renderOpts, params)
      })
    ]
  }
}

function defaultButtonItemRender(h, renderOpts, params) {
  const { attrs } = renderOpts
  const props = getItemProps(renderOpts, params, null)
  return [
    h('el-button', {
      attrs,
      props,
      on: getOns(renderOpts, params),
      nativeOn: getNativeOns(renderOpts, params)
    }, cellText(h, renderOpts.content || props.content))
  ]
}

function defaultButtonsItemRender(h, renderOpts, params) {
  return renderOpts.children.map((childRenderOpts) => defaultButtonItemRender(h, childRenderOpts, params)[0])
}

function createExportMethod(getExportCellValue) {
  return function(params) {
    const { row, column, options } = params
    return options && options.original ? XEUtils.get(row, column.property) : getExportCellValue(column.editRender || column.cellRender, params)
  }
}

function createFormItemRadioAndCheckboxRender() {
  return function(h, renderOpts, params) {
    const { name, options = [], optionProps = {}, attrs } = renderOpts
    const { data, property } = params
    const labelProp = optionProps.label || 'label'
    const valueProp = optionProps.value || 'value'
    const itemValue = XEUtils.get(data, property)
    return [
      h(`${name}Group`, {
        attrs,
        props: getItemProps(renderOpts, params, itemValue),
        on: getItemOns(renderOpts, params),
        nativeOn: getNativeOns(renderOpts, params)
      }, options.map((option, oIndex) => {
        return h(name, {
          key: oIndex,
          props: {
            label: option[valueProp],
            disabled: option.disabled
          }
        }, option[labelProp])
      }))
    ]
  }
}

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
    getEventTargetNode(evnt, bodyElem, 'el-color-dropdown').flag) {
    return false
  }
}

/**
 * 基于 vxe-table 表格的适配插件，用于兼容 element-ui 组件库
 */
export const VXETablePluginElement = {
  install({ interceptor, renderer }) {
    renderer.mixin({
      ElAutocomplete: {
        autofocus: 'input.el-input__inner',
        renderDefault: createEditRender(),
        renderEdit: createEditRender(),
        renderFilter: createFilterRender(),
        defaultFilterMethod: defaultExactFilterMethod,
        renderItem: createFormItemRender(),
        renderItemContent: createFormItemRender()
      },
      ElInput: {
        autofocus: 'input.el-input__inner',
        renderDefault: createEditRender(),
        renderEdit: createEditRender(),
        renderFilter: createFilterRender(),
        defaultFilterMethod: defaultFuzzyFilterMethod,
        renderItem: createFormItemRender(),
        renderItemContent: createFormItemRender()
      },
      ElInputNumber: {
        autofocus: 'input.el-input__inner',
        renderDefault: createEditRender(),
        renderEdit: createEditRender(),
        renderFilter: createFilterRender(),
        defaultFilterMethod: defaultFuzzyFilterMethod,
        renderItem: createFormItemRender(),
        renderItemContent: createFormItemRender()
      },
      ElSelect: {
        renderEdit(h, renderOpts, params) {
          const { options = [], optionGroups, optionProps = {}, optionGroupProps = {}} = renderOpts
          const { row, column } = params
          const { attrs } = renderOpts
          const cellValue = XEUtils.get(row, column.property)
          const props = getCellEditFilterProps(renderOpts, params, cellValue)
          const on = getEditOns(renderOpts, params)
          const nativeOn = getNativeOns(renderOpts, params)
          if (optionGroups) {
            const groupOptions = optionGroupProps.options || 'options'
            const groupLabel = optionGroupProps.label || 'label'
            return [
              h('el-select', {
                attrs,
                props,
                on,
                nativeOn
              }, XEUtils.map(optionGroups, (group, gIndex) => {
                return h('el-option-group', {
                  key: gIndex,
                  props: {
                    label: group[groupLabel]
                  }
                }, renderOptions(h, group[groupOptions], optionProps))
              }))
            ]
          }
          return [
            h('el-select', {
              props,
              attrs,
              on,
              nativeOn
            }, renderOptions(h, options, optionProps))
          ]
        },
        renderCell(h, renderOpts, params) {
          return getCellLabelVNs(h, renderOpts, params, getSelectCellValue(renderOpts, params))
        },
        renderFilter(h, renderOpts, params) {
          const { options = [], optionGroups, optionProps = {}, optionGroupProps = {}} = renderOpts
          const groupOptions = optionGroupProps.options || 'options'
          const groupLabel = optionGroupProps.label || 'label'
          const { column } = params
          const { attrs } = renderOpts
          const nativeOn = getNativeOns(renderOpts, params)
          return [
            h('div', {
              class: 'vxe-table--filter-element-wrapper'
            }, optionGroups
              ? column.filters.map((option, oIndex) => {
                const optionValue = option.data
                const props = getCellEditFilterProps(renderOpts, params, optionValue)
                return h('el-select', {
                  key: oIndex,
                  attrs,
                  props,
                  on: getFilterOns(renderOpts, params, option, () => {
                    // 处理 change 事件相关逻辑
                    handleConfirmFilter(params, props.multiple ? (option.data && option.data.length > 0) : !XEUtils.eqNull(option.data), option)
                  }),
                  nativeOn
                }, XEUtils.map(optionGroups, (group, gIndex) => {
                  return h('el-option-group', {
                    key: gIndex,
                    props: {
                      label: group[groupLabel]
                    }
                  }, renderOptions(h, group[groupOptions], optionProps))
                }))
              })
              : column.filters.map((option, oIndex) => {
                const optionValue = option.data
                const props = getCellEditFilterProps(renderOpts, params, optionValue)
                return h('el-select', {
                  key: oIndex,
                  attrs,
                  props,
                  on: getFilterOns(renderOpts, params, option, () => {
                    // 处理 change 事件相关逻辑
                    handleConfirmFilter(params, props.multiple ? (option.data && option.data.length > 0) : !XEUtils.eqNull(option.data), option)
                  }),
                  nativeOn
                }, renderOptions(h, options, optionProps))
              }))
          ]
        },
        defaultFilterMethod(params) {
          const { option, row, column } = params
          const { data } = option
          const { property, filterRender: renderOpts } = column
          const { props = {}} = renderOpts
          const cellValue = XEUtils.get(row, property)
          if (props.multiple) {
            if (XEUtils.isArray(cellValue)) {
              return XEUtils.includeArrays(cellValue, data)
            }
            return data.indexOf(cellValue) > -1
          }
          /* eslint-disable eqeqeq */
          return cellValue == data
        },
        renderItem(h, renderOpts, params) {
          const { options = [], optionGroups, optionProps = {}, optionGroupProps = {}} = renderOpts
          const { data, property } = params
          const { attrs } = renderOpts
          const itemValue = XEUtils.get(data, property)
          const props = getItemProps(renderOpts, params, itemValue)
          const on = getItemOns(renderOpts, params)
          const nativeOn = getNativeOns(renderOpts, params)
          if (optionGroups) {
            const groupOptions = optionGroupProps.options || 'options'
            const groupLabel = optionGroupProps.label || 'label'
            return [
              h('el-select', {
                attrs,
                props,
                on,
                nativeOn
              }, XEUtils.map(optionGroups, (group, gIndex) => {
                return h('el-option-group', {
                  props: {
                    label: group[groupLabel]
                  },
                  key: gIndex
                }, renderOptions(h, group[groupOptions], optionProps))
              }))
            ]
          }
          return [
            h('el-select', {
              attrs,
              props,
              on,
              nativeOn
            }, renderOptions(h, options, optionProps))
          ]
        },
        renderItemContent(h, renderOpts, params) {
          const { options = [], optionGroups, optionProps = {}, optionGroupProps = {}} = renderOpts
          const { data, property } = params
          const { attrs } = renderOpts
          const itemValue = XEUtils.get(data, property)
          const props = getItemProps(renderOpts, params, itemValue)
          const on = getItemOns(renderOpts, params)
          const nativeOn = getNativeOns(renderOpts, params)
          if (optionGroups) {
            const groupOptions = optionGroupProps.options || 'options'
            const groupLabel = optionGroupProps.label || 'label'
            return [
              h('el-select', {
                attrs,
                props,
                on,
                nativeOn
              }, XEUtils.map(optionGroups, (group, gIndex) => {
                return h('el-option-group', {
                  props: {
                    label: group[groupLabel]
                  },
                  key: gIndex
                }, renderOptions(h, group[groupOptions], optionProps))
              }))
            ]
          }
          return [
            h('el-select', {
              attrs,
              props,
              on,
              nativeOn
            }, renderOptions(h, options, optionProps))
          ]
        },
        cellExportMethod: createExportMethod(getSelectCellValue),
        exportMethod: createExportMethod(getSelectCellValue)
      },
      ElCascader: {
        renderEdit: createEditRender(),
        renderCell(h, renderOpts, params) {
          return getCellLabelVNs(h, renderOpts, params, getCascaderCellValue(renderOpts, params))
        },
        renderItem: createFormItemRender(),
        renderItemContent: createFormItemRender(),
        cellExportMethod: createExportMethod(getCascaderCellValue),
        exportMethod: createExportMethod(getCascaderCellValue)
      },
      ElDatePicker: {
        renderEdit: createEditRender(),
        renderCell(h, renderOpts, params) {
          return getCellLabelVNs(h, renderOpts, params, getDatePickerCellValue(renderOpts, params))
        },
        renderFilter(h, renderOpts, params) {
          const { column } = params
          const { attrs } = renderOpts
          const nativeOn = getNativeOns(renderOpts, params)
          return [
            h('div', {
              class: 'vxe-table--filter-element-wrapper'
            }, column.filters.map((option, oIndex) => {
              const optionValue = option.data
              return h(renderOpts.name, {
                key: oIndex,
                attrs,
                props: getCellEditFilterProps(renderOpts, params, optionValue),
                on: getFilterOns(renderOpts, params, option, () => {
                  // 处理 change 事件相关逻辑
                  handleConfirmFilter(params, !!option.data, option)
                }),
                nativeOn
              })
            }))
          ]
        },
        defaultFilterMethod(params) {
          const { option, row, column } = params
          const { data } = option
          const { filterRender: renderOpts } = column
          const { props = {}} = renderOpts
          const cellValue = XEUtils.get(row, column.property)
          if (data) {
            switch (props.type) {
              case 'daterange':
                return equalDaterange(cellValue, data, props, 'yyyy-MM-dd')
              case 'datetimerange':
                return equalDaterange(cellValue, data, props, 'yyyy-MM-dd HH:ss:mm')
              case 'monthrange':
                return equalDaterange(cellValue, data, props, 'yyyy-MM')
              default:
                return cellValue === data
            }
          }
          return false
        },
        renderItem: createFormItemRender(),
        renderItemContent: createFormItemRender(),
        cellExportMethod: createExportMethod(getDatePickerCellValue),
        exportMethod: createExportMethod(getDatePickerCellValue)
      },
      ElTimePicker: {
        renderEdit: createEditRender(),
        renderCell(h, renderOpts, params) {
          return getCellLabelVNs(h, renderOpts, params, getTimePickerCellValue(renderOpts, params))
        },
        renderItem: createFormItemRender(),
        renderItemContent: createFormItemRender(),
        cellExportMethod: createExportMethod(getTimePickerCellValue),
        exportMethod: createExportMethod(getTimePickerCellValue)
      },
      ElTimeSelect: {
        renderEdit: createEditRender(),
        renderItem: createFormItemRender(),
        renderItemContent: createFormItemRender()
      },
      ElRate: {
        renderDefault: createEditRender(),
        renderEdit: createEditRender(),
        renderFilter: createFilterRender(),
        defaultFilterMethod: defaultExactFilterMethod,
        renderItem: createFormItemRender(),
        renderItemContent: createFormItemRender()
      },
      ElSwitch: {
        renderDefault: createEditRender(),
        renderEdit: createEditRender(),
        renderFilter(h, renderOpts, params) {
          const { column } = params
          const { name, attrs } = renderOpts
          const nativeOn = getNativeOns(renderOpts, params)
          return [
            h('div', {
              class: 'vxe-table--filter-element-wrapper'
            }, column.filters.map((option, oIndex) => {
              const optionValue = option.data
              return h(name, {
                key: oIndex,
                attrs,
                props: getCellEditFilterProps(renderOpts, params, optionValue),
                on: getFilterOns(renderOpts, params, option, () => {
                  // 处理 change 事件相关逻辑
                  handleConfirmFilter(params, XEUtils.isBoolean(option.data), option)
                }),
                nativeOn
              })
            }))
          ]
        },
        defaultFilterMethod: defaultExactFilterMethod,
        renderItem: createFormItemRender(),
        renderItemContent: createFormItemRender()
      },
      ElSlider: {
        renderDefault: createEditRender(),
        renderEdit: createEditRender(),
        renderFilter: createFilterRender(),
        defaultFilterMethod: defaultExactFilterMethod,
        renderItem: createFormItemRender(),
        renderItemContent: createFormItemRender()
      },
      ElRadio: {
        renderItem: createFormItemRadioAndCheckboxRender(),
        renderItemContent: createFormItemRadioAndCheckboxRender()
      },
      ElCheckbox: {
        renderItem: createFormItemRadioAndCheckboxRender(),
        renderItemContent: createFormItemRadioAndCheckboxRender()
      },
      ElButton: {
        renderDefault: defaultButtonEditRender,
        renderItem: defaultButtonItemRender,
        renderItemContent: defaultButtonItemRender
      },
      ElButtons: {
        renderDefault: defaultButtonsEditRender,
        renderItem: defaultButtonsItemRender,
        renderItemContent: defaultButtonsItemRender
      }
    })
    interceptor.add('event.clearFilter', handleClearEvent)
    interceptor.add('event.clearActived', handleClearEvent)
    interceptor.add('event.clearAreas', handleClearEvent)
  }
}
if (typeof window !== 'undefined' && window.VXETable && window.VXETable.use) {
  window.VXETable.use(VXETablePluginElement)
}
export default VXETablePluginElement
