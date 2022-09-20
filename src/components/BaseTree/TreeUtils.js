import _ from 'lodash'

// checkState勾选状态定义：
// 0: 未勾选
// 1: 半勾选
// 2: 全勾选

export function updateAllChildrenNodeState(startNode) {
  iterateTree(startNode, function(node) {
    // 设置状态为勾选
    node.selected = startNode.selected
    node.checkState = startNode.selected ? 2 : 0
  })
}

function updateAllParentNodeState(startNode) {
  // 判断子节点是否全部勾选、或全部未勾选。
  function isChildrenAllCheckedOrNot(parent, checked) {
    const children = parent.children
    for (let i = 0; i < children.length; i++) {
      if (children[i].checkState !== (checked ? 2 : 0)) {
        return false
      }
    }
    return true
  }

  startNode.checkState = startNode.selected ? 2 : 0
  upNode(startNode.parentNode, function(parent) {
    // 若子节点全部勾选，则更改上级父节点为全部勾选状态
    // 若子节点全部未勾选，则更改上级父节点为空选状态
    if (isChildrenAllCheckedOrNot(parent, startNode.selected)) {
      parent.selected = startNode.selected
      parent.checkState = startNode.selected ? 2 : 0
    } else {
      parent.selected = false
      // 半选
      parent.checkState = 1
    }
  })
}

export function updateNodeSelectState(node) {
  updateAllChildrenNodeState(node)
  updateAllParentNodeState(node)
}

// 重新构造树的数据
export function formatTreeData(nodes, parent) {
  let level = parent ? parent.level : 0
  nodes = _.isArray(nodes) ? nodes : [nodes]
  let children = nodes
  _.each(children, function(node) {
    node.parentNode = parent
  })
  while (children) {
    const subChildren = []
    _.each(children, function(node) {
      // TODO 添加节点图标样式
      node.iconCls = ''
      node.level = level
      if (_.isUndefined(node.objectType)) {
        node.objectType = ''
      }
      if (_.isUndefined(node.children)) {
        node.children = []
      }
      if (node.children.length && _.isUndefined(node.objectCount)) {
        node.objectCount = node.children.length
      }
      if (_.isUndefined(node.objectCount)) {
        node.objectCount = node.children.length || 0
      }
      node.expanded = node.expanded || false
      node.checkState = node.checkState || 0
      node.selected = node.selected || false
      node.loading = node.loading || false
      if (node.children && node.children.length) {
        _.each(node.children, function(child) {
          child.parentNode = node
          subChildren.push(child)
        })
      }
    })
    if (subChildren.length > 0) {
      level++
      children = subChildren
    } else {
      children = false
    }
  }
  return nodes
}

export function upNode(node, fn) {
  let parent = node
  while (parent && _.isFunction(fn)) {
    const returnFalse = fn && fn(parent) === false
    if (returnFalse) {
      break
    }
    parent = parent.parentNode
  }
}

export function downNode(node, fn) {
  let children = [node]
  while (children) {
    let subChildren = []
    _.each(children, function(subNode) {
      const returnFalse = fn && fn(subNode) === false
      if (subNode.children && !returnFalse) {
        subChildren = subChildren.concat(subNode.children)
      }
    })
    if (subChildren.length > 0) {
      children = subChildren
    } else {
      break
    }
  }
}

export function findChildrenByType(node, objectType) {
  const rs = []
  iterateTree(node, function(subNode) {
    if (subNode.objectType === objectType) {
      rs.push(subNode)
    }
  })
  return rs
}

export function iterateTree(treeData, iteratee) {
  treeData = treeData || []
  if (!_.isArray(treeData)) {
    treeData = [treeData]
  }
  _.each(treeData, function(node) {
    downNode(node, iteratee)
  })
}

export function buildTreeFromListNode(data) {
  data = data || []
  if (!_.isArray(data)) {
    data = [data]
  }
  const rootList = []
  const nodeMap = {}
  const cacheApi = {
    getOrSet: function(key, value, newCB) {
      if (nodeMap[key]) {
        return nodeMap[key]
      } else {
        nodeMap[key] = value
        newCB && newCB(value)
        return value
      }
    },
    get: function(key) {
      return nodeMap[key]
    }
  }

  function emptyChildrenWhenCloned(newOne) {
    // backup for comparison
    newOne._children = newOne._children || newOne.children || []
    newOne.children = []
    newOne.objectCount = 0
  }

  /**
   * 向上逐级创建父节点给本次或者将来的节点用
   * @param node
   * @param rootList
   */
  function createHierarchyLine(node, rootList) {
    while (node) {
      let parent = node.parentNode
      const clonedNode = cacheApi.getOrSet(node.objectId, _.clone(node), emptyChildrenWhenCloned)
      if (parent) {
        const clonedParent = cacheApi.getOrSet(parent.objectId, _.clone(parent), emptyChildrenWhenCloned)
        // 防止重复添加
        if (clonedParent.children.length < parent.children.length) {
          clonedNode.parentNode = clonedParent
          clonedParent.children.push(clonedNode)
          clonedParent.objectCount = clonedParent.children.length
        }
        parent = clonedParent
      } else {
        if (rootList.indexOf(clonedNode) < 0) {
          rootList.push(clonedNode)
        }
      }
      node = parent
    }
  }

  _.each(data, function(node) {
    createHierarchyLine(node, rootList)
  })

  // 如果节点没有挂载过搜索的到的节点那么子节点可以全部展示
  _.each(rootList, function(node) {
    downNode(node, function(subNode) {
      if (subNode.children.length === 0 && subNode._children.length > 0) {
        subNode.children = subNode._children
        return false
      }
    })
  })
  return rootList
}

