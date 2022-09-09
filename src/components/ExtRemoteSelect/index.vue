<script>
import service from '@/api/service'
import { normalizeSlots } from '@/utils'
import Vue from 'vue'

const defaultPageConfig = {
  pageSize: 20,
  pageSizeParamKey: 'pageSize',
  pageIndexParamKey: 'pageIndex',
  dataKey: 'data',
  totalCountKey: 'total',
  itemKey: 'data'
}
const stateMap = new WeakMap()

function getScope(parentComponent, key, defaultScope) {
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
      default: true
    },
    pageConfig: {
      type: Object,
      default() {
        return Object.assign({}, defaultPageConfig)
      }
    }
  },
  render(h, context) {
    let children = (context.children || []).concat([])
    const scope = getScope(context.parent, (context.props.scopeKey || context.props.requestKey || 'self'), {
      items: [],
      loading: false,
      _counter: 0,
      remoteMethod: function(keyword) {
        scope._counter++
        scope.loading = true
        params[context.props.searchName] = keyword
        context.props.service.requestApi(context.props.requestKey, params).then(function(res) {
          scope.loading = false
          const items = []
          for (const item of res.data.data) {
            items.push(item)
          }
          scope.items = items
        })
      }
    })
    const params = Object.assign({}, context.props.params)
    const mergedOptions = Object.assign({
      filterable: true,
      automaticDropdown: false
    }, context.data.attrs || {})
    mergedOptions.remote = true
    mergedOptions.remoteMethod = scope.remoteMethod
    mergedOptions.loading = scope.loading

    const slots = context.slots()
    if (!slots.default) {
      slots.default = scope.items.map(function(item, index) {
        /* eslint-disable */
        return <el-option
            key={item[context.props.valueKey]}
            label={item[context.props.labelKey]}
            value={item[context.props.valueKey]}>
        </el-option>
      })
    }
    children = children.concat(normalizeSlots(slots))
    let data = Object.assign({}, context.data)
    data.props = mergedOptions
    if (scope._counter === 0) {
      scope.remoteMethod('')
    }
    // console.log('attrs', data.attrs)
    return h('el-select', data, children)
  }
}
</script>
