const { verifyBooking } = require("../../services/auth.service")
const { getStoreInfo } = require("../../services/checkin.service")

Page({
  data: {
    verified: false,
    storeInfo: null
  },

  async onVerifyAndLoad(e) {
    const bookingNo = e.detail.bookingNo
    const phone = e.detail.phone
    const auth = await verifyBooking({ bookingNo, phone })
    const info = await getStoreInfo(auth.data.storeId)
    this.setData({
      verified: true,
      storeInfo: info.data
    })
  }
})
