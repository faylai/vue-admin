<template>
  <div>
    <el-form-item label="选项尺寸">
      <el-radio-group v-model="activeData.size">
        <el-radio-button label="medium">
          中等
        </el-radio-button>
        <el-radio-button label="small">
          较小
        </el-radio-button>
        <el-radio-button label="mini">
          迷你
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
