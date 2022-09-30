const tokens = {
  admin: {
    token: 'admin-token'
  },
  editor: {
    token: 'editor-token'
  }
}
const userDropDownData = require('./json/userDropDown.json')
const userListData = require('./json/userList.json')

const users = {
  'admin-token': {
    roles: ['admin'],
    introduction: 'I am a super administrator',
    avatar: '',
    name: 'Super Admin'
  },
  'editor-token': {
    roles: ['editor'],
    introduction: 'I am an editor',
    avatar: '',
    name: 'Normal Editor'
  }
}

module.exports = [
  // user login
  {
    url: '/vue-admin-template/user/login',
    type: 'post',
    response: config => {
      const { username } = config.body
      const token = tokens[username]

      // mock error
      if (!token) {
        return {
          code: 60204,
          message: 'Account and password are incorrect.'
        }
      }

      return {
        code: 20000,
        data: token
      }
    }
  },

  // get user info
  {
    url: '/vue-admin-template/user/info\.*',
    type: 'get',
    response: config => {
      const { token } = config.query
      const info = users[token]

      // mock error
      if (!info) {
        return {
          code: 50008,
          message: 'Login failed, unable to get user details.'
        }
      }

      return {
        code: 20000,
        data: info
      }
    }
  },

  // user logout
  {
    url: '/vue-admin-template/user/logout',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },
  // person list
  {
    url: '/vue-admin-template/person/list',
    type: 'post',
    response: config => {
      const pageIndex = config.query.pageIndex || config.body.pageIndex || 1
      const pageSize = config.query.pageSize || 10
      return {
        code: 20000,
        data: {
          totalCount: userDropDownData.length,
          data: userDropDownData.slice(pageSize * (pageIndex - 1), pageSize * pageIndex)
        }
      }
    }
  },
  // user list
  {
    url: '/vue-admin-template/user/list',
    type: 'post',
    response: config => {
      return {
        code: 20000,
        data: {
          totalCount: userListData.length,
          data: userListData
        }
      }
    }
  }
]
