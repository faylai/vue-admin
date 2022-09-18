const syncData = require('./syncTree.json')
module.exports = [
  {
    url: '/vue-admin-template/tree/sync',
    type: 'post',
    response: config => {
      return syncData
    }
  }
]
