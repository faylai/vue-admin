<script>
import emitter from 'element-ui/lib/mixins/emitter'
import { normalizeSlots } from '@/utils'

export default {
  name: 'ExtStaticSelect',
  functional: true,
  mixins: [
    emitter
  ],
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
      default: function() {
        return {}
      }
    }
  },
  render(h, context) {
    let children = (context.children || []).concat([])
    const mergedOptions = Object.assign({}, context.props.options)
    const slots = Object.assign({}, context.slots())
    if (!slots.default) {
      const items = context.props.items.map(function(item, index) {
        /* eslint-disable */
        return <el-option
            key={item[context.props.valueKey]}
            label={item[context.props.labelKey]}
            value={item[context.props.valueKey]}>
        </el-option>
      })
      slots.default = items
    }
    children = children.concat(normalizeSlots(slots))
    let data = Object.assign({}, context.data)
    data = Object.assign(data, {
      props: mergedOptions
    })
    return h('el-select', data, children)
  }
}
</script>
