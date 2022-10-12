<template>
  <div>
    <el-tree
        draggable
        :data="value"
        node-key="id"
        :expand-on-click-node="false"
        :render-content="renderContent"/>
    <div>
      <el-button
          style="padding-bottom: 0"
          icon="el-icon-circle-plus-outline"
          type="text"
          @click="addRootItem">
        添加父级
      </el-button>
    </div>
  </div>
</template>

<script>
import TreeDataForm from './TreeDataForm'

export default {
  name: 'TreeDataEditor',
  props: {
    value: {}
  },
  methods: {
    addRootItem() {
      const currentNode = this.value
      this.$dialog(TreeDataForm).show({
        title: '添加选项'
      }, (form, dialog) => {
        form.$on('commit', function(formData) {
          currentNode.push(formData)
          dialog.close()
        })
      })
    },
    appendChild(data) {
      if (!data.children) {
        this.$set(data, 'children', [])
      }
      const currentNode = data.children
      this.$dialog(TreeDataForm).show({
        title: '添加选项'
      }, (form, dialog) => {
        form.$on('commit', function(formData) {
          currentNode.push(formData)
          dialog.close()
        })
      })
    },
    removeChild(node, data) {
      const { parent } = node
      const children = parent.data.children || parent.data
      const index = children.findIndex(d => d.id === data.id)
      children.splice(index, 1)
    },
    renderContent(h, { node, data, store }) {
      return (
          <div class="custom-tree-node">
            <span>{node.label}</span>
            <span class="node-operation">
            <i on-click={() => this.appendChild(data)}
               class="el-icon-plus"
               title="添加"
            ></i>
            <i on-click={() => this.removeChild(node, data)}
               class="el-icon-delete"
               title="删除"
            ></i>
          </span>
          </div>
      )
    }
  }
}
</script>

