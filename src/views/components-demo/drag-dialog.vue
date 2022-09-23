<template>
  <div class="components-container">
    <el-button type="primary" @click="dialogTableVisible = true">
      普通的形式打开（drag）
    </el-button>

    <el-button type="primary" @click="showDashBoard">
      使用service 形式打开
    </el-button>
    <el-dialog v-el-drag-dialog :visible.sync="dialogTableVisible" title="Shipping address" @dragDialog="handleDrag">
      <el-select ref="select" v-model="value" placeholder="请选择">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"/>
      </el-select>
      <el-table :data="gridData">
        <el-table-column property="date" label="Date" width="150"/>
        <el-table-column property="name" label="Name" width="200"/>
        <el-table-column property="address" label="Address"/>
      </el-table>
    </el-dialog>

    <el-row :gutter="20">
      <el-col :span="12"><h1>dropDownTree 下拉多选 </h1></el-col>
      <el-col :span="12"><h1>dropDownTree 下拉单选 </h1></el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <div style="padding-top: 10px">
          <DropDownTree
              v-model="dropDownValue"
              :multiple="true"
              :collapseTags="true"
              :clearable="true"
              :tree-config="{localSearch:true,fetchTreePromiseFn:fetchSyncTreePromiseFn,onlyLeaf:true}">
            <template v-slot:node="node">
              <span style="vertical-align: middle">({{ node.onlineCount }}/{{ node.businessCount }})  </span>
            </template>
          </DropDownTree>
        </div>
      </el-col>

      <el-col :span="12">
        <div style="padding-top: 10px">
          <DropDownTree
              v-model="dropDownSingleValue"
              :multiple="false"
              :collapseTags="true"
              :clearable="true"
              :tree-config="{localSearch:true,fetchTreePromiseFn:fetchSyncTreePromiseFn}">
            <template v-slot:node="node">
              <span style="vertical-align: middle">({{ node.onlineCount }}/{{ node.businessCount }})  </span>
            </template>
          </DropDownTree>
        </div>
      </el-col>
    </el-row>

    <div style="height: 400px;"></div>
    <el-row :gutter="20">
      <el-col :span="12"><h1>XTree 同步树多选</h1></el-col>
      <el-col :span="12"><h1>XTree 异步树多选</h1></el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <div style="height: 400px;width: 300px;border: 1px solid grey;">
          <XTree selectMode="multiple" :local-search="true" :fetch-tree-promise-fn="fetchSyncTreePromiseFn">
            <template v-slot:node="node">
              <span style="vertical-align: middle">({{ node.onlineCount }}/{{ node.businessCount }})  </span>
            </template>
          </XTree>
        </div>
      </el-col>
      <el-col :span="12">
        <div style="height: 400px;width: 300px;border: 1px solid grey;">
          <XTree selectMode="multiple" :async="true" :fetch-tree-promise-fn="fetchAsyncTreePromiseFn"
                 style="border:1px solid red;">
            <template v-slot:node="node">
              <span style="vertical-align: middle">({{ node.onlineCount }}/{{ node.businessCount }})  </span>
            </template>
          </XTree>
        </div>
      </el-col>
    </el-row>


    <el-row :gutter="20">
      <el-col :span="12"><h1>XTree 同步树单选</h1></el-col>
      <el-col :span="12"><h1>XTree 异步树单选</h1></el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <div style="height: 400px;width: 300px;border: 1px solid grey;">
          <XTree selectMode="single" :local-search="true" :fetch-tree-promise-fn="fetchSyncTreePromiseFn">
            <template v-slot:node="node">
              <span style="vertical-align: middle">({{ node.onlineCount }}/{{ node.businessCount }})  </span>
            </template>
          </XTree>
        </div>
      </el-col>
      <el-col :span="12">
        <div style="height: 400px;width: 300px;border: 1px solid grey;">
          <XTree selectMode="single" :async="true" :fetch-tree-promise-fn="fetchAsyncTreePromiseFn"
                 style="border:1px solid red;">
            <template v-slot:node="node">
              <span style="vertical-align: middle">({{ node.onlineCount }}/{{ node.businessCount }})  </span>
            </template>
          </XTree>
        </div>
      </el-col>
    </el-row>



    <div>
      <slot name="header"></slot>
    </div>
    <div>
      <slot name="header"></slot>
    </div>
  </div>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog' // base on element-ui
import dashboard from '@/views/dashboard'
import XTree from '@/components/XTree'
import service from '@/api/service'
import DropDownTree from '@/components/DropDownTree'

export default {
  name: 'DragDialogDemo',
  directives: { elDragDialog },
  components: {
    XTree,
    DropDownTree
  },
  data() {
    return {
      dialogTableVisible: false,
      dropDownValue: '3193DF41119F47CBA4535074146E9AAA',
      dropDownSingleValue: '722FF1B7692F44C59A8EE344F34C823F',
      options: [
        { value: '选项1', label: '黄金糕' },
        { value: '选项2', label: '双皮奶' },
        { value: '选项3', label: '蚵仔煎' },
        { value: '选项4', label: '龙须面' }
      ],
      value: '',
      gridData: [{
        date: '2016-05-02',
        name: 'John Smith',
        address: 'No.1518,  Jinshajiang Road, Putuo District'
      }, {
        date: '2016-05-04',
        name: 'John Smith',
        address: 'No.1518,  Jinshajiang Road, Putuo District'
      }, {
        date: '2016-05-01',
        name: 'John Smith',
        address: 'No.1518,  Jinshajiang Road, Putuo District'
      }, {
        date: '2016-05-03',
        name: 'John Smith',
        address: 'No.1518,  Jinshajiang Road, Putuo District'
      }],
      fetchAsyncTreePromiseFn: function(params) {
        return service.requestByKey('example.getAsyncTree', params)
      },
      fetchSyncTreePromiseFn: function(params) {
        return service.requestByKey('example.getSyncTree', params)
      }
    }
  },
  computed: {
    dropDownTreeConfig() {
      return {}
    }
  },
  methods: {
    // v-el-drag-dialog onDrag callback function
    handleDrag() {
      this.$refs.select.blur()
    },
    showDashBoard() {
      const dialog = this.$dialog(dashboard)
      dialog.show({
        title: '这是Service 形式打开的Dialog'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.components-container {
  padding: 10px;
}
</style>
