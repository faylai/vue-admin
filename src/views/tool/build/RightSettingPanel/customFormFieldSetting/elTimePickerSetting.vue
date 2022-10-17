<template>
  <div>
    <el-form-item v-if="activeData['picker-options'] !== undefined" label="时间段">
      <el-input
          v-model="activeData['picker-options'].selectableRange"
          placeholder="请输入时间段"/>
    </el-form-item>
    <el-form-item v-if="activeData.format !== undefined" label="时间格式">
      <el-input
          :value="activeData.format"
          placeholder="请输入时间格式"
          @input="setTimeValue($event)"/>
    </el-form-item>

    <el-form-item v-if="activeData['range-separator'] !== undefined" label="分隔符">
      <el-input v-model="activeData['range-separator']" placeholder="请输入分隔符"/>
    </el-form-item>

    <el-form-item v-if="activeData['start-placeholder']!==undefined" label="开始占位">
      <el-input v-model="activeData['start-placeholder']" placeholder="请输入占位提示"/>
    </el-form-item>
    <el-form-item v-if="activeData['end-placeholder']!==undefined" label="结束占位">
      <el-input v-model="activeData['end-placeholder']" placeholder="请输入占位提示"/>
    </el-form-item>
  </div>
</template>
<script>
import { dateTimeFormat } from './components/constances'

export default {
  name: 'ElTimePickerSetting',
  components: {},
  props: {
    activeData: {
      type: Object,
      require: true
    }
  },
  methods: {
    setDefaultValue(val) {
      if (Array.isArray(val)) {
        return val.join(',')
      }
      if (['string', 'number'].indexOf(val) > -1) {
        return val
      }
      if (typeof val === 'boolean') {
        return `${val}`
      }
      return val
    }
  },
  setTimeValue(val, type) {
    const valueFormat = type === 'week' ? dateTimeFormat.date : val
    this.$set(this.activeData, 'defaultValue', null)
    this.$set(this.activeData, 'value-format', valueFormat)
    this.$set(this.activeData, 'format', val)
  }
}
</script>
