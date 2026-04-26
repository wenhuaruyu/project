const { success, failureByCode } = require("../common/response")
const { ERROR_CODES } = require("../common/error-codes")
const { findOne, updateOne } = require("../common/mock-db")
const { releaseStock } = require("../common/stock")

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

  if (order.pay_status === "PAID") {
    return failureByCode({
      code: ERROR_CODES.ORDER_STATUS_CONFLICT,
      data: { orderStatus: order.order_status, payStatus: order.pay_status },
      requestRef: context
    })
  }

  if (order.expire_at && new Date(order.expire_at).getTime() < Date.now()) {
    const cancelled = updateOne(
      "orders",
      (row) => row._id === payload.orderId,
      (row) => ({ ...row, order_status: "CANCELLED", updated_at: new Date().toISOString() })
    )
    if (cancelled) {
      releaseStock(cancelled.items)
    }
    return failureByCode({
      code: ERROR_CODES.ORDER_STATUS_CONFLICT,
      data: { orderStatus: "CANCELLED" },
      requestRef: context
    })
  }

  return success(
    {
      paymentParams: {
        timeStamp: String(Date.now()),
        nonceStr: Math.random().toString(36).slice(2, 10),
        package: `prepay_id=${payload.orderId}`,
        signType: "RSA",
        paySign: `mock_sign_${payload.orderId}`
      }
    },
    context
  )
}
