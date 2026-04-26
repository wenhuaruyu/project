function callCloudFunction(name, data) {
  if (typeof name !== "string" || name.trim() === "") {
    throw new Error("云函数名称缺失，请检查 callCloudFunction(name, data) 的 name 参数。")
  }

  const app = getApp && getApp()
  if (app && app.globalData && app.globalData.cloudReady === false) {
    throw new Error("云开发未初始化成功，请先检查环境绑定与权限。")
  }

  return wx.cloud.callFunction({ name: name, data: data }).then((res) => {
    const payload = res.result || {}
    if (payload.code !== 0) {
      const error = new Error(payload.message || "request failed")
      error.code = payload.code
      error.requestId = payload.requestId
      error.data = payload.data
      throw error
    }
    return payload
  })
}

module.exports = {
  callCloudFunction
}
