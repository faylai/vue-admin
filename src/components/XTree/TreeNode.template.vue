<template>
  <li>
    <div @click.stop="$emit('node-click',node)"
         :style="{'padding-left':indentPadding}"
         :class="['bd-object-tree-node',selectMode == 'single' && node.selected?'selected':'']">
      <span
          @click.stop="$emit('update-expanded',node)"
          v-if="node.children.length > 0 || node.objectCount>0"
          :class="['icon',node.loading?'tree-folder-expanded-loading-icon':(node.expanded?'bd-object-tree-folder-expanded-icon':'bd-object-tree-folder-collapsed-icon')]">
            </span>
      <span v-else
            class="icon">
            </span>
      <span class="space5"></span>

      <template v-if="selectMode != 'single'">
        <span
            @click.stop="$emit('node-check',node)"
            :class="['checkbox',node.checkState == 0?'uncheck':'', node.checkState == 1?'half-check':'', node.checkState == 2?'all-check':'']"></span>
        <span class="space5"></span>
      </template>

      <template v-if="node.iconCls">
        <span
            :class="['icon',node.iconCls]">
            </span>
        <span class="space5"></span>
      </template>
      <slot name="node" v-bind:node="node"></slot>
      <span class="node-text"> {{ nodeText }}</span>
    </div>

    <ul v-if="node.children.length>0 && node.expanded">
      <template v-for="child in node.childNodes">
        <NestedNode :node="child"
                    :key="child.objectId"
                    :select-mode="selectMode"
                    :select-object-type="selectObjectType"
                    @update-more="$emit('update-more',$event)"
                    @node-click="$emit('node-click',$event)"
                    @node-check="$emit('node-check',$event)"
                    @update-expanded="$emit('update-expanded',$event)"></NestedNode>
      </template>
      <li class="bd-object-tree-load-more"
          v-if="node.childNodes.length < node.objectCount"
          @click="$emit('update-more',node)">加载更多&gt;&gt;
      </li>
    </ul>
  </li>
</template>

<script>
export default {}
</script>
