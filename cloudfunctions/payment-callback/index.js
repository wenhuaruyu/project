const { success, failureByCode } = require("../common/response")
const { ERROR_CODES } = require("../common/error-codes")
const { findOne, updateOne, insert } = require("../common/mock-db")
const { logAction } = require("../common/logger")

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
    return success(
      {
        processed: true,
        payStatus: order.pay_status,
        orderStatus: order.order_status
      },
      context
    )
  }

  if (payload.paySuccess === false) {
    return failureByCode({
      code: ERROR_CODES.PAYMENT_SERVICE_ERROR,
      data: { orderId: payload.orderId },
      requestRef: context
    })
  }

  const paid = updateOne(
    "orders",
    (row) => row._id === payload.orderId,
    (row) => ({
      ...row,
      pay_status: "PAID",
      order_status: "PAID",
      paid_at: new Date().toISOString()
    })
  )

  insert("order_logs", {
    order_id: payload.orderId,
    action: "pay",
    operator: "system",
    remark: payload.transactionId || "callback",
    created_at: new Date().toISOString()
  })

  logAction({
    requestId: context && context.requestId,
    action: "payment-callback.success",
    meta: { orderId: payload.orderId }
  })

  return success(
    {
      processed: true,
      payStatus: paid.pay_status,
      orderStatus: paid.order_status
    },
    context
  )
}
