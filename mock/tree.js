const _ = require('lodash')

const syncData = require('./syncTree.json')

function itNode(node, fn) {
  let children = _.isArray(node) ? node : [node]
  let level = 1
  while (children) {
    let subChildren = []
    for (let i = 0; i < children.length; i++) {
      const subNode = children[i]
      const returnFalse = fn && fn(subNode, level) === false
      if (subNode.children && !returnFalse) {
        subChildren = subChildren.concat(subNode.children)
      } else {
        subChildren = []
        break
      }
    }
    if (subChildren.length > 0) {
      children = subChildren
      level++
    } else {
      break
    }
  }
}

module.exports = [
  {
    url: '/vue-admin-template/tree/sync',
    type: 'post',
    response: config => {
      console.log(config.query)
      return syncData
    }
  },
  {
    url: '/vue-admin-template/tree/async',
    type: 'post',
    response: config => {
      const parentId = config.query.parentId || config.body.parentId
      console.log('parentId is', parentId)
      let found = []
      // 访问根的时候默认展示两层
      if (!parentId) {
        found = _.map(syncData.data, function(node) {
          const newNode = _.assign({}, node)
          newNode.children = _.map(newNode.children, function(subNode) {
            const newSubNode = _.assign({}, subNode)
            newSubNode.children = []
            return newSubNode
          })
          return newNode
        })

      } else {
        itNode(syncData.data, function(node, level) {
          if (node.objectId === parentId) {
            found = node.children
            found = _.map(found, function(node) {
              const newNode = _.assign({}, node)
              newNode.children = []
              return newNode
            })
            return false
          }
        })
      }

      return {
        code: 20000,
        data: found
      }
    }
  }
]
