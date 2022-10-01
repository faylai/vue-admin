<template>
  <FilterListLayout>
    <template #header>
      <BaseFilterPanel :form-config="formConfig" @query="handleQuery">
        <FilterItem prop="name1">
          <DropDownTree
              v-model="formConfig.model.name1"
              placeholder="请选择部门"
              :collapseTags="true"
              :clearable="true"
              :multiple="true"
              :tree-config="{localSearch:true,fetchTreePromiseFn:fetchSyncTreePromiseFn}">
          </DropDownTree>
        </FilterItem>
        <FilterItem prop="name2">
          <ExtStaticSelect v-model="formConfig.model.name2"
                           clearable
                           placeholder="请选择状态"
                           :items="CONSTANCE.userStatus"></ExtStaticSelect>
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
                           request-key="example.getPersonList"></ExtRemoteSelect>
        </FilterItem>

        <FilterItem prop="name4">
          <ExtRemoteSelect v-model.trim="formConfig.model.name5"
                           :label="formConfig.model.name5"
                           :clearable="true"
                           :multiple="true"
                           :collapse-tags="true"
                           placeholder="请选择角色"
                           value-key="no"
                           label-key="name"
                           request-key="example.getPersonList"></ExtRemoteSelect>
        </FilterItem>

      </BaseFilterPanel>
    </template>
    <template #content>
      <XGrid :gridOptions="gridOptions"
             :query-promise-function="fetchUserListFunction"
             ref="xGrid"
             @toolbar-button-click="toolbarButtonClickEvent">
        <template #operate="{ row }">
          <vxe-button icon="vxe-icon-edit" @click="showFormDialog(row)">修改</vxe-button>
          <XPopConfirm
              @confirm="remove(row)"
              type="delete">
            <vxe-button  icon="vxe-icon-delete">删除</vxe-button>
          </XPopConfirm>
        </template>
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
import XPopConfirm from '@/components/XPopConfirm'

export default {
  name: 'UserList',
  components: {
    FilterItem,
    ExtStaticSelect,
    BaseFilterPanel,
    FilterListLayout,
    ExtRemoteSelect,
    DropDownTree,
    XGrid,
    XPopConfirm
  },
  mixins: [constance],
  data() {
    return {
      formConfig: {
        model: {
          name1: '',
          name2: '',
          name3: '',
          name4: [],
          name5: []
        },
        rules: {
          name1: [
            { required: true, message: '请选择组织', trigger: 'change' }
          ]
        }
      },
      gridOptions: {
        params: {},
        pagerConfig: true,
        id: 'userId',
        toolbarConfig: {
          buttons: [{
            code: 'add',
            name: '新增',
            status: 'primary',
            size: 'small',
            icon: 'vxe-icon-square-plus'
          }],
          export: true,
          custom: true
        },
        columns: [{
          type: 'seq',
          title: '序号',
          width: 60
        }, {
          field: 'userId',
          title: '用户编号'
        }, {
          field: 'userName',
          title: '用户名称'
        }, {
          field: 'nickName',
          title: '用户昵称'
        }, {
          field: 'dept.deptName',
          title: '部门'
        }, {
          field: 'phonenumber',
          title: '手机号码'
        }, {
          field: 'status',
          title: '状态',
          formatter: ['formatLabelValue', constance.CONSTANCE.userStatus]
        }, {
          field: 'createTime',
          title: '创建时间'
        }, {
          slots: { default: 'operate' },
          showOverflow: false,
          minWidth: 120,
          align: 'center',
          title: '操作'
        }]
      }
    }
  },
  methods: {
    handleQuery(params) {
      this.gridOptions.params = {
        a: new Date().getTime(),
        ...params
      }
    },
    showFormDialog(row) {
      this.$dialog(UserForm, {
        form: row
      }).show({
        title: !row ? '新增用户' : '修改用户',
        width: '600px'
      })
    },
    toolbarButtonClickEvent({ code }) {
      if (code === 'add') {
        this.showFormDialog()
      }
    },
    remove(row) {
      console.log('remove')
    },
    fetchUserListFunction: function(params) {
      return service.requestByKey('example.getUserList', params)
    },
    fetchSyncTreePromiseFn: function(params) {
      return service.requestByKey('example.getSyncTree', params)
    }
  }
}
</script>
