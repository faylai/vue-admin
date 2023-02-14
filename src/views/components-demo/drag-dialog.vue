<template>
  <div class="components-container">
    <el-button type="primary" @click="dialogTableVisible = true">
      普通的形式打开（drag）
    </el-button>

    <el-button type="primary" @click="showDashBoard">
      使用service 形式打开
    </el-button>
    <el-dialog v-el-drag-dialog :visible.sync="dialogTableVisible" title="Shipping address" @dragDialog="handleDrag">
      this is the dialog content
    </el-dialog>

    <el-row :gutter="20">
      <el-col :span="12"><h1>dropDownTree 同步多选 </h1></el-col>
      <el-col :span="12"><h1>dropDownTree 同步单选 </h1></el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <div style="padding-top: 10px">
          <DropDownTree
              v-model="dropDownValue"
              :multiple="true"
              :collapseTags="false"
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

    <el-row :gutter="20">
      <el-col :span="12"><h1>dropDownTree 异步多选 </h1></el-col>
      <el-col :span="12"><h1>dropDownTree 异步单选 </h1></el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <div style="padding-top: 10px">
          <DropDownTree
              v-model="dropDownValueAsync"
              :label="dropDownLabelAsync"
              :multiple="true"
              :collapseTags="true"
              :clearable="true"
              :tree-config="{localSearch:true,async:true,fetchTreePromiseFn:fetchAsyncTreePromiseFn,onlyLeaf:true}">
            <template v-slot:node="node">
              <span style="vertical-align: middle">({{ node.onlineCount }}/{{ node.businessCount }})  </span>
            </template>
          </DropDownTree>
        </div>
      </el-col>

      <el-col :span="12">
        <div style="padding-top: 10px">
          <DropDownTree
              v-model="dropDownSingleValueAsync"
              :label="dropDownSingleLabelAsync"
              :multiple="false"
              :collapseTags="true"
              :clearable="true"
              :tree-config="{localSearch:true,async:true,fetchTreePromiseFn:fetchAsyncTreePromiseFn}">
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
      dropDownValueAsync: '3193DF41119F47CBA4535074146E9AAA,1FE29AD581784006A0A3E5454B406397,BD809395A90D45D1BEDFB791D1A07D4B',
      dropDownLabelAsync: '苏E89C3E,苏U95G00,苏EJ16M2',
      dropDownSingleValueAsync: '722FF1B7692F44C59A8EE344F34C823F',
      dropDownSingleLabelAsync: '苏E89C3E',
      value: '',
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
      // this.$refs.select.blur()
    },
    showDashBoard() {
      this.$dialog(dashboard, {}, {
        title: (<span> just a test of title</span>),
        footer: (<span> just a test of footer</span>)
      }).show({
        title: '这是Service 形式打开的Dialog'
      })
    }
  },
  mounted() {
    setTimeout(() => {
      this.dropDownValueAsync = '3193DF41119F47CBA4535074146E9AAA,1FE29AD581784006A0A3E5454B406397'
      this.dropDownLabelAsync = '苏E89C3E,苏U95G00'
      this.dropDownValue = '1FE29AD581784006A0A3E5454B406397'
    }, 3000)
  }
}
</script>

<style lang="scss" scoped>
.components-container {
  padding: 10px;

  h1 {
    font-size: 16px;
  }
}

</style>
