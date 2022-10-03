<script>
import Popper from 'element-ui/lib/utils/vue-popper'
import { addClass, off, on, removeClass } from 'element-ui/lib/utils/dom'
import PopperContainer from './PopperContainer'
import { createIDFactory } from '@/utils'
import PopperContainerApp from './PopperContainerApp'

const uuid = createIDFactory('x-popover')
/**
 * 实现了不包裹新的标签也能实现popperover效果，达到了最小的侵入性
 */
/* eslint-disable */
export default {
  name: 'XPopover',
  mixins: [Popper],
  props: {
    trigger: {
      type: String,
      default: 'click',
      validator: value => ['click', 'focus', 'hover', 'manual'].indexOf(value) > -1
    },
    openDelay: {
      type: Number,
      default: 0
    },
    closeDelay: {
      type: Number,
      default: 200
    },
    title: String,
    disabled: Boolean,
    content: String,
    reference: {},
    popperClass: String,
    width: {},
    visibleArrow: {
      default: true
    },
    arrowOffset: {
      type: Number,
      default: 0
    },
    transition: {
      type: String,
      default: 'fade-in-linear'
    },
    tabindex: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      tooltipId: uuid()
    }
  },
  computed: {
    popperObject() {
      return this.popper || (this.popperContainer ? this.popperContainer.$el : false)
    },
    referenceObject() {
      const reference = this.reference || this.$el
      return reference
    },
    popperElm: {
      get: function() {
        return this.popperObject
      },
      set: function(v) {

      }
    },
    referenceElm: {
      get: function() {
        return this.referenceObject
      },
      set: function(v) {
      }
    }
  },
  watch: {
    showPopper(val) {
      if (this.disabled) {
        return
      }
      this.updatePopperContainer()
      val ? this.$emit('show') : this.$emit('hide')
    }
  },

  beforeDestroy() {
    this.cleanup()
  },

  deactivated() {
    this.cleanup()
  },

  methods: {
    createPopperContainer() {
      const instance = new PopperContainerApp({
        el: document.createElement('div')
      }, {
        router: this.router,
        store: this.store,
        i18n: this.i18n
      })
      instance.tooltipId = this.tooltipId
      instance.defaultSlot = this.$slots.default || []
      instance.$mount()
      instance.$refs.popperContainer.$on('after-enter', this.handleAfterEnter)
      instance.$refs.popperContainer.$on('after-leave', this.handleAfterLeave)
      return instance
    },
    updatePopperContainer() {
      if (this.popperContainer) {
        Object.keys(PopperContainer.props).forEach(key => {
          // console.log('this.$props[key]', key, this[key])
          this.popperContainer[key] = this[key]
        })
      }
    },
    doToggle() {
      this.showPopper = !this.showPopper
    },
    doShow() {
      this.showPopper = true
    },
    doClose() {
      this.showPopper = false
    },
    handleFocus() {
      addClass(this.referenceObject, 'focusing')
      if (this.trigger === 'click' || this.trigger === 'focus') this.showPopper = true
    },
    handleClick() {
      removeClass(this.referenceObject, 'focusing')
    },
    handleBlur() {
      removeClass(this.referenceElm, 'focusing')
      if (this.trigger === 'click' || this.trigger === 'focus') this.showPopper = false
    },
    handleMouseEnter() {
      clearTimeout(this._timer)
      if (this.openDelay) {
        this._timer = setTimeout(() => {
          this.showPopper = true
        }, this.openDelay)
      } else {
        this.showPopper = true
      }
    },
    handleKeydown(ev) {
      if (ev.keyCode === 27 && this.trigger !== 'manual') { // esc
        this.doClose()
      }
    },
    handleMouseLeave() {
      clearTimeout(this._timer)
      if (this.closeDelay) {
        this._timer = setTimeout(() => {
          this.showPopper = false
        }, this.closeDelay)
      } else {
        this.showPopper = false
      }
    },
    handleDocumentClick(e) {
      const reference = this.referenceObject
      const popper = this.popperObject
      if (!this.$el ||
          !reference ||
          this.$el.contains(e.target) ||
          reference.contains(e.target) ||
          !popper ||
          popper.contains(e.target)) {
        return
      }
      this.showPopper = false
    },
    handleAfterEnter() {
      this.$emit('after-enter')
    },
    handleAfterLeave() {
      this.$emit('after-leave')
      this.doDestroy()
    },
    cleanup() {
      if (this.openDelay || this.closeDelay) {
        clearTimeout(this._timer)
      }
    }
  },
  render(createElement, context) {
    const slots = this.$slots
    return slots.reference
  },
  created() {
    this.popperContainer = this.createPopperContainer()
  },
  mounted() {
    const reference = this.referenceObject
    const popper = this.popperObject
    // 可访问性
    if (reference) {
      addClass(reference, 'el-popover__reference')
      reference.setAttribute('aria-describedby', this.tooltipId)
      reference.setAttribute('tabindex', this.tabindex) // tab序列
      popper.setAttribute('tabindex', 0)

      if (this.trigger !== 'click') {
        on(reference, 'focusin', () => {
          this.handleFocus()
          const instance = reference.__vue__
          if (instance && typeof instance.focus === 'function') {
            instance.focus()
          }
        })
        on(popper, 'focusin', this.handleFocus)
        on(reference, 'focusout', this.handleBlur)
        on(popper, 'focusout', this.handleBlur)
      }
      on(reference, 'keydown', this.handleKeydown)
      on(reference, 'click', this.handleClick)
    }
    if (this.trigger === 'click') {
      on(reference, 'click', this.doToggle)
      on(document, 'click', this.handleDocumentClick)
    } else if (this.trigger === 'hover') {
      on(reference, 'mouseenter', this.handleMouseEnter)
      on(popper, 'mouseenter', this.handleMouseEnter)
      on(reference, 'mouseleave', this.handleMouseLeave)
      on(popper, 'mouseleave', this.handleMouseLeave)
    } else if (this.trigger === 'focus') {
      if (this.tabindex < 0) {
        console.warn('[Element Warn][Popover]a negative taindex means that the element cannot be focused by tab key')
      }
      if (reference.querySelector('input, textarea')) {
        on(reference, 'focusin', this.doShow)
        on(reference, 'focusout', this.doClose)
      } else {
        on(reference, 'mousedown', this.doShow)
        on(reference, 'mouseup', this.doClose)
      }
    }
  },
  destroyed() {
    const reference = this.referenceObject
    off(reference, 'click', this.doToggle)
    off(reference, 'mouseup', this.doClose)
    off(reference, 'mousedown', this.doShow)
    off(reference, 'focusin', this.doShow)
    off(reference, 'focusout', this.doClose)
    off(reference, 'mousedown', this.doShow)
    off(reference, 'mouseup', this.doClose)
    off(reference, 'mouseleave', this.handleMouseLeave)
    off(reference, 'mouseenter', this.handleMouseEnter)
    off(document, 'click', this.handleDocumentClick)
    if (this.popperContainer) {
      const popper = this.popperObject
      off(popper, 'focusin', this.handleFocus)
      off(popper, 'focusout', this.handleBlur)
      off(popper, 'mouseenter', this.handleMouseEnter)
      off(popper, 'mouseleave', this.handleMouseLeave)
      this.popperContainer.$destroy()
      this.popperContainer._vnode = null
      this.popperContainer.$children = []
    }
  }
}
</script>
