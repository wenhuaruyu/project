const { getStoreInfo } = require("../../services/checkin.service")

Page({
  data: {
    storeId: "store_001",
    userId: "",
    storeInfo: null,
    loading: false
  },

  onLoad() {
    this.loadStoreInfo()
  },

  async loadStoreInfo() {
    this.setData({ loading: true })
    try {
      const info = await getStoreInfo(this.data.storeId)
      this.setData({
        storeInfo: info.data,
        storeId: info.data.storeId
      })
    } catch (error) {
      this.showRequestError(error, "加载失败")
    } finally {
      this.setData({ loading: false })
    }
  },

  goToCheckin() {
    wx.navigateTo({
      url: "/pages/checkin/index?userId=" + this.data.userId
    })
  },

  goToGiftList() {
    wx.navigateTo({
      url: "/pages/gift-list/index?storeId=" + this.data.storeId
    })
  },

  goToOrderList() {
    wx.switchTab({
      url: "/pages/order-list/index"
    })
  },

  copyWifiPassword() {
    const wifiPassword =
      this.data.storeInfo &&
      (this.data.storeInfo.wifiPassword || this.data.storeInfo.wifiPasswordMasked)
    if (!wifiPassword) {
      wx.showToast({ title: "暂无 Wi-Fi 密码", icon: "none" })
      return
    }
    wx.setClipboardData({ data: wifiPassword })
  },

  callStore() {
    const phone = this.data.storeInfo && this.data.storeInfo.contactPhone
    if (!phone) {
      wx.showToast({ title: "暂无联系电话", icon: "none" })
      return
    }
    wx.makePhoneCall({ phoneNumber: phone })
  },

  openStoreLocation() {
    const info = this.data.storeInfo || {}
    if (typeof info.lat !== "number" || typeof info.lng !== "number") {
      wx.showToast({ title: "暂无定位信息", icon: "none" })
      return
    }
    wx.openLocation({
      latitude: info.lat,
      longitude: info.lng,
      name: info.name || "门店位置",
      address: info.address || ""
    })
  },

  showRequestError(error, fallbackTitle) {
    const codeText = error && error.code ? `(${error.code})` : ""
    const message = error && error.message ? error.message : fallbackTitle
    wx.showToast({
      title: `${message}${codeText}`,
      icon: "none"
    })
    console.error("home request failed", {
      code: error && error.code,
      message: error && error.message,
      requestId: error && error.requestId,
      data: error && error.data
    })
  }
})
