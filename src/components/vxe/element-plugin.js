import _xeUtils from 'xe-utils'

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true })
  } else {
    obj[key] = value
  }
  return obj
}

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
  var type = 'change'
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
  return value && props.valueFormat ? _xeUtils['default'].toStringDate(value, props.valueFormat) : value
}

function getFormatDate(value, props, defaultFormat) {
  return _xeUtils['default'].toDateString(parseDate(value, props), props.format || defaultFormat)
}

function getFormatDates(values, props, separator, defaultFormat) {
  return _xeUtils['default'].map(values, function(date) {
    return getFormatDate(date, props, defaultFormat)
  }).join(separator)
}

function equalDaterange(cellValue, data, props, defaultFormat) {
  cellValue = getFormatDate(cellValue, props, defaultFormat)
  return cellValue >= getFormatDate(data[0], props, defaultFormat) && cellValue <= getFormatDate(data[1], props, defaultFormat)
}

function getCellEditFilterProps(renderOpts, params, value, defaultProps) {
  var vSize = params.$table.vSize
  return _xeUtils['default'].assign(vSize ? {
    size: vSize
  } : {}, defaultProps, renderOpts.props, _defineProperty({}, getModelProp(renderOpts), value))
}

function getItemProps(renderOpts, params, value, defaultProps) {
  var vSize = params.$form.vSize
  return _xeUtils['default'].assign(vSize ? {
    size: vSize
  } : {}, defaultProps, renderOpts.props, _defineProperty({}, getModelProp(renderOpts), value))
}

function formatText(cellValue) {
  return '' + (isEmptyValue(cellValue) ? '' : cellValue)
}

function getCellLabelVNs(h, renderOpts, params, cellLabel) {
  var placeholder = renderOpts.placeholder
  return [h('span', {
    'class': 'vxe-cell--label'
  }, placeholder && isEmptyValue(cellLabel) ? [h('span', {
    'class': 'vxe-cell--placeholder'
  }, formatText(placeholder))] : formatText(cellLabel))]
}

function getNativeOns(renderOpts, params) {
  var nativeEvents = renderOpts.nativeEvents
  var nativeOns = {}
  _xeUtils['default'].objectEach(nativeEvents, function(func, key) {
    nativeOns[key] = function() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key]
      }
      func.apply(void 0, [params].concat(args))
    }
  })
  return nativeOns
}

function getOns(renderOpts, params, inputFunc, changeFunc) {
  var events = renderOpts.events
  var modelEvent = getModelEvent(renderOpts)
  var changeEvent = getChangeEvent(renderOpts)
  var isSameEvent = changeEvent === modelEvent
  var ons = {}
  _xeUtils['default'].objectEach(events, function(func, key) {
    ons[key] = function() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2]
      }
      func.apply(void 0, [params].concat(args))
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
    ons[changeEvent] = function() {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3]
      }
      changeFunc.apply(void 0, args)
      if (events && events[changeEvent]) {
        events[changeEvent].apply(events, [params].concat(args))
      }
    }
  }
  return ons
}

function getEditOns(renderOpts, params) {
  var $table = params.$table
  var row = params.row
  var column = params.column
  return getOns(renderOpts, params, function(value) {
    // 处理 model 值双向绑定
    _xeUtils['default'].set(row, column.property, value)
  }, function() {
    // 处理 change 事件相关逻辑
    $table.updateStatus(params)
  })
}

function getFilterOns(renderOpts, params, option, changeFunc) {
  return getOns(renderOpts, params, function(value) {
    // 处理 model 值双向绑定
    option.data = value
  }, changeFunc)
}

function getItemOns(renderOpts, params) {
  var $form = params.$form
  var data = params.data
  var property = params.property
  return getOns(renderOpts, params, function(value) {
    // 处理 model 值双向绑定
    _xeUtils['default'].set(data, property, value)
  }, function() {
    // 处理 change 事件相关逻辑
    $form.updateStatus(params)
  })
}

function matchCascaderData(index, list, values, labels) {
  var val = values[index]
  if (list && values.length > index) {
    _xeUtils['default'].each(list, function(item) {
      if (item.value === val) {
        labels.push(item.label)
        matchCascaderData(++index, item.children, values, labels)
      }
    })
  }
}

