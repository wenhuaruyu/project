function resolveRequestId(context) {
  return (context && context.requestId) || `req_${Date.now()}`
}

function success(data, context) {
  return {
    code: 0,
    message: "ok",
    data: data || {},
    requestId: resolveRequestId(context)
  }
}

function fail(code, message, data, context) {
  return {
    code,
    message,
    data: data || {},
    requestId: resolveRequestId(context)
  }
}

const STORE = {
  storeId: "store_001",
  name: "桂花小院",
  address: "杭州市西湖区文三路 18 号",
  lat: 30.2741,
  lng: 120.1551,
  wifiName: "GuihuaHome",
  wifiPasswordMasked: "********88",
  contactPhone: "0571-88886666",
  notice: "入住请携带有效证件，22:00 后保持安静。"
}

exports.main = async (event, context) => {
  const payload = event || {}
  if (!payload.storeId) {
    return fail(40001, "参数错误", { missingFields: ["storeId"] }, context)
  }
  if (payload.storeId !== STORE.storeId) {
    return fail(40401, "数据不存在", {}, context)
  }
  return success(STORE, context)
}
