<script>
import { Grid } from 'vxe-table'

export default {
  extends: Grid,
  name: 'ExtendsFromVxeGrid',
  props: {
    autoLoad: {}
  },
  created() {
    this.$$$currentIndex = -1
    const unwatchQueryParams = this.$watch('params', function(nv, ov) {
      this.reloadData()
    }, { deep: true })
    this.$on('hook:beforeDestroy', function() {
      unwatchQueryParams()
    })
  },
  mounted() {
    if (this.autoLoad !== false) {
      this.reloadData()
    }
  },
  methods: {
    reloadData() {
      this.$$$currentIndex = -1
      this.commitProxy('reload').then((res) => {
        this.$nextTick(function() {
          this.$emit('loaded')
        })
      })
    },
    selectNextRow(direction) {
      this.$$$currentIndex = this.$$$currentIndex + 1 * (direction || 1)
      if (this.$$$currentIndex < 0) {
        this.$$$currentIndex = 0
      }
      const tableData = (this.getTableData().tableData || [])
      const total = tableData.length
      const index = this.$$$currentIndex % total
      const row = tableData[index]
      this.setCurrentRow(row)
    }
  }
}
</script>