function getSelectCellValue(renderOpts, params) {
  var _renderOpts$options = renderOpts.options
  var options = _renderOpts$options === void 0 ? [] : _renderOpts$options
  var optionGroups = renderOpts.optionGroups
  var _renderOpts$props = renderOpts.props
  var props = _renderOpts$props === void 0 ? {} : _renderOpts$props
  var _renderOpts$optionPro = renderOpts.optionProps
  var optionProps = _renderOpts$optionPro === void 0 ? {} : _renderOpts$optionPro
  var _renderOpts$optionGro = renderOpts.optionGroupProps
  var optionGroupProps = _renderOpts$optionGro === void 0 ? {} : _renderOpts$optionGro
  var row = params.row
  var column = params.column
  var $table = params.$table
  var labelProp = optionProps.label || 'label'
  var valueProp = optionProps.value || 'value'
  var groupOptions = optionGroupProps.options || 'options'
  var cellValue = _xeUtils['default'].get(row, column.property)
  var colid = column.id
  var rest
  var cellData
  if (props.filterable) {
    var fullAllDataRowMap = $table.fullAllDataRowMap
    var cacheCell = fullAllDataRowMap.has(row)
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
    var selectlabel = _xeUtils['default'].map(props.multiple ? cellValue : [cellValue], optionGroups ? function(value) {
      var selectItem
      for (var index = 0; index < optionGroups.length; index++) {
        selectItem = _xeUtils['default'].find(optionGroups[index][groupOptions], function(item) {
          return item[valueProp] === value
        })
        if (selectItem) {
          break
        }
      }
      return selectItem ? selectItem[labelProp] : value
    } : function(value) {
      var selectItem = _xeUtils['default'].find(options, function(item) {
        return item[valueProp] === value
      })
      return selectItem ? selectItem[labelProp] : value
    }).join(', ')
    if (cellData && options && options.length) {
      cellData[colid] = {
        value: cellValue,
        label: selectlabel
      }
    }
    return selectlabel
  }
  return ''
}

function getCascaderCellValue(renderOpts, params) {
  var _renderOpts$props2 = renderOpts.props
  var props = _renderOpts$props2 === void 0 ? {} : _renderOpts$props2
  var row = params.row
  var column = params.column
  var cellValue = _xeUtils['default'].get(row, column.property)
  var values = cellValue || []
  var labels = []
  matchCascaderData(0, props.options, values, labels)
  return (props.showAllLevels === false ? labels.slice(labels.length - 1, labels.length) : labels).join(' '.concat(props.separator || '/', ' '))
}

function getDatePickerCellValue(renderOpts, params) {
  var _renderOpts$props3 = renderOpts.props
  var props = _renderOpts$props3 === void 0 ? {} : _renderOpts$props3
  var row = params.row
  var column = params.column
  var _props$rangeSeparator = props.rangeSeparator
  var rangeSeparator = _props$rangeSeparator === void 0 ? '-' : _props$rangeSeparator
  var cellValue = _xeUtils['default'].get(row, column.property)
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
      cellValue = getFormatDates(cellValue, props, ' '.concat(rangeSeparator, ' '), 'yyyy-MM-dd')
      break
    case 'datetimerange':
      cellValue = getFormatDates(cellValue, props, ' '.concat(rangeSeparator, ' '), 'yyyy-MM-dd HH:ss:mm')
      break
    case 'monthrange':
      cellValue = getFormatDates(cellValue, props, ' '.concat(rangeSeparator, ' '), 'yyyy-MM')
      break
    default:
      cellValue = getFormatDate(cellValue, props, 'yyyy-MM-dd')
  }
  return cellValue
}

function getTimePickerCellValue(renderOpts, params) {
  var _renderOpts$props4 = renderOpts.props
  var props = _renderOpts$props4 === void 0 ? {} : _renderOpts$props4
  var row = params.row
  var column = params.column
  var isRange = props.isRange
  var _props$format = props.format
  var format = _props$format === void 0 ? 'hh:mm:ss' : _props$format
  var _props$rangeSeparator2 = props.rangeSeparator
  var rangeSeparator = _props$rangeSeparator2 === void 0 ? '-' : _props$rangeSeparator2
  var cellValue = _xeUtils['default'].get(row, column.property)
  if (cellValue && isRange) {
    cellValue = _xeUtils['default'].map(cellValue, function(date) {
      return _xeUtils['default'].toDateString(parseDate(date, props), format)
    }).join(' '.concat(rangeSeparator, ' '))
  }
  return _xeUtils['default'].toDateString(parseDate(cellValue, props), format)
}

