<template>
  <div class="base-filter-panel">
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

    <div class="filter-list" ref="filterList">
      <div
        class="list-item"
        v-show="item.hide === false"
        ref="listItems"
        v-for="(item,$index) in filterComponentList" :key="$index"
      >
        <div
          :style="{width:item.width/2 +'px' ,textAlign:'center',fontSize:'20px',padding:'10px',backgroundColor:'blue'}"
        >
          <span>{{ item.label }}</span>
        </div>
      </div>
      <div class="list-item" ref="foldBtn">
        <el-button
          class="foldBtn"
          v-show="foldConfig.show"
          v-bind="foldConfig.props"
          @click="handleExpand(foldConfig)"
        >
        </el-button>
      </div>
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
      filterComponentList: [
        {
          hide: false,
          width: 150,
          label: '150'
        },
        {
          hide: false,
          width: 100,
          label: '100'
        },
        {
          hide: false,
          width: 200,
          label: '200'
        },
        {
          hide: false,
          width: 100,
          label: '100'
        },
        {
          hide: false,
          width: 200,
          label: '200'
        }
      ],
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
    bindResizeEvent() {
      window.addEventListener('resize', this.responsiveFilerListWithMemory)
    },
    unbindResizeEvent() {
      window.removeEventListener('resize', this.responsiveFilerListWithMemory)
    },
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
      this.foldConfig.show = false
      this._.each(this.filterComponentList, (item) => {
        if (item.show === false) {
          item.hide = item.show && true
          return
        }
        console.log(sumW, item._cacheWidth, filterListWidth)
        sumW += item._cacheWidth
        if (this._.isNaN(sumW)) {
          console.log(`过滤条件计算错误component:${item.component}`)
        }
        if (sumW > filterListWidth) {
          item.hide = true
          this.foldConfig.show = true
        } else {
          item.hide = false
          this.foldConfig.show = false
        }
      })
    }, 150)
  },
  mounted() {
    // 获取的原生的dom 这里来获取宽度数据
    this.$nextTick(function() {
      this.buttonListWidth = this.$refs.buttonList.offsetWidth
      this.filterListWidth = this.$refs.filterList.offsetWidth
      this.foldButtonWidth = this.$refs.foldBtn.offsetWidth
      const $listItems = this.$refs.listItems
      this._.each(this.filterComponentList, function(item, index) {
        item._cacheWidth = $listItems[index].offsetWidth
      })
      this.bindResizeEvent()
      this.responsiveFilerList(false)
    })
  },
  destroyed() {
    this.unbindResizeEvent()
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
      vertical-align: middle;
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
