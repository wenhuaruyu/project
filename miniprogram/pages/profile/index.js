const { getStoreInfo } = require("../../services/checkin.service")

Page({
  data: {
    userInfo: {
      nickname: "游客",
      userId: "guest_local",
      contactHint: "如需帮助请联系门店前台"
    },
    storeInfo: null,
    loading: false
  },

  onLoad() {
    this.loadStoreInfo()
  },

  async loadStoreInfo() {
    this.setData({ loading: true })
    try {
      const res = await getStoreInfo("store_001")
      this.setData({ storeInfo: res.data })
    } catch (error) {
      wx.showToast({ title: error.message || "加载失败", icon: "none" })
    } finally {
      this.setData({ loading: false })
    }
  },

  goCheckin() {
    wx.navigateTo({
      url: `/pages/checkin/index?userId=${this.data.userInfo.userId}`
    })
  },

  goGiftList() {
    wx.switchTab({
      url: "/pages/gift-list/index"
    })
  },

  goOrderList() {
    wx.switchTab({
      url: "/pages/order-list/index"
    })
  },

  callStore() {
    const phone = this.data.storeInfo && this.data.storeInfo.contactPhone
    if (!phone) {
      wx.showToast({ title: "暂无联系电话", icon: "none" })
      return
    }
    wx.makePhoneCall({ phoneNumber: phone })
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
  }
})
