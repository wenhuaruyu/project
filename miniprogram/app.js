const { resolveAppEnv } = require("./constants/env-profile")
const { resolveCloudEnvId } = require("./constants/cloud-env")

App({
  globalData: {
    appEnv: "dev",
    cloudEnvId: "",
    cloudReady: false,
    forceLocalMock: false
  },

  onLaunch() {
    const accountInfo = wx.getAccountInfoSync()
    const envVersion =
      accountInfo && accountInfo.miniProgram
        ? accountInfo.miniProgram.envVersion
        : "develop"

    const appEnv = resolveAppEnv(envVersion)
    const cloudEnvId = resolveCloudEnvId(appEnv)
    this.globalData.appEnv = appEnv
    this.globalData.cloudEnvId = cloudEnvId
    this.globalData.forceLocalMock = appEnv === "dev"

    if (!wx.cloud) {
      throw new Error("wx.cloud is not available. Please use a supported base library.")
    }

    try {
      wx.cloud.init({
        env: cloudEnvId,
        traceUser: true
      })
      this.globalData.cloudReady = true
      return
    } catch (error) {
      console.warn("cloud init with fixed env failed", { appEnv, cloudEnvId, error })
    }

    try {
      wx.cloud.init({
        env: wx.cloud.DYNAMIC_CURRENT_ENV,
        traceUser: true
      })
      this.globalData.cloudReady = true
      this.globalData.cloudEnvId = "dynamic_current_env"
    } catch (error) {
      console.error("cloud init failed", { appEnv, cloudEnvId, error })
      wx.showModal({
        title: "云开发初始化失败",
        content:
          "请先在微信开发者工具开通并绑定云开发环境，或确认当前微信号已加入小程序开发成员。",
        showCancel: false
      })
    }
  }
})
