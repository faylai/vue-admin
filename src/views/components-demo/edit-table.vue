<template>
  <FilterListLayout>
    <template #header>
      <BaseFilterPanel :form-config="formConfig" @query="handleQuery">
        <FilterItem>
          <el-button @click="showFormDialog">物料入库</el-button>
        </FilterItem>
        <FilterItem prop="name1">
          <DropDownTree
              v-model="formConfig.model.name1"
              placeholder="请选择组织"
              :collapseTags="true"
              :clearable="true"
              :multiple="true"
              :tree-config="{localSearch:true,fetchTreePromiseFn:fetchSyncTreePromiseFn}">
          </DropDownTree>
        </FilterItem>
        <FilterItem prop="name2">
          <SmartCache :dep-props="{value:formConfig.model.name2}">
            <ExtRemoteSelect v-model="formConfig.model.name2"
                             request-key="example.getSelectList1"></ExtRemoteSelect>
          </SmartCache>
        </FilterItem>
        <FilterItem prop="name3">
          <ExtStaticSelect v-model="formConfig.model.name3"
                           clearable
                           @change="selectChange"
                           :items="[{value:'11',label:'11'},{value:'22',label:'22'},{value:'333',label:'333'}]">
            <template #prefix>
              <div style="color:red;padding: 10px;">请一定要选择哈哈</div>
            </template>
          </ExtStaticSelect>
        </FilterItem>
        <FilterItem prop="name4">
          <ExtRemoteSelect v-model.trim="formConfig.model.name4"
                           :label="formConfig.model.label4"
                           :params="selectParams"
                           :clearable="true"
                           :multiple="true"
                           :show-page="false"
                           :collapse-tags="true"
                           value-key="no"
                           label-key="name"
                           request-key="example.getPersonList"></ExtRemoteSelect>

        </FilterItem>

      </BaseFilterPanel>
    </template>
    <template #content>
      <FieldGrid
          ref="xGrid"
          :gridOptions="gridOptions"
          :query-promise-function="queryOptions.queryPromiseFunction"
          @toolbar-button-click="toolbarButtonClickEvent">
        <template #name="{ row }">
          <span> {{ row.name }}</span>
        </template>
        <template #sex_edit="{ row }">
          <el-select v-model="row.sex" transfer>
            <el-option v-for="item in sexOptions" :key="item.value" :value="item.value"
                       :label="item.label"></el-option>
          </el-select>
        </template>
        <template #role_edit="{ row }">
          <ExtRemoteSelect v-model.trim="row.role"
                           :clearable="true"
                           :show-page="true"
                           :collapse-tags="true"
                           placeholder="请选择角色"
                           value-key="no"
                           label-key="name"
                           request-key="example.getPersonList">
          </ExtRemoteSelect>
        </template>
        <template #org_edit="{ row }">
          <DropDownTree
              v-model="row.org"
              placeholder="请选择组织"
              :collapseTags="true"
              @change="onOrgChange(arguments,row)"
              :clearable="true"
              :multiple="false"
              :tree-config="{localSearch:true,fetchTreePromiseFn:fetchSyncTreePromiseFn}">
          </DropDownTree>
        </template>
      </FieldGrid>
    </template>
  </FilterListLayout>

</template>
<script>
import FieldGrid from '@/components/vxe/FieldGrid'
import BaseFilterPanel from '@/components/BaseFilterPanel'
import FilterItem from '@/components/BaseFilterPanel/FilterItem'
import FilterListLayout from '@/components/layout/FilterListLayout'
import ExtStaticSelect from '@/components/ExtStaticSelect'
import ExtRemoteSelect from '@/components/ExtRemoteSelect'
import DropDownTree from '@/components/DropDownTree'
import service from '@/api/service'
import formTable from '@/views/components-demo/formTable'
import SmartCache from '@/components/SmartCache'

export default {
  name: 'EditTable',
  components: {
    FieldGrid,
    FilterItem,
    ExtStaticSelect,
    BaseFilterPanel,
    FilterListLayout,
    ExtRemoteSelect,
    DropDownTree,
    SmartCache
  },
  data() {
    return {
      selectParams: {
        test: 1
      },
      formConfig: {
        model: {
          name1: '722FF1B7692F44C59A8EE344F34C823F',
          name2: '',
          name3: '22',
          name4: ['ald0030034', 'ald0030005', 'ald0030001'],
          label4: ['杨景妮', '韩花娥', '魏永森']
        },
        rules: {
          name1: [
            { required: true, message: '请选择组织', trigger: 'change' }
          ],
          name3: [
            { required: true, message: '请选择', trigger: 'change' }
          ]
        }
      },
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
        params: {},
        border: true,
        resizable: true,
        keepSource: true,
        showOverflow: 'title',
        height: 'auto',
        pagerConfig: true,
        toolbarConfig: {
          buttons: [{
            code: 'refreshMe',
            size: 'small',
            name: '刷新'
          }, {
            code: 'addMe',
            name: '新增',
            size: 'small',
            icon: 'vxe-icon-square-plus'
          }, {
            code: 'deleteMe',
            name: '删除',
            size: 'small',
            icon: 'vxe-icon-delete'
          }, {
            code: 'saveMe',
            name: '保存',
            status: 'success',
            size: 'small',
            icon: 'vxe-icon-save'
          }, {
            code: 'validateMe',
            size: 'small',
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
          field: 'org',
          title: '组织',
          formatter(params) {
            return params.row.orgName
          },
          editRender: {},
          slots: { edit: 'org_edit' }
        }, {
          field: 'sex',
          title: '性别',
          formatter: function(params) {
            if (String(params.cellValue) === '1') {
              return '男'
            } else {
              return '女'
            }
          },
          editRender: {},
          slots: { edit: 'sex_edit' }
        }, {
          field: 'age',
          title: '年龄',
          editRender: {
            name: 'input'
          }
        }, {
          field: 'role',
          title: '角色',
          editRender: {},
          slots: { edit: 'role_edit' },
          formatter(params) {
            return params.row.roleName
          }
        }, {
          field: 'address',
          title: '地址'
        }]
      },
      queryOptions: {
        queryPromiseFunction: this.createQuery
      }
    }
  },
  methods: {
    showFormDialog() {
      this.$dialog(formTable, {
        form: {}
      }).show({
        title: '物料入库',
        width: '600px'
      })
    },
    fetchSyncTreePromiseFn: function(params) {
      return service.requestByKey('example.getSyncTree', params)
    },
    selectChange(value) {
      this.selectParams = {
        test: value
      }
    },
    handleQuery(params) {
      console.log('查询参数', params)
      this.gridOptions.params = {
        a: new Date().getTime(),
        ...params
      }
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
      } else if (code === 'validateMe') {
        instance.fullValidate(true, function(err) {
          console.log(err)
        })
      } else if (code === 'print') {
        this.printReview()
      }
    },
    onOrgChange(rawArgs, row) {
      if (rawArgs[1].length) {
        row.orgName = rawArgs[1][0].objectName
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
                org: '722FF1B7692F44C59A8EE344F34C823F',
                orgName: '安蓝环保',
                role: 'ald0030040',
                roleName: '倪祖华',
                sex: '1',
                age: 28,
                address: 'Shenzhen 88888888888888888888888888888888888'
              }]
            }
          })
        }, 1000)
      })
    }
  }
}
</script>
