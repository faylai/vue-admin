import i18n from '@/lang'

// translate router.meta.title, be used in breadcrumb sidebar tagsview
export function generateTitle(title) {
  // 注意：$t :this method from vue-i18n, inject in @/lang/index.js 只能用在.vue文件中(vue实例)
  const hasKey = this.$te('route.' + title)
  const translatedTitle = this.$t('route.' + title)

  if (hasKey) {
    return translatedTitle
  }
  return title
}

// translate global message outside .vue files
export function translate(title) {
  // i18n.t :用于非.vue 文件的翻译中
  const hasKey = i18n.te(title)
  const translatedTitle = i18n.t(title)

  if (hasKey) {
    return translatedTitle
  }
  return title
}
export function translateFormat() {
  if (arguments.length === 0) {
    return null
  }

  let str = arguments[0]
  if (typeof str !== 'string') {
    return '-'
  }
  for (let i = 1; i < arguments.length; i++) {
    const re = new RegExp('\\{' + (i - 1) + '\\}', 'gm')
    if (arguments[i] === undefined || arguments[i] === null) {
      arguments[i] = ''
    }
    str = str.replace(re, arguments[i])
  }
  return str
}
