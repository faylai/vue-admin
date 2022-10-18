<script>
const TreeNode = {
  name: 'TreeNode',
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
  render(h) {
    const nodeScopeSlots = {
      node: this.$scopedSlots.node || function emptyScopeNode() {
        return h('')
      }
    }
    /* eslint-disable indent */
    return (<li>
      <div
          vOn:click_stop={() => this.$emit('node-click', this.node)}
          style={{ 'padding-left': this.indentPadding }}
          class={['bd-object-tree-node', this.selectMode === 'single' && this.node.selected ? 'selected' : '']}>
        {(() => {
          if (this.node.children.length > 0 || this.node.objectCount > 0) {
            return (<span
                vOn:click_stop={() => this.$emit('update-expanded', this.node)}
                class={['icon', this.node.loading ? 'tree-folder-expanded-loading-icon' : (this.node.expanded ? 'bd-object-tree-folder-expanded-icon' : 'bd-object-tree-folder-collapsed-icon')]}>
                </span>)
          } else {
            return (<span class="icon"></span>)
          }
        })()}
        <span class="space5"></span>
        {(() => {
          if (this.selectMode === 'multiple') {
            return [
              (<span vOn:click_stop={() => this.$emit('node-check', this.node)}
                     class={['checkbox', this.node.checkState === 0 ? 'uncheck' : '', this.node.checkState === 1 ? 'half-check' : '', this.node.checkState === 2 ? 'all-check' : '']}></span>),
              (<span class="space5"></span>)]
          }
        })()}

        {(() => {
          if (this.node.iconCls) {
            return (<span
                class={['icon', this.node.iconCls]}></span>)
          }
        })()}

        {nodeScopeSlots.node(this.node)}
        <span class="node-text"> {this.nodeText}</span>
      </div>

      {(() => {
        if (this.node.children.length > 0 && this.node.expanded) {
          return <ul>
            {this.node.childNodes.map((child) => {
              return (
                  <TreeNode node={child}
                              scopedSlots={nodeScopeSlots}
                              key={child.objectId}
                              select-mode={this.selectMode}
                              select-object-type={this.selectObjectType}
                              vOn:update-more={($event) => this.$emit('update-more', $event)}
                              vOn:node-click={($event) => this.$emit('node-click', $event)}
                              vOn:node-check={($event) => this.$emit('node-check', $event)}
                              vOn:update-expanded={($event) => this.$emit('update-expanded', $event)}></TreeNode>)
            })}
            {(() => {
              if (this.node.childNodes.length < this.node.objectCount) {
                return (<li class="bd-object-tree-load-more"
                            vOn:click={() => this.$emit('update-more', this.node)}> 加载更多 &gt;&gt;</li>)
              }
            })()}
          </ul>
        }
      })()}
    </li>)

  },
  data: function() {
    return {}
  },
  computed: {
    indentPadding: function() {
      return (6 + this.node.level * 20) + 'px'
    },
    nodeText: function() {
      const node = this.node
      const preCount = ''
      return preCount + node.objectName
    }
  }
}
export default TreeNode
</script>



