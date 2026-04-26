const { submitGuestProfile } = require("../../services/checkin.service")

Page({
  data: {
    submitResult: null
  },

  async onSubmitProfile(e) {
    const payload = e.detail
    const res = await submitGuestProfile(payload)
    this.setData({
      submitResult: res.data
    })
  }
})
