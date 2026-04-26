const { queryProducts } = require("../../services/product.service")

Page({
  data: {
    list: []
  },

  async onLoad(query) {
    const res = await queryProducts({
      storeId: query.storeId,
      pageNo: 1,
      pageSize: 10
    })
    this.setData({ list: res.data.list })
  }
})
