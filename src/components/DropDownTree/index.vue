<script>
import XTree from '@/components/XTree'
import { addResizeListener, removeResizeListener } from 'element-ui/lib/utils/resize-event'
import Emitter from 'element-ui/lib/mixins/emitter'
import SmartCache from '@/components/SmartCache'

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
    XTree,
    SmartCache
  },
  mixins: [
    Emitter
  ],
  props: {
    value: {
      type: [String, Number],
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
    displayNameFormat: {
      type: Function,
      default(node) {
        return node.objectName
      }
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
      checkedNodes: [],
      dropDownDisabled: false
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
      if (visible) {
        this.$nextTick(function() {
          // console.log('visible change')
          this.$refs.xtree.focusInput()
        })
      }
    },
    handleFocus(e) {
      this.$emit('focus', e)
    },
    handleBlur(e) {
      this.$emit('blur', e)
    },
    emitChange(value, nodes) {
      this.$emit('change', value, nodes)
      this.dispatch('ElFormItem', 'el.form.change', value)
    },
    handleClear() {
      this.presentText = ''
      this.checkedNodes = []
      this.presentTags = []
      this.emitChange('', [])
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
        this.presentText = this.displayNameFormat(node)
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
        text: this.displayNameFormat(node),
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
              text: `+${restCount > 99 ? 99 : restCount}`,
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
      this.computePresentContent()
      this.emitChange(this.checkedNodes.map(node => node.objectId).join(','), this.checkedNodes)
    },
    treeChange(value, selection) {
      this.checkedNodes = selection
      this.emitChange(value, selection)
      this.computePresentContent()
      if (!this.multiple && selection.length) {
        this.$refs.popper.hide()
      }
    },
    onTreeRestore(value, selection) {
      const values = String(value || '').trim().split(',')
      this.checkedNodes = (selection || []).filter(function(node) {
        return values.indexOf(node.objectId) > -1
      })
      this.computePresentContent()
      this.$emit('restore', value, selection)
    },
    onTreeFirstLoad() {
      // 处理disable的情况
      this.$nextTick(function() {
        this.dropDownDisabled = this.disabled
      })
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
    },
    restorePresentFromLabel(values, labels) {
      this.checkedNodes = values.map(function(value, index) {
        return { objectId: value, objectName: labels[index] }
      })
      this.computePresentContent()
    }
  },
  mounted() {
    const { input } = this.$refs
    if (input && input.$el) {
      this.inputInitialHeight = input.$el.offsetHeight || InputSizeMap[this.realSize] || 40
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
    },
    label: {
      handler(newValue, oldValue) {
        const labels = String(this.label || '').trim().split(',')
        const values = String(this.value || '').trim().split(',')
        if (labels.length && labels.length === values.length && !(values.length === 1 && values[0] === '')) {
          this.restorePresentFromLabel(values, labels)
        }
      },
      immediate: true
    },
    disabled(v, o) {
      if (o !== undefined && v !== o) {
        this.dropDownDisabled = v
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
    // console.log('this.treeConfig', this.treeConfig)
    /* eslint-disable indent */
    return (<el-dropdown
      hide-on-click={false}
      ref="popper"
      vOn:visible-change={this.visibleChange}
      placement="bottom-start"
      disabled={this.dropDownDisabled}
      trigger="click"
    >
      <div slot="default"
           class={[
             'el-drop-down-tree',
             this.realSize && ('el-drop-down-tree--' + this.realSize),
             this.isDisabled && 'is-disabled'
           ]}
           vOn:mouseenter={() => this.setInputHover(true)}
           vOn:mouseleave={() => this.setInputHover(false)}
      >
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
          vOn:blur={this.handleBlur}
        >{(() => {
          if (this.clearBtnVisible) {
            return <i slot="suffix"
                      key="clear"
                      class="el-input__icon el-icon-circle-close"
                      vOn:click_stop={this.handleClear}
            ></i>
          } else {
            return <i slot="suffix"
                      key="arrow-down"
                      class={[
                        'el-input__icon',
                        'el-icon-arrow-down',
                        this.dropDownVisible && 'is-reverse'
                      ]}
            ></i>
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
                    class={[this.collapseTags && 'collapse-tag']}
                    vOn:close={() => this.deleteTag(tag)}
                  >
                    <span title={tag.text}>{tag.text}</span>
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
        {/** 这里要注意 depProps 配置，depProps 里面变量的是否变动决定了xtree 是否重新渲染 */}
        <SmartCache depProps={{
          value: this.value,
          height: this.dropDownHeight,
          params: this.treeConfig.params,
          selectObjectType: this.treeConfig.selectObjectType
        }}
                    nodeRender={() => {
                      return (<XTree scopedSlots={nodeScopeSlots}
                                     ref="xtree"
                                     vOn:change={this.treeChange}
                                     vOn:restore={this.onTreeRestore}
                                     vOn:firstLoad={this.onTreeFirstLoad}
                                     value={String(this.value)}
                                     style={{ height: this.dropDownHeight }}
                                     {...{ attrs: this.treeConfig }}>
                        <template slot="rightbar">{this.$slots.rightbar}</template>
                      </XTree>)
                    }}
        />
      </el-dropdown-menu>
    </el-dropdown>)
  }
}
</script>

<style lang="scss">
@import 'index.scss';
</style>
