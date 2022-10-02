<template>
  <div
      class="el-select"
      :class="[selectSize ? 'el-select--' + selectSize : '']"
      @click.stop="toggleMenu"
      v-clickoutside="handleClose">
    <div
        class="el-select__tags"
        v-if="multiple"
        ref="tags"
        :style="{ 'max-width': inputWidth - 32 + 'px', width: '100%' }">
      <span v-if="collapseTags && selected.length" class="collapse-tags">
        <el-tag
            :closable="!selectDisabled"
            :size="collapseTagSize"
            :hit="selected[0].hitState"
            type="info"
            @close="deleteTag($event, selected[0])"
            disable-transitions>
          <span class="el-select__tags-text" :title="selected[0].currentLabel">{{ selected[0].currentLabel }}</span>
        </el-tag>
        <el-tag
            v-if="selected.length > 1"
            :closable="false"
            :size="collapseTagSize"
            type="info"
            disable-transitions>
          <span class="el-select__tags-text">+ {{ selected.length - 1 }}</span>
        </el-tag>
      </span>
      <transition-group @after-leave="resetInputHeight" v-if="!collapseTags">
        <el-tag
            v-for="item in selected"
            :key="getValueKey(item)"
            :closable="!selectDisabled"
            :size="collapseTagSize"
            :hit="item.hitState"
            type="info"
            @close="deleteTag($event, item)"
            disable-transitions>
          <span class="el-select__tags-text">{{ item.currentLabel }}</span>
        </el-tag>
      </transition-group>

      <input
          type="text"
          class="el-select__input"
          :class="[selectSize ? `is-${ selectSize }` : '']"
          :disabled="selectDisabled"
          :autocomplete="autoComplete || autocomplete"
          @focus="handleFocus"
          @blur="softFocus = false"
          @keyup="managePlaceholder"
          @keydown="resetInputState"
          @keydown.down.prevent="navigateOptions('next')"
          @keydown.up.prevent="navigateOptions('prev')"
          @keydown.enter.prevent="selectOption"
          @keydown.esc.stop.prevent="visible = false"
          @keydown.delete="deletePrevTag"
          @keydown.tab="visible = false"
          @compositionstart="handleComposition"
          @compositionupdate="handleComposition"
          @compositionend="handleComposition"
          v-model="query"
          @input="debouncedQueryChange"
          v-if="filterable"
          :style="{ 'flex-grow': '1', width: inputLength / (inputWidth - 32) + '%', 'max-width': inputWidth - 42 + 'px' }"
          ref="input">
    </div>
    <el-input
        ref="reference"
        v-model="selectedLabel"
        type="text"
        :placeholder="currentPlaceholder"
        :name="name"
        :id="id"
        :autocomplete="autoComplete || autocomplete"
        :size="selectSize"
        :disabled="selectDisabled"
        :readonly="readonly"
        :validate-event="false"
        :class="{ 'is-focus': visible }"
        :tabindex="(multiple && filterable) ? '-1' : null"
        @focus="handleFocus"
        @blur="handleBlur"
        @keyup.native="debouncedOnInputChange"
        @keydown.native.down.stop.prevent="navigateOptions('next')"
        @keydown.native.up.stop.prevent="navigateOptions('prev')"
        @keydown.native.enter.prevent="selectOption"
        @keydown.native.esc.stop.prevent="visible = false"
        @keydown.native.tab="visible = false"
        @paste.native="debouncedOnInputChange"
        @mouseenter.native="inputHovering = true"
        @mouseleave.native="inputHovering = false">
      <template slot="prefix" v-if="$slots.prefix">
        <slot name="prefix"></slot>
      </template>
      <template slot="suffix">
        <i v-show="!showClose" :class="['el-select__caret', 'el-input__icon', 'el-icon-' + iconClass]"></i>
        <i v-if="showClose" class="el-select__caret el-input__icon el-icon-circle-close" @click="handleClearClick"></i>
      </template>
    </el-input>
    <transition
        name="el-zoom-in-top"
        @before-enter="handleMenuEnter"
        @after-leave="doDestroy">
      <el-select-menu
          ref="popper"
          :append-to-body="popperAppendToBody"
          v-show="visible && emptyDisplayText !== false">
        <el-scrollbar
            tag="ul"
            wrap-class="el-select-dropdown__wrap"
            view-class="el-select-dropdown__list"
            ref="scrollbar"
            :class="{ 'is-empty': !allowCreate && query && filteredOptionsCount === 0 }"
            v-show="options.length > 0 && !isLoading">
          <el-option
              :value="query"
              created
              v-if="showNewOption">
          </el-option>
          <slot>
            <template v-for="item in enforceScope.items" if="remote">
              <template v-if="item.display !== false">
                <slot name="option" v-bind="item">
                  <el-option
                      :key="item[valueKey]"
                      :label="item[labelKey]"
                      :value="item[valueKey]">
                  </el-option>
                </slot>
              </template>
              <template v-else>
                <el-option
                    v-show="false"
                    :key="item[valueKey]"
                    :label="item[labelKey]"
                    :value="item[valueKey]">
                </el-option>
              </template>

            </template>
          </slot>
        </el-scrollbar>
        <template v-if="emptyDisplayText && (!allowCreate || isLoading || (allowCreate && options.length === 0 ))">
          <slot name="empty" v-if="$slots.empty"></slot>
          <p class="el-select-dropdown__empty" v-else>
            {{ emptyDisplayText }}
          </p>
        </template>
        <!-- bottom 插槽 用以支持分页组件 -->
        <slot name="bottom" v-if="!isLoading">
          <el-pagination v-if="showPage && remote"
                         small
                         layout="prev, pager, next"
                         :page-size="pageSize"
                         :current-page="enforceScope.pageIndex"
                         :total="enforceScope.total"
                         @current-change="currentPageChange">
          </el-pagination>
        </slot>
      </el-select-menu>
    </transition>
  </div>
