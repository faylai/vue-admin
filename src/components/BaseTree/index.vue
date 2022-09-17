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

      <div v-show="noData" class="bc-control-error " style="display: none;">
        <h4 class="bc-control-error-tip">
          <span class="bc-warning-white-gray-icon"/>
          <span v-once>{{ words.noMatchResult }}</span>
        </h4>
      </div>

      <div v-show="dataError" class="bc-control-error " style="display: none;">
        <h4 class="bc-control-error-tip">
          <span class="bc-warning-white-gray-icon"/>
          <span v-once>{{ words.dataErrorTip }}</span>
        </h4>
      </div>


      <div v-show="loading" class="bc-control-loading" style="display: none;">
        <h4 class="bc-control-loading-tip">
          <span class="bc-doing-icon"/>
          <span v-once>{{ words.loadingTip }}</span>
        </h4>
      </div>

    </div>
  </div>
</template>

<script>
import TreeNode from '@/components/BaseTree/TreeNode'
import { iterateTree, formatTreeData, updateNodeSelectState, searchTree } from './TreeUtils'
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
    fetchNodePromiseFn: {
      type: Function,
      default: function() {
        return new Promise(function(resolve) {
          resolve([{
            'parentId': null,
            'objectName': '请初始化 fetchNodePromiseFn',
            'objectId': '808D3A23D3D54038B1B42EA9BFFB8327',
            'objectCount': 2,
            'objectType': 'test2',
            'children': [{
              'parentId': '808D3A23D3D54038B1B42EA9BFFB8327',
              'objectName': '测试节点1',
              'objectId': '808D3A23D3D54038B1B42EA9BFFB8325',
              'children': [],
              'objectCount': '0',
              'objectType': 'test2'
            }, {
              'parentId': '808D3A23D3D54038B1B42EA9BFFB8327',
              'objectName': '测试节点2',
              'objectId': '808D3A23D3D54038B1B42EA9BFFB8335',
              'children': [
                {
                  'parentId': '808D3A23D3D54038B1B42EA9BFFB8335',
                  'objectName': '测试节点2-1',
                  'objectId': '808D3A23D3D54038B1B42EA9BFFB8435',
                  'children': [],
                  'objectCount': '0',
                  'objectType': 'test2'
                },
                {
                  'parentId': '808D3A23D3D54038B1B42EA9BFFB8335',
                  'objectName': '测试节点2-2',
                  'objectId': '808D3A23D3D54038B1B42EA9BFFB8935',
                  'children': [],
                  'objectCount': '0',
                  'objectType': 'test2'
                }
              ],
              'objectCount': '0',
              'objectType': 'test2'
            }]
          }])
        })
      }
    },
    searchFieldName: {
      type: String,
      default: 'keywords'
    },
    localSearch: {
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
        const searchCallback = function(treeData, neeFormat) {
          // 刷新需要根据关键字变化来判断是否清理或者恢复选中的只
          if (isRefresh === true) {
            if (me.lastKeywords !== keywords) {
              me.clearSelectResult()
            } else {
              me.restoreSelection()
            }
          } else {
            me.lastKeywords = keywords
            me.clearSelectResult()
          }
          me.initTreeData(treeData, neeFormat)
        }
        if (this.localSearch && !isRefresh) {
          const formattedTreeData = formatTreeData(JSON.parse(this._treeJsonString), null)
          const searchTreeData = searchTree(formattedTreeData, this.keywords)
          this.noData = !searchTreeData.length
          searchCallback(searchTreeData, false)
        } else {
          this.fetchTreeData(this.getFetchParams(), function(data) {
            searchCallback(data, true)
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
    initTreeData(rawTreeData, needFormat) {
      let formattedData = rawTreeData
      if (needFormat) {
        formattedData = formatTreeData(lodash.cloneDeep(rawTreeData), null)
      }
      const node = formattedData[0]
      if (node) {
        // 对大于 maxFoldNodes 设置的子节点进行分页设置，减少过多节点展示优化加载速度
        iterateTree(formattedData, (node) => {
          const maxNode = Math.min(this.maxFoldNodes, node.children.length)
          const childNodes = node.children.slice(0, maxNode)
          node.childNodes = childNodes
        })
        // 默认展开第一个节点
        node.expanded = true
      }
      this.treeData = formattedData
    },
    fetchTreeData(params, cb) {
      const vm = this
      vm.loading = true
      vm.fetchNode(params).then(function(data) {
        vm.loading = false
        vm.dataError = false
        if (vm.localSearch) {
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
        console.log(e)
        vm.dataError = true
        vm.loading = false
      })
    },
    getFetchParams() {
      const keywords = (this.keywords || '').trim()
      const params = {}
      if (keywords !== '') {
        params[this.searchFieldName] = keywords
        this.isSearched = true
      } else {
        this.isSearched = false
      }
      return Object.assign(params, this.params)
    }
  },
  computed: {
    // 用版本控制防止慢的请求覆盖新的请求
    fetchNode() {
      return enablePromiseFnVersionControl(this.fetchNodePromiseFn)
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
