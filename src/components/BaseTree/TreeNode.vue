<template>
  <li>
    <div @click.stop="$emit('node:click',node)"
         :style="{'padding-left':indentPadding}"
         :class="['bd-object-tree-node',selectMode == 'single' && node.selected?'selected':'']">
      <span
          @click.stop="$emit('update:expanded',node)"
          v-if="node.children.length > 0 || node.objectCount>0"
          :class="['icon',node.expanded?'bd-object-tree-folder-expanded-icon':'bd-object-tree-folder-collapsed-icon',selectMode == 'single' && node.selected?'selected':'' ]">
            </span>
      <span v-else
            class="icon">
            </span>
      <span class="space5"></span>

      <template v-if="selectMode != 'single'">
        <span
            @click.stop="$emit('node:check',node)"
            :class="['checkbox',node.checkState == 0?'uncheck':'', node.checkState == 1?'half-check':'', node.checkState == 2?'all-check':'']"></span>
        <span class="space5"></span>
      </template>

      <template v-if="node.iconCls">
        <span
            :class="['icon',node.iconCls]">
            </span>
        <span class="space5"></span>
      </template>
      <span class="node-text"> {{ nodeText }}</span>
    </div>

    <ul v-if="node.children.length>0 && node.expanded">
      <template v-for="child in node.childNodes">
        <NestedNode :node="child"
                    :key="child.objectId"
                    :select-mode="selectMode"
                    :select-object-type="selectObjectType"
                    @update:more="$emit('update:more',$event)"
                    @node:click="$emit('node:click',$event)"
                    @node:check="$emit('node:check',$event)"
                    @update:expanded="$emit('update:expanded',$event)"></NestedNode>
      </template>
      <li class="bd-object-tree-load-more"
          v-if="node.childNodes.length < node.objectCount"
          @click="$emit('update:more',node)">加载更多&gt;&gt;
      </li>
    </ul>
  </li>
</template>

<script>
export default {
  name: 'TreeNode',
  // 自己引入自己
  components: {
    NestedNode: () => import('./TreeNode.vue')
  },
  props: {
    node: {
      type: Object,
      required: true
    },
    // single 单选； multiple 多选
    selectMode: {
      type: String,
      default() {
        return 'single'
      }
    },
    selectObjectType: {
      type: String,
      default() {
        return ''
      }
    }
  },
  data: function() {
    return {}
  },
  computed: {
    indentPadding: function() {
      return (5 + this.node.level * 16) + 'px'
    },
    nodeText: function() {
      const node = this.node
      return node.objectName
    }
  }
}
</script>



