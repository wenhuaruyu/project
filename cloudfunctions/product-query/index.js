const { success, failureByCode } = require("../common/response")
const { ERROR_CODES } = require("../common/error-codes")
const { findMany } = require("../common/mock-db")
const { toProductListItem } = require("../common/mappers")

exports.main = async (event, context) => {
  const payload = event || {}
  if (!payload.storeId) {
    return failureByCode({
      code: ERROR_CODES.PARAM_ERROR,
      data: { missingFields: ["storeId"] },
      requestRef: context
    })
  }

  const pageNo = Number(payload.pageNo || 1)
  const pageSize = Number(payload.pageSize || 10)

  let products = findMany(
    "products",
    (row) => row.store_id === payload.storeId && row.status === "online"
  )
  if (payload.category) {
    products = products.filter((row) => row.category === payload.category)
  }
  const total = products.length
  const offset = (pageNo - 1) * pageSize

  return success(
    {
      list: products.slice(offset, offset + pageSize).map(toProductListItem),
      total,
      pageNo,
      pageSize
    },
    context
  )
}
