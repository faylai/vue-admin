<script>
import XGrid from '@/components/vxe/XGrid'
import { addResizeListener, removeResizeListener } from 'element-ui/lib/utils/resize-event'
import Emitter from 'element-ui/lib/mixins/emitter'
import SmartCache from '@/components/SmartCache'
import { cloneDeep } from 'lodash'

const InputSizeMap = {
  medium: 36,
  small: 32,
  mini: 28
}
export default {
  name: 'DropDownGrid',
  model: {
    prop: 'value',
    event: 'change'
  },
  components: {
    XGrid,
    SmartCache
  },
  mixins: [
    Emitter
  ],
  props: {
    value: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    valueKey: {
      type: String,
      default: 'value'
    },
    labelKey: {
      type: String,
      default: 'label'
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
    gridConfig: {
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
      inputFocus: false,
      inputValue: '',
      presentText: '',
      dropDownVisible: false,
      presentTags: [],
      checkedNodes: [],
      keyword: ''
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
      this.keyword = ''
    },
    keywordInput(v) {
      this.keyword = v
    },
    handleFocus(e) {
      this.inputFocus = true
      this.$emit('focus', e)
    },
    handleBlur(e) {
      this.inputFocus = false
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
      this.keyword = ''
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
    gridChange({ newValue, oldValue, row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, $event }) {
      let rows = []
      if (this.multiple) {
        this.$refs.xGrid.toggleCheckboxRow(row)
        rows = this.$refs.xGrid.getCheckboxRecords()
      } else {
        rows = [row]
      }
      const value = rows.map((item) => {
        return item[this.valueKey]
      }).join(',')

      const checkedNodes = rows.map((item) => {
        return { objectId: item[this.valueKey], objectName: item[this.labelKey], ...item }
      })
      this.keyword = ''
      this.checkedNodes = checkedNodes
      this.emitChange(value, checkedNodes)
      this.computePresentContent()
    },
    onTreeRestore(value, selection) {
      const values = String(value || '').trim().split(',')
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
    },
    restorePresentFromLabel(values, labels) {
      this.checkedNodes = values.map(function(value, index) {
        return { objectId: value, objectName: labels[index] }
      })
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
    }
  },
  render(h) {
    const nodeScopeSlots = {
      node: this.$scopedSlots.node || function emptyScopeNode() {
        return ''
      }
    }
    const gridOptions = cloneDeep(this.gridConfig.gridOptions || {})
    if (gridOptions.columns) {
      if (this.multiple) {
        gridOptions.columns.unshift({
          type: 'checkbox',
          width: 50
        })
      }
    }
    gridOptions.rowConfig = {
      isCurrent: true,
      isHover: true
    }

    /* eslint-disable indent */
    return (<el-dropdown
        hide-on-click={false}
        vOn:visible-change={this.visibleChange}
        placement="bottom-start"
        ref="popper"
        trigger="none">
      <div slot="default"
           vOn:keyup_enter={($event) => {
             this.$refs.popper.show()
             const keyword = String(this.keyword).trim()
             if (keyword.length) {
               const params = Object.assign({}, gridOptions.params)
               params.keyword = keyword
               gridOptions.params = params
               console.log('trigger search ')
             }
           }}
           vOn:click_stop={() => {
             this.$refs.popper.show()
             return false
           }}
           class={[
             'el-drop-down-grid',
             this.realSize && ('el-drop-down-grid--' + this.realSize),
             this.isDisabled && 'is-disabled'
           ]}
           vOn:mouseenter={() => this.setInputHover(true)}
           vOn:mouseleave={() => this.setInputHover(false)}>
        <el-input
            ref="input"
            value={this.inputFocus ? this.keyword : this.keyword || this.presentText}
            size={this.realSize}
            vOn:input={this.keywordInput}
            placeholder={this.checkedNodes && this.checkedNodes.length ? this.presentText : this.placeholder}
            disabled={this.isDisabled}
            validate-event={false}
            class={[this.dropDownVisible && 'is-focus']}
            vOn:focus={this.handleFocus}
            vOn:blur={this.handleBlur}>{(() => {
          if (this.clearBtnVisible) {
            return <i slot="suffix"
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
            return <div class="el-drop-down-grid__tags" ref="tags">
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
                      vOn:close={() => this.deleteTag(tag)}>
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
        <SmartCache
            depProps={{ value: this.value, height: this.dropDownHeight, params: this.gridConfig.gridOptions.params }}
            nodeRender={() => {
              return (<XGrid scopedSlots={nodeScopeSlots}
                             ref="xGrid"
                             style={{ height: this.dropDownHeight }}
                             vOn:current-change={this.gridChange}
                             queryPromiseFunction={this.gridConfig.queryPromiseFunction}
                             gridOptions={gridOptions}> </XGrid>)
            }}/>
      </el-dropdown-menu>
    </el-dropdown>)
  }
}
</script>

<style lang="scss">
@import 'index.scss';
</style>
