<script>
import emitter from 'element-ui/lib/mixins/emitter'
import service from '@/api/service'

const defaultPageConfig = {
  pageSize: 20,
  dataKey: 'data',
  totalCountKey: 'total',
  listKey: 'data'
}
export default {
  name: 'ExtRemoteSelect',
  mixins: [
    emitter
  ],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    // 多值,用英文逗号分隔
    value: {
      type: String,
      default: ''
    }, // 多值,用英文逗号分隔 用于解决异步加载默认值显示的问题
    label: {
      type: String,
      default: ''
    },
    service: {
      type: Object,
      default() {
        return {
          requestApi: function(params) {
            if (!this.requestKey) {
              throw new Error('请配置 requestKey 才能发送远程请求')
            } else {
              return service.requestByKey(this.requestKey, params)
            }
          }
        }
      }
    },
    requestKey: {
      type: String,
      default: undefined
    },
    searchName: {
      type: String,
      default: 'searchWord'
    },
    pageConfig: {
      type: Object,
      default() {
        return Object.assign({}, defaultPageConfig)
      }
    }
  }
}
</script>
