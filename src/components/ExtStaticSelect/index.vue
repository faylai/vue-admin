<script>
import { normalizeSlots } from '@/utils'

export default {
  name: 'ExtStaticSelect',
  functional: true,
  props: {
    valueKey: {
      type: String,
      default: 'value'
    },
    labelKey: {
      type: String,
      default: 'label'
    },
    items: {
      type: Array,
      default: function() {
        return []
      }
    },
    // see https://element.eleme.io/#/zh-CN/component/select 定义props
    options: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  render(h, context) {
    const slots = Object.assign({}, context.slots())
    if (!slots.default) {
      slots.default = context.props.items.map(function(item, index) {
        /* eslint-disable */
        return <el-option
            key={item[context.props.valueKey]}
            label={item[context.props.labelKey]}
            value={item[context.props.valueKey]}>
        </el-option>
      })
    }
    return h('el-select', context.data, normalizeSlots(slots))
  }
}
</script>
