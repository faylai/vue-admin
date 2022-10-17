<template>
  <div>
    <el-form-item label="至少应选">
      <el-input-number
          :value="activeData.min"
          :min="0"
          placeholder="至少应选"
          @input="$set(activeData, 'min', $event?$event:undefined)"/>
    </el-form-item>
    <el-form-item label="最多可选">
      <el-input-number
          :value="activeData.max"
          :min="0"
          placeholder="最多可选"
          @input="$set(activeData, 'max', $event?$event:undefined)"/>
    </el-form-item>
    <ListOptionEditor :activeData="activeData"></ListOptionEditor>
  </div>
</template>

<script>
import ListOptionEditor from './components/ListOptionEditor'

export default {
  name: 'ElInputNumberSetting',
  components: {
    ListOptionEditor
  },
  props: {
    activeData: {
      type: Object,
      require: true
    }
  }
}
</script>
