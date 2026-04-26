function callCloudFunction(name, data) {
  return wx.cloud.callFunction({ name, data }).then((res) => {
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
