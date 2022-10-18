<template>
  <div>
    <el-form-item label="颜色格式">
      <el-select
          v-model="activeData['color-format']"
          placeholder="请选择颜色格式"
          :style="{ width: '100%' }"
          @change="colorFormatChange">
        <el-option
            v-for="(item, index) in colorFormatOptions"
            :key="index"
            :label="item.label"
            :value="item.value"/>
      </el-select>
    </el-form-item>
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
  name: 'ElSelectSetting',
  components: {},
  data() {
    return {
      colorFormatOptions: [
        {
          label: 'hex',
          value: 'hex'
        },
        {
          label: 'rgb',
          value: 'rgb'
        },
        {
          label: 'rgba',
          value: 'rgba'
        },
        {
          label: 'hsv',
          value: 'hsv'
        },
        {
          label: 'hsl',
          value: 'hsl'
        }
      ]
    }
  },
  props: {
    activeData: {
      type: Object,
      require: true
    }
  },
  methods: {
    colorFormatChange(val) {
      this.activeData.defaultValue = null
      this.activeData['show-alpha'] = val.indexOf('a') > -1
      this.activeData.renderKey = +new Date() // 更新renderKey,重新渲染该组件
    }
  }
}
</script>
