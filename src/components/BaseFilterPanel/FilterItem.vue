<script>
import { FormItem } from 'element-ui'

export default {
  name: 'FilterItem',
  inject: ['baseFilterPanel'],
  extends: FormItem,
  created() {
    if (this.baseFilterPanel) {
      this.baseFilterPanel.registerFilterItem(this)
    }
  }
}
</script>

