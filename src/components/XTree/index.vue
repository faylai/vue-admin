<script>
import TreeNode from '@/components/XTree/TreeNode'
import SmartCache from '@/components/SmartCache'
import {
  iterateTree,
  formatTreeData,
  updateNodeSelectState,
  updateAllChildrenNodeState,
  searchTree,
  getAllSelectedBranchesAndLeaves,
  getTopSelectedBranchesAndLeaves,
  getSelectedLeaves
} from './TreeUtils'
import { enablePromiseFnVersionControl } from '@/utils'
import lodash from 'lodash'

/**
 *
 * event {keywords-min-error}  低于最小搜索字符的验证错误
 */

export default {
  name: 'XTree',
  components: {
    TreeNode,
    SmartCache
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    // 传递的节点ID,逗号分隔
    value: {
      type: String,
      default: ''
    },
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
            'objectName': '请初始化 fetchTreePromiseFn',
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
    },
    // 多选的时候，只选择叶子节点，和 selectObjectType 配合使用
    onlyLeaf: Boolean
  },
  data() {
    return {
      keywords: '',
      lastKeywords: '',
      loading: false,
      noData: false,
      dataError: false,
      isSearched: false,
      inputFocused: false,
      words: {
        noMatchResult: '没有查询到数据',
        dataErrorTip: '数据加载出错',
        loadingTip: '加载中...'
      },
      treeData: [],
      // 用于 localSearch 不需要响应式
      // eslint-disable-next-line vue/no-reserved-keys
      _treeJsonString: '[]'
      // eslint-disable-next-line vue/no-reserved-keys
    }
  },
  render() {
    const nodeScopeSlots = {
      node: this.$scopedSlots.node || function emptyScopeNode() {
        return ''
      }
    }
    return (<div class="bc-filter-object-tree">
      <div class="object-container-header" vShow={!this.hideSearchBar}>
        <label class="fuzzy-search">
          <input type="text"
                 vModel_trim={this.keywords}
                 vOn:keydown_enter_stop={this.search}
                 vOn:focus={this.onInputFocus}
                 vOn:blur={this.onInputBlur}
                 class={[this.inputFocused && 'focus']}
                 ref="input"/>
          <span class="bc-query-icon icon" vOn:click={this.search}></span>
        </label>
        <span class="bc-refresh-icon icon" vOn:click={this.refresh}></span>
        <span class="bc-brush-icon icon" vOn:click={this.clear}>< /span>
      </div>
      <div class="object-container-body" style={{ top: this.hideSearchBar ? '10px' : '40px' }}>
        {/** 这里要注意 ignoreProps 配置，ignoreProps 的变更不会影响 nodeRender 重新渲染 */}
        <SmartCache
            ignoreProps={{ inputFocused: this.inputFocused }}
            nodeRender={() => {
              return (<ul className="bd-object-tree"
                          vShow={!this.noData && !this.dataError && !this.loading}>{
                this.treeData.map((node) => {
                  return (<TreeNode node={node}
                                    scopedSlots={nodeScopeSlots}
                                    key={node.objectId}
                                    select-mode={this.selectMode}
                                    select-object-type={this.selectObjectType}
                                    vOn:update-more={this.loadMore}
                                    vOn:node-click={this.nodeClick}
                                    vOn:node-check={this.nodeCheck}
                                    vOn:update-expanded={this.expandChange}>
                  </TreeNode>)
                })}
              </ul>)
            }}/>

        <div class="bc-control-info " vShow={this.noData}>
          <span>{this.words.noMatchResult}</span>
        </div>

        <div class="bc-control-error " vShow={this.dataError}>
          <span>{this.words.dataErrorTip}</span>
        </div>

        <div class="bc-control-loading" vShow={this.loading}>
          <span>{this.words.loadingTip}</span>
        </div>
      </div>
    </div>)
  },
  watch: {
    value(newValue) {
      const newIds = String(newValue || '').split(',')
      const oldIds = this._selectNodes.map(item => item.objectId)
      // console.log('watch:', newValue, oldValue)
      if (!lodash.isEqual(newIds, oldIds)) {
        this.$nextTick(this.restoreSelection)
      }
    }
  },
  methods: {
    // 无脑返回所有checked的节点
    getAllSelectedNode() {
      const { branches, leaves } = getAllSelectedBranchesAndLeaves(this.treeData)
      branches.push.apply(branches, leaves)
      return this.simplifyNode(branches)
    },
    onInputFocus() {
      this.inputFocused = true
    },
    onInputBlur() {
      this.inputFocused = false
    },
    refresh: function() {
      this.search(true)
    },
    search: function(isRefresh) {
      const keywords = String(this.keywords || '').trim()
      const me = this
      if (this.minKeywordLength > 0 && keywords.length > 0 && keywords.length < this.minKeywordLength) {
        me.$emit('keywords-min-error', keywords)
      } else {
        this.noData = false
        this.dataError = false
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
          initTreeAndHandleSelection(localSearchTree(JSON.parse(this._data._treeJsonString)))
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
      this.clearSelection()
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

          // 如果是多选需要同步下级状态，单选不必要了
          if (node.selected && this.selectMode === 'multiple') {
            updateAllChildrenNodeState(node)
          }

          if (!node.selected) {
            // 异步树需要恢复选择用，作用不大，展开的时候才能选中
            this.restoreSelection(node)
          }

        })
      }
    },
    loadMore: function(node) {
      const children = node.children
      const min = Math.min(node.childNodes.length + this.maxFoldNodes, children.length)
      node.childNodes.push.apply(node.childNodes, children.slice(node.childNodes.length, min))
    },
    // 单选
    nodeClick: function(node) {
      if (this.selectMode !== 'single') {
        return
      }
      if (this.selectObjectType &&
          this.selectObjectType.split(',').indexOf(node.objectType) < 0) {
        return
      }
      this._selectNodes.forEach(function(node) {
        node.selected = false
      })
      node.selected = true
      this.synSingleSelection(node)
    },
    // 多选
    nodeCheck: function(node) {
      node.selected = !node.selected
      updateNodeSelectState(node)
      this.synMultiSelection()
    },
    clearSelection() {
      this.$emit('change', '', [])
    },
    clearAllNodeSelectedState(startNode) {
      iterateTree(startNode || this.treeData || [], function(node) {
        if (node.selected) {
          node.selected = false
          updateNodeSelectState(node)
          return false
        }
      })
    },
    // 把外部传递过来的 value 转换成为树的节点的选中状态,异步除外
    restoreSelection(startNode) {
      let ids = []
      let selectNodes = []
      if (this.value) {
        ids = this.value.split(',')
      }

      if (this.async) {
        // 异步直接清空所有节点选中状态就行了
        if (ids.length === 0) {
          this.clearAllNodeSelectedState(startNode)
          return
        } else {
          const foundNodes = []
          iterateTree(startNode || this.treeData || [], function(node) {
            if (ids.indexOf(node.objectId) >= 0) {
              foundNodes.push(node)
            }
            if (foundNodes.length === ids.length) {
              return false
            }
          })
          if (foundNodes.length !== ids.length) {
            this.clearAllNodeSelectedState(startNode)
            return
          }
        }
      }

      // console.log('restoreSelection')
      if (this.selectMode === 'multiple') {
        iterateTree(startNode || this.treeData || [], function(node) {
          if (ids.indexOf(node.objectId) >= 0) {
            node.selected = true
            updateNodeSelectState(node)
            return false
          } else {
            if (node.selected) {
              node.selected = false
              updateNodeSelectState(node)
            }
          }
        })
        selectNodes = this.synMultiSelection(true)
      } else {
        let foundSelectedNode = false
        let unsetSelectedNode = false
        iterateTree(startNode || this.treeData || [], function(node) {
          // 因为单选只有个选中，找到就不用再找了
          if (foundSelectedNode && unsetSelectedNode) {
            return false
          } else if (ids.indexOf(node.objectId) >= 0) {
            node.selected = true
            foundSelectedNode = node
            return false
          } else {
            if (node.selected) {
              unsetSelectedNode = node
              node.selected = false
            }
          }
        })
        if (foundSelectedNode) {
          selectNodes = this.synSingleSelection(foundSelectedNode, true)
        }
      }
      this.$emit('restore', ids.join(','), this.simplifyNode(selectNodes))

    },
    synSingleSelection(node, suppressChangeEvent) {
      const selectedNodes = [node]
      this._selectNodes = selectedNodes
      if (suppressChangeEvent !== true) {
        this.$emit('change', node.objectId, this.simplifyNode(node))
      }
      return selectedNodes
    },
    synMultiSelection(suppressChangeEvent) {
      let selectNodes = []
      // 如果异步树只能得到顶部的节点即可
      let branches = []
      let leaves = []
      // 搜索得到的树只能选择叶子节点
      if (this.isSearched) {
        leaves = getSelectedLeaves(this.treeData).leaves || []
      } else {
        // 异步只能选择 top和 leaves
        if (this.async) {
          const ret = getTopSelectedBranchesAndLeaves(this.treeData)
          branches = ret.branches
          leaves = ret.leaves
        } else {
          if (this.onlyLeaf) {
            leaves = getSelectedLeaves(this.treeData).leaves || []
          } else {
            const ret = getTopSelectedBranchesAndLeaves(this.treeData)
            branches = ret.branches
            leaves = ret.leaves
          }
        }
      }
      selectNodes.push.apply(selectNodes, branches)
      selectNodes.push.apply(selectNodes, leaves)
      if (this.selectObjectType) {
        selectNodes = lodash.filter(selectNodes, (node) => {
          return this.selectObjectType.split(',').indexOf(node.objectType) >= 0
        })
      }

      this._selectNodes = selectNodes

      if (suppressChangeEvent !== true) {
        const ids = lodash.map(selectNodes, (node) => node.objectId).join(',')
        this.$emit('change', ids, this.simplifyNode(selectNodes))
      }
      return selectNodes
    },
    formatNodeAndPage(rawTreeData, parent) {
      const formattedData = formatTreeData(rawTreeData, parent)
      // 对大于 maxFoldNodes 设置的子节点进行分页设置，减少过多节点展示优化加载速度
      iterateTree(formattedData, (node) => {
        const maxNode = Math.min(this.maxFoldNodes, node.children.length)
        node.childNodes = node.children.slice(0, maxNode)
      })
      return formattedData
    },
    handleSelectAfterSearch(isRefresh) {
      const keywords = String(this.keywords || '').trim()
      // 刷新需要根据关键字变化来判断是否清理或者恢复选中的节点
      if (isRefresh === true && !this.async) {
        if (this.lastKeywords !== keywords) {
          this.lastKeywords = keywords
          this.clearSelection()
        } else {
          this.restoreSelection()
        }
      } else {
        if (this.lastKeywords !== keywords && keywords === '') {
          this.clearSelection()
        }
        this.lastKeywords = keywords
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
          vm._data._treeJsonString = JSON.stringify(data) || '[]'
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
    },
    simplifyNode(node) {
      node = node || []
      const nodes = lodash.isArray(node) ? node : [node]
      return lodash.map(nodes, function(node) {
        const plainNode = lodash.assign({}, node)
        delete plainNode.parentNode
        delete plainNode.children
        delete plainNode.childNodes
        return plainNode
      })
    },
    focusInput() {
      if (this.$refs.input) {
        this.$refs.input.focus()
      }
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
    // 初始化数据
    this._selectNodes = []
    this.search(true)
  }
}
</script>

<style lang="scss">
@import "./index.scss";
</style>
