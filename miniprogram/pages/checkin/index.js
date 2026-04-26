const { submitGuestProfile } = require("../../services/checkin.service")
const { isPhone, isIdNo, required } = require("../../utils/validate")

Page({
  data: {
    userId: "",
    name: "",
    phone: "",
    idNo: "",
    idCardFrontImage: "",
    idCardBackImage: "",
    submitResult: null,
    loading: false
  },

  onLoad(query) {
    this.setData({
      userId: query.userId || ""
    })
  },

  onChangeName(e) {
    this.setData({ name: e.detail.value.trim() })
  },

  onChangePhone(e) {
    this.setData({ phone: e.detail.value.trim() })
  },

  onChangeIdNo(e) {
    this.setData({ idNo: e.detail.value.trim() })
  },

  chooseImage(fieldName) {
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      sourceType: ["album", "camera"],
      success: (res) => {
        const filePath =
          res && res.tempFiles && res.tempFiles[0] ? res.tempFiles[0].tempFilePath : ""
        if (!filePath) {
          return
        }
        this.setData({ [fieldName]: filePath })
      },
      fail: (error) => {
        this.showRequestError(error, "选择图片失败")
      }
    })
  },

  onChooseIdCardFront() {
    this.chooseImage("idCardFrontImage")
  },

  onChooseIdCardBack() {
    this.chooseImage("idCardBackImage")
  },

  async onSubmitProfile() {
    const payload = {
      userId: this.data.userId,
      name: this.data.name,
      phone: this.data.phone,
      idNo: this.data.idNo,
      idCardFrontImage: this.data.idCardFrontImage,
      idCardBackImage: this.data.idCardBackImage
    }

    const missing = ["name", "phone", "idNo", "idCardFrontImage", "idCardBackImage"].filter(
      (key) => !required(payload[key])
    )
    if (missing.length > 0) {
      wx.showToast({ title: "请填写必填项", icon: "none" })
      return
    }
    if (!isPhone(payload.phone)) {
      wx.showToast({ title: "手机号格式不正确", icon: "none" })
      return
    }
    if (!isIdNo(payload.idNo)) {
      wx.showToast({ title: "身份证号码格式不正确", icon: "none" })
      return
    }

    this.setData({ loading: true })
    try {
      const res = await submitGuestProfile(payload)
      this.setData({ submitResult: res.data })
      wx.showToast({ title: "提交成功", icon: "success" })
    } catch (error) {
      this.showRequestError(error, "提交失败")
    } finally {
      this.setData({ loading: false })
    }
  },

  showRequestError(error, fallbackTitle) {
    const codeText = error && error.code ? `(${error.code})` : ""
    const message = error && error.message ? error.message : fallbackTitle
    wx.showToast({
      title: `${message}${codeText}`,
      icon: "none"
    })
    console.error("checkin request failed", {
      code: error && error.code,
      message: error && error.message,
      requestId: error && error.requestId,
      data: error && error.data
    })
  }
})
