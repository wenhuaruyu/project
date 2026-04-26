const { success, failureByCode } = require("../common/response")
const { ERROR_CODES } = require("../common/error-codes")
const { findOne } = require("../common/mock-db")
const { toOrderData } = require("../common/mappers")

exports.main = async (event, context) => {
  const payload = event || {}
  if (!payload.orderId) {
    return failureByCode({
      code: ERROR_CODES.PARAM_ERROR,
      data: { missingFields: ["orderId"] },
      requestRef: context
    })
  }

  const order = findOne("orders", (row) => row._id === payload.orderId)
  if (!order) {
    return failureByCode({
      code: ERROR_CODES.NOT_FOUND,
      requestRef: context
    })
  }

  const isAdmin = Boolean(payload.isAdmin)
  if (!isAdmin && payload.userId !== order.user_id) {
    return failureByCode({
      code: ERROR_CODES.FORBIDDEN,
      requestRef: context
    })
  }

  return success(toOrderData(order), context)
}
