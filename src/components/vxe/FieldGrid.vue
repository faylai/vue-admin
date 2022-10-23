<script>
import elEmitter from 'element-ui/lib/mixins/emitter'
import { normalizeSlots } from '@/utils'
import XGrid from './XGrid'
import lodash from 'lodash'

const inner = 'inner'
const outer = 'outer'
export default {
  name: 'FieldGrid',
  mixins: [elEmitter],
  inheritAttrs: false,
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
    value: Object
  }, XGrid.props),
  computed: {
    instance: function() {
      return this.$children[0]
    }
  },
  data() {
    return {
      editType: outer
    }
  },
  methods: {
    emitChange() {
      console.log('change')
      this.$emit('change', this.getValue())
      this.dispatch('ElFormItem', 'el.form.change', this.getValue())
    },
    onActive: function() {
      this.editType = inner
    },
    setInnerType() {
      this.editType = inner
    },
    setOuterType() {
      this.editType = outer
    },
    /**
     * 处理自动触发验证的逻辑，只要再编辑里面切换行就验证
     * @param params
     */
    onEditClosed(params) {
      // 触发数据同步
      const $table = $(this.$el).find('.vxe-table')
      if (params.$event && params.$event.target && $.contains($table, params.$event.target)) {
        this.setInnerType()
      } else {
        if (this.editType === inner) {
          this.onBlur()
        }
        this.setOuterType()
      }
    },
    getTableData() {
      return this.instance.getTableData()
    },
    getValue() {
      const ret = this.instance.getRecordset()
      ret.total = this.getTableData().length
      return ret
    },
    getRecordset() {
      return this.instance.getRecordset()
    },
    fullValidate() {
      this.instance.fullValidate.apply(this.instance, [].slice.call(arguments, 0))
    },
    validate(cb) {
      this.instance.validate().then(cb)
    },
    onBlur() {
      this.validate((err) => {
        if (!err) {
          this.emitChange()
        }
      })
    },
    // expose validate api for outer invoke
    showIfError() {
      this.validate(this.getTableData())
    },
    insert(obj, isValid = false) {
      this.instance.insert(obj || {}).then((meta) => {
        this.instance.setActiveRow(meta.row)
        isValid && this.onBlur()
      })
    },
    getCheckboxRecords() {
      return this.instance.getCheckboxRecords()
    },
    remove() {
      const rows = this.getCheckboxRecords()
      if (rows.length === 0) {
        this.$message.info('请选择要删除的行')
      } else {
        rows.forEach((row) => this.instance.remove(row))
      }
    },
    applyListeners(config) {
      const onEditClose = config['edit-closed'] || lodash.noop
      const onEditActived = config['edit-actived'] || lodash.noop
      const that = this
      config['edit-closed'] = function() {
        that.onEditClosed.apply(this, [].slice.call(arguments, 0))
        onEditClose.apply(this, [].slice.call(arguments, 0))
      }
      config['edit-actived'] = function() {
        that.onActive.apply(this, [].slice.call(arguments, 0))
        onEditActived.apply(this, [].slice.call(arguments, 0))
      }
      return config
    }
  },
  render(h) {
    const children = normalizeSlots(this.$slots)
    const listeners = this.applyListeners(this.$listeners)
    return h(XGrid, {
      props: this.$props,
      attrs: this.attrs,
      scopedSlots: this.$scopedSlots,
      on: listeners
    }, children)
  }
}
</script>
