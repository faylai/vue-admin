<template>
  <div class="filterListLayout">
    <div ref="header" class="header">
      <div ref="headerWrapper" class="headerWrapper">
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

export default {
  name: 'FilterListLayout',
  data() {
    return {
      observer: undefined
    }
  },
  methods: {
    init: lodash.debounce(function() {
      const MutationObserver = window.MutationObserver || window.webkitMutationObserver || window.MozMutationObserver
      const observer = new MutationObserver((mutationsList) => {
        if (this.$refs.headerWrapper.offsetHeight !== this.$refs.header.offsetHeight) {
          $(this.$refs.header).css('height', $(this.$refs.headerWrapper).height())
        }
      })
      observer.observe(this.$refs.headerWrapper, {
        childList: false, // 子节点的变动（新增、删除或者更改）
        attributes: true, // 属性的变动
        characterData: false, // 节点内容或节点文本的变动
        subtree: true // 是否将观察器应用于该节点的所有后代节点
      })
      this.observer = observer
    }, 100),
    release: lodash.debounce(function() {
      this.observer || this.observer.disconnect()
    }, 100)
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
