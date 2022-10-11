import { saveAs } from 'file-saver'

export default {
  install(Vue) {
    // 本地下载文件
    Vue.prototype.$download = {
      saveAs
    }
  }
}
