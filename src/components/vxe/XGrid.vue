<script>
import Grid from './Grid'
import lodash from 'lodash'
import settings from '@/settings'
import { normalizeSlots } from '@/utils'

const paginationConfig = settings.paginationConfig
export default {
  name: 'XGrid',
  functional: true,
  props: {
    queryPromiseFunction: {
      type: Function,
      default() {
        return new Promise(function(resolve, reject) {
          reject('请初始化 queryPromiseFunction 方法')
        })
      }
    },
    gridOptions: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  render(h, context) {
    let children = (context.children || []).concat([])
    const data = context.data
    const gridOptions = context.props.gridOptions || {}
    if (gridOptions.pagerConfig !== false) {
      gridOptions.pagerConfig = lodash.defaultsDeep(gridOptions.pagerConfig, {
        total: 0,
        currentPage: 1,
        enabled: false,
        pageSize: paginationConfig.defaultPageSize * 10
      })
    }
    if (context.props.queryPromiseFunction) {
      gridOptions.proxyConfig = gridOptions.proxyConfig || {}
      lodash.defaultsDeep(gridOptions.proxyConfig, {
        seq: true,
        props: {
          result: paginationConfig.responseRootName,
          message: paginationConfig.responseMsgName,
          list: [paginationConfig.responseRootName, paginationConfig.responseRecordListKey].join('.'),
          total: [paginationConfig.responseRootName, paginationConfig.responseTotalCountKey].join('.')
        },
        ajax: {
          query: ({ page }) => {
            const params = {
              page: page.currentPage,
              pageIndex: page.currentPage,
              pageSize: page.pageSize
            }
            lodash.defaultsDeep(params, gridOptions.params || {})
            return context.props.queryPromiseFunction(params)
          }
        }
      })
    }
    data.props = gridOptions
    children = children.concat(normalizeSlots(context.slots()))
    return h(Grid, data, children)
  }
}
</script>

