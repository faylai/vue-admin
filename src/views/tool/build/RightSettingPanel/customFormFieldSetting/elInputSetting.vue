<template>
  <div>
    <el-form-item v-if="activeData.prepend!==undefined" label="前缀">
      <el-input v-model="activeData.prepend" placeholder="请输入前缀"/>
    </el-form-item>
    <el-form-item v-if="activeData.append!==undefined" label="后缀">
      <el-input v-model="activeData.append" placeholder="请输入后缀"/>
    </el-form-item>


    <el-form-item v-if="activeData['prefix-icon']!==undefined" label="前图标">
      <IconPicker v-model="activeData['prefix-icon']" placeholder="请输入前图标名称" clearable></IconPicker>
    </el-form-item>

    <el-form-item v-if="activeData['suffix-icon'] !== undefined" label="后图标">
      <IconPicker v-model="activeData['suffix-icon']" placeholder="请输入后图标名称" clearable></IconPicker>
    </el-form-item>

    <el-form-item v-if="activeData.autosize !== undefined" label="最小行数">
      <el-input-number v-model="activeData.autosize.minRows" :min="1" placeholder="最小行数"/>
    </el-form-item>
    <el-form-item v-if="activeData.autosize !== undefined" label="最大行数">
      <el-input-number v-model="activeData.autosize.maxRows" :min="1" placeholder="最大行数"/>
    </el-form-item>
  </div>

</template>

<script>
import IconPicker from '@/views/tool/build/IconPicker'

export default {
  name: 'ElInputNumberSetting',
  components: {
    IconPicker
  },
  props: {
    activeData: {
      type: Object,
      require: true
    }
  }
}
</script>
