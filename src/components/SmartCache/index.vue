<script>
import { isEqual, sortBy } from 'lodash'

/**
 * 用来缓存VNode 节点 减少render 执行的次数提高运行效率
 *  depProps {Object} 依赖变量，变更后重新会执行 nodeRender 否则使用之前的 nodeRender 返回的VNode;优先级高于ignoreProps 推荐使用
 *  ignoreProps {Object} 忽略变量， ignoreProps 变更不会触发 nodeRender 再次执行 ；优先级低于 depProps
 */
export default {
  name: 'SmartCache',
  props: {
    nodeRender: {
      type: Function,
      required: true
    },
    depProps: {
      type: Object,
      default() {
        return {}
      }
    },
    ignoreProps: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      foreUpdate: true
    }
  },
  created() {
    this.$foreUpdateStack = []
    this.$isUpdating = false
  },
  methods: {
    schedulerUpdating(updatingCommand) {
      this.$foreUpdateStack.push(updatingCommand)
      if (this.$isUpdating) {
        return
      } else {
        // 放入微任务后面执行
        Promise.resolve().then(() => {
          this.$isUpdating = false
          if (this.$foreUpdateStack.length) {
            // console.log('this.$foreUpdateStack.length', this.$foreUpdateStack.length)
            sortBy(this.$foreUpdateStack, ['p']).reverse().forEach((command) => {
              this.foreUpdate = command.foreUpdate
            })
            this.$foreUpdateStack = []
          }
        })
      }
    }
  },
  watch: {
    depProps: {
      handler(nv, ov) {
        if (nv && ov) {
          if (!isEqual(nv, ov)) {
            this.schedulerUpdating({
              // 越小优先级越高
              p: 0,
              foreUpdate: true
            })
          } else {
            this.schedulerUpdating({
              // 越小优先级越高
              p: 0,
              foreUpdate: false
            })
          }
        }
      }
    },
    ignoreProps: {
      handler(nv, ov) {
        if (nv && ov) {
          if (isEqual(nv, ov)) {
            this.schedulerUpdating({
              // 越小优先级越高
              p: 1,
              foreUpdate: true
            })
          } else {
            this.schedulerUpdating({
              // 越小优先级越高
              p: 1,
              foreUpdate: false
            })
          }
        }
      }
    }
  },
  render(h) {
    // console.log('foreUpdate', this.foreUpdate)
    if (!this.$$cacheNode || this.foreUpdate) {
      this.$$cacheNode = this.nodeRender()
    }
    return this.$$cacheNode
  }
}
</script>

