<template>
  <div>
    <el-form-item label="栅格间隔">
      <el-input-number v-model="activeData.gutter" :min="0" placeholder="栅格间隔"/>
    </el-form-item>

    <el-form-item label="布局模式">
      <el-radio-group v-model="activeData.type">
        <el-radio-button label="default"/>
        <el-radio-button label="flex"/>
      </el-radio-group>
    </el-form-item>

    <el-divider>布局结构树</el-divider>
    <el-tree
        :data="[activeData]"
        :props="layoutTreeProps"
        node-key="renderKey"
        default-expand-all
        draggable>
              <span slot-scope="{ node, data }">
                <span class="node-label">
                  <svg-icon class="node-icon" :icon-class="data.tagIcon"/>
                  {{ node.label }}
                </span>
              </span>
    </el-tree>
  </div>
</template>
<script>
export default {
  name: 'RowFormItem',
  props: {
    activeData: {
      type: Object,
      require: true
    }
  },
  data() {
    return {
      layoutTreeProps: {
        label(data, node) {
          return data.componentName || `${data.label}: ${data.vModel}`
        }
      }
    }
  }
}
</script>

