<template>
  <div class="right-board">
    <el-tabs v-model="currentTab" class="center-tabs">
      <el-tab-pane label="组件属性" name="field"/>
      <el-tab-pane label="表单属性" name="form"/>
    </el-tabs>
    <div class="field-box">
      <a class="document-link" target="_blank" :href="documentLink" title="查看组件文档">
        <i class="el-icon-link"/>
      </a>
      <div class="right-scrollbar">
        <!-- 组件属性 -->
        <el-form v-show="currentTab==='field' && showField" size="small" label-width="90px">
          <el-form-item v-if="activeData.changeTag" label="组件类型">
            <el-select
                v-model="activeData.tagIcon"
                placeholder="请选择组件类型"
                :style="{width: '100%'}"
                @change="tagChange">
              <el-option-group v-for="group in tagList" :key="group.label" :label="group.label">
                <el-option
                    v-for="item in group.options"
                    :key="item.label"
                    :label="item.label"
                    :value="item.tagIcon">
                  <svg-icon class="node-icon" :icon-class="item.tagIcon"/>
                  <span> {{ item.label }}</span>
                </el-option>
              </el-option-group>
            </el-select>
          </el-form-item>
          <el-form-item v-if="activeData.vModel!==undefined" label="字段名">
            <el-input v-model="activeData.vModel" placeholder="请输入字段名（v-model）"/>
          </el-form-item>
          <el-form-item v-if="activeData.componentName!==undefined" label="组件名">
            {{ activeData.componentName }}
          </el-form-item>
          <el-form-item v-if="activeData.label!==undefined" label="标题">
            <el-input v-model="activeData.label" placeholder="请输入标题"/>
          </el-form-item>
          <el-form-item v-if="activeData.placeholder!==undefined" label="占位提示">
            <el-input v-model="activeData.placeholder" placeholder="请输入占位提示"/>
          </el-form-item>

          <el-form-item v-if="activeData.span!==undefined" label="表单栅格">
            <el-slider v-model="activeData.span" :max="24" :min="1" :marks="{12:''}" @change="spanChange"/>
          </el-form-item>


          <el-form-item v-if="activeData.labelWidth!==undefined" label="标签宽度">
            <el-input v-model.number="activeData.labelWidth" type="number" placeholder="请输入标签宽度"/>
          </el-form-item>
          <el-form-item v-if="activeData.style&&activeData.style.width!==undefined" label="组件宽度">
            <el-input v-model="activeData.style.width" placeholder="请输入组件宽度" clearable/>
          </el-form-item>
          <el-form-item v-if="activeData.vModel!==undefined" label="默认值">
            <el-input
                :value="setDefaultValue(activeData.defaultValue)"
                placeholder="请输入默认值"
                @input="onDefaultValueInput"/>
          </el-form-item>


          <el-form-item v-if="activeData.min !== undefined" label="最小值">
            <el-input-number v-model="activeData.min" placeholder="最小值"/>
          </el-form-item>
          <el-form-item v-if="activeData.max !== undefined" label="最大值">
            <el-input-number v-model="activeData.max" placeholder="最大值"/>
          </el-form-item>


          <el-form-item v-if="activeData.maxlength !== undefined" label="最多输入">
            <el-input v-model="activeData.maxlength" placeholder="请输入字符长度">
              <template slot="append">
                个字符
              </template>
            </el-input>
          </el-form-item>


          <el-form-item v-if="activeData['show-word-limit'] !== undefined" label="输入统计">
            <el-switch v-model="activeData['show-word-limit']"/>
          </el-form-item>


          <el-form-item v-if="activeData.clearable !== undefined" label="能否清空">
            <el-switch v-model="activeData.clearable"/>
          </el-form-item>
          <el-form-item v-if="activeData.showTip !== undefined" label="显示提示">
            <el-switch v-model="activeData.showTip"/>
          </el-form-item>

          <el-form-item v-if="activeData.readonly !== undefined" label="是否只读">
            <el-switch v-model="activeData.readonly"/>
          </el-form-item>
          <el-form-item v-if="activeData.disabled !== undefined" label="是否禁用">
            <el-switch v-model="activeData.disabled"/>
          </el-form-item>

          <el-form-item v-if="activeData.required !== undefined" label="是否必填">
            <el-switch v-model="activeData.required"/>
          </el-form-item>

          <template v-if="customFormFieldSettingsComponentsKeys[customFormFieldSettingKey]">
            <component :is="customFormFieldSettingKey" :activeData="activeData"></component>
          </template>

          <template v-if="activeData.layout === 'colFormItem' && activeData.tag !== 'el-button'">
            <el-divider>正则校验</el-divider>
            <div
                v-for="(item, index) in activeData.regList"
                :key="index"
                class="reg-item">
              <span class="close-btn" @click="activeData.regList.splice(index, 1)">
                <i class="el-icon-close"/>
              </span>
              <el-form-item label="表达式">
                <el-input v-model="item.pattern" placeholder="请输入正则"/>
              </el-form-item>
              <el-form-item label="错误提示" style="margin-bottom:0">
                <el-input v-model="item.message" placeholder="请输入错误提示"/>
              </el-form-item>
            </div>
            <div style="margin-left: 20px">
              <el-button icon="el-icon-circle-plus-outline" type="text" @click="addReg">
                添加规则
              </el-button>
            </div>
          </template>
        </el-form>
        <!-- 表单属性 -->
        <FormSetting v-show="currentTab === 'form'" :formConf="formConf"></FormSetting>
      </div>
    </div>
  </div>
