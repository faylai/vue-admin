<script>
import { normalizeSlots } from '@/utils'
const TYPES = {
  delete: {
    'confirm-button-text': '确定',
    'cancel-button-text': '取消',
    'icon': 'el-icon-info',
    'icon-color': 'red',
    title: '确定删除吗'
  },
  default: {
    'confirm-button-text': '确定',
    'cancel-button-text': '取消',
    'icon': 'el-icon-info',
    'icon-color': 'red',
    title: '确定执行该操作码？'
  }
}
import PopBase from '@/components/XPopConfirm/base'

export default {
  extends: PopBase,
  name: 'XPopConfirm'
}
</script>
