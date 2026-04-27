const { queryOrderList, payOrder, confirmPayment } = require("../../services/order.service")

function pad2(value) {
  return String(value).padStart(2, "0")
}

function formatTime(time) {
  if (!time) {
    return ""
  }
  const date = new Date(time)
  if (Number.isNaN(date.getTime())) {
    return String(time).replace("T", " ").slice(0, 16)
  }
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(
    date.getHours()
  )}:${pad2(date.getMinutes())}`
}

const ORDER_STATUS_LABEL = {
  PENDING_PAY: "待支付",
  PAID: "已支付",
  PREPARING: "备货中",
  COMPLETED: "已完成",
  CANCELLED: "已取消"
}

const PAY_STATUS_LABEL = {
  UNPAID: "未支付",
  PAID: "已支付",
  REFUNDED: "已退款"
}

const ORDER_STATUS_CLASS = {
  PENDING_PAY: "status-warn",
  PAID: "status-success",
  PREPARING: "status-info",
  COMPLETED: "status-done",
  CANCELLED: "status-muted"
}

const PAY_STATUS_CLASS = {
  UNPAID: "status-warn",
  PAID: "status-success",
  REFUNDED: "status-muted"
}

Page({
  data: {
    userId: "guest_local",
    status: "",
    list: [],
    emptyText: "还没有订单，去挑选伴手礼吧",
    payingOrderId: "",
    loading: false
  },

  onLoad(query) {
    this.setData({
      userId: query.userId || "guest_local",
      status: query.status || ""
    })
    this.loadList()
  },

  async loadList() {
    this.setData({ loading: true })
    try {
      const res = await queryOrderList({
        userId: this.data.userId,
        pageNo: 1,
        pageSize: 20,
        status: this.data.status
      })
      const list = (res.data.list || []).map((item) => ({
        ...item,
        orderStatusLabel: ORDER_STATUS_LABEL[item.orderStatus] || item.orderStatus || "未知状态",
        orderStatusClass: ORDER_STATUS_CLASS[item.orderStatus] || "status-info",
        payStatusLabel: PAY_STATUS_LABEL[item.payStatus] || item.payStatus || "未知状态",
        payStatusClass: PAY_STATUS_CLASS[item.payStatus] || "status-info",
        displayAmount: (Number(item.amountTotal || 0) / 100).toFixed(2),
        displayTime: formatTime(item.createdAt)
      }))
      this.setData({
        list,
        emptyText: this.buildEmptyText(this.data.status)
      })
    } catch (error) {
      wx.showToast({ title: error.message || "加载失败", icon: "none" })
    } finally {
      this.setData({ loading: false })
    }
  },

  buildEmptyText(status) {
    if (status === "PENDING_PAY") {
      return "当前没有待支付订单"
    }
    if (status === "PAID") {
      return "当前没有已支付订单"
    }
    if (status === "PREPARING") {
      return "当前没有备货中订单"
    }
    if (status === "COMPLETED") {
      return "当前没有已完成订单"
    }
    if (status === "CANCELLED") {
      return "当前没有已取消订单"
    }
    return "还没有订单，去挑选伴手礼吧"
  },

  setStatusFilter(e) {
    const status = e.currentTarget.dataset.status || ""
    this.setData({ status })
    this.loadList()
  },

  onPullDownRefresh() {
    this.loadList().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  async onRepay(e) {
    const orderId = e.currentTarget.dataset.orderId
    if (!orderId) {
      return
    }
    this.setData({ payingOrderId: orderId })
    try {
      await payOrder(orderId)
      await confirmPayment(orderId)
      wx.showToast({ title: "支付成功", icon: "success" })
      await this.loadList()
    } catch (error) {
      wx.showToast({ title: error.message || "支付失败", icon: "none" })
    } finally {
      this.setData({ payingOrderId: "" })
    }
  },

  goOrderDetail(e) {
    const orderId = e.currentTarget.dataset.orderId
    if (!orderId) {
      return
    }
    wx.navigateTo({
      url: `/pages/order-detail/index?orderId=${orderId}&userId=${this.data.userId}`
    })
  },

  goGiftList() {
    wx.switchTab({
      url: "/pages/gift-list/index"
    })
  }
})
