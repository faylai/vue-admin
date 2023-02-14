<script>
import Grid from './Grid'
import lodash from 'lodash'
import settings from '@/settings'
import { normalizeSlots } from '@/utils'

function trimArray(array) {
  return lodash.filter(array, function(item) {
    return !(lodash.isNil(item) || String(item).trim() === '')
  })
}

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
        perfect: true,
        pageSize: paginationConfig.defaultPageSize * 1,
        layouts: paginationConfig.layouts,
        pageSizes: paginationConfig.pageSizes
      })
    }

    const proxyProps = {
      result: trimArray([paginationConfig.responseRootName, paginationConfig.responseRecordListKey]).join('.'),
      message: trimArray([paginationConfig.responseRootName, paginationConfig.responseMsgName]).join('.'),
      list: trimArray([paginationConfig.responseRootName, paginationConfig.responseRecordListKey]).join('.'),
      total: trimArray([paginationConfig.responseRootName, paginationConfig.responseTotalCountKey]).join('.')
    }
    // console.log(proxyProps)
    if (context.props.queryPromiseFunction) {
      gridOptions.proxyConfig = gridOptions.proxyConfig || {}
      lodash.defaultsDeep(gridOptions.proxyConfig, {
        seq: true,
        autoLoad: false,
        props: gridOptions.treeConfig ? undefined : proxyProps,
        ajax: {
          query: ({ page }) => {
            const params = {
              [paginationConfig.pageIndexParamKey]: page.currentPage,
              [paginationConfig.pageSizeParamKey]: page.pageSize
            }
            lodash.defaultsDeep(params, gridOptions.params || {})
            return context.props.queryPromiseFunction(params)
          }
        }
      })
      gridOptions.proxyConfig.autoLoad = false
    }
    lodash.defaultsDeep(gridOptions, {
      resizable: false,
      keepSource: true,
      showOverflow: 'title',
      height: 'auto'
    })
    data.props = gridOptions
    children = children.concat(normalizeSlots(context.slots()))
    return h(Grid, data, children)
  }
}
</script>

