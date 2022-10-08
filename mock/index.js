
const user = require('./user')
const table = require('./table')
const tree = require('./tree')
const mocks = [
  ...user,
  ...table,
  ...tree
]

module.exports = {
  mocks
}

