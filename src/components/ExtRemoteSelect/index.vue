<script>
import service from '@/api/service'
import { normalizeSlots, createScope } from '@/utils'
import settings from '@/settings'
import lodash from 'lodash'
// EnforceSlotSelect 修改了 el-select 的template 模板用以支持 bottom 插槽（放分页组件）
// 注意：升级element-ui 的时候可能也需要升级 EnforceSlotSelect 的模板
import EnforceSlotSelect from '@/components/ExtRemoteSelect/EnforceSlotSelect'
import { beforeFunction } from '@/utils'

const paginationConfig = settings.paginationConfig
export default {
  name: 'ExtRemoteSelect',
  functional: true,
  props: {
    // 异步情况用于恢复选中状态的值
    label: {},
    // 唯一性决定是否使用新的 data Scope,同一 scopeKey 下的 scope 会共享
    scopeKey: {
      type: String,
      default: undefined
    },
    requestKey: {
      type: String,
      required: true
    },
    // 搜索的时候关键参数名称
    searchName: {
      type: String,
      default: 'keyword'
    },
    // 默认接口请求参数
    params: {
      type: Object,
      default() {
        return {}
      }
    },
    valueKey: {
      type: String,
      default: 'value'
    },
    labelKey: {
      type: String,
      default: 'label'
    },
    showPage: {
      type: Boolean,
      default: false
    },
    pageSize: {
      type: Number,
      default() {
        return paginationConfig.defaultPageSize * 1
      }
    },
    service: {
      type: Object,
      default() {
        return {
          requestApi: function(requestKey, params) {
            if (!requestKey) {
              throw new Error('请配置 requestKey 才能发送远程请求')
            } else {
              return service.requestByKey(requestKey, params)
            }
          }
        }
      }
    }
  },
  render(h, context) {
    let children = (context.children || []).concat([])
    const scope = createScope(context.parent, (context.props.scopeKey || context.props.requestKey || 'self'), {
      value: undefined,
      items: [],
      _items: [],
      loading: false,
      _counter: 0,
      pageIndex: 1,
      total: 0,
      _keyword: '',
      _params: context.props.params,
      remoteMethod: function(keyword) {
        scope._counter++
        scope.loading = true
        scope._keyword = keyword
        const params = Object.assign({}, scope._params)
        params[context.props.searchName] = scope._keyword
        params[paginationConfig.pageIndexParamKey] = scope.pageIndex
        params[paginationConfig.pageSizeParamKey] = context.props.pageSize
        if (context.props.showPage || (scope._items.length === 0 && context.props.requestKey)) {
          context.props.service.requestApi(context.props.requestKey, params).then(function(res) {
            scope.loading = false
            const items = []
            const root = res[paginationConfig.responseRootName]
            for (const item of root[paginationConfig.responseRecordListKey] || []) {
              items.push(item)
            }
            scope.total = root[paginationConfig.responseTotalCountKey]
            scope.items = items
            scope._items = items.slice(0)
            // 处理默认选中的问题,生成几个隐藏的option
            if (context.props.showPage && !lodash.isUndefined(context.data.attrs.value)) {
              console.log('context.data.attrs.value', context.data.attrs.value)
              const value = lodash.isArray(context.data.attrs.value) ? context.data.attrs.value : [context.data.attrs.value]
              const scopeValue = lodash.isArray(scope.value) ? context.props.value : [scope.value]
              const label = lodash.isArray(context.props.label) ? context.props.value : [context.props.label]
              if (value && !lodash.isEqual(value, scopeValue) && value.length === label.length) {
                for (let i = 0; i < value.length; i++) {
                  // 没有从item 找到情况下，新建隐藏项目用来诱导选中
                  if (!lodash.some(scope.items, item => String(item[context.props.valueKey]) === value[i])) {
                    scope.items.push({
                      display: false,
                      [context.props.valueKey]: value[i],
                      [context.props.labelKey]: label[i]
                    })
                  }
                }
              }
            }
          })
        } else if (scope._items.length) {
          scope.loading = false
          if (String(keyword).trim() === '') {
            scope.items = scope._items
          } else {
            scope.items = scope._items.filter(function(item) {
              return String(item[context.props.labelKey]).indexOf(keyword) >= 0
            })
          }
        } else {
          scope.loading = false
        }
      },
      currentChange(pageIndex) {
        scope.pageIndex = pageIndex
        scope.remoteMethod(scope._keyword)
      }
    })
    // 简单检查参数是否被外部修改,如果修改分页重置并且重新拉取数据
    if (!lodash.isEqual(context.props.params, scope._params)) {
      scope._params = context.props.params
      scope._item = []
      scope._counter = 0
      scope.pageIndex = 1
    }

    scope.value = context.props.value
    if (context.data.on && context.data.on.input) {
      context.data.on.input = beforeFunction(context.data.on.input, function(value) {
        console.log('v-model:value', value)
        scope.value = value
      })
    }

    const mergedOptions = Object.assign({
      filterable: true,
      automaticDropdown: false
    }, context.data.attrs || {})
    mergedOptions.remote = true
    mergedOptions.remoteMethod = scope.remoteMethod
    mergedOptions.loading = scope.loading

    const slots = context.slots()
    if (!slots.default) {
      /* eslint-disable indent */
      slots.default = scope.items.map(function(item, index) {
        return <el-option
            vShow={item.display !== false}
            key={item[context.props.valueKey]}
            label={item[context.props.labelKey]}
            value={item[context.props.valueKey]}>
        </el-option>
      })

      if (context.props.showPage) {
        slots.bottom = []
        slots.bottom.push(<el-pagination
            small
            layout="prev, pager, next"
            page-size={context.props.pageSize}
            current-page={scope.pageIndex}
            total={scope.total}
            vOn:current-change={scope.currentChange}>
        </el-pagination>)
      }

      children = children.concat(normalizeSlots(slots))
      const data = Object.assign({}, context.data)
      data.props = mergedOptions
      // 第一初始化，或者参数改变重新获取数据
      if (scope._counter === 0) {
        scope.remoteMethod('')
      }
      // eslint-disable-next-line
      return h(EnforceSlotSelect, data, children)
    }
  }
}
</script>
