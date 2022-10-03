<script>
import { Grid } from 'vxe-table'

export default {
  extends: Grid,
  name: 'ExtendsFromVxeGrid',
  created() {
    const unwatchQueryParams = this.$watch('params', function() {
      this.commitProxy('reload')
    }, { deep: true })
    this.$on('hook:beforeDestroy', function() {
      unwatchQueryParams()
    })
  }
}
</script>
