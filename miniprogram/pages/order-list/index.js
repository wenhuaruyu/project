const { queryOrderList } = require("../../services/order.service")

Page({
  data: {
    list: []
  },

  async onLoad(query) {
    const res = await queryOrderList({
      userId: query.userId,
      pageNo: 1,
      pageSize: 10,
      status: query.status || ""
    })
    this.setData({ list: res.data.list })
  }
})
