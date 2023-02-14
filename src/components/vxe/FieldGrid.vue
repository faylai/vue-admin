<script>
import elEmitter from 'element-ui/lib/mixins/emitter'
import { normalizeSlots } from '@/utils'
import XGrid from './XGrid'
import lodash from 'lodash'
import clickoutside from 'element-ui/lib/utils/clickoutside'

export default {
  name: 'FieldGrid',
  mixins: [elEmitter],
  inheritAttrs: false,
  directives: {
    clickoutside
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  props: lodash.defaultsDeep({
    /*
        insertRecords:  插入新增的数据
        removeRecords:  删除的数据
        updateRecords: 更新的数据
        all:  所有数据
        error: 错误的数据
       */
    value: {},
    ignoreUpdate: {
      type: Boolean,
      default: false
    },
    editable: {
      type: Boolean,
      default: true
    }
  }, XGrid.props),
  computed: {
    instance: function() {
      return this.$children[0]
    }
  },
  data() {
    return {}
  },
  methods: {
    emitChange(error) {
      let value = {}
      if (error) {
        Object.defineProperties(value, {
          total: {
            value: 0,
            enumerable: false
          },
          error: {
            value: error,
            enumerable: false
          }
        })
      } else {
        value = this.getValue()
      }
      const defaultValue = { 'insertRecords': [], 'removeRecords': [], 'updateRecords': [], total: 0 }
      const currentValue = lodash.cloneDeep(this.value || defaultValue)
      currentValue.total = value.total
      if (!lodash.isEqual(currentValue, lodash.cloneDeep(value))) {
        this.$emit('change', value)
        this.dispatch('ElFormItem', 'el.form.change', value)
      }
    },
    onActive: function() {
      // 看以后有什么用处
    },
    /**
     * 处理自动触发验证的逻辑，只要再编辑里面切换行就验证
     * @param params
     */
    onEditClosed(params) {
      // 看以后有什么用处
    },
    getTableData() {
      return this.instance.getTableData()
    },
    deleteXRowKey(list) {
      (list || []).forEach(function(item) {
        delete item._X_ROW_KEY
      })
      return list
    },
    getValue() {
      let ret = []
      const allDate = (this.getTableData().tableData || [])
      if (this.ignoreUpdate) {
        ret = lodash.cloneDeep(allDate)
        this.deleteXRowKey(ret)
      } else {
        ret = lodash.cloneDeep(this.instance.getRecordset())
        Object.keys(ret).forEach((key) => {
          this.deleteXRowKey(ret[key])
        })
      }
      const total = allDate.length
      Object.defineProperties(ret, {
        total: {
          value: total,
          enumerable: false
        }
      })
      return ret
    },
    getRecordset() {
      return this.instance.getRecordset()
    },
    fullValidate() {
      this.instance.fullValidate.apply(this.instance, [].slice.call(arguments, 0))
    },
    validate(cb) {
      this.instance.validate(true).then(cb)
    },
    onBlur() {
      this.canValidate && this.validate((err) => {
        this.emitChange(err)
      })
    },
    // expose validate api for outer invoke
    showIfError() {
      this.validate(this.getTableData())
    },
    insert(obj, isAppend) {
      this.instance[isAppend === true ? 'insertAt' : 'insert'](obj || {}, -1).then((meta) => {
        this.instance.setActiveRow(meta.row)
        this.onBlur()
      })
    },
    getCheckboxRecords() {
      return this.instance.getCheckboxRecords()
    },
    onLoaded() {
      const data = this.getTableData().tableData || []
      if (data.length) {
        this.onBlur()
      }
    },
    removeAll() {
      const rows = this.getTableData().tableData || []
      rows.forEach((row) => this.instance.remove(row))
    },
    remove(row) {
      const rows = (lodash.isNil(row) ? this.getCheckboxRecords() : lodash.isArray(row) ? row : [row])
      if (rows.length === 0) {
        this.$message.info('请选择要删除的行')
      } else {
        rows.forEach((row) => this.instance.remove(row))
      }
    },
    applyListeners(config) {
      const listeners = Object.assign({}, config)
      const onEditClose = listeners['edit-closed'] || lodash.noop
      const onEditActived = listeners['edit-actived'] || lodash.noop
      const onLoaded = listeners['loaded'] || lodash.noop
      const that = this
      listeners['edit-closed'] = function() {
        that.onEditClosed.apply(this, [].slice.call(arguments, 0))
        onEditClose.apply(this, [].slice.call(arguments, 0))
        that.onBlur()
      }
      listeners['edit-actived'] = function() {
        that.onActive.apply(this, [].slice.call(arguments, 0))
        onEditActived.apply(this, [].slice.call(arguments, 0))
      }
      listeners['loaded'] = function() {
        that.onLoaded.apply(this, [].slice.call(arguments, 0))
        onLoaded.apply(this, [].slice.call(arguments, 0))
      }
      return listeners
    },
    filterEditable($props) {
      if (!this.editable) {
        const props = lodash.cloneDeep($props)
        if (props.gridOptions && props.gridOptions.columns) {
          props.gridOptions.columns = props.gridOptions.columns.map(function(item) {
            const newItem = lodash.cloneDeep(item)
            delete newItem.editRender
            return newItem
          })
          return props
        } else {
          return $props
        }
      } else {
        return $props
      }
    },
    disableValidate() {
      this.canValidate = false
    },
    enableValidate() {
      this.canValidate = true
      this.onBlur()
    }
  },
  created() {
    this.canValidate = true
  },
  render(h) {
    const children = normalizeSlots(this.$slots)
    const listeners = this.applyListeners(this.$listeners)
    return h(XGrid, {
      props: this.filterEditable(this.$props),
      directives: [
        {
          name: 'clickoutside',
          value: () => {
            this.onBlur()
          }
        }
      ],
      attrs: this.$attrs,
      scopedSlots: this.$scopedSlots,
      on: listeners
    }, children)
  }
}
</script>
