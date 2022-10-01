<script>

import EnforceSlotSelect from '@/components/EnforceSlotSelect'
import { normalizeSlots } from '@/utils'

export default {
  name: 'ExtRemoteSelect',
  functional: true,
  render(h, context) {
    let children = (context.children || []).concat([])
    const mergedOptions = Object.assign({
      filterable: true,
      loading: false,
      automaticDropdown: false
    }, context.data.attrs || {})
    mergedOptions.remote = true
    const slots = context.slots()
    children = children.concat(normalizeSlots(slots))
    const data = Object.assign({}, context.data)
    data.props = mergedOptions
    // eslint-disable-next-line
    return h(EnforceSlotSelect, data, children)
  }
}
</script>
