const CONSTANCE = {
  sex: [
    {
      value: '1',
      label: '男'
    }, {
      value: '0',
      label: '女'
    }
  ],
  userStatus: [
    { value: '1', label: '正常' },
    { value: '0', label: '停用' }
  ],
  job: [
    { value: '1', label: '工人' },
    { value: '2', label: '管理人员' },
    { value: '3', label: '高层' }
  ]
}

function clone() {
  return JSON.parse(JSON.stringify(CONSTANCE))
}

export default {
  CONSTANCE: clone(),
  data() {
    return {
      CONSTANCE: clone()
    }
  }
}
