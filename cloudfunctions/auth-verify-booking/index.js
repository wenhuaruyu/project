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

exports.main = async (event, context) => {
  const payload = event || {}
  if (!payload.phone) {
    return fail(40001, "参数错误", { missingFields: ["phone"] }, context)
  }

  return success(
    {
      verified: true,
      userId: `user_${Date.now()}`,
      bookingId: payload.bookingNo ? `booking_${payload.bookingNo}` : "walkin",
      storeId: "store_001"
    },
    context
  )
}
