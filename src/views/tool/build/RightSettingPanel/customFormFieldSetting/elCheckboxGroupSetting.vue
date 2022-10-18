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
    <el-form-item v-if="activeData.optionType !== undefined" label="选项样式">
      <el-radio-group v-model="activeData.optionType">
        <el-radio-button label="default">
          默认
        </el-radio-button>
        <el-radio-button label="button">
          按钮
        </el-radio-button>
      </el-radio-group>
    </el-form-item>

    <el-form-item
        v-if="activeData.border !== undefined && activeData.optionType === 'default'"
        label="是否带边框">
      <el-switch v-model="activeData.border"/>
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
