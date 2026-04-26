const { success, failureByCode } = require("../common/response")
const { ERROR_CODES } = require("../common/error-codes")
const { findMany } = require("../common/mock-db")
const { toOrderData } = require("../common/mappers")

exports.main = async (event, context) => {
  const payload = event || {}
  if (!payload.userId) {
    return failureByCode({
      code: ERROR_CODES.UNAUTHORIZED,
      requestRef: context
    })
  }

  const pageNo = Number(payload.pageNo || 1)
  const pageSize = Number(payload.pageSize || 10)

  let orders = findMany("orders", (row) => row.user_id === payload.userId)
  if (payload.status) {
    orders = orders.filter((row) => row.order_status === payload.status)
  }
  orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const total = orders.length
  const offset = (pageNo - 1) * pageSize
  const list = orders.slice(offset, offset + pageSize).map(toOrderData)

  return success(
    {
      list,
      total,
      pageNo,
      pageSize
    },
    context
  )
}
