<template>
  <div>
    <el-form-item  label="开启值">
      <el-input
          :value="setDefaultValue(activeData['active-value'])"
          placeholder="请输入开启值"
          @input="onSwitchValueInput($event, 'active-value')"/>
    </el-form-item>
    <el-form-item  label="关闭值">
      <el-input
          :value="setDefaultValue(activeData['inactive-value'])"
          placeholder="请输入关闭值"
          @input="onSwitchValueInput($event, 'inactive-value')"/>
    </el-form-item>

    <el-form-item v-if="activeData['active-color'] !== undefined" label="开启颜色">
      <el-color-picker v-model="activeData['active-color']"/>
    </el-form-item>
    <el-form-item v-if="activeData['inactive-color'] !== undefined" label="关闭颜色">
      <el-color-picker v-model="activeData['inactive-color']"/>
    </el-form-item>

    <el-form-item v-if="activeData['active-text'] !== undefined" label="开启提示">
      <el-input v-model="activeData['active-text']" placeholder="请输入开启提示"/>
    </el-form-item>
    <el-form-item v-if="activeData['inactive-text'] !== undefined" label="关闭提示">
      <el-input v-model="activeData['inactive-text']" placeholder="请输入关闭提示"/>
    </el-form-item>
  </div>
</template>
<script>

import { isNumberStr } from '@/utils'

export default {
  name: 'ElSwitchSetting',
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
  onSwitchValueInput(val, name) {
    if (['true', 'false'].indexOf(val) > -1) {
      this.$set(this.activeData, name, JSON.parse(val))
    } else {
      this.$set(this.activeData, name, isNumberStr(val) ? +val : val)
    }
  }
}
</script>
