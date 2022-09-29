<template>
  <FilterListLayout>
    <template #header>
      <BaseFilterPanel :form-config="formConfig" @query="handleQuery">
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
          <ExtRemoteSelect v-model="formConfig.model.name2"
                           clearable
                           request-key="example.getSelectList1"></ExtRemoteSelect>
        </FilterItem>
        <FilterItem prop="name3">
          <ExtStaticSelect v-model="formConfig.model.name3"
                           clearable
                           placeholder="请选择性别"
                           :items="CONSTANCE.sex">
          </ExtStaticSelect>
        </FilterItem>
        <FilterItem prop="name4">
          <ExtRemoteSelect v-model.trim="formConfig.model.name4"
                           :label="formConfig.model.label4"
                           :clearable="true"
                           :multiple="true"
                           :show-page="true"
                           :collapse-tags="true"
                           placeholder="请选择角色"
                           value-key="no"
                           label-key="name"
                           request-key="example.getUserList"></ExtRemoteSelect>
        </FilterItem>
      </BaseFilterPanel>
    </template>
    <template #content>
      <XGrid :gridOptions="gridOptions"
             :query-promise-function="createQuery"
             ref="xGrid"
             @toolbar-button-click="toolbarButtonClickEvent">

      </XGrid>
    </template>
  </FilterListLayout>

</template>
<script>
import BaseFilterPanel from '@/components/BaseFilterPanel'
import FilterItem from '@/components/BaseFilterPanel/FilterItem'
import FilterListLayout from '@/components/layout/FilterListLayout'
import ExtStaticSelect from '@/components/ExtStaticSelect'
import ExtRemoteSelect from '@/components/ExtRemoteSelect'
import DropDownTree from '@/components/DropDownTree'
import service from '@/api/service'
import XGrid from '@/components/vxe/XGrid'
import constance from './constance'
import UserForm from './form'

export default {
  name: 'UserList',
  components: {
    FilterItem,
    ExtStaticSelect,
    BaseFilterPanel,
    FilterListLayout,
    ExtRemoteSelect,
    DropDownTree,
    XGrid
  },
  mixins: [constance],
  data() {
    return {
      formConfig: {
        model: {
          name1: '722FF1B7692F44C59A8EE344F34C823F',
          name2: '',
          name3: '',
          name4: ['ald0030034', 'ald0030005'],
          label4: ['杨景妮', '韩花娥']
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
      gridOptions: {
        params: {},
        pagerConfig: true,
        toolbarConfig: {
          buttons: [{
            code: 'add',
            name: '新增',
            status: 'primary',
            size: 'small',
            icon: 'vxe-icon-square-plus'
          }]
        },
        columns: [{
          type: 'seq',
          title: '序号',
          width: 60
        }, {
          field: 'name',
          title: '姓名'
        }, {
          field: 'orgName',
          title: '组织'
        }, {
          field: 'sex',
          title: '性别'
        }, {
          field: 'age',
          title: '年龄'
        }, {
          field: 'role',
          title: '角色'
        }, {
          field: 'phonenumber',
          title: '手机号码'
        }, {
          field: 'address',
          title: '地址'
        }]
      }
    }
  },
  methods: {
    fetchSyncTreePromiseFn: function(params) {
      return service.requestByKey('example.getSyncTree', params)
    },
    handleQuery(params) {
      this.gridOptions.params = {
        a: new Date().getTime(),
        ...params
      }
    },
    toolbarButtonClickEvent({ code }) {
      if (code === 'add') {
        console.log('add')
        this.$dialog(UserForm, {
          form: {}
        }).show({
          title: '新增用户',
          width: '580px'
        })
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
                orgName: 'T1',
                sex: '1',
                age: 28,
                phonenumber: '13937143905',
                role: 'Develop',
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
