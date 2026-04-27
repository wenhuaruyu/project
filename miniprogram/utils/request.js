const { executeLocalMock, canHandleLocalMock } = require("./local-mock-functions")

function parseErrCode(rawError) {
  const errMsg =
    (rawError && (rawError.errMsg || rawError.message)) ||
    "cloud.callFunction:fail unknown error"
  const codeMatch = String(errMsg).match(/errCode:\s*(-?\d+)/i)
  return {
    errMsg,
    code: codeMatch ? Number(codeMatch[1]) : undefined
  }
}

function isLocalFallbackCode(code) {
  return code === -501000 || code === 501000 || code === -504002 || code === 504002
}

function callCloudFunction(name, data) {
  if (typeof name !== "string" || name.trim() === "") {
    throw new Error("云函数名称缺失，请检查 callCloudFunction(name, data) 的 name 参数。")
  }

  const app = getApp && getApp()
  if (app && app.globalData && app.globalData.cloudReady === false) {
    if (canHandleLocalMock(name)) {
      return Promise.resolve(executeLocalMock(name, data))
    }
    throw new Error("云开发未初始化成功，请先检查环境绑定与权限。")
  }

  if (app && app.globalData && app.globalData.forceLocalMock && canHandleLocalMock(name)) {
    return Promise.resolve(executeLocalMock(name, data))
  }

  return wx.cloud
    .callFunction({ name: name, data: data })
    .then((res) => {
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
    .catch((rawError) => {
      const parsed = parseErrCode(rawError)
      const resolvedCode = parsed.code

      if (isLocalFallbackCode(resolvedCode) || canHandleLocalMock(name)) {
        const localResult = executeLocalMock(name, data)
        if (localResult.code === 0) {
          wx.showToast({
            title: "云端调用异常，已切换本地演示模式",
            icon: "none"
          })
          return localResult
        }
      }

      const error = new Error(parsed.errMsg)
      error.code = resolvedCode
      error.requestId = rawError && (rawError.requestId || rawError.callId)
      error.data = rawError
      error.functionName = name
      throw error
    })
}

module.exports = {
  callCloudFunction
}
