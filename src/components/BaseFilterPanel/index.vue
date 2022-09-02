<template>
  <div class="base-filter-panel">
    <div class="filter-list" ref="filterList">
      <el-button
        ref="foldBtn"
        class="foldBtn"
        v-show="foldConfig.show"
        v-bind="foldConfig.props"
        @click="foldConfig.handleExpand(foldConfig)"
      >
      </el-button>
    </div>
    <div class="button-list" ref="buttonList">
      <el-button
        v-for="(item,key) in constButtonList"
        :key="key"
        v-show="item.show"
        v-bind="item.props"
        @click="item.click"
      >
        {{ $t(item.label) }}
      </el-button>

    </div>
  </div>
</template>

<script>
import lodash from 'lodash'

export default {
  name: 'BaseFilterPanel',
  data() {
    return {
      filterListWidth: 0,
      buttonListWidth: 0,
      foldButtonWidth: 0,
      constButtonList: [
        {
          ref: 'queryButton',
          show: true,
          label: 'components.query',
          props: {
            is: 'elButton',
            disabled: false,
            type: 'primary'
          },
          click: this.handleQuery
        },
        {
          ref: 'resetButton',
          show: true,
          logParam: {},
          label: 'components.reset',
          type: 'default',
          props: {
            is: 'elButton',
            disabled: false,
            type: 'default'
          },
          click: this.handleReset
        }
      ],
      foldConfig: {
        show: true,
        props: {
          disabled: false,
          icon: 'el-icon-plus'
        }
      }
    }
  },
  methods: {
    handleExpand(item) {
      this.isExpand = !this.isExpand
      if (this.isExpand) {
        item.props.icon = 'el-icon-minus'
      } else {
        item.props.icon = 'el-icon-plus'
      }
    },
    handleQuery() {

    },
    handleReset() {

    },
    bindResize: lodash.debounce(function() {
      window.addEventListener('resize', this.responsiveFilerListWithMemory)
    }, 100),
    responsiveFilerListWithMemory() {
      this.responsiveFilerList(true)
    },
    responsiveFilerList: lodash.debounce(function(isMemory) {
      // isMemory 为true 会记忆宽度 否则强制更新
      // 获取总的宽度 filterListWidth(监听是否是 x 的窗口变动)
      const filterListDom = this.$refs.filterList
      if (!filterListDom) return
      const filterListWidth = Math.floor(filterListDom.offsetWidth)
      if (!isMemory || filterListWidth !== this.filterListWidth) {
        this.filterListWidth = filterListWidth
      } else {
        // 不进行重新计算
        return
      }
      // 初始化赋值宽度 按钮组组合(默认最后一排)
      let sumW = this.foldButtonWidth + this.buttonListWidth
      const config = this.filterConfig
      this.foldConfig.show = false
      let foldItem = null
      this._.each(config, (item, index, config) => {
        if (item.show === false || item.right || item.left) {
          // 这里不处理 1.不显示的item 2.在按钮组右侧显示的
          item.hide = item.show && true
          return
        }
        // console.log(sumW, item.width, elWidth, list)
        sumW += item.width
        if (this._.isNaN(sumW)) {
          console.log(`过滤条件计算错误component:${item.component}`)
        }
        if (sumW > filterListWidth) {
          if (!foldItem && (sumW - this.foldButtonWidth <= filterListWidth)) {
            // 恰巧可以显示的 但是一定是最后一个要显示的元素了
            foldItem = item
            // 第一行最后一个隐藏暂不隐藏
            item.hide = false
            this.foldConfig.show = false
          } else {
            if (foldItem) {
              // 第一行最后一个隐藏
              foldItem.hide = true
            }
            item.hide = true
            // 是否显示折叠按钮
            this.foldConfig.show = true
          }
        } else {
          item.hide = false
          this.foldConfig.show = false
        }
      })
    }, 100)
  },
  mounted() {
    // 获取的原生的dom 这里来获取宽度数据
    this.buttonListWidth = this.$refs.buttonList.offsetWidth
    this.filterListWidth = this.$refs.filterList.offsetWidth
    this.foldButtonWidth = this.$refs.foldBtn.offsetWidth
  }
}
</script>

<style lang="scss" scoped>
.base-filter-panel {
  display: table-cell;
  width: 9999px;

  .filter-list {
    text-align: left;
    font-size: 0;

    .list-item {
      display: inline-block;
      padding-right: 4px;
      margin-bottom: 8px;
      vertical-align: top;

      .el-radio-group {
        label {
          line-height: 32px;
        }
      }
    }

    .foldBtn {
      padding: 6px 8px;

      &:focus, &:visited {
        background: #fff;
        border-color: #cccccc;
        color: #808080;
      }

      &:hover {
        color: #26a8ff;
        border-color: #26a8ff;
      }

      &:active {
        color: #fff;
        background-color: #1374F2;
        border-color: #1374F2;
      }
    }
  }

  .button-list {
    padding-bottom: 8px;
    padding-left: 32px;
    float: right;
  }
}
</style>
