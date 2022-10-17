<template>
  <div>
    <el-form-item label="是否多选">
      <el-switch v-model="activeData.props.props.multiple"/>
    </el-form-item>
    <el-form-item label="展示全路径">
      <el-switch v-model="activeData['show-all-levels']"/>
    </el-form-item>
    <el-form-item label="可否筛选">
      <el-switch v-model="activeData.filterable"/>
    </el-form-item>
    <el-form-item label="选项分隔符">
      <el-input v-model="activeData.separator" placeholder="请输入选项分隔符"/>
    </el-form-item>


    <el-divider>选项</el-divider>
    <el-form-item label="数据类型">
      <el-radio-group v-model="activeData.dataType" size="small">
        <el-radio-button label="dynamic">
          动态数据
        </el-radio-button>
        <el-radio-button label="static">
          静态数据
        </el-radio-button>
      </el-radio-group>
    </el-form-item>

    <template v-if="activeData.dataType === 'dynamic'">
      <el-form-item label="标签键名">
        <el-input v-model="activeData.labelKey" placeholder="请输入标签键名"/>
      </el-form-item>
      <el-form-item label="值键名">
        <el-input v-model="activeData.valueKey" placeholder="请输入值键名"/>
      </el-form-item>
      <el-form-item label="子级键名">
        <el-input v-model="activeData.childrenKey" placeholder="请输入子级键名"/>
      </el-form-item>
    </template>
    <TreeDataEditor :value="activeData.options"
                    v-if="activeData.dataType === 'static'"></TreeDataEditor>

  </div>

</template>

<script>
import TreeDataEditor from '@/views/tool/build/TreeDataEditor'

export default {
  name: 'ElCascaderSetting',
  components: {
    TreeDataEditor
  },
  props: {
    activeData: {
      type: Object,
      require: true
    }
  }
}
</script>

