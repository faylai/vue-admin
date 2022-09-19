<template>
  <div class="bc-filter-object-tree">
    <div class="object-container-header" v-show="!hideSearchBar">
      <label class="fuzzy-search">
        <input type="text" v-model.trim="keywords"
               @keyup.enter="search()"/>
        <span class="bc-query-icon icon"
              @click="search()"></span>
      </label>

      <span class="bc-refresh-icon icon"
            @click="refresh()"></span>
      <span class="bc-brush-icon icon"
            @click="clear()"></span>
    </div>
    <div class="object-container-body" :style="{'top':hideSearchBar?'10px':'40px'}">
      <ul class="bd-object-tree" v-show="(!loading) && (!dataError)">
        <template v-for="node in treeData">
          <TreeNode :node="node"
                    :key="node.objectId"
                    :select-mode="selectMode"
                    :select-object-type="selectObjectType"
                    @update:more="loadMore"
                    @node:click="nodeClick"
                    @node:check="nodeCheck"
                    @update:expanded="expandChange"></TreeNode>

        </template>
      </ul>

      <div v-show="noData" class="bc-control-info " style="display: none;">
        <span v-once>{{ words.noMatchResult }}</span>
      </div>

      <div v-show="dataError" class="bc-control-error " style="display: none;">
        <span v-once>{{ words.dataErrorTip }}</span>
      </div>

      <div v-show="loading" class="bc-control-loading" style="display: none;">
        <span v-once>{{ words.loadingTip }}</span>
      </div>

    </div>
  </div>
</template>

<script>
import TreeNode from '@/components/BaseTree/TreeNode'
import { iterateTree, formatTreeData, updateNodeSelectState, updateAllChildrenNodeState, searchTree } from './TreeUtils'
import { enablePromiseFnVersionControl } from '@/utils'
import lodash from 'lodash'

/**
 *
 * event {keywords-min-error}  低于最小搜索字符的验证错误
 */

