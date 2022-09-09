const Mock = require('mockjs')

const data = Mock.mock({
  'items|30': [{
    id: '@id',
    title: '@sentence(10, 20)',
    'status|1': ['published', 'draft', 'deleted'],
    author: 'name',
    display_time: '@datetime',
    pageviews: '@integer(300, 5000)'
  }]
})

const selectData1 = Mock.mock({
  'items|30': [{
    value: '@id',
    label: '@sentence(5, 6)'
  }]
})

const selectData2 = Mock.mock({
  'items|20': [{
    value: '@id',
    label: '@sentence(2,3)'
  }]
})

module.exports = [
  {
    url: '/vue-admin-template/table/list',
    type: 'get',
    response: config => {
      const items = data.items
      return {
        code: 20000,
        data: {
          total: items.length,
          items: items
        }
      }
    }
  },
  {
    url: '/vue-admin-template/select1/list',
    type: 'post',
    response: config => {
      const data = selectData1.items
      return {
        code: 20000,
        data: {
          total: data.length,
          data: data
        }
      }
    }
  },
  {
    url: '/vue-admin-template/select2/list',
    type: 'post',
    response: config => {
      const data = selectData2.items
      return {
        code: 20000,
        data: {
          total: 100,
          data: data
        }
      }
    }
  }
]
