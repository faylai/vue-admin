<template>
  <div class="base-filter-panel">
    <div ref="buttonList" class="button-list">
      <el-button
          v-for="(item,key) in constButtonList"
          v-show="item.show"
          :key="key"
          v-bind="item.props"
          @click="item.click">
        {{ $t(item.label) }}
      </el-button>
    </div>

    <el-form ref="filterList" :inline="true" v-bind="formConfig" class="filter-list">
      <slot></slot>
      <div ref="foldBtn" class="list-item">
        <el-button
            v-show="foldConfig.show"
            class="foldBtn"
            v-bind="foldConfig.props"
            @click="handleExpand(foldConfig)">
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import lodash from 'lodash'

export default {
  name: 'BaseFilterPanel',
  props: {
    formConfig: Object,
    default() {
      return {
        model: {},
        rules: {}
      }
    }
  },
  data() {
    return {
      filterListWidth: 0,
      buttonListWidth: 0,
      foldButtonWidth: 0,
      filterComponentList: [],
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
        isExpand: false,
        props: {
          disabled: false,
          icon: 'el-icon-plus'
        }
      },
      backupModel: {}
    }
  },
  methods: {
    handleExpand(item) {
      item.isExpand = !item.isExpand
      if (item.isExpand) {
        item.props.icon = 'el-icon-minus'
        this._.each(this.filterComponentList, (item) => {
          if (!item.$el || item._isDestroyed) {
            return
          }
          $(item.$el).css('display', item._display)
        })
      } else {
        item.props.icon = 'el-icon-plus'
      }
      this.responsiveFilerList(true)
    },
    handleQuery() {
      this.$refs.filterList.validate((valid) => {
        if (valid) {
          this.$emit('query', lodash.cloneDeep(this.formConfig.model))
        }
      })
    },
    handleReset() {
      this.$refs.filterList.resetFields()
      this.$emit('reset')
    },
    bindResizeEvent() {
      window.addEventListener('resize', this.responsiveFilerList)
    },
    unbindResizeEvent() {
      window.removeEventListener('resize', this.responsiveFilerList)
    },
    responsiveFilerList: lodash.debounce(function(foreLayout) {
      // ?????????????????? filterListWidth(??????????????? x ???????????????)
      const filterListDom = this.$refs.filterList.$el
      if (!filterListDom || this.foldConfig.isExpand) return
      const filterListWidth = filterListDom.offsetWidth
      if (filterListWidth !== this.filterListWidth) {
        this.filterListWidth = filterListWidth
      } else {
        // ???????????????????????????????????????
        if (!foreLayout) return
      }
      // ????????????????????? ???????????????(??????????????????)
      let sumW = this.foldButtonWidth + this.buttonListWidth
      this.foldConfig.show = false
      let isWrapped = false
      this._.each(this.filterComponentList, (item) => {
        if (!item.$el || item._isDestroyed) {
          return
        }
        // console.log(sumW, item._cacheWidth, filterListWidth)
        sumW += item._cacheWidth
        if (this._.isNaN(sumW)) {
          console.log(`????????????????????????component:${item.component}`)
        }
        if (sumW > filterListWidth) {
          isWrapped = true
          $(item.$el).css('display', 'none')
        } else {
          $(item.$el).css('display', item._display)
        }
      })
      this.foldConfig.show = isWrapped === true
    }, 150),
    // ????????????????????????
    registerFilterItem(item) {
      this.filterComponentList.push(item)
    }
  },
  activated() {
    this.responsiveFilerList()
  },
  mounted() {
    // ??????????????????dom ???????????????????????????
    this.$nextTick(function() {
      this.buttonListWidth = this.$refs.buttonList.offsetWidth
      this.foldButtonWidth = this.$refs.foldBtn.offsetWidth
      this._.each(this.filterComponentList, function(item, index) {
        // 10??? margin ???????????????????????????????????????
        item._cacheWidth = item.$el.offsetWidth + 10
        item._display = $(item.$el).css('display')
      })
      this.bindResizeEvent()
      this.responsiveFilerList()
    })
  },
  provide() {
    return {
      'baseFilterPanel': this
    }
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

    .list-item {
      display: inline-block;
      padding-right: 4px;
      margin-bottom: 8px;
      vertical-align: middle;
    }

    .foldBtn {
      padding: 8px;

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
