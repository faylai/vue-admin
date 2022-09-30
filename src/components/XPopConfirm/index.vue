<script>
import ElButton from 'element-ui/lib/button'
import XPopover from '@/components/XPopover'
import { t } from 'element-ui/lib/locale'

const TYPES = {
  delete: {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    icon: 'el-icon-info',
    iconColor: 'red',
    title: '确定删除吗？'
  },
  default: {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    icon: 'el-icon-info',
    iconColor: 'red',
    title: '确定执行该操作码？'
  }
}
export default {
  name: 'XPopConfirmBase',
  components: {
    XPopover,
    ElButton
  },
  props: {
    title: {
      type: String
    },
    type: {
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
  data() {
    return {
      visible: false
    }
  },
  computed: {
    displayConfirmButtonText() {
      return this.displayTypeValue('confirmButtonText', this.confirmButtonText || t('el.popconfirm.confirmButtonText'))
    },
    displayCancelButtonText() {
      return this.displayTypeValue('cancelButtonText', this.cancelButtonText || t('el.popconfirm.cancelButtonText'))
    },
    displayIcon() {
      return this.displayTypeValue('icon', this.icon)
    },
    displayIconColor() {
      return this.displayTypeValue('iconColor', this.iconColor)
    },
    displayTitle() {
      return this.displayTypeValue('title', this.title)
    }
  },
  methods: {
    displayTypeValue(key, value) {
      const type = TYPES[this.type]
      if (value !== undefined) {
        return value
      } else {
        return type[key]
      }
    },
    confirm() {
      this.visible = false
      this.$emit('confirm')
    },
    cancel() {
      this.visible = false
      this.$emit('cancel')
    }
  },
  render(h) {
    /* eslint-disable indent */
    const reference = this.$slots.reference || this.$slots.default
    if (reference) {
      reference.forEach(function(vnode) {
        if (!vnode.data) {
          vnode.data = {}
        }
        vnode.data.slot = 'reference'
      })
    }
    const defaultSlot = <div class="el-popconfirm">
      <p class="el-popconfirm__main">
        {(() => {
          if (!this.hideIcon) {
            return <i
                class={['el-popconfirm__icon', this.displayIcon]}
                style={{ color: this.displayIconColor }}> < /i>
          }
        })()}
        {this.displayTitle}
      </p>
      <div class="el-popconfirm__action">
        <el-button
            size="mini"
            type={this.cancelButtonType}
            vOn:click={this.cancel}>
          {this.displayCancelButtonText}
        </el-button>
        <el-button
            size="mini"
            type={this.confirmButtonType}
            vOn:click={this.confirm}>
          {this.displayConfirmButtonText}
        </el-button>
      </div>
    </div>
    return h('x-popover', {
          props: Object.assign({
            value: this.visible
          }, this.$attrs),
          on: {
            input: (visible) => {
              this.visible = visible
            }
          }
        },
        [defaultSlot, h('template', {
          slot: 'reference'
        }, [reference])])

  }
}
</script>
