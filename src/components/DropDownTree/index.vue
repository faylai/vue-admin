<script>
import XTree from '@/components/XTree'
import { addResizeListener, removeResizeListener } from 'element-ui/lib/utils/resize-event'

const InputSizeMap = {
  medium: 36,
  small: 32,
  mini: 28
}
export default {
  name: 'DropDownTree',
  model: {
    prop: 'value',
    event: 'change'
  },
  components: {
    XTree
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    size: String,
    clearable: Boolean,
    disabled: Boolean,
    collapseTags: Boolean,
    multiple: {
      type: Boolean,
      default: false
    }, placeholder: {
      type: String,
      default: () => '请选择'
    },
    dropDownHeight: {
      type: String,
      default: '350px'
    },
    treeConfig: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  inject: {
    elForm: {
      default: ''
    },
    elFormItem: {
      default: ''
    }
  },
  data() {
    return {
      inputHover: false,
      inputValue: '',
      presentText: '',
      dropDownVisible: false,
      presentTags: [],
      checkedNodes: []
    }
  },
  computed: {
    realSize() {
      const _elFormItemSize = (this.elFormItem || {}).elFormItemSize
      return this.size || _elFormItemSize || (this.$ELEMENT || {}).size
    },
    tagSize() {
      return ['small', 'mini'].indexOf(this.realSize) > -1 ? 'mini' : 'small'
    },
    isDisabled() {
      return this.disabled || (this.elForm || {}).disabled
    },
    clearBtnVisible() {
      if (!this.clearable || this.isDisabled || !this.inputHover) {
        return false
      }
      /* eslint-disable indent */
      return this.multiple
          ? !!this.checkedNodes.filter(node => !node.isDisabled).length
          : !!this.presentText
    }
  },
  methods: {
    setInputHover(value) {
      this.inputHover = value
    },
    visibleChange(visible) {
      this.dropDownVisible = visible
    },
    handleFocus(e) {
      this.$emit('focus', e)
    },
    handleBlur(e) {
      this.$emit('blur', e)
    },
    handleClear() {
      this.presentText = ''
      this.checkedNodes = []
      this.presentTags = []
      this.$emit('change', '', [])
    },
    computePresentContent() {
      // nextTick is required, because checked nodes may not change right now
      this.$nextTick(() => {
        if (this.multiple) {
          this.computePresentTags()
          this.presentText = ''
        } else {
          this.computePresentText()
        }
      })
    },
    computePresentText() {
      if (this.checkedNodes.length) {
        const node = this.checkedNodes[0]
        this.presentText = node.objectName
      } else {
        this.presentText = ''
      }
    },
    computePresentTags() {
      const { isDisabled, collapseTags, checkedNodes } = this
      const tags = []
      const genTag = node => ({
        node,
        key: node.objectId,
        text: node.objectName,
        hitState: false,
        closable: !isDisabled && !node.isDisabled
      })

      if (checkedNodes.length) {
        const [first, ...rest] = checkedNodes
        const restCount = rest.length
        tags.push(genTag(first))
        if (restCount) {
          if (collapseTags) {
            tags.push({
              key: -1,
              text: `+ ${restCount}`,
              closable: false
            })
          } else {
            rest.forEach(node => tags.push(genTag(node)))
          }
        }
      }
      this.presentTags = tags
    },
    deleteTag(tag) {
      const node = tag.node
      this.checkedNodes.splice(this.checkedNodes.indexOf(node), 1)
      this.presentTags.splice(this.presentTags.indexOf(tag), 1)
      this.$emit('change', this.checkedNodes.map(node => node.objectId).join(','), this.checkedNodes)
    },
    treeChange(value, selection) {
      this.checkedNodes = selection
      this.$emit('change', value, selection)
      this.computePresentContent()
    },
    onTreeRestore(value, selection) {
      const values = String(this.value || '').trim().split(',')
      this.checkedNodes = (selection || []).filter(function(node) {
        return values.indexOf(node.objectId) > -1
      })
      this.computePresentContent()
    },
    updateStyle() {
      const { inputInitialHeight } = this
      const input = this.$refs.input
      const panel = this.$refs.panel
      if (this.$isServer || !input.$el) return

      const inputInner = input.$el.querySelector('.el-input__inner')
      const tags = this.$refs.tags
      if (tags) {
        const offsetHeight = Math.round(tags.getBoundingClientRect().height)
        const height = Math.max(offsetHeight + 6, inputInitialHeight) + 'px'
        inputInner.style.height = height
      }
      if (panel || panel.$el) {
        panel.$el.style.minWidth = inputInner.offsetWidth + 'px'
        panel.$emit('updatePopper')
      }
    }
  },

  mounted() {
    const { input } = this.$refs
    if (input && input.$el) {
      this.inputInitialHeight = input.$el.offsetHeight || InputSizeMap[this.realSize] || 40
    }

    if (!String(this.value || '').trim() !== '') {
      this.computePresentContent()
    }

    addResizeListener(this.$el, this.updateStyle)
    this.$on('hook:beforeDestroy', () => {
      removeResizeListener(this.$el, this.updateStyle)
    })
  },
  watch: {
    presentTags(val, oldVal) {
      if (this.multiple && (val.length || oldVal.length)) {
        this.$nextTick(this.updateStyle)
      }
    }
  },
  render(h) {
    const nodeScopeSlots = {
      node: this.$scopedSlots.node || function emptyScopeNode() {
        return ''
      }
    }
    if (this.multiple) {
      this.treeConfig.selectMode = 'multiple'
    }
    this.treeConfig.value = this.value
    console.log('this.multiple', this.multiple)
    /* eslint-disable indent */
    return (<el-dropdown
        hide-on-click={false}
        vOn:visible-change={this.visibleChange}
        placement="bottom-start"
        trigger="click">
      <div slot="default"
           class={[
             'el-drop-down-tree',
             this.realSize && ('el-drop-down-tree--' + this.realSize),
             this.isDisabled && 'is-disabled'
           ]}
           vOn:mouseenter={() => this.setInputHover(true)}
           vOn:mouseleave={() => this.setInputHover(false)}>
        <el-input
            ref="input"
            value={this.presentText}
            size={this.realSize}
            placeholder={this.checkedNodes && this.checkedNodes.length ? '' : this.placeholder}
            readonly={true}
            disabled={this.isDisabled}
            validate-event={false}
            class={[this.dropDownVisible && 'is-focus']}
            vOn:focus={this.handleFocus}
            vOn:blur={this.handleBlur}>{(() => {
          if (this.clearBtnVisible) {
            return <i slot="suffix"
                      v-if="clearBtnVisible"
                      key="clear"
                      class="el-input__icon el-icon-circle-close"
                      vOn:click_stop={this.handleClear}></i>
          } else {
            return <i slot="suffix"
                      key="arrow-down"
                      class={[
                        'el-input__icon',
                        'el-icon-arrow-down',
                        this.dropDownVisible && 'is-reverse'
                      ]}></i>
          }
        })()
        }
        </el-input>
        {(() => {
          if (this.multiple) {
            return <div class="el-drop-down-tree__tags" ref="tags">
              {
                this.presentTags.map((tag) => {
                  return (<el-tag
                      key={tag.key}
                      type="info"
                      size={this.tagSize}
                      hit={tag.hitState}
                      closable={tag.closable}
                      disable-transitions
                      vOn:close={() => this.deleteTag(tag)}>
                    <span>{tag.text}</span>
                  </el-tag>)
                })
              }
            </div>
          } else {
            return h('')
          }
        })()
        }
      </div>
      <el-dropdown-menu slot="dropdown" ref="panel">
        <XTree scopedSlots={nodeScopeSlots}
               vOn:change={this.treeChange}
               vOn:restore={this.onTreeRestore}
               value={this.value}
               style={{ height: this.dropDownHeight }}
               {...{ attrs: this.treeConfig }}> </XTree>
      </el-dropdown-menu>
    </el-dropdown>)
  }
}
</script>

<style lang="scss">
@import 'index.scss';
</style>
