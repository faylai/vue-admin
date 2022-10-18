import ClipboardJS from 'clipboard'

let counter = 1

function uuid() {
  counter++
  return `copy_node_${counter}`
}

export default {
  methods: {
    // 复制到剪切板
    $clipboard: function(text, cb) {
      text = String(text)
      if (text && text.length) {
        const inputId = uuid()
        const $input = document.createElement('input')
        $input.id = inputId
        $input.type = 'hidden'
        document.body.appendChild($input)
        setTimeout(function() {
          const clipboard = new ClipboardJS(`#${inputId}`, {
            text: trigger => {
              return text
            }
          })
          clipboard.on('error', e => {
            console.error('复制到剪切板失败', e)
          })
          setTimeout(function() {
            document.getElementById(inputId).click()
            setTimeout(function() {
              clipboard.destroy()
              document.body.removeChild(document.getElementById(inputId))
              cb && cb()
            }, 100)
          }, 100)
        }, 100)

      }
    }
  }
}
