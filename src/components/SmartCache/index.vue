<script>
import { isEqual } from 'lodash'

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
  watch: {
    depProps: {
      handler(nv, ov) {
        if (nv && ov) {
          if (!isEqual(nv, ov)) {
            this.foreUpdate = true
          } else {
            this.foreUpdate = false
          }
        }
      }
    },
    ignoreProps: {
      handler(nv, ov) {
        if (nv && ov) {
          if (isEqual(nv, ov)) {
            this.foreUpdate = true
          } else {
            this.foreUpdate = false
          }
        }
      }
    }
  },
  render(h) {
    if (!this.$$cacheNode || this.foreUpdate) {
      this.$$cacheNode = this.nodeRender()
    }
    return this.$$cacheNode
  }
}
</script>

