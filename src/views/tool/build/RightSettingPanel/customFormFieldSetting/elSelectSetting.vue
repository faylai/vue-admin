<template>
  <div>
    <el-form-item label="是否可搜索">
      <el-switch v-model="activeData.filterable"/>
    </el-form-item>
    <el-form-item label="是否多选">
      <el-switch v-model="activeData.multiple" @change="multipleChange"/>
    </el-form-item>
    <ListOptionEditor :activeData="activeData"></ListOptionEditor>
  </div>
</template>
<script>
import ListOptionEditor from './components/ListOptionEditor'

export default {
  name: 'ElSelectSetting',
  components: {
    ListOptionEditor
  },
  props: {
    activeData: {
      type: Object,
      require: true
    }
  },
  methods: {
    multipleChange(val) {
      this.$set(this.activeData, 'defaultValue', val ? [] : '')
    }
  }
}
</script>
