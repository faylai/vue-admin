<template>
  <div>
    <FieldGrid
      ref="xGrid"
      :gridOptions="gridOptions"
      :queryOptions="queryOptions"
      @toolbar-button-click="toolbarButtonClickEvent"
    >
      <template #name="{ row }">
        <span>@</span>
        <span> {{ row.name }}</span>
      </template>
      <template #sex_edit="{ row }">
        <vxe-select v-model="row.sex" transfer>
          <vxe-option v-for="item in sexOptions" :key="item.value" :value="item.value" :label="item.label"></vxe-option>
        </vxe-select>
      </template>
    </FieldGrid>
  </div>
</template>
<script>
import FieldGrid from '@/components/vxe/FieldGrid'

export default {
  name: 'EditTable',
  components: {
    FieldGrid
  },
  data() {
    return {
      sexOptions: [
        {
          value: '1',
          label: '男'
        }, {
          value: '0',
          label: '女'
        }
      ],
      gridOptions: {
        border: true,
        resizable: true,
        keepSource: true,
        showOverflow: 'title',
        height: 530,
        pagerConfig: false,
        toolbarConfig: {
          buttons: [{
            code: 'refreshMe',
            type: 'text',
            name: '刷新'
          }, {
            code: 'addMe',
            type: 'text',
            name: '新增'
          }, {
            code: 'deleteMe',
            type: 'text',
            name: '删除'
          }, {
            code: 'saveMe',
            type: 'text',
            name: '保存'
          }, {
            code: 'validateMe',
            type: 'text',
            name: '校验'
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
            message: '名称必填'
          }, {
            min: 3,
            max: 50,
            message: '名称长度在 3 到 50 个字符'
          }],
          sex: [{
            required: true,
            message: '性别必填'
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
          title: '姓名',
          slots: { default: 'name' },
          editRender: { name: 'input' }
        }, {
          field: 'nickname',
          title: '昵称',
          editRender: { name: 'input' }
        }, {
          field: 'sex',
          title: '性别',
          editRender: {},
          slots: { edit: 'sex_edit' }
        }, {
          field: 'age',
          title: '年龄',
          editRender: {
            name: 'ElInputNumber'
          }
        }, {
          field: 'role',
          title: '角色',
          editRender: { name: 'input' }
        }, {
          field: 'address',
          title: '地址'
        }]
      }, queryOptions: {
        queryPromise: this.createQuery,
        queryParams: {}
      }
    }
  },
  methods: {
    toolbarButtonClickEvent({ code }) {
      const instance = this.$refs.xGrid.instance
      if (code === 'refreshMe') {
        this.queryOptions.queryParams = {
          a: new Date().getTime()
        }
      } else if (code === 'addMe') {
        instance.insert({
          name: ''
        })
      } else if (code === 'deleteMe') {
        const rows = instance.getCheckboxRecords()
        if (rows.length === 0) {
          this.$message.info('请选择要删除的行')
        } else {
          rows.forEach((row) => instance.remove(row))
        }
      } else if (code === 'saveMe') {
        // const {
        //   insertRecords,
        //   removeRecords,
        //   updateRecords
        // } = instance.getRecordset()
        const values = instance.getRecordset()
        console.log('values:' + JSON.stringify(values))
      } else if (code === 'validateMe') {
        instance.fullValidate(true, function(err) {
          console.log(err)
        })
      } else if (code === 'print') {
        this.printReview()
      }
    },
    createQuery: function(params) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            code: 1,
            data: {
              totalCount: 90,
              data: [{
                id: 10001,
                name: 'Test1',
                nickname: 'T1',
                role: 'Develop',
                sex: '1',
                age: 28,
                address: 'Shenzhen'
              }]
            }
          })
        }, 1000)
      })
    }
  }
}
</script>
