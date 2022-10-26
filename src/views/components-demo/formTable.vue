<template>
  <el-form ref="form" :model="form" :rules="rules" label-width="80px">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
      </el-col>

      <el-col :span="24">
        <el-form-item label="物料" prop="table">
          <FieldGrid
              ref="xGrid"
              style="height: 300px"
              v-model="form.table"
              :gridOptions="gridOptions"
              :query-promise-function="queryOptions.queryPromiseFunction"
              @toolbar-button-click="toolbarButtonClickEvent">
          </FieldGrid>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>

</template>

<script>
import constance from './user/constance'
import FieldGrid from '@/components/vxe/FieldGrid'

export default {
  name: 'UserForm',
  components: {
    FieldGrid
  },
  mixins: [constance],
  props: {},
  data() {
    return {
      form: {
        remark: '',
        table: {}
      },
      // 表单校验
      rules: {
        userName: [
          { required: true, message: '用户名称不能为空', trigger: 'blur' },
          { min: 2, max: 20, message: '用户名称长度必须介于 2 和 20 之间', trigger: 'blur' }
        ]
      },
      gridOptions: {
        params: {},
        border: true,
        resizable: true,
        keepSource: true,
        showOverflow: 'title',
        height: 'auto',
        pagerConfig: false, // 不分页
        toolbarConfig: {
          buttons: [{
            code: 'addMe',
            name: '新增',
            size: 'small',
            icon: 'vxe-icon-square-plus'
          }, {
            code: 'deleteMe',
            name: '删除',
            size: 'small',
            icon: 'vxe-icon-delete'
          }]
        },
        editConfig: {
          trigger: 'click',
          mode: 'row',
          showStatus: true
        },
        editRules: {
          name: [{
            required: true,
            message: '物料名称必填'
          }, {
            min: 3,
            max: 50,
            message: '名称长度在 3 到 50 个字符'
          }]
        },
        columns: [{
          type: 'checkbox',
          width: 50
        }, {
          type: 'seq',
          title: '序号',
          width: 60
        }, {
          field: 'name',
          title: '物料名称',
          editRender: { name: 'input' }
        }, {
          field: 'sex',
          title: '个数'
        }]
      },
      queryOptions: {
        queryPromiseFunction: this.createQuery
      }
    }
  },
  methods: {
    confirm(dialog) {
      this.$refs.form.validate(valid => {
        if (valid) {
          dialog && dialog.close()
        }
      })
    },
    toolbarButtonClickEvent({ code }) {
      const instance = this.$refs.xGrid
      if (code === 'refreshMe') {
        this.gridOptions.params = {
          a: new Date().getTime()
        }
      } else if (code === 'addMe') {
        instance.insert({
          name: ''
        })
      } else if (code === 'deleteMe') {
        instance.remove()
      } else if (code === 'saveMe') {
        // const {
        //   insertRecords,
        //   removeRecords,
        //   updateRecords
        // } = instance.getRecordset()
        const values = instance.getRecordset()
        console.log('values:' + JSON.stringify(values))
      }
    },
    test() {
      console.log('test')
    }
  },
  $dialogButton: {
    confirmButton: true,
    cancelButton: true,
    buttons: []
  }
}
</script>

<style scoped>

</style>
