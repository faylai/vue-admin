<template>
  <div class="form-editor">
    <div class="left-board">
      <div class="logo-wrapper">
        <div class="logo">
          <img :src="logo" alt="logo"> Form Generator
        </div>
      </div>
      <div class="left-scrollbar">
        <div class="components-list">
          <div class="components-title">
            <svg-icon icon-class="component"/>
            输入型组件
          </div>
          <draggable
              class="components-draggable"
              :list="inputComponents"
              :group="{ name: 'componentsGroup', pull: 'clone', put: false }"
              :clone="cloneComponent"
              draggable="div.components-item"
              :sort="false"
              @end="onEnd">
            <div
                v-for="(element, index) in inputComponents" :key="index" class="components-item"
                @click="addComponent(element)">
              <div class="components-body">
                <svg-icon :icon-class="element.tagIcon"/>
                {{ element.label }}
              </div>
            </div>
          </draggable>
          <div class="components-title">
            <svg-icon icon-class="component"/>
            选择型组件
          </div>
          <draggable
              class="components-draggable"
              :list="selectComponents"
              :group="{ name: 'componentsGroup', pull: 'clone', put: false }"
              :clone="cloneComponent"
              draggable="div.components-item"
              :sort="false"
              @end="onEnd">
            <div
                v-for="(element, index) in selectComponents"
                :key="index"
                class="components-item"
                @click="addComponent(element)">
              <div class="components-body">
                <svg-icon :icon-class="element.tagIcon"/>
                {{ element.label }}
              </div>
            </div>
          </draggable>
          <div class="components-title">
            <svg-icon icon-class="component"/>
            布局型组件
          </div>
          <draggable
              class="components-draggable" :list="layoutComponents"
              :group="{ name: 'componentsGroup', pull: 'clone', put: false }" :clone="cloneComponent"
              draggable="div.components-item" :sort="false" @end="onEnd">
            <div
                v-for="(element, index) in layoutComponents" :key="index" class="components-item"
                @click="addComponent(element)">
              <div class="components-body">
                <svg-icon :icon-class="element.tagIcon"/>
                {{ element.label }}
              </div>
            </div>
          </draggable>
        </div>
      </div>
    </div>

    <div class="center-board">
      <div class="action-bar">
        <el-button icon="el-icon-download" type="text" @click="download">
          导出vue文件
        </el-button>
        <el-button class="copy-btn-main" icon="el-icon-document-copy" type="text" @click="copy">
          复制代码
        </el-button>
        <el-button class="delete-btn" icon="el-icon-delete" type="text" @click="empty">
          清空
        </el-button>
      </div>
      <div class="center-scrollbar">
        <el-row class="center-board-row" :gutter="formConf.gutter">
          <el-form
              :size="formConf.size"
              :label-position="formConf.labelPosition"
              :disabled="formConf.disabled"
              :label-width="formConf.labelWidth + 'px'">
            <draggable-form
                :drawing-list="drawingList"
                :active-id="activeId"
                :form-conf="formConf"
                @activeItem="activeFormItem"
                @copyItem="drawingItemCopy"
                @deleteItem="drawingItemDelete"/>
            <div v-show="!drawingList.length" class="empty-info">
              从左侧拖入或点选组件进行表单设计
            </div>
          </el-form>
        </el-row>
      </div>
    </div>

    <right-panel
        :active-data="activeData"
        :form-conf="formConf"
        :show-field="!!drawingList.length"
        @tag-change="tagChange"/>
    <input id="copyNode" type="hidden" ref="copyNode">
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import beautifier from 'js-beautify'
import ClipboardJS from 'clipboard'
import RightPanel from './RightPanel'
import {
  inputComponents,
  selectComponents,
  layoutComponents,
  formConf
} from '@/views/tool/build/generator/config'
import { beautifierConf } from '@/utils/index'
import { makeUpHtml, vueTemplate, vueScript, cssStyle } from '@/views/tool/build/generator/html'
import { makeUpJs } from '@/views/tool/build/generator/js'
import { makeUpCss } from '@/views/tool/build/generator/css'
import drawingDefault from '@/views/tool/build/generator/drawingDefault'
import logo from '@/assets/logo/logo.png'
import DraggableForm from './DraggableForm'
import GenerateTypeForm from '@/views/tool/build/GenerateTypeForm'
import lodash from 'lodash'
import { off, on } from 'element-ui/lib/utils/dom'

