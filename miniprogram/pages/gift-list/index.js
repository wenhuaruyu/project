const { queryProducts } = require("../../services/product.service")

Page({
  data: {
    storeId: "store_001",
    list: [],
    loading: false
  },

  onLoad(query) {
    this.setData({
      storeId: query.storeId || "store_001"
    })
    this.loadList()
  },

  async loadList() {
    this.setData({ loading: true })
    try {
      const res = await queryProducts({
        storeId: this.data.storeId,
        pageNo: 1,
        pageSize: 20
      })
      const list = (res.data.list || []).map((item) => ({
        ...item,
        displayPrice: (Number(item.price || 0) / 100).toFixed(2),
        soldOut: Number(item.stock || 0) <= 0
      }))
      this.setData({ list })
    } catch (error) {
      wx.showToast({ title: error.message || "加载失败", icon: "none" })
    } finally {
      this.setData({ loading: false })
    }
  },

  goDetail(e) {
    const productId = e.currentTarget.dataset.productId
    const soldOut = e.currentTarget.dataset.soldOut
    if (soldOut) {
      wx.showToast({ title: "该商品已售罄", icon: "none" })
      return
    }
    wx.navigateTo({
      url: `/pages/gift-detail/index?productId=${productId}`
    })
  },

  goOrderList() {
    wx.switchTab({
      url: "/pages/order-list/index"
    })
  }
})
