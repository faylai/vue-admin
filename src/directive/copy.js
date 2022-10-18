import ClipboardJS from 'clipboard'
import lodash from 'lodash'

let counter = 1

function uuid() {
  counter++
  return `copy_node_${counter}`
}

const dataId = 'v-copy-data-id'
const clipboardJSInstanceId = 'v-copy-data-instance'

function onClick(inputId) {
  document.getElementById('inputId').click()
}

export default {
  bind(el, binding, vnode) {
    const valueFunction = binding.value
    const scope = vnode.context
    if (lodash.isFunction(valueFunction)) {
      const inputId = uuid()
      const $input = document.createElement('input')
      $input.id = inputId
      scope[dataId] = inputId
      document.body.appendChild($input)
      const clipboard = new ClipboardJS(inputId, {
        text: trigger => {
          return valueFunction()
        }
      })
      scope[clipboardJSInstanceId] = clipboard
      clipboard.on('error', e => {
        console.error('复制到剪切板失败')
      })
      el.addEventListener('click', onClick)
    }
  },
  unbind(el, binding, vnode) {
    const scope = vnode.context
    if (scope[dataId]) {
      document.body.removeChild(document.getElementById(el[dataId]))
    }
    if (scope[clipboardJSInstanceId]) {
      scope[clipboardJSInstanceId].destroy()
    }
    el.removeEventListener('click', onClick)
  }
}
