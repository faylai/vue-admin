<script>
import draggable from 'vuedraggable'
import renderField from '@/views/tool/build/RenderField'

const components = {
  itemBtns(h, element, index, parent) {
    const { copyItem, deleteItem } = this.listeners
    return [
      <span class="drawing-item-copy" title="复制" onClick={event => {
        copyItem && copyItem(element, parent)
        event.stopPropagation()
      }}>
        <i class="el-icon-copy-document"/>
      </span>,
      <span class="drawing-item-delete" title="删除" onClick={event => {
        deleteItem && deleteItem(index, parent)
        event.stopPropagation()
      }}>
        <i class="el-icon-delete"/>
      </span>
    ]
  }
}
/* eslint-disable indent */
const layouts = {
  colFormItem(h, element, index, parent) {
    const { activeItem } = this.listeners
    let className = this.activeId === element.formId ? 'drawing-item active-from-item' : 'drawing-item'
    if (this.props.formConf.unFocusedComponentBorder) className += ' unfocus-bordered'
    return (
        <el-col span={element.span} class={className}
                nativeOnClick={event => {
                  activeItem(element)
                  event.stopPropagation()
                }}>
          <el-form-item label-width={element.labelWidth ? `${element.labelWidth}px` : null}
                        label={element.label} required={element.required}>
            <renderField key={element.renderKey} value={element.defaultValue} conf={element} vOn:input={event => {
              element.defaultValue = event
            }}/>
          </el-form-item>
          {components.itemBtns.apply(this, arguments)}
        </el-col>
    )
  },
  rowFormItem(h, element, index, parent) {
    const { activeItem } = this.listeners
    const className = this.props.activeId === element.formId ? 'drawing-row-item active-from-item' : 'drawing-row-item'
    let child = renderChildren.apply(this, arguments)
    if (element.type === 'flex') {
      child = <el-row type={element.type} justify={element.justify} align={element.align}>
        {child}
      </el-row>
    }
    return (
        <el-col span={element.span}>
          <el-row gutter={element.gutter} class={className}
                  nativeOnClick={event => {
                    activeItem(element)
                    event.stopPropagation()
                  }}>
            <span class="component-name">{element.componentName}</span>
            <draggable list={element.children} animation={340} group="componentsGroup" class="drag-wrapper">
              {child}
            </draggable>
            {components.itemBtns.apply(this, arguments)}
          </el-row>
        </el-col>
    )
  }
}

function renderChildren(h, element, index, parent) {
  if (!Array.isArray(element.children)) return null
  return element.children.map((el, i) => {
    const layout = layouts[el.layout]
    el.getParent = function() {
      return element.children
    }
    if (layout) {
      return layout.call(this, h, el, i, element.children)
    } else {
      return layoutIsNotFound()
    }
  })
}

function layoutIsNotFound() {
  throw new Error(`没有与${this.element.layout}匹配的layout`)
}

export default {
  functional: true,
  name: 'DraggableForm',
  props: [
    'drawingList',
    'activeId',
    'formConf'
  ],
  render(h, context) {
    return (<draggable class="drawing-board" list={context.props.drawingList} animation="340" group="componentsGroup">
      {
        renderChildren.call(context, h, { children: context.props.drawingList })
      }
    </draggable>)
  }
}
</script>
