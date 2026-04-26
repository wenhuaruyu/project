const { getProductDetail } = require("../../services/product.service")

Page({
  data: {
    detail: null
  },

  async onLoad(query) {
    const res = await getProductDetail(query.productId)
    this.setData({ detail: res.data })
  }
})
