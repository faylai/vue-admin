<script>
import XTree from '@/components/XTree'

export default {
  name: 'DropDownTree',
  components: {
    XTree
  },
  render(h) {
    const nodeScopeSlots = {
      node: this.$scopedSlots.node || function emptyScopeNode() {
        return ''
      }
    }

    /* eslint-disable indent */
    return (<el-dropdown hide-on-click={false}>
        <span class="el-dropdown-link">
        下拉菜单<i class="el-icon-arrow-down el-icon--right"></i>
         </span>
      <XTree slot="dropdown" scopedSlots={nodeScopeSlots}> </XTree>
    </el-dropdown>)
  }
}
</script>

<style scoped>

</style>
