const { getProductDetail } = require("../../services/product.service")

Page({
  data: {
    detail: null,
    quantity: 1,
    maxQuantity: 1,
    displayPrice: "0.00",
    loading: false
  },

  async onLoad(query) {
    this.loadDetail(query.productId)
  },

  async loadDetail(productId) {
    this.setData({ loading: true })
    try {
      const res = await getProductDetail(productId)
      const stock = Number(res.data.stock || 0)
      this.setData({
        detail: res.data,
        maxQuantity: Math.max(1, stock),
        quantity: stock > 0 ? 1 : 0,
        displayPrice: (Number(res.data.price || 0) / 100).toFixed(2)
      })
    } catch (error) {
      wx.showToast({ title: error.message || "加载失败", icon: "none" })
    } finally {
      this.setData({ loading: false })
    }
  },

  onMinus() {
    if (!this.data.detail || this.data.quantity <= 1) {
      return
    }
    this.setData({ quantity: this.data.quantity - 1 })
  },

  onPlus() {
    if (!this.data.detail) {
      return
    }
    if (this.data.quantity >= this.data.maxQuantity) {
      wx.showToast({ title: "已达到最大可购数量", icon: "none" })
      return
    }
    this.setData({ quantity: this.data.quantity + 1 })
  },

  goOrderConfirm() {
    const detail = this.data.detail
    if (!detail || this.data.quantity < 1) {
      return
    }
    wx.navigateTo({
      url: `/pages/order-confirm/index?productId=${detail.productId}&quantity=${this.data.quantity}`
    })
  }
})
