const { success, failureByCode } = require("../common/response")
const { ERROR_CODES } = require("../common/error-codes")
const { findOne, insert } = require("../common/mock-db")
const { generateId } = require("../common/id")
const { lockStock } = require("../common/stock")
const { logAction } = require("../common/logger")

exports.main = async (event, context) => {
  const payload = event || {}
  const required = ["storeId", "deliveryType", "items"]
  const missingFields = required.filter((field) => !payload[field])
  if (missingFields.length > 0 || !Array.isArray(payload.items) || payload.items.length === 0) {
    return failureByCode({
      code: ERROR_CODES.PARAM_ERROR,
      data: { missingFields },
      requestRef: context
    })
  }

  const itemsForLock = []
  const orderItems = []
  let amountTotal = 0

  for (const item of payload.items) {
    const product = findOne(
      "products",
      (row) => row._id === item.productId && row.store_id === payload.storeId && row.status === "online"
    )
    if (!product) {
      return failureByCode({
        code: ERROR_CODES.NOT_FOUND,
        data: { productId: item.productId },
        requestRef: context
      })
    }

    const quantity = Number(item.quantity || 0)
    if (quantity < 1) {
      return failureByCode({
        code: ERROR_CODES.PARAM_ERROR,
        data: { invalidField: "quantity" },
        requestRef: context
      })
    }

    const amountSubtotal = product.price * quantity
    amountTotal += amountSubtotal
    itemsForLock.push({ productId: item.productId, quantity })
    orderItems.push({
      product_id: item.productId,
      sku_id: item.skuId || "",
      product_name: product.name,
      price: product.price,
      quantity,
      amount_subtotal: amountSubtotal
    })
  }

  if (payload.forceStockInsufficient) {
    return failureByCode({
      code: ERROR_CODES.STOCK_INSUFFICIENT,
      data: {
        reason: "stock_check_failed"
      },
      requestRef: context
    })
  }

  const lockResult = lockStock(itemsForLock)
  if (!lockResult.ok) {
    return failureByCode({
      code: lockResult.code,
      data: { reason: lockResult.reason },
      requestRef: context
    })
  }

  const now = Date.now()
  const expiredAt = new Date(now + 30 * 60 * 1000).toISOString()
  const order = insert("orders", {
    order_no: generateId("orderno"),
    user_id: payload.userId || "",
    store_id: payload.storeId,
    items: orderItems,
    amount_total: amountTotal,
    pay_status: "UNPAID",
    order_status: "PENDING_PAY",
    delivery_type: payload.deliveryType,
    address: payload.address || {},
    remark: payload.remark || "",
    expire_at: expiredAt,
    paid_at: "",
    created_at: new Date(now).toISOString()
  })

  logAction({
    requestId: context && context.requestId,
    action: "order-create.success",
    meta: {
      orderId: order._id,
      amountTotal,
      items: payload.items.length
    }
  })

  return success(
    {
      orderId: order._id,
      orderNo: order.order_no,
      amountTotal: order.amount_total,
      expiredAt: order.expire_at
    },
    context
  )
}
