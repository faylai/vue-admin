<script>
import { isEqual, sortBy, isFunction } from 'lodash'

/**
 * 用来缓存VNode 节点 减少render 执行的次数提高运行效率
 *  depProps {Object} 依赖变量，变更后重新会执行 nodeRender 否则使用之前的 nodeRender 返回的VNode;优先级高于ignoreProps 推荐使用
 *  ignoreProps {Object} 忽略变量， ignoreProps 变更不会触发 nodeRender 再次执行 ；优先级低于 depProps
 */
export default {
  name: 'SmartCache',
  props: {
    nodeRender: {
      type: Function
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
      counter: 0
    }
  },
  created() {
    this.$foreUpdateStack = []
    this.$isUpdating = false
    this.$lastCounter = this.counter
  },
  methods: {
    schedulerUpdating(updatingCommand) {
      this.$foreUpdateStack.push(updatingCommand)
      if (this.$isUpdating) {
        return
      } else {
        this.$isUpdating = true
        // 把微任务放入当前宏任务后面执行
        Promise.resolve().then(() => {
          this.$isUpdating = false
          if (this.$foreUpdateStack.length) {
            // console.log('this.$foreUpdateStack.length', this.$foreUpdateStack.length)
            let foreUpdate = false
            sortBy(this.$foreUpdateStack, ['p']).reverse().forEach((command) => {
              foreUpdate = command.foreUpdate
            })
            if (foreUpdate) {
              // trigger update
              this.counter = this.counter + 1
            }
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
    const foreUpdate = this.counter > this.$lastCounter
    if (isFunction(this.nodeRender)) {
      if (!this.$$cacheNode || foreUpdate) {
        this.$$cacheNode = this.nodeRender()
        // console.log('force update nodeRender')
      } else {
        // console.log('get from cached nodeRender $$cacheNode')
      }
    } else if (this.$slots.default) {
      if (!this.$$cacheNode || foreUpdate) {
        this.$$cacheNode = this.$slots.default
        // console.log('get from $slots.default $$cacheNode')
      } else {
        // console.log('get from $slots.default')
      }
    }
    this.$lastCounter = this.counter
    return this.$$cacheNode
  }
}
</script>

