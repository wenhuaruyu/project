const { getProductDetail } = require("../../services/product.service")
const { createOrder, payOrder, confirmPayment } = require("../../services/order.service")

Page({
  data: {
    product: null,
    quantity: 1,
    amountTotal: 0,
    displayUnitPrice: "0.00",
    displayAmountTotal: "0.00",
    orderId: "",
    paymentParams: null,
    paid: false,
    loading: false
  },

  async onLoad(query) {
    const productId = query.productId
    const quantity = Number(query.quantity || 1)
    if (!productId) {
      wx.showToast({ title: "缺少商品参数", icon: "none" })
      return
    }

    this.setData({ loading: true, quantity })
    try {
      const res = await getProductDetail(productId)
      this.setData({
        product: res.data,
        amountTotal: res.data.price * quantity,
        displayUnitPrice: (Number(res.data.price || 0) / 100).toFixed(2),
        displayAmountTotal: ((Number(res.data.price || 0) * quantity) / 100).toFixed(2)
      })
    } catch (error) {
      wx.showToast({ title: error.message || "加载失败", icon: "none" })
    } finally {
      this.setData({ loading: false })
    }
  },

  async onCreateOrder() {
    if (!this.data.product) {
      return
    }

    this.setData({ loading: true })
    try {
      const res = await createOrder({
        userId: "guest_local",
        storeId: "store_001",
        deliveryType: "pickup",
        items: [
          {
            productId: this.data.product.productId,
            quantity: this.data.quantity
          }
        ]
      })
      this.setData({ orderId: res.data.orderId, amountTotal: res.data.amountTotal })
      this.setData({
        displayAmountTotal: (Number(res.data.amountTotal || 0) / 100).toFixed(2),
        paid: false
      })
      wx.showToast({ title: "下单成功", icon: "success" })
    } catch (error) {
      wx.showToast({ title: error.message || "下单失败", icon: "none" })
    } finally {
      this.setData({ loading: false })
    }
  },

  async onStartPay() {
    if (!this.data.orderId) {
      wx.showToast({ title: "请先创建订单", icon: "none" })
      return
    }

    this.setData({ loading: true })
    try {
      const payRes = await payOrder(this.data.orderId)
      this.setData({ paymentParams: payRes.data.paymentParams })
      await confirmPayment(this.data.orderId)
      this.setData({ paid: true })
      wx.showToast({ title: "支付成功", icon: "success" })
    } catch (error) {
      wx.showToast({ title: error.message || "支付失败", icon: "none" })
    } finally {
      this.setData({ loading: false })
    }
  },

  goOrderList() {
    wx.switchTab({
      url: "/pages/order-list/index"
    })
  }
})
