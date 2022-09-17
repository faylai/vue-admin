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
import { iterateTree, formatTreeData, updateNodeSelectState } from './TreeUtils'
import { enablePromiseFnVersionControl } from '@/utils'

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
        this.fetchTreeData(function() {
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
        })
      }
    },
    clear: function() {
      this.keywords = ''
      this.clearSelectResult()
      this.fetchTreeData()
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
    fetchTreeData(cb) {
      const params = this.getFetchParams()
      const vm = this
      vm.loading = true
      vm.fetchNode(params).then(function(data) {
        const formattedData = formatTreeData(data, null)
        const node = data[0]
        vm.loading = false
        vm.dataError = false
        if (node) {
          // 对大于 maxFoldNodes 设置的子节点进行分页设置，减少过多节点展示优化加载速度
          iterateTree(formattedData, function(node) {
            const maxNode = Math.min(vm.maxFoldNodes, node.children.length)
            const childNodes = node.children.slice(0, maxNode)
            node.childNodes = childNodes
          })
          // 默认展开第一个节点
          node.expanded = true
          vm.treeData = formattedData
          cb && cb(vm.treeData)
        } else {
          vm.noData = true
          cb && cb(formattedData)
        }
      }).catch(function() {
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
    this.fetchTreeData()
  }

}
</script>

<style lang="scss">
.bc-filter-object-tree {
  height: 100%;
  position: relative;

  ul {
    list-style: none;
    margin-block-start: 0;
    margin-block-end: 0;
    padding-inline-start: 0;

    li {
      display: flex;
      flex-direction: column;
      cursor: pointer;
      font-size: 12px;
    }
  }

  span.icon {
    font-family: element-icons !important;
    *zoom: 1;
    display: inline-block;
    width: 16px;
    height: 16px;
  }

  span.space5 {
    display: inline-block;
    width: 5px;
  }

  .object-container-header {
    height: 40px;
    line-height: 40px;
    padding-left: 9px;
    padding-right: 9px;
    position: relative;

    input[type="text"] {
      height: 28px;
      border: 0;
      padding-left: 2px;
      padding-right: 28px;
      width: 100%;
      outline: none;
    }

    .fuzzy-search {
      display: block;
      margin-right: 52px;
      font-weight: normal;
      position: relative;
    }

    .fuzzy-search input[type="text"] {
      line-height: 26px;
      border: 1px solid #c9c9c9;
      border-radius: 4px;
    }

    @mixin fuzzy-search-icon {
      position: absolute;
      cursor: pointer;
      line-height: 16px;
      &:hover {
        color: #409eff;
      }
    }

    .bc-query-icon {
      top: 12px;
      right: 5px;
      @include fuzzy-search-icon;

      &:before {
        content: "\e778";
      }
    }

    .bc-refresh-icon {
      top: 12px;
      right: 29px;
      @include fuzzy-search-icon;

      &:before {
        content: "\e6d0";
      }
    }

    .bc-brush-icon {
      top: 12px;
      right: 3px;
      @include fuzzy-search-icon;

      &:before {
        content: "\e6d7";
      }
    }


  }

  .object-container-body {
    position: absolute;
    top: 40px;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: auto;

    .bd-object-tree {
      float: left;
      min-width: 100%;
      text-align: left;
    }

    .bd-object-tree-node {
      white-space: nowrap;
      line-height: 36px;
      padding: 0 4.5px;
    }

    .bd-object-tree-node:hover,
    .bd-object-tree-node.selected {
      background-color: #d6d9da;
    }


    .bd-object-tree-node .node-text {
      vertical-align: middle;
      display: inline-block;
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .bd-object-tree-node .checkbox {
      display: inline-block;
      *zoom: 1;
      position: relative;
      border: 1px solid #dcdfe6;
      border-radius: 2px;
      box-sizing: border-box;
      width: 14px;
      height: 14px;
      background-color: #fff;
      z-index: 1;
      vertical-align: middle;
      transition: border-color .25s cubic-bezier(.71, -.46, .29, 1.46), background-color .25s cubic-bezier(.71, -.46, .29, 1.46);

      &.uncheck:before {
        position: absolute;
        box-sizing: content-box;
        content: "";
        border: 1px solid #4fab22;
        border-left: 0;
        border-top: 0;
        height: 7px;
        left: 4px;
        top: 1px;
        transform: rotate(45deg) scaleY(0);
        width: 3px;
        transition: transform .15s ease-in .05s;
        transform-origin: center;
      }

      &.half-check {
        background-color: #409eff;
        border-color: #409eff;

        &:before {
          content: "";
          position: absolute;
          display: block;
          background-color: #fff;
          height: 2px;
          transform: scale(.5);
          left: 0;
          right: 0;
          top: 5px;
        }
      }

      &.all-check {
        background-color: #409eff;
        border-color: #409eff;

        &:before {
          box-sizing: content-box;
          content: "";
          border: 1px solid #fff;
          border-left: 0;
          border-top: 0;
          height: 7px;
          left: 4px;
          position: absolute;
          top: 1px;
          transform: rotate(45deg) scaleY(1);
          width: 3px;
          transition: transform .15s ease-in .05s;
          transform-origin: center;
        }
      }
    }

    .bd-object-tree-load-more {
      line-height: 25px;
      text-align: center;
      color: #999999;
    }

    .bd-object-tree-folder {
      display: inline-block;
      *zoom: 1;
      width: 16px;
      height: 16px;
      cursor: pointer;
    }

    .bd-object-tree-node-indent {
      display: inline-block;
      width: 9px;
      height: 9px;
    }

    .bd-object-tree-folder-expanded-icon, .bd-object-tree-folder-collapsed-icon {
      font-weight: bold;
      cursor: pointer;
      font-size: 15px;
      line-height: 16px;
      color: #868686;
      transform: rotate(0deg);
      transition: transform .3s ease-in-out;
      transform-origin: center;
      box-sizing: content-box;
      vertical-align: middle;

      &:before {
        content: "\e791";
      }
    }

    .bd-object-tree-folder-expanded-icon {
      transform: rotate(90deg);
    }

  }
}

</style>