export default {
  name: 'BaseTree',
  components: {
    TreeNode
  },
  props: {
    hideSearchBar: {
      type: Boolean,
      default: false
    },
    // single 单选； multiple 多选
    selectMode: {
      type: String,
      default() {
        return 'single'
      }
    },
    selectObjectType: {
      type: String,
      default() {
        return ''
      }
    },
    // 搜索关键字的最小长度 0 无限制
    minKeywordLength: {
      type: Number,
      default() {
        return 0
      }
    },
    // 子节点折叠阀值
    maxFoldNodes: {
      type: Number,
      default() {
        return 50
      }
    },
    params: {
      type: Object,
      default() {
        return {}
      }
    },
    fetchTreePromiseFn: {
      type: Function,
      default: function() {
        return new Promise(function(resolve) {
          resolve([{
            'parentId': null,
            'objectName': '请初始化 fetchNodePromiseFn',
            'objectId': '808D3A23D3D54038B1B42EA9BFFB8327',
            'objectCount': 2,
            'objectType': ''
          }])
        })
      }
    },
    searchFieldName: {
      type: String,
      default: 'keywords'
    },
    parentFieldName: {
      type: String,
      default: 'parentId'
    },
    localSearch: {
      type: Boolean,
      default: false
    },
    // 是否异步树；异步树不能进行 localSearch
    async: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      keywords: '',
      lastKeywords: '',
      loading: false,
      noData: false,
      dataError: false,
      isSearched: false,
      words: {
        noMatchResult: '没有查询到数据',
        dataErrorTip: '数据加载出错',
        loadingTip: '加载中...'
      },
      treeData: [],
      // 用于 localSearch 不需要响应式
      // eslint-disable-next-line vue/no-reserved-keys
      _treeJsonString: '[]',
      cho: {
        selectedNode: false,
        selections: []
      }
    }
  },
  methods: {
    refresh: function() {
      this.search(true)
    },
    search: function(isRefresh) {
      const keywords = String(this.keywords || '').trim()
      const me = this
      if (this.minKeywordLength > 0 && keywords.length > 0 && keywords.length < this.minKeywordLength) {
        me.$emit('keywords-min-error', keywords)
      } else {
        const initTreeAndHandleSelection = function(treeData) {
          me.treeData = me.formatNodeAndPage(treeData)
          me.handleSelectAfterSearch(isRefresh)
          // 为了美观默认展开第一个节点
          if (me.treeData.length) {
            me.treeData[0].expanded = true
          }
        }
        const localSearchTree = function(data) {
          const searchTreeData = searchTree(data, me.keywords)
          me.noData = !searchTreeData.length
          return searchTreeData
        }
        if (this.couldLocalSearch && !isRefresh) {
          initTreeAndHandleSelection(localSearchTree(JSON.parse(this._treeJsonString)))
        } else {
          this.fetchTreeData(this.getFetchParams(), (data) => {
            if (this.couldLocalSearch && this.keywords.trim() !== '') {
              initTreeAndHandleSelection(localSearchTree(data))
            } else {
              initTreeAndHandleSelection(data)
            }
          })
        }
      }
    },
    clear: function() {
      this.keywords = ''
      this.clearSelectResult()
      this.search(true)
    },
    expandChange: function(node) {
      node.expanded = !node.expanded
      if (this.async && node.expanded && node.objectCount > 0 && node.children.length === 0) {
        node.loading = true
        this.fetchTreeData({
          parentId: node.objectId
        }, (data) => {
          const clone = lodash.clone(node)
          clone.children = data
          node.loading = false
          const formattedNode = this.formatNodeAndPage(clone, clone)[0]
          node.children = formattedNode.children
          node.childNodes = formattedNode.childNodes
          // 新增 parentNode （clone 节点）是非响应式的，需要重新修改为原节点
          lodash.each(node.children, function(sub) {
            sub.parentNode = node
          })
          if (node.selected) {
            updateAllChildrenNodeState(node)
          }
        })
      }
    },
    loadMore: function(node) {
      const children = node.children
      const min = Math.min(node.childNodes.length + this.maxFoldNodes, children.length)
      node.childNodes.push.apply(node.childNodes, children.slice(node.childNodes.length, min))
    },
    nodeClick: function(node) {
      if (this.selectMode !== 'single') {
        return
      }
      if (this.selectObjectType &&
          this.selectObjectType.split(',').indexOf(node.objectType) < 0) {
        return
      }
      // set old selected node false
      if (this.cho.selectedNode) {
        this.cho.selectedNode.selected = false
      }
      this.cho.selectedNode = node
      // set new selected node true
      this.cho.selectedNode.selected = true
      this.synSingleSelection(node, this.isSearched)
    },
    nodeCheck: function(node) {
      node.selected = !node.selected
      updateNodeSelectState(node)
      this.synMultiSelection()
    },
    clearSelectResult() {
      // TODO
    },
    restoreSelection() {
      // TODO
    },
    synSingleSelection($node) {
      // TODO
    },
    synMultiSelection() {
      // TODO
    },
    formatNodeAndPage(rawTreeData, parent) {
      const formattedData = formatTreeData(rawTreeData, parent)
      // 对大于 maxFoldNodes 设置的子节点进行分页设置，减少过多节点展示优化加载速度
      iterateTree(formattedData, (node) => {
        const maxNode = Math.min(this.maxFoldNodes, node.children.length)
        const childNodes = node.children.slice(0, maxNode)
        node.childNodes = childNodes
      })
      return formattedData
    },
    handleSelectAfterSearch(isRefresh) {
      const keywords = String(this.keywords || '').trim()
      // 刷新需要根据关键字变化来判断是否清理或者恢复选中的节点
      if (isRefresh === true) {
        if (this.lastKeywords !== keywords) {
          this.lastKeywords = keywords
          this.clearSelectResult()
        } else {
          this.restoreSelection()
        }
      } else {
        this.lastKeywords = keywords
        this.clearSelectResult()
      }
    },
    fetchTreeData(params, cb) {
      const vm = this
      const muteLoading = params && params[this.parentFieldName]
      if (!muteLoading) {
        vm.loading = true
      }
      vm.fetchTree(params).then(function(data) {
        if (!muteLoading) {
          vm.loading = false
          vm.dataError = false
        }

        if (lodash.isObject(data) && lodash.isArray(data.data)) {
          data = data.data
        }
        if (vm.couldLocalSearch) {
          // 保存字符数据，可以减少内存占用，提供给本地搜索用
          vm._treeJsonString = JSON.stringify(data) || '[]'
        }
        if (data.length) {
          cb && cb(data)
        } else {
          vm.noData = true
          cb && cb([])
        }
      }).catch(function(e) {
        console.error(e)
        if (!muteLoading) {
          vm.dataError = true
          vm.loading = false
        }
      })
    },
    getFetchParams() {
      const keywords = (this.keywords || '').trim()
      const params = {}
      if (keywords !== '') {
        if (!this.couldLocalSearch) {
          params[this.searchFieldName] = keywords
        }
        this.isSearched = true
      } else {
        this.isSearched = false
      }
      return Object.assign(params, this.params)
    }
  },
  computed: {
    // 用版本控制防止慢的请求覆盖新的请求
    fetchTree() {
      return enablePromiseFnVersionControl(this.fetchTreePromiseFn)
    },
    couldLocalSearch() {
      return this.async === false && this.localSearch
    }
  },
  created: function() {
    this.search(true)
  }

}
</script>

<style lang="scss">
@import "./index.scss";
</style>
