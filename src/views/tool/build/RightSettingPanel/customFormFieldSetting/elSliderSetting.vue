<template>
  <div>
    <el-form-item label="显示间断点">
      <el-switch v-model="activeData['show-stops']"/>
    </el-form-item>
    <el-form-item label="范围选择">
      <el-switch v-model="activeData.range" @change="rangeChange"/>
    </el-form-item>
    <el-form-item label="步长">
      <el-input-number v-model="activeData.step" placeholder="步数"/>
    </el-form-item>
  </div>
</template>
<script>
export default {
  name: 'ElSliderSetting',
  components: {},
  props: {
    activeData: {
      type: Object,
      require: true
    }
  },
  methods: {
    rangeChange(val) {
      this.$set(
          this.activeData,
          'defaultValue',
          val ? [this.activeData.min, this.activeData.max] : this.activeData.min
      )
    }
  }
}
</script>
