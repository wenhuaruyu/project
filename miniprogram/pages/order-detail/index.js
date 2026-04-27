const { getOrderDetail } = require("../../services/order.service")

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

function formatCurrency(cents) {
  return (Number(cents || 0) / 100).toFixed(2)
}

function formatTime(time) {
  if (!time) {
    return ""
  }
  const date = new Date(time)
  if (Number.isNaN(date.getTime())) {
    return String(time).replace("T", " ").slice(0, 16)
  }
  const pad2 = (value) => String(value).padStart(2, "0")
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(
    date.getHours()
  )}:${pad2(date.getMinutes())}`
}

function buildTimeline(detail) {
  const timeline = [
    {
      key: "created",
      label: "订单创建",
      time: formatTime(detail.createdAt),
      active: true
    },
    {
      key: "paid",
      label: "支付完成",
      time: detail.payStatus === "PAID" ? formatTime(detail.paidAt) : "待完成",
      active: detail.payStatus === "PAID"
    }
  ]

  if (detail.orderStatus === "CANCELLED") {
    timeline.push({
      key: "cancelled",
      label: "订单已取消",
      time: "系统处理",
      active: true
    })
  }

  return timeline.map((item) => ({
    ...item,
    dotClass: item.active ? "dot-active" : ""
  }))
}

Page({
  data: {
    orderId: "",
    userId: "guest_local",
    detail: null,
    timeline: [],
    loading: false
  },

  onLoad(query) {
    this.setData({
      orderId: query.orderId || "",
      userId: query.userId || "guest_local"
    })
    this.loadDetail()
  },

  async loadDetail() {
    if (!this.data.orderId) {
      wx.showToast({ title: "缺少订单参数", icon: "none" })
      return
    }

    this.setData({ loading: true })
    try {
      const res = await getOrderDetail(this.data.orderId, this.data.userId)
      const detail = {
        ...res.data,
        items: (res.data.items || []).map((item) => ({
          ...item,
          displayPrice: formatCurrency(item.price)
        })),
        orderStatusLabel: ORDER_STATUS_LABEL[res.data.orderStatus] || res.data.orderStatus || "未知状态",
        payStatusLabel: PAY_STATUS_LABEL[res.data.payStatus] || res.data.payStatus || "未知状态",
        displayAmount: formatCurrency(res.data.amountTotal),
        displayCreatedAt: formatTime(res.data.createdAt),
        displayPaidAt: formatTime(res.data.paidAt)
      }
      this.setData({
        detail,
        timeline: buildTimeline(detail)
      })
    } catch (error) {
      wx.showToast({ title: error.message || "加载失败", icon: "none" })
    } finally {
      this.setData({ loading: false })
    }
  }
})