</template>


<script>
import { Select } from 'element-ui'
import service from '@/api/service'
import settings from '@/settings'
import lodash from 'lodash'

const paginationConfig = settings.paginationConfig
/**
 * 模板是从源代码中复制过来的，变更内容如下：
 * 1、html 模板增加了 bottom 插槽,注意升级的时候更新
 * 2、scss 中修复了 tag collapse 模式下样式文字溢出的问题
 */
export default {
  name: 'EnforceSlotSelect',
  extends: Select,
  props: {
    // 异步情况用于恢复选中状态的值和value 保持一致
    // eslint-disable-next-line
    label: {},
    // eslint-disable-next-line
    value: {},
    // 唯一性决定是否使用新的 data Scope,同一 scopeKey 下的 scope 会共享
    requestKey: {
      type: String
    },
    // 搜索的时候关键参数名称
    searchName: {
      type: String,
      default: 'keyword'
    },
    // 默认接口请求参数
    params: {
      type: Object,
      default() {
        return {}
      }
    },
    valueKey: {
      type: String,
      default: 'value'
    },
    labelKey: {
      type: String,
      default: 'label'
    },
    showPage: {
      type: Boolean,
      default: false
    },
    pageSize: {
      type: Number,
      default() {
        return paginationConfig.defaultPageSize * 1
      }
    },
    // 一次性获得所有数据的的最大分页数
    maxPageSize: {
      type: Number,
      default: 1000
    },
    service: {
      type: Object,
      default() {
        return {
          requestApi: function(requestKey, params) {
            if (!requestKey) {
              throw new Error('请配置 requestKey 才能发送远程请求')
            } else {
              return service.requestByKey(requestKey, params)
            }
          }
        }
      }
    },
    // 真是没有办法的的技巧
    remoteMethod: {
      type: Function,
      default(keyword) {
        this.enforceScope.pageIndex = 1
        this.requestMethod(keyword)
      }
    }
  },
  data() {
    return {
      enforceScope: {
        items: [],
        loading: false,
        _items: [],
        _counter: 0,
        pageIndex: 1,
        total: 0,
        _keyword: '',
        _params: ''
      }
    }
  },
  computed: {
    isLoading() {
      return this.loading === true || this.enforceScope.loading === true
    },
    emptyDisplayText() {
      if (this.isLoading) {
        return this.loadingText || this.t('el.select.loading')
      } else {
        if (this.options.length === 0 || (this.remote === true && this.enforceScope.items.filter((item) => item.display !== false).length === 0)) {
          return this.noDataText || this.t('el.select.noData')
        } else {
          return this.emptyText
        }
      }
    }
  },
  watch: {
    'params': function() {
      if (this.remote) {
        this.resetEnforceScope()
        this.requestMethod('')
      }
    },
    'value': function() {
      const scope = this.enforceScope
      const arrayValue = lodash.isArray(this.value) ? this.value : lodash.isEmpty(this.value) ? [] : [this.value]
      if (!lodash.isEqual(scope._value || [], arrayValue)) {
        this.resetEnforceScope()
      }
    }
  },
  methods: {
    resetEnforceScope() {
      const scope = this.enforceScope
      const arrayValue = lodash.isArray(this.value) ? this.value : lodash.isEmpty(this.value) ? [] : [this.value]
      const arrayLabel = lodash.isArray(this.label) ? this.label : lodash.isEmpty(this.label) ? [] : [this.label]
      scope._params = this.params
      scope._items = []
      scope._counter = 0
      scope.pageIndex = 1
      scope._value = arrayValue
      scope._label = arrayLabel
    },
    requestMethod: function(keyword) {
      const scope = this.enforceScope
      scope._counter++
      scope._keyword = keyword
      const params = Object.assign({}, scope._params)
      params[this.searchName] = scope._keyword
      params[paginationConfig.pageIndexParamKey] = scope.pageIndex
      params[paginationConfig.pageSizeParamKey] = this.showPage ? this.pageSize : this.maxPageSize
      if (this.showPage || (scope._items.length === 0 && this.requestKey)) {
        this.$emit('beforeRequest', this)
        scope.loading = true
        this.service.requestApi(this.requestKey, params).then((res) => {
          const items = []
          scope.loading = false
          const root = res[paginationConfig.responseRootName]
          for (const item of root[paginationConfig.responseRecordListKey] || []) {
            items.push(item)
          }
          scope.total = root[paginationConfig.responseTotalCountKey]
          scope.items = items
          scope._items = items.slice(0)
          // 处理默认选中的问题,生成几个隐藏的option
          if (this.showPage && !lodash.isEmpty(scope._value)) {
            const value = scope._value
            const label = scope._label
            if (value.length === label.length) {
              for (let i = 0; i < value.length; i++) {
                // 没有从item 找到情况下，新建隐藏项目用来诱导选中
                if (!lodash.some(scope.items, item => String(item[this.valueKey]) === value[i])) {
                  scope.items.push({
                    display: false,
                    [this.valueKey]: value[i],
                    [this.labelKey]: label[i] || ''
                  })
                }
              }
            }
          }
          this.$emit('afterRequest', this)
        })
      } else if (scope._items.length) {
        // 本地搜索
        if (String(keyword).trim() === '') {
          scope.items = scope._items
        } else {
          scope.items = scope._items.filter((item) => {
            return String(item[this.labelKey]).indexOf(keyword) >= 0
          })
        }
      }
    },
    currentPageChange(pageIndex) {
      const scope = this.enforceScope
      scope.pageIndex = pageIndex
      this.requestMethod(scope._keyword)
    }
  },
  created() {
    this.$emit('created', this)
    if (this.remote === true && this.requestKey) {
      this.requestMethod('')
    }
    this.resetEnforceScope()
  },
  // 用来截获选中的值用以保证分页的时候的选中
  mounted() {
    if (this.remote === true) {
      const scope = this.enforceScope
      // 保存选中的value label,用于状态恢复用
      this.$on('input', (value) => {
        if (lodash.isEmpty(value)) {
          scope._value = []
          scope._label = []
        } else {
          const values = lodash.isArray(value) ? value : [value]
          let allItem = []
          lodash.each(scope._value, (v, i) => {
            allItem.push({
              [this.valueKey]: v,
              [this.labelKey]: scope._label[i]
            })
          })
          allItem = allItem.concat(scope.items)
          scope._value = values
          scope._label = []
          lodash.each(values, (v) => {
            const item = lodash.find(allItem, item => String(item[this.valueKey]) === v)
            scope._label.push(item[this.labelKey])
          })
        }
      })
      this.$on('visible-change', (visible) => {
        if (visible === false && this.enforceScope._keyword) {
          this.enforceScope.pageIndex = 1
          this.requestMethod('')
        }
      })
    }
  }
}
</script>

<style lang="scss">
.el-select {
  .el-select__tags {
    .collapse-tags {
      width: 100%;

      .el-tag.el-tag--info:first-child {
        width: calc(100% - 80px);
        display: block;
        position: relative;

        .el-select__tags-text {
          max-width: calc(100% - 16px);
          display: inline-block;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .el-tag__close {
          position: absolute;
          margin-top: -8px;
          top: 50%;
          right: 0;
          left: auto;
          bottom: auto;
        }
      }
    }
  }

}
</style>

