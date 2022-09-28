<script>
import settings from '@/settings'
import elEmitter from 'element-ui/lib/mixins/emitter'
import { validObjEmpty } from '@/utils'
import { createHOC } from 'vue-hoc'
import { Grid } from 'vxe-table'
import lodash from 'lodash'

const paginationConfig = settings.paginationConfig
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
    params: {
      type: Object,
      default: function() {
        return {}
      }
    },
    queryPromiseFunction: {
      type: Function,
      default() {
        return new Promise(function(resolve, reject) {
          reject('请初始化 queryPromiseFunction 方法')
        })
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
      const gridOptions = lodash.defaultsDeep({}, this.gridOptions || {})
      if (!lodash.isUndefined(gridOptions.pagerConfig)) {
        if (gridOptions.pagerConfig === true) {
          gridOptions.pagerConfig = {
            total: 0,
            currentPage: 1,
            pageSize: paginationConfig.defaultPageSize * 1
          }
        } else {
          gridOptions.pagerConfig = {}
          lodash.defaultsDeep(gridOptions.pagerConfig, {
            total: 0,
            currentPage: 1,
            enabled: false,
            pageSize: paginationConfig.defaultPageSize * 10
          })
        }
      }
      if (this.queryPromiseFunction) {
        gridOptions.proxyConfig = gridOptions.proxyConfig || {}
        lodash.defaultsDeep(gridOptions.proxyConfig, {
          seq: true,
          props: {
            result: paginationConfig.responseRootName,
            message: paginationConfig.responseMsgName,
            list: [paginationConfig.responseRootName, paginationConfig.responseRecordListKey].join('.'),
            total: [paginationConfig.responseRootName, paginationConfig.responseTotalCountKey].join('.')
          },
          ajax: {
            query: ({ page }) => {
              const params = {
                page: page.currentPage,
                pageIndex: page.currentPage,
                pageSize: page.pageSize
              }
              lodash.defaultsDeep(params, this.params || {})
              const queryPromise = this.queryPromiseFunction(params)
              return new Promise((resolve, reject) => {
                queryPromise.then((data) => {
                  resolve(data)
                  this.$nextTick(() => {
                    this.emitChange(this.getValue())
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
        this.emitChange(this.getValue())
      })
    }
  },
  created() {
    const unwatchQueryParams = this.$watch('params', function() {
      console.log('params change')
      this.instance.commitProxy('reload')
    }, { deep: true })
    this.$on('hook:beforeDestroy', function() {
      unwatchQueryParams()
    })
  },
  methods: {
    emitChange(values) {
      this.$emit('change', values)
      this.dispatch('ElFormItem', 'el.form.change', values)
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
    onEditClosed(params) {
      // console.log('editType =' + this.editType + ' & contains  ')
      if (params.$event && params.$event.target && $.contains(this.$el, params.$event.target)) {
        if ($(params.$event.target).closest('tr.vxe-body--row').length) {
          this.setInnerType()
        } else {
          if (this.editType === inner || this.editType === false) {
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
        this.emitChange(values)
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
        this.$emit('change', this.getValue())
      })
    }
  }
}, {
  props: function() {
    return this.packagedGridOptions
  },
  attrs: {
    'class': 'field-grid'
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
