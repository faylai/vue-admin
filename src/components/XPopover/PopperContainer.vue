<template>
  <transition
      :name="transition"
      @after-enter="$emit('handleAfterEnter',$event)"
      @after-leave="$emit('handleAfterLeave',$event)">
    <div
        class="el-popover el-popper"
        :class="[popperClass, content && 'el-popover--plain']"
        ref="popper"
        v-show="!disabled && showPopper"
        :style="{ width: width + 'px' }"
        role="tooltip"
        :id="tooltipId"
        :aria-hidden="(disabled || !showPopper) ? 'true' : 'false'">
      <div class="el-popover__title" v-if="title" v-text="title"></div>
      <slot>{{ content }}</slot>
    </div>
  </transition>
</template>
<script>
export default {
  name: 'PopperContainer',
  props: {
    popperClass: String,
    content: String,
    disabled: Boolean,
    showPopper: Boolean,
    title: String,
    width: {},
    tooltipId: String,
    transition: {
      type: String,
      default: 'fade-in-linear'
    }
  }
}
</script>


