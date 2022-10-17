<template>
  <div>

    <el-form-item v-if="activeData['show-text'] !== undefined" label="辅助文字">
      <el-switch v-model="activeData['show-text']" @change="rateTextChange"/>
    </el-form-item>
    <el-form-item label="允许半选">
      <el-switch v-model="activeData['allow-half']"/>
    </el-form-item>
    <el-form-item label="显示分数">
      <el-switch v-model="activeData['show-score']" @change="rateScoreChange"/>
    </el-form-item>
  </div>
</template>
<script>
export default {
  name: 'ElRateSetting',
  components: {},
  props: {
    activeData: {
      type: Object,
      require: true
    }
  },
  methods: {
    rateScoreChange(val) {
      if (val) this.activeData['show-text'] = false
    },
    rateTextChange(val) {
      if (val) this.activeData['show-score'] = false
    }
  }
}
</script>
