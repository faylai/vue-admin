<script>
import IconsForm from '@/views/tool/build/IconsForm'
import Emitter from 'element-ui/lib/mixins/emitter'

export default {
  name: 'IconPicker',
  inheritAttrs: false,
  mixins: [
    Emitter
  ],
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    value: {}
  },
  data() {
    return {
      keywords: ''
    }
  },
  methods: {
    showDialog() {
      this.$dialog(IconsForm, {
        current: this.value
      }, {
        title: () => {
          return (<div><span>选择图标    </span>
            <el-input
                vModel={this.keywords}
                size="mini"
                style={{ width: '260px' }}
                placeholder="请输入图标名称"
                prefix-icon="el-icon-search"
                clearable/>
          </div>)
        }
      }).show({
        title: '请选择图标',
        width: '980px'
      }, (form, dialog) => {
        form.$on('select', (event) => {
          this.$emit('input', event)
          this.dispatch('ElFormItem', 'el.form.change', event)
          dialog.close()
        })
      })
    }
  },
  render: function(h) {
    const data = {
      on: this.$listeners || {},
      attrs: {
        value: this.value,
        ...this.$attrs
      }
    }
    return h('el-input', data, [
      h('template', {
        slot: 'append'
      }, [
        (<el-button type="mini" icon="el-icon-thumb" vOn:click={this.showDialog}>选择</el-button>)
      ])
    ].concat(this.$children))
  }
}
</script>


