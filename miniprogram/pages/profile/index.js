Page({
  data: {
    userInfo: null
  },

  onLoad() {
    this.setData({
      userInfo: {
        nickname: "游客",
        contactHint: "如需帮助请联系门店前台"
      }
    })
  }
})
