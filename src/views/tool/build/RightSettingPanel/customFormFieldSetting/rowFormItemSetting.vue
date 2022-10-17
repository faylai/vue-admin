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

    <el-form-item v-if="activeData.justify!==undefined&&activeData.type==='flex'" label="水平排列">
      <el-select v-model="activeData.justify" placeholder="请选择水平排列" :style="{width: '100%'}">
        <el-option
            v-for="(item, index) in justifyOptions"
            :key="index"
            :label="item.label"
            :value="item.value"/>
      </el-select>
    </el-form-item>


    <el-form-item v-if="activeData.align!==undefined&&activeData.type==='flex'" label="垂直排列">
      <el-radio-group v-model="activeData.align">
        <el-radio-button label="top"/>
        <el-radio-button label="middle"/>
        <el-radio-button label="bottom"/>
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
      justifyOptions: [
        {
          label: 'start',
          value: 'start'
        },
        {
          label: 'end',
          value: 'end'
        },
        {
          label: 'center',
          value: 'center'
        },
        {
          label: 'space-around',
          value: 'space-around'
        },
        {
          label: 'space-between',
          value: 'space-between'
        }
      ],
      layoutTreeProps: {
        label(data, node) {
          return data.componentName || `${data.label}: ${data.vModel}`
        }
      }
    }
  }
}
</script>

