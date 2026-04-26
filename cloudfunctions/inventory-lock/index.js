const { success, failureByCode } = require("../common/response")
const { ERROR_CODES } = require("../common/error-codes")
const { lockStock, releaseStock } = require("../common/stock")

exports.main = async (event, context) => {
  const payload = event || {}
  if (!payload.action || !Array.isArray(payload.items)) {
    return failureByCode({
      code: ERROR_CODES.PARAM_ERROR,
      data: { missingFields: ["action", "items"] },
      requestRef: context
    })
  }

  if (payload.action === "lock") {
    const result = lockStock(payload.items)
    if (!result.ok) {
      return failureByCode({
        code: result.code,
        data: { reason: result.reason },
        requestRef: context
      })
    }
  }

  if (payload.action === "release") {
    releaseStock(
      payload.items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity
      }))
    )
  }

  return success(
    {
      locked: payload.action === "lock"
    },
    context
  )
}
