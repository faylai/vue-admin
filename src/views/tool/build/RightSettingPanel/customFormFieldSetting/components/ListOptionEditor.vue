<template>
  <div class="list-option-editor">
    <!-- 'el-checkbox-group', 'el-radio-group', 'el-select' -->
    <el-divider>选项</el-divider>
    <draggable
        :list="activeData.options"
        :animation="340"
        group="selectItem"
        handle=".option-drag">
      <div v-for="(item, index) in activeData.options" :key="index" class="select-item">
        <div class="select-line-icon option-drag">
          <i class="el-icon-s-operation"/>
        </div>
        <el-input v-model="item.label" placeholder="选项名" size="small"/>
        <el-input
            placeholder="选项值"
            size="small"
            :value="item.value"
            @input="setOptionValue(item, $event)"/>
        <div class="close-btn select-line-icon" @click="activeData.options.splice(index, 1)">
          <i class="el-icon-remove-outline"/>
        </div>
      </div>
    </draggable>
    <div style="margin-left: 20px;">
      <el-button
          style="padding-bottom: 0"
          icon="el-icon-circle-plus-outline"
          type="text"
          @click="addSelectItem">
        添加选项
      </el-button>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import { isNumberStr } from '@/utils'

export default {
  name: 'ListOptionEditor',
  components: {
    draggable
  },
  props: {
    activeData: {
      type: Object,
      require: true
    }
  },
  methods: {
    setOptionValue(item, val) {
      item.value = isNumberStr(val) ? +val : val
    },
    addSelectItem() {
      this.activeData.options.push({
        label: '',
        value: ''
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.list-option-editor {
  .select-item {
    display: flex;
    border: 1px dashed #fff;
    box-sizing: border-box;

    & .close-btn {
      cursor: pointer;
      color: #f56c6c;
    }

    & .el-input + .el-input {
      margin-left: 4px;
    }
  }

  .select-item + .select-item {
    margin-top: 4px;
  }

  .select-item.sortable-chosen {
    border: 1px dashed #409eff;
  }

  .select-line-icon {
    line-height: 32px;
    font-size: 22px;
    padding: 0 4px;
    color: #777;
  }

  .option-drag {
    cursor: move;
  }
}
</style>
