const { queryGuides } = require("../../services/guide.service")

Page({
  data: {
    list: []
  },

  async onLoad(query) {
    const res = await queryGuides({
      storeId: query.storeId,
      pageNo: 1,
      pageSize: 10
    })
    this.setData({ list: res.data.list })
  }
})
