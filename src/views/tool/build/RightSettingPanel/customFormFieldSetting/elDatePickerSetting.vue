<template>
  <div>
    <el-form-item
        v-if="activeData.type !== undefined && 'el-date-picker' === activeData.tag"
        label="时间类型">
      <el-select
          v-model="activeData.type"
          placeholder="请选择时间类型"
          :style="{ width: '100%' }"
          @change="dateTypeChange">
        <el-option
            v-for="(item, index) in dateOptions"
            :key="index"
            :label="item.label"
            :value="item.value"/>
      </el-select>
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
  name: 'ElDatePickerSetting',
  components: {},
  props: {
    activeData: {
      type: Object,
      require: true
    }
  },
  data() {
    return {
      dateTypeOptions: [
        {
          label: '日(date)',
          value: 'date'
        },
        {
          label: '周(week)',
          value: 'week'
        },
        {
          label: '月(month)',
          value: 'month'
        },
        {
          label: '年(year)',
          value: 'year'
        },
        {
          label: '日期时间(datetime)',
          value: 'datetime'
        }
      ],
      dateRangeTypeOptions: [
        {
          label: '日期范围(daterange)',
          value: 'daterange'
        },
        {
          label: '月范围(monthrange)',
          value: 'monthrange'
        },
        {
          label: '日期时间范围(datetimerange)',
          value: 'datetimerange'
        }
      ]
    }
  },
  computed: {
    dateOptions() {
      if (
          this.activeData.type !== undefined &&
          this.activeData.tag === 'el-date-picker'
      ) {
        if (this.activeData['start-placeholder'] === undefined) {
          return this.dateTypeOptions
        }
        return this.dateRangeTypeOptions
      }
      return []
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
    },
    dateTypeChange(val) {
      this.setTimeValue(dateTimeFormat[val], val)
    },
    setTimeValue(val, type) {
      const valueFormat = type === 'week' ? dateTimeFormat.date : val
      this.$set(this.activeData, 'defaultValue', null)
      this.$set(this.activeData, 'value-format', valueFormat)
      this.$set(this.activeData, 'format', val)
    }
  }

}
</script>
