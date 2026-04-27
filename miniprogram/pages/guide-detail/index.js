const { getGuideDetail } = require("../../services/guide.service")

const CATEGORY_LABEL_MAP = {
  spot: "景点",
  food: "美食",
  photo: "拍照",
  night: "夜游"
}

function formatTime(time) {
  if (!time) {
    return ""
  }
  const date = new Date(time)
  if (Number.isNaN(date.getTime())) {
    return String(time)
  }
  const pad2 = (value) => String(value).padStart(2, "0")
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(
    date.getHours()
  )}:${pad2(date.getMinutes())}`
}

Page({
  data: {
    guideId: "",
    detail: null,
    loading: false
  },

  async onLoad(query) {
    this.setData({ guideId: query.guideId || "" })
    if (!this.data.guideId) {
      wx.showToast({ title: "缺少攻略参数", icon: "none" })
      return
    }

    await this.loadDetail()
  },

  async loadDetail() {
    if (!this.data.guideId) {
      return
    }

    this.setData({ loading: true })
    try {
      const res = await getGuideDetail(this.data.guideId)
      const detail = {
        ...res.data,
        categoryLabel: CATEGORY_LABEL_MAP[res.data.category] || "其他",
        displayDistance: Number(res.data.distanceKm || 0).toFixed(1),
        displayUpdatedAt: formatTime(res.data.updatedAt),
        trafficWalk: res.data.traffic && res.data.traffic.walk,
        trafficBus: res.data.traffic && res.data.traffic.bus,
        trafficTaxi: res.data.traffic && res.data.traffic.taxi
      }
      this.setData({ detail })
    } catch (error) {
      wx.showToast({ title: error.message || "加载失败", icon: "none" })
    } finally {
      this.setData({ loading: false })
    }
  },

  onPullDownRefresh() {
    this.loadDetail().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  copyAddress() {
    const address = this.data.detail && this.data.detail.address
    if (!address) {
      wx.showToast({ title: "暂无地址信息", icon: "none" })
      return
    }
    wx.setClipboardData({ data: address })
  },

  openLocation() {
    const detail = this.data.detail || {}
    if (typeof detail.lat !== "number" || typeof detail.lng !== "number") {
      wx.showToast({ title: "暂无定位信息", icon: "none" })
      return
    }
    wx.openLocation({
      latitude: detail.lat,
      longitude: detail.lng,
      name: detail.title || "目的地",
      address: detail.address || ""
    })
  }
})
