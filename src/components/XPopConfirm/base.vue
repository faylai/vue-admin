<template>
  <x-popover
      v-bind="$attrs"
      v-model="visible"
      trigger="click">
    <div class="el-popconfirm">
      <p class="el-popconfirm__main">
        <i
            v-if="!hideIcon"
            :class="icon"
            class="el-popconfirm__icon"
            :style="{color: iconColor}"></i>
        {{ title }}
      </p>
      <div class="el-popconfirm__action">
        <el-button
            size="mini"
            :type="cancelButtonType"
            @click="cancel">
          {{ displayCancelButtonText }}
        </el-button>
        <el-button
            size="mini"
            :type="confirmButtonType"
            @click="confirm">
          {{ displayConfirmButtonText }}
        </el-button>
      </div>
    </div>
    <slot name="reference" slot="reference"></slot>
  </x-popover>
</template>

<script>
import ElButton from 'element-ui/lib/button'
import XPopover from '@/components/XPopover'
import { t } from 'element-ui/lib/locale'

export default {
  name: 'XPopConfirmBase',
  props: {
    title: {
      type: String
    },
    confirmButtonText: {
      type: String
    },
    cancelButtonText: {
      type: String
    },
    confirmButtonType: {
      type: String,
      default: 'primary'
    },
    cancelButtonType: {
      type: String,
      default: 'text'
    },
    icon: {
      type: String,
      default: 'el-icon-question'
    },
    iconColor: {
      type: String,
      default: '#f90'
    },
    hideIcon: {
      type: Boolean,
      default: false
    }
  },
  components: {
    XPopover,
    ElButton
  },
  data() {
    return {
      visible: false
    }
  },
  computed: {
    displayConfirmButtonText() {
      return this.confirmButtonText || t('el.popconfirm.confirmButtonText')
    },
    displayCancelButtonText() {
      return this.cancelButtonText || t('el.popconfirm.cancelButtonText')
    }
  },
  methods: {
    confirm() {
      this.visible = false
      this.$emit('confirm')
    },
    cancel() {
      this.visible = false
      this.$emit('cancel')
    }
  }
}
</script>