</template>

<script>
import { isArray, camelCase } from 'lodash'
import draggable from 'vuedraggable'
import { isNumberStr } from '@/utils/index'
import {
  inputComponents,
  selectComponents
} from '@/views/tool/build/generator/config'

import FormSetting from '@/views/tool/build/RightSettingPanel/formSetting'

// 从整个文件夹导入所有组件
const reqCustomFormField = require.context('./customFormFieldSetting', true, /\.(js|vue)$/i)
const customFormFieldSettingsComponents = {}
const customFormFieldSettingsComponentsKeys = {}
reqCustomFormField.keys().forEach((key) => {
  const name = key.match(/\w+/)[0]
  customFormFieldSettingsComponents[name] = reqCustomFormField(key).default
  customFormFieldSettingsComponentsKeys[name] = true
})

export default {
  components: {
    draggable,
    FormSetting,
    ...customFormFieldSettingsComponents
  },
  props: ['showField', 'activeData', 'formConf'],
  data() {
    return {
      currentTab: 'field',
      customFormFieldSettingsComponentsKeys: customFormFieldSettingsComponentsKeys
    }
  },
  computed: {
    customFormFieldSettingKey() {
      const key = (this.activeData.tag || this.activeData.layout) + 'Setting'
      return camelCase(key)
    },
    documentLink() {
      return (
          this.activeData.document ||
          'https://element.eleme.cn/#/zh-CN/component/installation'
      )
    },
    tagList() {
      return [
        {
          label: '输入型组件',
          options: inputComponents
        },
        {
          label: '选择型组件',
          options: selectComponents
        }
      ]
    }
  },
  methods: {
    addReg() {
      this.activeData.regList.push({
        pattern: '',
        message: ''
      })
    },
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
    onDefaultValueInput(str) {
      if (isArray(this.activeData.defaultValue)) {
        // 数组
        this.$set(
            this.activeData,
            'defaultValue',
            str.split(',').map(val => (isNumberStr(val) ? +val : val))
        )
      } else if (['true', 'false'].indexOf(str) > -1) {
        // 布尔
        this.$set(this.activeData, 'defaultValue', JSON.parse(str))
      } else {
        // 字符串和数字
        this.$set(
            this.activeData,
            'defaultValue',
            isNumberStr(str) ? +str : str
        )
      }
    },
    spanChange(val) {
      this.formConf.span = val
    },
    tagChange(tagIcon) {
      let target = inputComponents.find(item => item.tagIcon === tagIcon)
      if (!target) target = selectComponents.find(item => item.tagIcon === tagIcon)
      this.$emit('tag-change', target)
    }
  }
}
</script>

<style lang="scss" scoped>
.right-board {
  width: 350px;
  height: 100%;
  position: absolute;
  right: 0;
  top: 0;
  padding-top: 3px;

  .field-box {
    position: relative;
    height: calc(100% - 40px);
    box-sizing: border-box;
    overflow: hidden;
  }

  .el-scrollbar {
    height: 100%;
  }
}


.time-range {
  .el-date-editor {
    width: 227px;
  }

  :deep(.el-icon-time) {
    display: none;
  }
}

.document-link {
  position: absolute;
  display: block;
  width: 26px;
  height: 26px;
  top: 0;
  left: 0;
  cursor: pointer;
  background: #409eff;
  z-index: 1;
  border-radius: 0 0 6px 0;
  text-align: center;
  line-height: 26px;
  color: #fff;
  font-size: 18px;
}

</style>
