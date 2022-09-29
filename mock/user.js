const tokens = {
  admin: {
    token: 'admin-token'
  },
  editor: {
    token: 'editor-token'
  }
}

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
  // user list
  {
    url: '/vue-admin-template/user/list',
    type: 'post',
    response: config => {
      const pageIndex = config.query.pageIndex || config.body.pageIndex
      return {
        code: 20000,
        data: {
          total: 40,
          data: pageIndex === 2 ? [{
            'no': 'ald0030041',
            'name': '李福山',
            'userName': '李福山',
            'sex': 1,
            'idCardNo': '410112197004141716',
            'tel': '13676968505'
          }, {
            'no': 'ald0030040',
            'name': '倪祖华',
            'userName': '13606177265',
            'sex': 1,
            'idCardNo': '320222196603070210',
            'tel': '13606177265'
          }, {
            'no': 'ald0030038',
            'name': '张军义',
            'userName': '15890693802',
            'sex': 1,
            'idCardNo': '410122197510122932',
            'tel': '15890693802'
          }, {
            'no': 'ald0030035',
            'name': '董书来',
            'userName': '13592407282',
            'sex': 1,
            'idCardNo': '410122196811112311',
            'tel': '13592407282'
          }, {
            'no': 'ald0030034',
            'name': '杨景妮',
            'userName': '18236943182',
            'sex': 0,
            'idCardNo': '410122196611152984',
            'tel': '18236943182'
          }, {
            'no': 'ald0030031',
            'name': '梁西水',
            'userName': '18236935938',
            'sex': 1,
            'idCardNo': '410125195909164018',
            'tel': '18236935938'
          }, {
            'no': 'ald0030018',
            'name': '高春芹',
            'userName': '15838145518',
            'sex': 0,
            'idCardNo': '410125197111154549',
            'tel': '15838145518'
          }, {
            'no': 'ald0030021',
            'name': '栗海朝',
            'userName': '15890682969',
            'sex': 1,
            'idCardNo': '410125196812274573',
            'tel': '15890682969'
          }, {
            'no': 'ald0030008',
            'name': '张珍',
            'userName': '13663858143',
            'sex': 0,
            'idCardNo': '410125196308092025',
            'tel': '13663858143'
          }, {
            'no': 'ald0030011',
            'name': '孟秋兰',
            'userName': '13503819235',
            'sex': 0,
            'idCardNo': '410125196310215020',
            'tel': '13503819235'
          }, {
            'no': 'ald0030029',
            'name': '张婷婷',
            'userName': '13525593520',
            'sex': 0,
            'idCardNo': '410185199110067326',
            'tel': '13525593520'
          }, {
            'no': 'ald0030026',
            'name': '耿文斐',
            'userName': '15238050808',
            'sex': 0,
            'idCardNo': '410185198801078326',
            'tel': '15238050808'
          }, {
            'no': 'ald0030033',
            'name': '高晓丽',
            'userName': '15803996885',
            'sex': 0,
            'idCardNo': '410185198809205548',
            'tel': '15803996885'
          }, {
            'no': 'ald0030032',
            'name': '王四妮',
            'userName': '17335715088',
            'sex': 0,
            'idCardNo': '410125196610010086',
            'tel': '17335715088'
          }, {
            'no': 'ald0030028',
            'name': '王秋占',
            'userName': '18738429025',
            'sex': 0,
            'idCardNo': '41032919620705654X',
            'tel': '18738429025'
          }, {
            'no': 'ald0030025',
            'name': '孙瑞娜',
            'userName': '13938424850',
            'sex': 0,
            'idCardNo': '410125197510142027',
            'tel': '13938424850'
          }, {
            'no': 'ald0029999',
            'name': '高文岗',
            'userName': '13014506389',
            'sex': 1,
            'idCardNo': '410125196407275556',
            'tel': '13014506389'
          }, {
            'no': 'ald0030005',
            'name': '韩花娥',
            'userName': '15038597708',
            'sex': 0,
            'idCardNo': '410321196106245025',
            'tel': '15038597708'
          }, {
            'no': 'ald0030015',
            'name': '王金婵',
            'userName': '15517153889',
            'sex': 0,
            'idCardNo': '410125196211185567',
            'tel': '15517153889'
          }, {
            'no': 'ald0030003',
            'name': '梅雪芳',
            'userName': '13603982456',
            'sex': 0,
            'idCardNo': '410185198410203604',
            'tel': '13603982456'
          }] : [

            {
              'no': 'ald0030013',
              'name': '张彩娟',
              'userName': '15038362160',
              'sex': 0,
              'idCardNo': '410185198910261026',
              'tel': '15038362160'
            }, {
              'no': 'ald0030027',
              'name': '陈宏林',
              'userName': '13949212371',
              'sex': 1,
              'idCardNo': '410321196010045010',
              'tel': '13949212371'
            }, {
              'no': 'ald0030001',
              'name': '魏永森',
              'userName': '15617743390',
              'sex': 1,
              'idCardNo': '410125196208142013',
              'tel': '15617743390'
            }, {
              'no': 'ald0030006',
              'name': '刘二苟',
              'userName': '18738180649',
              'sex': 1,
              'idCardNo': '410125196312020032',
              'tel': '18738180649'
            }, {
              'no': 'ald0030004',
              'name': '吴荣欣',
              'userName': '13803994964',
              'sex': 1,
              'idCardNo': '410125196903171019',
              'tel': '13803994964'
            }, {
              'no': 'ald0030030',
              'name': '冯福来',
              'userName': '13592584237',
              'sex': 1,
              'idCardNo': '410125197009136555',
              'tel': '13592584237'
            }, {
              'no': 'ald0030012',
              'name': '王雪香',
              'userName': '19903836919',
              'sex': 0,
              'idCardNo': '410125196402046025',
              'tel': '19903836919'
            }, {
              'no': 'ald0030009',
              'name': '张小香',
              'userName': '15136239417',
              'sex': 0,
              'idCardNo': '410125197302111605',
              'tel': '15136239417'
            }, {
              'no': 'ald0030017',
              'name': '降凤军',
              'userName': '15039061114',
              'sex': 0,
              'idCardNo': '410185197010146589',
              'tel': '15039061114'
            }, {
              'no': 'ald0030014',
              'name': '仝晓红',
              'userName': '13663010011',
              'sex': 0,
              'idCardNo': '410185198704096023',
              'tel': '13663010011'
            },
            {
              'no': 'ald0030007',
              'name': '丁金夫',
              'userName': '15136157683',
              'sex': 1,
              'idCardNo': '41012519620704055X',
              'tel': '15136157683'
            }, {
              'no': 'ald0030019',
              'name': '李海朝',
              'userName': '19939368830',
              'sex': 1,
              'idCardNo': '410125195807195518',
              'tel': '19939368830'
            }, {
              'no': 'ald0030002',
              'name': '张彦玲',
              'userName': '17596482896',
              'sex': 0,
              'idCardNo': '41012519681119554X',
              'tel': '17596482896'
            }, {
              'no': 'ald0030024',
              'name': '吴爱玲',
              'userName': '15565059736',
              'sex': 0,
              'idCardNo': '410125196305162526',
              'tel': '15565059736'
            }, {
              'no': 'ald0030000',
              'name': '唐学德',
              'userName': '15737129528',
              'sex': 1,
              'idCardNo': '410125196002113532',
              'tel': '15737129528'
            }, {
              'no': 'ald0030020',
              'name': '冯亚菲',
              'userName': '13273800902',
              'sex': 0,
              'idCardNo': '410185198710241020',
              'tel': '13273800902'
            }, {
              'no': 'ald0030016',
              'name': '杨少宗',
              'userName': '15838361692',
              'sex': 1,
              'idCardNo': '410185196312186012',
              'tel': '15838361692'
            }, {
              'no': 'ald0030010',
              'name': '石书芳',
              'userName': '13213232867',
              'sex': 0,
              'idCardNo': '410125195810122029',
              'tel': '13213232867'
            }, {
              'no': 'ald0030022',
              'name': '杨海军',
              'userName': '15639701989',
              'sex': 1,
              'idCardNo': '410125196510194535',
              'tel': '15639701989'
            }, {
              'no': 'ald0030023',
              'name': '牛桂芬',
              'userName': '19913716528',
              'sex': 0,
              'idCardNo': '410185196810106564',
              'tel': '19913716528'
            }
          ]
        }
      }
    }
  }
]
