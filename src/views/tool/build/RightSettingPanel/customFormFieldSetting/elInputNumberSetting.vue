<template>
  <div>
    <el-form-item label="严格步数">
      <el-switch v-model="activeData['step-strictly']"/>
    </el-form-item>
    <el-form-item label="精度">
      <el-input-number v-model="activeData.precision" :min="0" placeholder="精度"/>
    </el-form-item>
    <el-form-item label="增减位置">
      <el-radio-group v-model="activeData['controls-position']">
        <el-radio-button label="">
          默认
        </el-radio-button>
        <el-radio-button label="right">
          右侧
        </el-radio-button>
      </el-radio-group>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'ElInputNumberSetting',
  props: {
    activeData: {
      type: Object,
      require: true
    }
  }
}
</script>
