const { getGuideDetail } = require("../../services/guide.service")

Page({
  data: {
    detail: null
  },

  async onLoad(query) {
    const res = await getGuideDetail(query.guideId)
    this.setData({ detail: res.data })
  }
})
