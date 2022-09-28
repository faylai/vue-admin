module.exports = {
  title: 'Vue Admin Template',

  /**
   * @type {boolean} true | false
   * @description Whether fix the header
   */
  fixedHeader: false,

  /**
   * @type {boolean} true | false
   * @description Whether show the logo in sidebar
   */
  sidebarLogo: false,
  paginationConfig: {
    // 单页最大记录数
    defaultPageSize: 20,
    // 单页最大记录数请求参数名称
    pageSizeParamKey: 'pageSize',
    // 页码请求参数名称
    pageIndexParamKey: 'pageIndex',
    // 返回数据根访问名称
    responseRootName: 'data',
    // 返回消息访问名称
    responseMsgName: 'msg',
    // responseRoot  中的总记录数字段名
    responseTotalCountKey: 'total',
    // responseRoot 中的记录列表字段名
    responseRecordListKey: 'data'
  }
}
