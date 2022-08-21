/**
 * @author laijy
 * @param routeQueryKey  主键参数名称 默认_dc
 * @param immediate  是否立即触发 默认 true
 * @returns mixin object
 */
import lodash from 'lodash'

export function build(routeQueryKey, immediate) {
  routeQueryKey = routeQueryKey || '_dc'
  immediate = immediate === false ? immediate : true
  return {
    data() {
      return {
        ROUTE_QUERY_DC: undefined,
        _isComponentActive: false
      }
    },
    activated() {
      this._isComponentActive = true
      this.ROUTE_QUERY_DC = this.$route.query[routeQueryKey]
    },
    deactivated() {
      this._isComponentActive = false
    },
    mounted: function() {
      this.ROUTE_QUERY_DC = this.$route.query[routeQueryKey]
      this._isComponentActive = true
    },
    destroyed() {
      this._isComponentActive = false
    },
    watch: {
      ['$route.query.' + routeQueryKey]: function(v) {
        // 屏蔽非活动下其他同名参数的干扰
        if (this._isComponentActive) {
          this.ROUTE_QUERY_DC = v
        }
      },
      'ROUTE_QUERY_DC': {
        handler: lodash.debounce(function(v, o) {
          if (this.onRouteQueryChange) {
            // 放到下一个宏任务执行
            this.$nextTask(function() {
              this.onRouteQueryChange(v, o)
            })
          }
        }, 200),
        immediate: immediate
      }
    },
    methods: {
      $nextTask(cb) {
        setTimeout(cb.bind(this), 1)
      }
    }
  }
}

export default build()
