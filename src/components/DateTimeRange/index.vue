<template>
  <el-date-picker v-model="value" v-bind="propsData" v-on="$listeners"></el-date-picker>
</template>
<script>
/**
 * 只支持 startValue.sync 和 endValue.sync
 * 不支持 v-model
 */

import { DatePicker } from 'element-ui'
import { getComponentPropsDef } from '@/utils'

const defaultProps = getComponentPropsDef(DatePicker)
delete defaultProps.value
export default {
  name: 'DateTimeRange',
  props: Object.assign({
    startValue: {},
    endValue: {}
  }, defaultProps),
  computed: {
    value: {
      get() {
        if (this.startValue && this.endValue) {
          return [this.startValue, this.endValue]
        } else {
          return []
        }
      },
      set(v) {
        if (v && v.length) {
          this.$emit('update:startValue', v[0])
          this.$emit('update:endValue', v[1])
        } else {
          this.$emit('update:startValue', undefined)
          this.$emit('update:endValue', undefined)
        }
      }
    },
    propsData() {
      const props = Object.assign({}, this.$props)
      props.type = 'datetimerange'
      return props
    }
  }
}
</script>
