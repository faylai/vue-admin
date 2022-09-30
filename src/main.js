import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'
import i18n from './lang'
import '@/icons' // icon
import '@/permission' // permission control
import DialogService from '@/components/DialogService'
import './components/vxe/install.js'
import lodash from 'lodash'

window.$ = window.jQuery = require('jquery')
/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
if (process.env.NODE_ENV === 'production') {
  const { mockXHR } = require('../mock')
  mockXHR()
}

// set ElementUI lang to EN
Vue.use(ElementUI, {
  size: 'small', // set element-ui default size
  i18n: (key, value) => i18n.t(key, value)
})

// 如果想要中文版 element-ui，按如下方式声明
// Vue.use(ElementUI)
const pluginConfig = {
  router,
  store,
  i18n
}
Vue.config.productionTip = false
Vue.prototype._ = lodash
Vue.use(DialogService, pluginConfig)
new Vue(Object.assign({
  el: '#app',
  render: h => h(App)
}, pluginConfig))
