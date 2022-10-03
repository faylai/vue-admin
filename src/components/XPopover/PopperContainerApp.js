import Vue from 'vue'
import PopperContainer from '@/components/XPopover/PopperContainer'

export default Vue.extend({
  props: Object.assign({
    defaultSlot: {
      type: Array,
      default() {
        return []
      }
    }
  }, PopperContainer.props),
  render(h, context) {
    return h(PopperContainer, {
      props: this._props,
      ref: 'popperContainer'
    }, this.defaultSlot || [])
  }
})
