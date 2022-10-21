<script>
import { normalizeSlots } from '@/utils'
import EnforceSlotSelect from '@/components/EnforceSlotSelect'

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
    const data = Object.assign(context.data)
    data.on = context.listeners
    return h(EnforceSlotSelect, data, normalizeSlots(slots))
  }
}
</script>
