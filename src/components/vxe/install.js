
import Vue from 'vue'
import XEUtils from 'xe-utils'
import './override.scss'
import {
  // 全局对象
  VXETable,

  // 功能模块
  // Filter,
  // Menu,
  Edit,
  // Export,
  // Keyboard,
  Validator,

  // 可选组件
  Icon,
  Column,
  // Colgroup,
  Grid,
  Toolbar,
  // Pager,
  // Checkbox,
  // CheckboxGroup,
  // Radio,
  // RadioGroup,
  // RadioButton,
  // Input,
  // Textarea,
  Button,
  // Modal,
  // Tooltip,
  // Form,
  // FormItem,
  // FormGather,
  Select,
  // Optgroup,
  // Option,
  // Switch,
  // List,
  // Pulldown,
  // 表格
  Table
} from 'vxe-table'
import zhCN from 'vxe-table/lib/locale/lang/zh-CN'

// 按需加载的方式默认是不带国际化的，自定义国际化需要自行解析占位符 '{0}'，例如：
VXETable.setup({
  i18n: (key, args) => XEUtils.toFormatString(XEUtils.get(zhCN, key), args)
})

// 表格功能
// Vue.use(Filter)
Vue.use(Edit)
// .use(Menu)
// .use(Export)
// .use(Keyboard)
Vue.use(Validator)

// 可选组件
Vue.use(Icon)
  .use(Column)
  // .use(Colgroup)
  .use(Grid)
  .use(Toolbar)
  // .use(Pager)
  // .use(Checkbox)
  // .use(CheckboxGroup)
  // .use(Radio)
  // .use(RadioGroup)
  // .use(RadioButton)
  // .use(Input)
  // .use(Textarea)
  .use(Button)
  // .use(Modal)
  // .use(Tooltip)
  // .use(Form)
  // .use(FormItem)
  // .use(FormGather)
  .use(Select)
  // .use(Optgroup)
  // .use(Option)
  // .use(Switch)
  // .use(List)
  // .use(Pulldown)

  // 安装表格
  .use(Table)

// 给 vue 实例挂载内部对象，例如：
// Vue.prototype.$XModal = VXETable.modal
// Vue.prototype.$XPrint = VXETable.print
// Vue.prototype.$XSaveFile = VXETable.saveFile
// Vue.prototype.$XReadFile = VXETable.readFile
