<template>
  <div class="filterListLayout">
    <div ref="header" class="header">
      <div ref="headerWrapper">
        <slot name="header"></slot>
      </div>
    </div>
    <div class="content">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script>
import lodash from 'lodash'
import ResizeObserver from 'resize-observer-polyfill'

export default {
  name: 'FilterListLayout',
  data() {
    return {
      observer: undefined
    }
  },
  methods: {
    init: lodash.debounce(function() {

      const observer = new ResizeObserver((entries, observer) => {
        /*  for (const entry of entries) {
                  const {left, top, width, height} = entry.contentRect;
                  console.log('Element:', entry.target);
                  console.log(`Element's size: ${ width }px x ${ height }px`);
                  console.log(`Element's paddings: ${ top }px ; ${ left }px`);
         } */
        this.onResize()
      })
      observer.observe(this.$refs.headerWrapper)
      window.addEventListener('resize', this.onResize)
      this.observer = observer
    }, 100),
    release: lodash.debounce(function() {
      this.observer && this.observer.disconnect()
      window.removeEventListener('resize', this.onResize)
    }, 100),
    onResize: lodash.debounce(function() {
      if (this.$refs.headerWrapper && this.$refs.headerWrapper.offsetHeight !== this.$refs.header.offsetHeight) {
        $(this.$refs.header).css('height', $(this.$refs.headerWrapper).height())
      }
    }, 160)
  },
  activated() {
    this.init()
  },
  mounted() {
    this.init()
  },
  deactivated() {
    this.release()
  },
  destroyed() {
    this.release()
  }
}
</script>

<style lang="scss" scoped>
.filterListLayout {
  height: 100%;
  display: flex;
  box-sizing: border-box;
  padding: 10px;
  flex-direction: column;

  .header {
    height: 50px;
    overflow: hidden;
  }

  .content {
    flex: 1;
    min-height: 300px;
    overflow: visible;
  }

}
</style>
