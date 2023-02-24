import Vue from 'vue'
import './override.scss'
import config from './config'
import initFormat from './format'
import elementPlugin from './element-plugin'
import {
  Button,
  Column,
  Edit,
  Export,
  Grid,
  Icon,
  Input,
  Option,
  Pager,
  Select,
  Table,
  Toolbar,
  Validator,
  VXETable
} from 'vxe-table'

VXETable.use(elementPlugin)
// 按需加载的方式默认是不带国际化的，自定义国际化需要自行解析占位符 '{0}'，例如：
VXETable.setup(config)
// 配置全局格式化函数
initFormat(VXETable)
// 表格功能
// Vue.use(Filter)
Vue.use(Edit)
  // .use(Menu)
  .use(Export)
// .use(Keyboard)
Vue.use(Validator)

// 可选组件
Vue.use(Icon)
  .use(Column)
  // .use(Colgroup)
  .use(Grid)
  .use(Toolbar)
  .use(Pager)
  // .use(Checkbox)
  // .use(CheckboxGroup)
  // .use(Radio)
  // .use(RadioGroup)
  // .use(RadioButton)
  .use(Input)
  // .use(Textarea)
  .use(Button)
  // .use(Modal)
  // .use(Tooltip)
  // .use(Form)
  // .use(FormItem)
  // .use(FormGather)
  .use(Select)
  // .use(Optgroup)
  .use(Option)
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
