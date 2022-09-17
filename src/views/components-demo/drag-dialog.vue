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
    <h1>XTree 异步树</h1>
    <div style="height: 400px;width: 300px;border: 1px solid grey;">
      <BaseTree selectMode="multiple" :local-search="true"></BaseTree>
    </div>
  </div>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog' // base on element-ui
import dashboard from '@/views/dashboard'
import BaseTree from '@/components/BaseTree'

export default {
  name: 'DragDialogDemo',
  directives: { elDragDialog },
  components: {
    BaseTree
  },
  data() {
    return {
      dialogTableVisible: false,
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
      }]
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
