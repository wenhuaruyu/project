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
    idCardFrontPreview: "",
    idCardBackPreview: "",
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

  uploadImageToCloud(tempFilePath, folder) {
    const ext = tempFilePath.includes(".")
      ? tempFilePath.slice(tempFilePath.lastIndexOf("."))
      : ".jpg"
    const cloudPath = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`
    return wx.cloud.uploadFile({
      cloudPath,
      filePath: tempFilePath
    })
  },

  chooseImage(fileFieldName, previewFieldName, folder) {
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      sourceType: ["album", "camera"],
      success: async (res) => {
        const filePath =
          res && res.tempFiles && res.tempFiles[0] ? res.tempFiles[0].tempFilePath : ""
        if (!filePath) {
          return
        }

        const app = getApp && getApp()
        if (app && app.globalData && app.globalData.forceLocalMock) {
          this.setData({
            [fileFieldName]: filePath,
            [previewFieldName]: filePath
          })
          wx.showToast({ title: "开发模式：已使用本地图片", icon: "none" })
          return
        }

        let loadingShown = false
        try {
          wx.showLoading({ title: "上传中", mask: true })
          loadingShown = true
          const uploadRes = await this.uploadImageToCloud(filePath, folder)
          this.setData({
            [fileFieldName]: uploadRes.fileID,
            [previewFieldName]: filePath
          })
          wx.showToast({ title: "上传成功", icon: "success" })
        } catch (error) {
          const errorMsg = String((error && (error.errMsg || error.message)) || "")
          const codeMatch = errorMsg.match(/errCode:\s*(-?\d+)/i)
          const code = codeMatch ? Number(codeMatch[1]) : undefined
          const useLocalImage = code === -501000 || code === 501000 || code === -504002 || code === 504002
          if (useLocalImage) {
            this.setData({
              [fileFieldName]: filePath,
              [previewFieldName]: filePath
            })
            wx.showToast({ title: "云端上传异常，已使用本地图片", icon: "none" })
            return
          }
          this.showRequestError(error, "上传失败")
        } finally {
          if (loadingShown) {
            wx.hideLoading()
          }
        }
      },
      fail: (error) => {
        this.showRequestError(error, "选择图片失败")
      }
    })
  },

  onChooseIdCardFront() {
    this.chooseImage("idCardFrontImage", "idCardFrontPreview", "id-cards/front")
  },

  onChooseIdCardBack() {
    this.chooseImage("idCardBackImage", "idCardBackPreview", "id-cards/back")
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
