import Vue from 'vue'
import VueI18n from 'vue-i18n'
import Cookies from 'js-cookie'
import elementEnLocale from 'element-ui/lib/locale/lang/en' // element-ui lang
import elementZhLocale from 'element-ui/lib/locale/lang/zh-CN'// element-ui lang
import elementFrLocale from 'element-ui/lib/locale/lang/fr'// element-ui lang
import enLocale from './en-us'
import zhLocale from './zh-cn'
import frLocale from './fr'

Vue.use(VueI18n)

const messages = {
  'en-us': {
    ...enLocale,
    ...elementEnLocale
  },
  'zh-cn': {
    ...zhLocale,
    ...elementZhLocale
  },
  'fr': {
    ...frLocale,
    ...elementFrLocale
  }
}
let lang = 'zh-cn'
if (Cookies.get('language') && Cookies.get('language') !== 'undefined') {
  lang = Cookies.get('language')
}
const i18n = new VueI18n({
  locale: lang, // set locale
  messages, // set locale messages
  silentTranslationWarn: true
})

export default i18n