function createEditRender(defaultProps) {
  return function(h, renderOpts, params) {
    var row = params.row
    var column = params.column
    var attrs = renderOpts.attrs
    var cellValue = _xeUtils['default'].get(row, column.property)
    return [h(renderOpts.name, {
      attrs: attrs,
      props: getCellEditFilterProps(renderOpts, params, cellValue, defaultProps),
      on: getEditOns(renderOpts, params),
      nativeOn: getNativeOns(renderOpts, params)
    })]
  }
}

function defaultButtonEditRender(h, renderOpts, params) {
  var attrs = renderOpts.attrs
  return [h('el-button', {
    attrs: attrs,
    props: getCellEditFilterProps(renderOpts, params, null),
    on: getOns(renderOpts, params),
    nativeOn: getNativeOns(renderOpts, params)
  }, cellText(h, renderOpts.content))]
}

function defaultButtonsEditRender(h, renderOpts, params) {
  return renderOpts.children.map(function(childRenderOpts) {
    return defaultButtonEditRender(h, childRenderOpts, params)[0]
  })
}

function createFilterRender(defaultProps) {
  return function(h, renderOpts, params) {
    var column = params.column
    var name = renderOpts.name
    var attrs = renderOpts.attrs
    var nativeOn = getNativeOns(renderOpts, params)
    return [h('div', {
      'class': 'vxe-table--filter-element-wrapper'
    }, column.filters.map(function(option, oIndex) {
      var optionValue = option.data
      return h(name, {
        key: oIndex,
        attrs: attrs,
        props: getCellEditFilterProps(renderOpts, params, optionValue, defaultProps),
        on: getFilterOns(renderOpts, params, option, function() {
          // 处理 change 事件相关逻辑
          handleConfirmFilter(params, !!option.data, option)
        }),
        nativeOn: nativeOn
      })
    }))]
  }
}

function handleConfirmFilter(params, checked, option) {
  var $panel = params.$panel
  $panel.changeOption({}, checked, option)
}

/**
 * 模糊匹配
 * @param params
 */
function defaultFuzzyFilterMethod(params) {
  var option = params.option
  var row = params.row
  var column = params.column
  var data = option.data
  var cellValue = _xeUtils['default'].get(row, column.property)
  return _xeUtils['default'].toValueString(cellValue).indexOf(data) > -1
}

/**
 * 精确匹配
 * @param params
 */
function defaultExactFilterMethod(params) {
  var option = params.option
  var row = params.row
  var column = params.column
  var data = option.data
  var cellValue = _xeUtils['default'].get(row, column.property)
  /* eslint-disable eqeqeq */
  return cellValue === data
}

