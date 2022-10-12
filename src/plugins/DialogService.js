import { Dialog } from 'element-ui'
import lodash from 'lodash'

const confirmButtonConfig = {
  text: '确定',
  type: 'primary',
  // 调用包裹组件方法的名称
  trigger: 'confirm'
}

const cancelButtonConfig = {
  text: '取消',
  // 调用包裹组件方法的名称
  trigger: 'cancel'
}
const SHOW_PARAMS = 'showParams'

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
    name: 'ElDialogConstructor',
    inheritAttrs: false,
    props: getDialogPropsDef(),
    /* eslint-disable indent */
    render(h) {
      console.log('dialog render')
      const showParams = this[SHOW_PARAMS] || {}
      const slots = showParams.slots || this.componentConfig.slots
      const $dialogStyle = showParams.style || this.componentConfig.class.$dialogStyle || {}
      const $dialogClass = showParams.class || this.componentConfig.class.$dialogClass || {}
      const $dialogButton = this.componentConfig.class.$dialogButton || {}
      let { buttons, confirmButton, cancelButton } = showParams
      if (!(buttons && buttons.length)) {
        buttons = $dialogButton.buttons || []
      }
      if (!confirmButton) {
        confirmButton = $dialogButton.confirmButton
      }
      if (!cancelButton) {
        cancelButton = $dialogButton.cancelButton
      }

      if (!slots.footer) {
        slots.footer = (<div slot="footer" class="dialog-footer">
          {(() => {
            let copyConfirmButtonConfig = Object.assign({}, confirmButtonConfig)
            if (confirmButton) {
              if (confirmButton !== true) {
                lodash.defaultsDeep(confirmButton, copyConfirmButtonConfig)
                copyConfirmButtonConfig = confirmButton
              }

              return <el-button {...{ attrs: copyConfirmButtonConfig }}
                                vOn:click={() => {
                                  const instance = this.getComponentInstance()
                                  if (instance) {
                                    const fn = instance[copyConfirmButtonConfig.trigger]
                                    if (lodash.isFunction(fn)) {
                                      fn.call(instance, this)
                                    } else {
                                      console.error(`请定义${copyConfirmButtonConfig.text} 按钮触发的方法:${copyConfirmButtonConfig.trigger}`)
                                    }
                                  }
                                }}>{copyConfirmButtonConfig.text}</el-button>
            }

          })()}
          {(() => {
            let copyCancelButtonConfig = Object.assign({}, cancelButtonConfig)
            if (cancelButton) {
              if (cancelButton !== true) {
                lodash.defaultsDeep(confirmButton, copyCancelButtonConfig)
                copyCancelButtonConfig = confirmButton
              }
              return <el-button {...{ attrs: copyCancelButtonConfig }}
                                vOn:click={() => {
                                  const instance = this.getComponentInstance()
                                  if (instance) {
                                    const fn = instance[copyCancelButtonConfig.trigger]
                                    if (lodash.isFunction(fn)) {
                                      if (fn.call(instance, this) !== false) {
                                        this.close()
                                      }
                                    } else {
                                      this.close()
                                    }
                                  }
                                }}>{copyCancelButtonConfig.text}</el-button>
            }

          })()}

          {
            buttons.map((item) => {
              return <el-button {...{ attrs: item }}
                                vOn:click={() => {
                                  const instance = this.getComponentInstance()
                                  if (instance) {
                                    if (lodash.isFunction(item.trigger)) {
                                      item.trigger(instance)
                                    } else if (lodash.isString(item.trigger)) {

                                      if (instance) {
                                        const fn = instance[item.trigger]
                                        if (lodash.isFunction(fn)) {
                                          fn.call(instance, this)
                                        } else {
                                          console.error(`请定义【${item.text}】 按钮触发的方法:${item.trigger}`)
                                        }
                                      }
                                    }
                                  }
                                }}>{item.text}</el-button>
            })
          }
        </div>)
      }
      const children = [h(this.componentConfig.class, { props: this.componentConfig.props, ref: 'comp' })]
      for (const key of Object.keys(slots)) {
        const vNode = lodash.isFunction(slots[key]) ? slots[key]() : slots[key]
        vNode.context = this.$root
        vNode.data = Object.assign(vNode.data || {}, { slot: key })
        children.push(vNode)
      }
      return h('el-dialog', {
        props: this._props,
        style: $dialogStyle,
        class: $dialogClass,
        on: { close: this.close },
        ref: 'dialog'
      }, children)
    },
    methods: {
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
              closeOnClickModal: false,
              title: '请初始化title',
              appendToBody: true
            }, dialogProps || {})
            Object.keys(config).forEach(key => {
              this[key] = config[key]
            })
            this[SHOW_PARAMS] = dialogProps
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
        },
        [SHOW_PARAMS]: {}
      }
    }, config || {}))
    return instance
  }
}

export default {
  install
}
