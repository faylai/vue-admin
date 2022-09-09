<script>
import service from '@/api/service'
import { normalizeSlots, createScope } from '@/utils'
import settings from '@/settings'
import lodash from 'lodash'
// EnforceSlotSelect 修改了 el-select 的template 模板用以支持 bottom 插槽（放分页组件）
// 注意：升级element-ui 的时候可能也需要升级 EnforceSlotSelect 的模板
import EnforceSlotSelect from '@/components/ExtRemoteSelect/EnforceSlotSelect'

const paginationConfig = settings.paginationConfig
export default {
  name: 'ExtRemoteSelect',
  functional: true,
  props: {
    label: {
      type: String,
      default: ''
    },
    // 唯一性决定是否使用新的 data Scope,同一 scopeKey 下 的scope 会共享
    scopeKey: {
      type: String,
      default: undefined
    },
    requestKey: {
      type: String,
      required: true
    },
    searchName: {
      type: String,
      default: 'keyword'
    },
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
      items: [],
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
        context.props.service.requestApi(context.props.requestKey, params).then(function(res) {
          scope.loading = false
          const items = []
          const root = res[paginationConfig.responseRootName]
          for (const item of root[paginationConfig.responseRecordListKey] || []) {
            items.push(item)
          }
          scope.total = root[paginationConfig.responseTotalCountKey]
          scope.items = items
        })
      },
      currentChange(pageIndex) {
        scope.pageIndex = pageIndex
        scope.remoteMethod(scope._keyword)
      }
    })
    // 简单检查参数是否被外部修改,如果修改分页重置并且重新拉取数据
    if (!lodash.isEqual(context.props.params, scope._params)) {
      scope._params = context.props.params
      scope._counter = 0
      scope.pageIndex = 1
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
    }

    children = children.concat(normalizeSlots(slots))
    const data = Object.assign({}, context.data)
    data.props = mergedOptions
    if (scope._counter === 0) {
      scope.remoteMethod('')
    }
    // eslint-disable-next-line
    return h(EnforceSlotSelect, data, children)
  }
}
</script>