function renderOptions(h, options, optionProps) {
  var labelProp = optionProps.label || 'label'
  var valueProp = optionProps.value || 'value'
  return _xeUtils['default'].map(options, function(item, oIndex) {
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
    var data = params.data
    var property = params.property
    var name = renderOpts.name
    var attrs = renderOpts.attrs
    var itemValue = _xeUtils['default'].get(data, property)
    return [h(name, {
      attrs: attrs,
      props: getItemProps(renderOpts, params, itemValue, defaultProps),
      on: getItemOns(renderOpts, params),
      nativeOn: getNativeOns(renderOpts, params)
    })]
  }
}

function defaultButtonItemRender(h, renderOpts, params) {
  var attrs = renderOpts.attrs
  var props = getItemProps(renderOpts, params, null)
  return [h('el-button', {
    attrs: attrs,
    props: props,
    on: getOns(renderOpts, params),
    nativeOn: getNativeOns(renderOpts, params)
  }, cellText(h, renderOpts.content || props.content))]
}

function defaultButtonsItemRender(h, renderOpts, params) {
  return renderOpts.children.map(function(childRenderOpts) {
    return defaultButtonItemRender(h, childRenderOpts, params)[0]
  })
}

function createExportMethod(getExportCellValue) {
  return function(params) {
    var row = params.row
    var column = params.column
    var options = params.options
    return options && options.original ? _xeUtils['default'].get(row, column.property) : getExportCellValue(column.editRender || column.cellRender, params)
  }
}

function createFormItemRadioAndCheckboxRender() {
  return function(h, renderOpts, params) {
    var name = renderOpts.name
    var _renderOpts$options2 = renderOpts.options
    var options = _renderOpts$options2 === void 0 ? [] : _renderOpts$options2
    var _renderOpts$optionPro2 = renderOpts.optionProps
    var optionProps = _renderOpts$optionPro2 === void 0 ? {} : _renderOpts$optionPro2
    var attrs = renderOpts.attrs
    var data = params.data
    var property = params.property
    var labelProp = optionProps.label || 'label'
    var valueProp = optionProps.value || 'value'
    var itemValue = _xeUtils['default'].get(data, property)
    return [h(''.concat(name, 'Group'), {
      attrs: attrs,
      props: getItemProps(renderOpts, params, itemValue),
      on: getItemOns(renderOpts, params),
      nativeOn: getNativeOns(renderOpts, params)
    }, options.map(function(option, oIndex) {
      return h(name, {
        key: oIndex,
        props: {
          label: option[valueProp],
          disabled: option.disabled
        }
      }, option[labelProp])
    }))]
  }
}

/**
 * 检查触发源是否属于目标节点
 */
function getEventTargetNode(evnt, container, className) {
  var targetElem
  var target = evnt.target
  while (target && target.nodeType && target !== document) {
    if (className && target.className && target.className.split && target.className.split(' ').indexOf(className) > -1) {
      targetElem = target
    } else if (target === container) {
      return {
        flag: className ? !!targetElem : true,
        container: container,
        targetElem: targetElem
      }
    }
    target = target.parentNode
  }
  return {
    flag: false
  }
}

/**
 * 事件兼容性处理
 */
function handleClearEvent(params, e) {
  var bodyElem = document.body
  var evnt = params.$event || e
  if (
    // 远程搜索
    getEventTargetNode(evnt, bodyElem, 'el-autocomplete-suggestion').flag ||
    // 下拉框
    getEventTargetNode(evnt, bodyElem, 'el-select-dropdown').flag ||
    // 级联
    getEventTargetNode(evnt, bodyElem, 'el-cascader__dropdown').flag || getEventTargetNode(evnt, bodyElem, 'el-cascader-menus').flag ||
    // 日期
    getEventTargetNode(evnt, bodyElem, 'el-time-panel').flag || getEventTargetNode(evnt, bodyElem, 'el-picker-panel').flag ||
    // 颜色
    getEventTargetNode(evnt, bodyElem, 'el-color-dropdown').flag) {
    return false
  }
}

/**
 * 基于 vxe-table 表格的适配插件，用于兼容 element-ui 组件库
 */
export default {
  install: function install(_ref) {
    var interceptor = _ref.interceptor
    var renderer = _ref.renderer
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
        renderEdit: function renderEdit(h, renderOpts, params) {
          var _renderOpts$options3 = renderOpts.options
          var options = _renderOpts$options3 === void 0 ? [] : _renderOpts$options3
          var optionGroups = renderOpts.optionGroups
          var _renderOpts$optionPro3 = renderOpts.optionProps
          var optionProps = _renderOpts$optionPro3 === void 0 ? {} : _renderOpts$optionPro3
          var _renderOpts$optionGro2 = renderOpts.optionGroupProps
          var optionGroupProps = _renderOpts$optionGro2 === void 0 ? {} : _renderOpts$optionGro2
          var row = params.row
          var column = params.column
          var attrs = renderOpts.attrs
          var cellValue = _xeUtils['default'].get(row, column.property)
          var props = getCellEditFilterProps(renderOpts, params, cellValue)
          var on = getEditOns(renderOpts, params)
          var nativeOn = getNativeOns(renderOpts, params)
          if (optionGroups) {
            var groupOptions = optionGroupProps.options || 'options'
            var groupLabel = optionGroupProps.label || 'label'
            return [h('el-select', {
              attrs: attrs,
              props: props,
              on: on,
              nativeOn: nativeOn
            }, _xeUtils['default'].map(optionGroups, function(group, gIndex) {
              return h('el-option-group', {
                key: gIndex,
                props: {
                  label: group[groupLabel]
                }
              }, renderOptions(h, group[groupOptions], optionProps))
            }))]
          }
          return [h('el-select', {
            props: props,
            attrs: attrs,
            on: on,
            nativeOn: nativeOn
          }, renderOptions(h, options, optionProps))]
        },
        renderCell: function renderCell(h, renderOpts, params) {
          return getCellLabelVNs(h, renderOpts, params, getSelectCellValue(renderOpts, params))
        },
        renderFilter: function renderFilter(h, renderOpts, params) {
          var _renderOpts$options4 = renderOpts.options
          var options = _renderOpts$options4 === void 0 ? [] : _renderOpts$options4
          var optionGroups = renderOpts.optionGroups
          var _renderOpts$optionPro4 = renderOpts.optionProps
          var optionProps = _renderOpts$optionPro4 === void 0 ? {} : _renderOpts$optionPro4
          var _renderOpts$optionGro3 = renderOpts.optionGroupProps
          var optionGroupProps = _renderOpts$optionGro3 === void 0 ? {} : _renderOpts$optionGro3
          var groupOptions = optionGroupProps.options || 'options'
          var groupLabel = optionGroupProps.label || 'label'
          var column = params.column
          var attrs = renderOpts.attrs
          var nativeOn = getNativeOns(renderOpts, params)
          return [h('div', {
            'class': 'vxe-table--filter-element-wrapper'
          }, optionGroups ? column.filters.map(function(option, oIndex) {
            var optionValue = option.data
            var props = getCellEditFilterProps(renderOpts, params, optionValue)
            return h('el-select', {
              key: oIndex,
              attrs: attrs,
              props: props,
              on: getFilterOns(renderOpts, params, option, function() {
                // 处理 change 事件相关逻辑
                handleConfirmFilter(params, props.multiple ? option.data && option.data.length > 0 : !_xeUtils['default'].eqNull(option.data), option)
              }),
              nativeOn: nativeOn
            }, _xeUtils['default'].map(optionGroups, function(group, gIndex) {
              return h('el-option-group', {
                key: gIndex,
                props: {
                  label: group[groupLabel]
                }
              }, renderOptions(h, group[groupOptions], optionProps))
            }))
          }) : column.filters.map(function(option, oIndex) {
            var optionValue = option.data
            var props = getCellEditFilterProps(renderOpts, params, optionValue)
            return h('el-select', {
              key: oIndex,
              attrs: attrs,
              props: props,
              on: getFilterOns(renderOpts, params, option, function() {
                // 处理 change 事件相关逻辑
                handleConfirmFilter(params, props.multiple ? option.data && option.data.length > 0 : !_xeUtils['default'].eqNull(option.data), option)
              }),
              nativeOn: nativeOn
            }, renderOptions(h, options, optionProps))
          }))]
        },
        defaultFilterMethod: function defaultFilterMethod(params) {
          var option = params.option
          var row = params.row
          var column = params.column
          var data = option.data
          var property = column.property
          var renderOpts = column.filterRender
          var _renderOpts$props5 = renderOpts.props
          var props = _renderOpts$props5 === void 0 ? {} : _renderOpts$props5
          var cellValue = _xeUtils['default'].get(row, property)
          if (props.multiple) {
            if (_xeUtils['default'].isArray(cellValue)) {
              return _xeUtils['default'].includeArrays(cellValue, data)
            }
            return data.indexOf(cellValue) > -1
          }
          /* eslint-disable eqeqeq */
          return cellValue == data
        },
        renderItem: function renderItem(h, renderOpts, params) {
          var _renderOpts$options5 = renderOpts.options
          var options = _renderOpts$options5 === void 0 ? [] : _renderOpts$options5
          var optionGroups = renderOpts.optionGroups
          var _renderOpts$optionPro5 = renderOpts.optionProps
          var optionProps = _renderOpts$optionPro5 === void 0 ? {} : _renderOpts$optionPro5
          var _renderOpts$optionGro4 = renderOpts.optionGroupProps
          var optionGroupProps = _renderOpts$optionGro4 === void 0 ? {} : _renderOpts$optionGro4
          var data = params.data
          var property = params.property
          var attrs = renderOpts.attrs
          var itemValue = _xeUtils['default'].get(data, property)
          var props = getItemProps(renderOpts, params, itemValue)
          var on = getItemOns(renderOpts, params)
          var nativeOn = getNativeOns(renderOpts, params)
          if (optionGroups) {
            var groupOptions = optionGroupProps.options || 'options'
            var groupLabel = optionGroupProps.label || 'label'
            return [h('el-select', {
              attrs: attrs,
              props: props,
              on: on,
              nativeOn: nativeOn
            }, _xeUtils['default'].map(optionGroups, function(group, gIndex) {
              return h('el-option-group', {
                props: {
                  label: group[groupLabel]
                },
                key: gIndex
              }, renderOptions(h, group[groupOptions], optionProps))
            }))]
          }
          return [h('el-select', {
            attrs: attrs,
            props: props,
            on: on,
            nativeOn: nativeOn
          }, renderOptions(h, options, optionProps))]
        },
        renderItemContent: function renderItemContent(h, renderOpts, params) {
          var _renderOpts$options6 = renderOpts.options
          var options = _renderOpts$options6 === void 0 ? [] : _renderOpts$options6
          var optionGroups = renderOpts.optionGroups
          var _renderOpts$optionPro6 = renderOpts.optionProps
          var optionProps = _renderOpts$optionPro6 === void 0 ? {} : _renderOpts$optionPro6
          var _renderOpts$optionGro5 = renderOpts.optionGroupProps
          var optionGroupProps = _renderOpts$optionGro5 === void 0 ? {} : _renderOpts$optionGro5
          var data = params.data
          var property = params.property
          var attrs = renderOpts.attrs
          var itemValue = _xeUtils['default'].get(data, property)
          var props = getItemProps(renderOpts, params, itemValue)
          var on = getItemOns(renderOpts, params)
          var nativeOn = getNativeOns(renderOpts, params)
          if (optionGroups) {
            var groupOptions = optionGroupProps.options || 'options'
            var groupLabel = optionGroupProps.label || 'label'
            return [h('el-select', {
              attrs: attrs,
              props: props,
              on: on,
              nativeOn: nativeOn
            }, _xeUtils['default'].map(optionGroups, function(group, gIndex) {
              return h('el-option-group', {
                props: {
                  label: group[groupLabel]
                },
                key: gIndex
              }, renderOptions(h, group[groupOptions], optionProps))
            }))]
          }
          return [h('el-select', {
            attrs: attrs,
            props: props,
            on: on,
            nativeOn: nativeOn
          }, renderOptions(h, options, optionProps))]
        },
        cellExportMethod: createExportMethod(getSelectCellValue),
        exportMethod: createExportMethod(getSelectCellValue)
      },
      ElCascader: {
        renderEdit: createEditRender(),
        renderCell: function renderCell(h, renderOpts, params) {
          return getCellLabelVNs(h, renderOpts, params, getCascaderCellValue(renderOpts, params))
        },
        renderItem: createFormItemRender(),
        renderItemContent: createFormItemRender(),
        cellExportMethod: createExportMethod(getCascaderCellValue),
        exportMethod: createExportMethod(getCascaderCellValue)
      },
      ElDatePicker: {
        renderEdit: createEditRender(),
        renderCell: function renderCell(h, renderOpts, params) {
          return getCellLabelVNs(h, renderOpts, params, getDatePickerCellValue(renderOpts, params))
        },
        renderFilter: function renderFilter(h, renderOpts, params) {
          var column = params.column
          var attrs = renderOpts.attrs
          var nativeOn = getNativeOns(renderOpts, params)
          return [h('div', {
            'class': 'vxe-table--filter-element-wrapper'
          }, column.filters.map(function(option, oIndex) {
            var optionValue = option.data
            return h(renderOpts.name, {
              key: oIndex,
              attrs: attrs,
              props: getCellEditFilterProps(renderOpts, params, optionValue),
              on: getFilterOns(renderOpts, params, option, function() {
                // 处理 change 事件相关逻辑
                handleConfirmFilter(params, !!option.data, option)
              }),
              nativeOn: nativeOn
            })
          }))]
        },
        defaultFilterMethod: function defaultFilterMethod(params) {
          var option = params.option
          var row = params.row
          var column = params.column
          var data = option.data
          var renderOpts = column.filterRender
          var _renderOpts$props6 = renderOpts.props
          var props = _renderOpts$props6 === void 0 ? {} : _renderOpts$props6
          var cellValue = _xeUtils['default'].get(row, column.property)
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
        renderCell: function renderCell(h, renderOpts, params) {
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
        renderFilter: function renderFilter(h, renderOpts, params) {
          var column = params.column
          var name = renderOpts.name
          var attrs = renderOpts.attrs
          var nativeOn = getNativeOns(renderOpts, params)
          return [h('div', {
            'class': 'vxe-table--filter-element-wrapper'
          }, column.filters.map(function(option, oIndex) {
            var optionValue = option.data
            return h(name, {
              key: oIndex,
              attrs: attrs,
              props: getCellEditFilterProps(renderOpts, params, optionValue),
              on: getFilterOns(renderOpts, params, option, function() {
                // 处理 change 事件相关逻辑
                handleConfirmFilter(params, _xeUtils['default'].isBoolean(option.data), option)
              }),
              nativeOn: nativeOn
            })
          }))]
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

