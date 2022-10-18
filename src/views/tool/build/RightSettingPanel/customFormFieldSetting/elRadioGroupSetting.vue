<template>
  <div>
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
  name: 'ElRadioGroupSetting',
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