export default {
  name: 'FormBuilder',
  components: {
    draggable,
    RightPanel,
    DraggableForm
  },
  data() {
    const defaultDrawingList = drawingDefault.map((item) => {
      const ret = lodash.cloneDeep(item)
      ret.renderKey = +new Date()
      return ret
    })
    return {
      logo,
      idGlobal: 100,
      formConf: lodash.cloneDeep(formConf),
      inputComponents,
      selectComponents,
      layoutComponents,
      labelWidth: 100,
      drawingList: defaultDrawingList,
      activeId: defaultDrawingList[0].formId,
      activeData: defaultDrawingList[0],
      oldActiveId: undefined,
      tempActiveData: undefined
    }
  },
  created() {
    // 防止 firefox 下 拖拽 会新打卡一个选项卡
    on(document.body, 'ondrag', this.onDrop)
    this.$on('hook:beforeDestroy', function() {
      off(document.body, 'ondrag', this.onDrop)
    })
  },
  watch: {
    // eslint-disable-next-line func-names
    'activeData.label': function(val, oldVal) {
      if (
          this.activeData.placeholder === undefined ||
          !this.activeData.tag ||
          this.oldActiveId !== this.activeId
      ) {
        return
      }
      this.activeData.placeholder = this.activeData.placeholder.replace(oldVal, '') + val
    },
    activeId: {
      handler(val) {
        this.oldActiveId = val
      },
      immediate: true
    }
  },
  mounted() {
    const clipboard = new ClipboardJS('#copyNode', {
      text: trigger => {
        const codeStr = this.generateCode(this.$refs.copyNode.generateConf)
        this.$notify({
          title: '成功',
          message: '代码已复制到剪切板，可粘贴。',
          type: 'success'
        })
        return codeStr
      }
    })
    clipboard.on('error', e => {
      this.$message.error('代码复制失败')
    })
  },
  methods: {
    activeFormItem(element) {
      this.activeData = element
      this.activeId = element.formId
    },
    onEnd(obj, a) {
      if (obj.from !== obj.to) {
        this.activeData = this.tempActiveData
        this.activeId = this.idGlobal
      }
    },
    addComponent(item) {
      const clone = this.cloneComponent(item)
      // 如果是容器组件则放到容器组件里面
      if (this.activeData && this.activeData.children) {
        this.activeData.children.push(clone)
      } else {
        // 如果焦点再容器组件里面那么新增的组件还是在容器里面
        if (this.activeData && this.activeData.getParent()) {
          this.activeData.getParent().push(clone)
        } else {
          // 否则放到最外面即可
          this.drawingList.push(clone)
        }
        this.activeFormItem(clone)
      }
    },
    cloneComponent(origin) {
      const clone = JSON.parse(JSON.stringify(origin))
      clone.formId = ++this.idGlobal
      clone.span = formConf.span
      clone.renderKey = +new Date() // 改变renderKey后可以实现强制更新组件
      if (!clone.layout) clone.layout = 'colFormItem'
      if (clone.layout === 'colFormItem') {
        clone.vModel = `field${this.idGlobal}`
        clone.placeholder !== undefined && (clone.placeholder += clone.label)
        this.tempActiveData = clone
      } else if (clone.layout === 'rowFormItem') {
        delete clone.label
        clone.componentName = `row${this.idGlobal}`
        clone.gutter = this.formConf.gutter
        this.tempActiveData = clone
      }
      return this.tempActiveData
    },
    AssembleFormData() {
      return {
        fields: JSON.parse(JSON.stringify(this.drawingList)),
        ...this.formConf
      }
    },
    empty() {
      this.$confirm('确定要清空所有组件吗？', '提示', { type: 'warning' }).then(
          () => {
            this.drawingList = []
          }
      )
    },
    drawingItemCopy(item, parent) {
      let clone = JSON.parse(JSON.stringify(item))
      clone = this.createIdAndKey(clone)
      parent.push(clone)
      this.activeFormItem(clone)
    },
    createIdAndKey(item) {
      item.formId = ++this.idGlobal
      item.renderKey = +new Date()
      if (item.layout === 'colFormItem') {
        item.vModel = `field${this.idGlobal}`
      } else if (item.layout === 'rowFormItem') {
        item.componentName = `row${this.idGlobal}`
      }
      if (Array.isArray(item.children)) {
        item.children = item.children.map(childItem => this.createIdAndKey(childItem))
      }
      return item
    },
    drawingItemDelete(index, parent) {
      parent.splice(index, 1)
      this.$nextTick(() => {
        const len = this.drawingList.length
        if (len) {
          this.activeFormItem(this.drawingList[len - 1])
        }
      })
    },
    generateCode(generateConf) {
      const { type } = generateConf
      const formData = this.AssembleFormData()
      const script = vueScript(makeUpJs(formData, type))
      const html = vueTemplate(makeUpHtml(formData, type))
      const css = cssStyle(makeUpCss(formData))
      return beautifier.html(html + script + css, beautifierConf.html)
    },
    download() {
      this.$dialog(GenerateTypeForm, {
        showFileName: true
      }).show({
        title: '选择生成类型',
        width: '500px'
      }, (form) => {
        form.$on('confirm', (generateConf) => {
          const codeStr = this.generateCode(generateConf)
          const blob = new Blob([codeStr], { type: 'text/plain;charset=utf-8' })
          this.$download.saveAs(blob, generateConf.fileName)
        })
      })
    },
    copy() {
      this.$dialog(GenerateTypeForm, {
        showFileName: false
      }).show({
        title: '选择生成类型',
        width: '500px'
      }, (form) => {
        form.$on('confirm', (generateConf) => {
          this.$refs.copyNode.generateConf = generateConf
          document.getElementById('copyNode').click()
        })
      })
    },
    tagChange(newTag) {
      newTag = this.cloneComponent(newTag)
      newTag.vModel = this.activeData.vModel
      newTag.formId = this.activeId
      newTag.span = this.activeData.span
      delete this.activeData.tag
      delete this.activeData.tagIcon
      delete this.activeData.document
      Object.keys(newTag).forEach(key => {
        if (this.activeData[key] !== undefined &&
            typeof this.activeData[key] === typeof newTag[key]) {
          newTag[key] = this.activeData[key]
        }
      })
      this.activeData = newTag
      this.updateDrawingList(newTag, this.drawingList)
    },
    updateDrawingList(newTag, list) {
      const index = list.findIndex(item => item.formId === this.activeId)
      if (index > -1) {
        list.splice(index, 1, newTag)
      } else {
        list.forEach(item => {
          if (Array.isArray(item.children)) this.updateDrawingList(newTag, item.children)
        })
      }
    },
    onDrop(event) {
      event.preventDefault()
      event.stopPropagation()
    }
  }
}
</script>

