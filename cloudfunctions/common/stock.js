const { ERROR_CODES } = require("./error-codes")
const { findOne, updateOne } = require("./mock-db")

function lockStock(items) {
  for (const item of items) {
    const product = findOne("products", (row) => row._id === item.productId && row.status === "online")
    if (!product || product.stock < item.quantity) {
      return {
        ok: false,
        code: ERROR_CODES.STOCK_INSUFFICIENT,
        reason: "stock_check_failed"
      }
    }
  }

  for (const item of items) {
    updateOne(
      "products",
      (row) => row._id === item.productId,
      (row) => ({
        ...row,
        stock: row.stock - item.quantity,
        updated_at: new Date().toISOString()
      })
    )
  }

  return { ok: true }
}

function releaseStock(items) {
  for (const item of items) {
    updateOne(
      "products",
      (row) => row._id === item.product_id,
      (row) => ({
        ...row,
        stock: row.stock + item.quantity,
        updated_at: new Date().toISOString()
      })
    )
  }
}

module.exports = {
  lockStock,
  releaseStock
}
