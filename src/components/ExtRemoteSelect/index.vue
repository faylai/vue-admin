<script>
import service from '@/api/service'
import { normalizeSlots, createScope } from '@/utils'
import settings from '@/settings'
import Vue from 'vue'
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
            total={0}>
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
<style lang="scss">

</style>