<style lang="scss">
.form-editor {
  position: relative;
  width: 100%;
  height: 100%;

  .editor-tabs {
    background: #121315;

    .el-tabs__header {
      margin: 0;
      border-bottom-color: #121315;

      .el-tabs__nav {
        border-color: #121315;
      }
    }

    .el-tabs__item {
      height: 32px;
      line-height: 32px;
      color: #888a8e;
      border-left: 1px solid #121315 !important;
      background: #363636;
      margin-right: 5px;
      user-select: none;
    }

    .el-tabs__item.is-active {
      background: #1e1e1e;
      border-bottom-color: #1e1e1e !important;
      color: #fff;
    }

    .el-icon-edit {
      color: #f1fa8c;
    }

    .el-icon-document {
      color: #a95812;
    }
  }

  // home
  .right-scrollbar {
    height: 100%;
    overflow: auto;
    padding: 12px 18px 15px 15px;
  }


  .center-tabs {
    .el-tabs__header {
      margin-bottom: 0 !important;
    }

    .el-tabs__item {
      width: 50%;
      text-align: center;
    }

    .el-tabs__nav {
      width: 100%;
    }
  }

  .reg-item {
    padding: 12px 6px;
    background: #f8f8f8;
    position: relative;
    border-radius: 4px;

    .close-btn {
      position: absolute;
      right: -6px;
      top: -6px;
      display: block;
      width: 16px;
      height: 16px;
      line-height: 16px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 50%;
      color: #fff;
      text-align: center;
      z-index: 1;
      cursor: pointer;
      font-size: 12px;

      &:hover {
        background: rgba(210, 23, 23, 0.5)
      }
    }

    & + .reg-item {
      margin-top: 18px;
    }
  }

  .action-bar {
    & .el-button + .el-button {
      margin-left: 15px;
    }

    & i {
      font-size: 20px;
      vertical-align: middle;
      position: relative;
      top: -1px;
    }
  }

  .custom-tree-node {
    width: 100%;
    font-size: 14px;

    .node-operation {
      float: right;
    }

    i[class*="el-icon"] + i[class*="el-icon"] {
      margin-left: 6px;
    }

    .el-icon-plus {
      color: #409EFF;
    }

    .el-icon-delete {
      color: #157a0c;
    }
  }


  .el-rate {
    display: inline-block;
    vertical-align: text-top;
  }

  .el-upload__tip {
    line-height: 1.2;
  }

  $selectedColor: #f6f7ff;
  $lighterBlue: #409EFF;

  .components-list {
    padding: 8px;
    box-sizing: border-box;
    height: 100%;
    overflow: auto;

    .components-item {
      display: inline-block;
      width: 48%;
      margin: 1%;
      transition: transform 0ms !important;
    }
  }

  .components-draggable {
    padding-bottom: 20px;
  }

  .components-title {
    font-size: 14px;
    color: #222;
    margin: 6px 2px;

    .svg-icon {
      color: #666;
      font-size: 18px;
    }
  }

  .components-body {
    padding: 8px 10px;
    background: $selectedColor;
    font-size: 12px;
    cursor: move;
    border: 1px dashed $selectedColor;
    border-radius: 3px;

    .svg-icon {
      color: #777;
      font-size: 15px;
    }

    &:hover {
      border: 1px dashed #787be8;
      color: #787be8;

      .svg-icon {
        color: #787be8;
      }
    }
  }

  .left-board {
    width: 260px;
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
  }

  .left-scrollbar {
    height: calc(100% - 42px);
    overflow: hidden;
  }

  .center-scrollbar {
    height: calc(100% - 42px);
    overflow: auto;
    border-left: 1px solid #f1e8e8;
    border-right: 1px solid #f1e8e8;
    box-sizing: border-box;
  }

  .center-board {
    height: 100%;
    width: auto;
    margin: 0 351px 0 261px;
    box-sizing: border-box;
  }

  .empty-info {
    position: absolute;
    top: 46%;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 18px;
    color: #ccb1ea;
    letter-spacing: 4px;
  }

  .action-bar {
    position: relative;
    height: 42px;
    text-align: right;
    padding: 0 15px;
    box-sizing: border-box;;
    border: 1px solid #f1e8e8;
    border-top: none;
    border-left: none;

    .delete-btn {
      color: #F56C6C;
    }
  }

  .logo-wrapper {
    position: relative;
    height: 42px;
    background: #fff;
    border-bottom: 1px solid #f1e8e8;
    box-sizing: border-box;
  }

  .logo {
    position: absolute;
    left: 12px;
    top: 6px;
    line-height: 30px;
    color: #00afff;
    font-weight: 600;
    font-size: 17px;
    white-space: nowrap;

    > img {
      width: 30px;
      height: 30px;
      vertical-align: top;
    }

    .github {
      display: inline-block;
      vertical-align: sub;
      margin-left: 15px;

      > img {
        height: 22px;
      }
    }
  }

  .center-board-row {
    padding: 12px 12px 15px 12px;
    box-sizing: border-box;
    height: 100%;

    & > .el-form {
      height: 100%;
    }
  }

  .drawing-board {
    height: 100%;
    position: relative;

    .components-body {
      padding: 0;
      margin: 0;
      font-size: 0;
    }

    .sortable-ghost {
      position: relative;
      display: block;
      overflow: hidden;

      &::before {
        content: " ";
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        height: 3px;
        background: rgb(89, 89, 223);
        z-index: 2;
      }
    }

    .components-item.sortable-ghost {
      width: 100%;
      height: 60px;
      background-color: $selectedColor;
    }

    .active-from-item {
      & > .el-form-item {
        background: $selectedColor;
        border-radius: 6px;
      }

      & > .drawing-item-copy, & > .drawing-item-delete {
        display: initial;
      }

      & > .component-name {
        color: $lighterBlue;
      }
    }

    .el-form-item {
      margin-bottom: 15px;
    }
  }

  .drawing-item {
    position: relative;
    cursor: move;

    &.unfocus-bordered:not(.activeFromItem) > div:first-child {
      border: 1px dashed #ccc;
    }

    .el-form-item {
      padding: 12px 10px;
    }
  }

  .drawing-row-item {
    position: relative;
    cursor: move;
    box-sizing: border-box;
    border: 1px dashed #ccc;
    border-radius: 3px;
    padding: 0 2px;
    margin-bottom: 15px;

    .drawing-row-item {
      margin-bottom: 2px;
    }

    .el-col {
      margin-top: 22px;
    }

    .el-form-item {
      margin-bottom: 0;
    }

    .drag-wrapper {
      min-height: 80px;
    }

    &.active-from-item {
      border: 1px dashed $lighterBlue;
    }

    .component-name {
      position: absolute;
      top: 0;
      left: 0;
      font-size: 12px;
      color: #bbb;
      display: inline-block;
      padding: 0 6px;
    }
  }

  .drawing-item, .drawing-row-item {
    &:hover {
      & > .el-form-item {
        background: $selectedColor;
        border-radius: 6px;
      }

      & > .drawing-item-copy, & > .drawing-item-delete {
        display: initial;
      }
    }

    & > .drawing-item-copy, & > .drawing-item-delete {
      display: none;
      position: absolute;
      top: -10px;
      width: 22px;
      height: 22px;
      line-height: 22px;
      text-align: center;
      border-radius: 50%;
      font-size: 12px;
      border: 1px solid;
      cursor: pointer;
      z-index: 1;
    }

    & > .drawing-item-copy {
      right: 56px;
      border-color: $lighterBlue;
      color: $lighterBlue;
      background: #fff;

      &:hover {
        background: $lighterBlue;
        color: #fff;
      }
    }

    & > .drawing-item-delete {
      right: 24px;
      border-color: #F56C6C;
      color: #F56C6C;
      background: #fff;

      &:hover {
        background: #F56C6C;
        color: #fff;
      }
    }
  }
}
</style>
