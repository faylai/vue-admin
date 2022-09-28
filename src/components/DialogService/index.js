import { Dialog } from 'element-ui'

function install(Vue, config) {
  // const Dialog =Vue.options.components.ElDialog.extendOptions;
  function getDialogPropsDef() {
    let props = Object.assign({}, Dialog.props);
    (Dialog.mixins || []).forEach(function(item) {
      if (item.props) {
        props = Object.assign(Object.assign({}, item.props), props)
      }
    })
    return props
  }

  const ElDialogConstructor = Vue.extend({
    name: 'ElDialogConstructor', props: getDialogPropsDef(), render(h) {
      const slots = this.componentConfig.slots
      const children = [h(this.componentConfig.class, { props: this.componentConfig.props, ref: 'comp' })]
      for (const key of Object.keys(slots)) {
        const vnode = slots[key]
        vnode.context = this.$root
        vnode.data = Object.assign(vnode.data || {}, { slot: key })
        children.push(vnode)
      }
      return h('el-dialog', {
        props: this._props,
        on: { close: this.close },
        ref: 'dialog'
      }, children)
    }, methods: {
      getComponentInstance() {
        if (this.$refs.comp) {
          return this.$refs.comp
        } else {
          return null
        }
      },
      close() {
        const beforeClose = this.beforeClose || function() {
          return true
        }
        if (beforeClose()) {
          this.visible = false
          this.$nextTick(function() {
            this.$destroy()
            this._vnode = null
            this.$children = []
          })
        }
      },
      show: function(dialogProps, callback) {
        if (this._isDestroyed) {
          console.error('you can\'t show a destroyed dialog')
          return
        } else {
          if (this.__isMounted__) {
            this.visible = true
          } else {
            const config = Object.assign({
              visible: true,
              title: '请初始化title',
              appendToBody: true
            }, dialogProps || {})
            Object.keys(config).forEach(key => {
              this[key] = config[key]
            })
            this.$mount()
            const that = this
            this.$refs.dialog.$on('open', function() {
              if (callback) {
                setTimeout(function() {
                  callback.apply(that, [that.getComponentInstance()])
                }, 100)
              }
            })
            document.body.appendChild(this.$el)
            this.__isMounted__ = true
            return this
          }
        }
      },
      hide() {
        this.close()
      }
    }
  })

  Vue.prototype.$dialog = function(Component, props, slots) {
    const instance = new ElDialogConstructor(Object.assign({
      el: document.createElement('div'),
      data: {
        componentConfig: {
          class: Component,
          props: props,
          slots: slots || {}
        }
      }
    }, config || {}))
    return instance
  }
}

export default {
  install
}
