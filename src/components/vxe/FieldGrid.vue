<script>
import elEmitter from 'element-ui/lib/mixins/emitter'
import { validObjEmpty } from '@/utils'
import service from '@/api/service'
import { createHOC } from 'vue-hoc'
import { Grid } from 'vxe-table'
import lodash from 'lodash'

const inner = 'inner'
const outer = 'outer'
export default createHOC(Grid, {
  name: 'FieldGrid',
  mixins: [elEmitter],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    // 封装自定义配置
    queryOptions: {
      type: Object,
      default: function() {
        return {
          // 查询参数改变的调用查询函数
          queryParams: false, // 查询接口
          queryPromise: false
        }
      }
    },
    gridOptions: {
      type: Object,
      default: function() {
        return {}
      }
    }, /*
      insertRecords:  插入新增的数据
      removeRecords:  删除的数据
      updateRecords: 更新的数据
      all:  所有数据
      error: 错误的数据
     */
    value: Object
  },
  computed: {
    instance: function() {
      return this.$children[0]
    },
    packagedGridOptions() {
      const gridOptions = this._.defaultsDeep({}, this.gridOptions || {})
      if (!this._.isUndefined(gridOptions.pagerConfig) && this.queryOptions.queryPromise) {
        if (gridOptions.pagerConfig === true) {
          gridOptions.pagerConfig = {
            total: 0,
            currentPage: 1,
            pageSize: 10
          }
        } else {
          gridOptions.pagerConfig = {}
          this._.defaultsDeep(gridOptions.pagerConfig, {
            total: 0,
            currentPage: 1,
            enabled: false,
            pageSize: 1000
          })
        }
      }
      if (this.queryOptions && this.queryOptions.queryPromise) {
        gridOptions.proxyConfig = gridOptions.proxyConfig || {}
        this._.defaultsDeep(gridOptions.proxyConfig, {
          seq: true,
          props: {
            result: 'data.data',
            message: 'msg',
            list: 'data.data',
            total: 'data.totalCount'
          },
          ajax: {
            query: ({ page }) => {
              const params = {
                page: page.currentPage,
                pageIndex: page.currentPage,
                pageSize: page.pageSize
              }
              this._.defaultsDeep(params, this.queryOptions.queryParams || {})
              const queryPromise = this._.isFunction(this.queryOptions.queryPromise) ? this.queryOptions.queryPromise(
                params) : service.requestByKey(this.queryOptions.queryPromise, params)
              return new Promise((resolve, reject) => {
                queryPromise.then((data) => {
                  resolve(data)
                  this.$nextTick(() => {
                    const values = this.getValue()
                    this.$emit('change', values)
                    this.dispatch('ElFormItem', 'el.form.change', [values])
                  })
                }, (err) => {
                  reject(err)
                })
              })
            }
          }
        })
      }
      return gridOptions
    }
  },
  data() {
    return {
      editType: false
    }
  },
  watch: {
    'gridOptions.data': function() {
      this.$nextTick(() => {
        const values = this.getValue()
        this.$emit('change', values)
      })
    }
  },
  created() {
    if (this.queryOptions && this.queryOptions.queryPromise && this.queryOptions.queryParams) {
      const unwatchQueryParams = this.$watch('queryOptions.queryParams', function() {
        this.instance.commitProxy('reload')
      }, { deep: true })
      this.$on('hook:beforeDestroy', function() {
        unwatchQueryParams()
      })
    }
  },
  methods: {
    onActive: function() {
      this.editType = inner
    },
    setInnerType() {
      this.editType = inner
    },
    setOuterType() {
      this.editType = outer
    },
    onEditClosed(params) {
      // console.log('editType =' + this.editType + ' & contains  ')
      if (params.$event && params.$event.target && $.contains(this.$el, params.$event.target)) {
        if ($(params.$event.target).closest('tr.vxe-body--row').length) {
          this.setInnerType()
        } else {
          if (this.editType === inner || this.editType === false) {
            this.setOuterType()
            this.onBlur()
          } else {
            this.setOuterType()
          }
        }
      }
    },
    getValue() {
      const values = this.instance.getRecordset()
      const allData = this.instance.getTableData()
      values.all = allData.fullData || []
      return values
    },
    onBlur() {
      // console.log('blur')
      const values = this.getValue()
      this.setOuterType()
      const rows = values.all.filter(item => !validObjEmpty(item))
      this.instance.fullValidate(rows, (err) => {
        values.error = err
        this.setOuterType()
        this.$emit('change', values)
        this.dispatch('ElFormItem', 'el.form.change', [values])
      })
    },
    // expose validate api for outer invoke
    showIfError() {
      this.instance.fullValidate(function() {
      })
    },
    insert(obj, isValid = false) {
      this.instance.insert(obj || {}).then((meta) => {
        this.instance.setActiveRow(meta.row)
        isValid && this.onBlur()
      })
    },
    delete(isValid = false) {
      const rows = this.instance.getCheckboxRecords()
      if (rows.length === 0) {
        this.$message.info('请选择要删除的行')
      } else {
        rows.forEach((row) => this.instance.remove(row))
        isValid && this.onBlur()
      }
    }
  },
  mounted() {
    if (this.gridOptions.data) {
      this.$nextTick(() => {
        const values = this.getValue()
        this.$emit('change', values)
        this.dispatch('ElFormItem', 'el.form.change', [values])
      })
    }
  }
}, {
  props: function() {
    return this.packagedGridOptions
  },
  attrs: {
    'class': 'field-grid',
    'ref': 'instance'
  },
  listeners: function(config) {
    const onEditClose = config['edit-closed'] || lodash.noop
    const onEditActived = config['edit-actived'] || lodash.noop
    const that = this
    config['edit-closed'] = function(params) {
      that.onEditClosed.call(this, params)
      onEditClose.apply(this, params)
    }
    config['edit-actived'] = function(params) {
      that.onActive.apply(this, params)
      onEditActived.apply(this, params)
    }
    return config
  }
})
</script>
