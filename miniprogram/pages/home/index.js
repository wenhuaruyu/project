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
