function createRequestId() {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function success(data) {
  return {
    code: 0,
    message: "ok",
    data: data || {},
    requestId: createRequestId()
  }
}

function fail(code, message, data) {
  return {
    code,
    message,
    data: data || {},
    requestId: createRequestId()
  }
}

function isIdNo(idNo) {
  const source = String(idNo || "").toUpperCase()
  if (!/^\d{17}[\dX]$/.test(source)) {
    return false
  }
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checkMap = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"]
  const sum = source
    .slice(0, 17)
    .split("")
    .reduce((acc, num, index) => acc + Number(num) * weights[index], 0)
  return checkMap[sum % 11] === source[17]
}

function executeLocalMock(name, data) {
  const payload = data || {}

  if (name === "auth-verify-booking") {
    if (!payload.phone) {
      return fail(40001, "参数错误", { missingFields: ["phone"] })
    }
    return success({
      verified: true,
      userId: `user_${Date.now()}`,
      bookingId: "walkin",
      storeId: "store_001"
    })
  }

  if (name === "store-info-get") {
    if (!payload.storeId) {
      return fail(40001, "参数错误", { missingFields: ["storeId"] })
    }
    if (payload.storeId !== "store_001") {
      return fail(40401, "数据不存在", {})
    }
    return success({
      storeId: "store_001",
      name: "桂花小院",
      address: "杭州市西湖区文三路 18 号",
      lat: 30.2741,
      lng: 120.1551,
      wifiName: "GuihuaHome",
      wifiPasswordMasked: "********88",
      contactPhone: "0571-88886666",
      notice: "入住请携带有效证件，22:00 后保持安静。"
    })
  }

  if (name === "guest-profile-submit") {
    const required = ["name", "phone", "idNo", "idCardFrontImage", "idCardBackImage"]
    const missingFields = required.filter((field) => !payload[field])
    if (missingFields.length > 0) {
      return fail(40001, "参数错误", { missingFields })
    }
    if (!/^1\d{10}$/.test(String(payload.phone))) {
      return fail(40001, "手机号格式不正确", { invalidField: "phone" })
    }
    if (!isIdNo(payload.idNo)) {
      return fail(40001, "身份证号码格式不正确", { invalidField: "idNo" })
    }
    return success({
      profileId: `guest_profile_${Date.now()}`,
      submittedAt: new Date().toISOString()
    })
  }

  return fail(40401, `未找到本地模拟函数: ${name}`, {})
}

function canHandleLocalMock(name) {
  return (
    name === "auth-verify-booking" ||
    name === "store-info-get" ||
    name === "guest-profile-submit"
  )
}

module.exports = {
  executeLocalMock,
  canHandleLocalMock
}