export function searchTree(data, keywords) {
  data = data || []
  if (!_.isArray(data)) {
    data = [data]
  }
  const treeList = []
  const formattedData = formatTreeData(data, null)
  iterateTree(formattedData, function(node) {
    if ((node.objectName + '').toLowerCase().indexOf((keywords + '').toLowerCase()) >= 0) {
      treeList.push(node)
    }
  })
  return buildTreeFromListNode(treeList)
}

/**
 * 展开节点所在的上下节点
 * @param nodes
 * @param objectId
 * @returns {boolean}
 */
export function expandTreeByNodeId(nodes, objectId) {
  nodes = nodes || []
  let findNode = false
  let parentNode = false
  iterateTree(nodes, function(node) {
    if (node.objectId === objectId) {
      findNode = node
      return false
    }
  })
  if (findNode) {
    findNode.expanded = true
    findNode.loaded = true
    parentNode = findNode
    if (findNode.children && findNode.children.length) {
      // 有了这个才能暂开
      findNode.childNodes = findNode.children
    }
    // 展开本节点的所有上层节点 ，以后可以从根节点动画展开
    while (parentNode) {
      parentNode.expanded = true
      parentNode.loaded = true
      if (parentNode.children && parentNode.children.length) {
        parentNode.childNodes = parentNode.children
      }
      parentNode = parentNode.parentNode
    }
    return findNode
  } else {
    return false
  }
}

export function expandNodeDeep(nodes) {
  nodes = nodes || []
  iterateTree(nodes, function(node) {
    node.expanded = true
    node.loaded = true
  })
}

const nodeStatusApi = {
  // 单选的时候使用
  isSelected: function(node) {
    return node.selected
  },
  // 是否全部选中
  isAllChecked: function(node) {
    return node.checkState && node.checkState === 2
  },
  // 部分选中
  isPartialChecked: function(node) {
    return node.checkState && node.checkState === 1
  },
  isChecked: function(node) {
    return this.isAllChecked(node) || this.isPartialChecked(node)
  },
  // 是否树枝 有objectCount 一般是组织
  isBranch: function(node) {
    return !_.isUndefined(node.objectCount) && node.objectCount > 0
  },
  // 是否叶子
  isLeaf: function(node) {
    return !this.isBranch(node)
  }
}

export function getSelectedBranchesAndLeaves(tree, onlyTopNode) {
  const branches = []
  const leaves = []

  function setSelected(node) {
    if (nodeStatusApi.isBranch(node)) {
      branches.push(node)
    } else {
      leaves.push(node)
    }
  }

  _.each(tree, function(node) {
    if (nodeStatusApi.isAllChecked(node)) {
      setSelected(node)
    } else if (nodeStatusApi.isPartialChecked(node)) {
      downNode(node, function(subNode) {
        if (nodeStatusApi.isChecked(subNode)) {
          if (nodeStatusApi.isAllChecked(subNode)) {
            setSelected(subNode)
            if (onlyTopNode === true) {
              // 中断遍历
              return false
            } else {
              // 继续遍历
              return true
            }
          }
        } else {
          return false
        }
      })
    }
  })

  return {
    branches: branches,
    leaves: leaves
  }
}

/**
 * 获取同步树的选择节点（叶子和树枝节点）
 * @param tree {{Node or [Node]}}
 * @returns {{leaves: Node[], branches: Node[]}}
 */
export function getSyncSelectedBranchesAndLeaves(tree) {
  return getSelectedBranchesAndLeaves(tree, false)
}

/**
 * 获取异步树的选择节点（叶子和树枝节点）
 * @param tree {{Node or [Node]}}
 * @returns {{leaves: Node[], branches: Node[]}}
 */
export function getAsyncSelectedBranchesAndLeaves(tree) {
  return getSelectedBranchesAndLeaves(tree, true)
}

/**
 * 获取所有选中的叶子节点
 * @param tree{{Node or [Node] }}
 * @returns {{leaves: Node []}}
 */
export function getSelectedLeaves(tree) {
  const leaves = []
  iterateTree(tree, function(node) {
    if (nodeStatusApi.isChecked(node)) {
      if (nodeStatusApi.isAllChecked(node) && nodeStatusApi.isLeaf(node)) {
        leaves.push(node)
      }
      return true
    } else {
      return false
    }
  })
  return {
    leaves: leaves
  }
}
