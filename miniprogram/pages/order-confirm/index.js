const { createOrder, payOrder } = require("../../services/order.service")

Page({
  data: {
    orderId: "",
    paymentParams: null
  },

  async onCreateOrder(e) {
    const res = await createOrder(e.detail)
    this.setData({ orderId: res.data.orderId })
  },

  async onStartPay() {
    const res = await payOrder(this.data.orderId)
    this.setData({ paymentParams: res.data.paymentParams })
  }
})
