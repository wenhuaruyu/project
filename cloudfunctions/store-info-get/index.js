const { success, failureByCode } = require("../common/response")
const { ERROR_CODES } = require("../common/error-codes")
const { findOne } = require("../common/mock-db")
const { toStoreInfoData } = require("../common/mappers")

exports.main = async (event, context) => {
  const payload = event || {}
  if (!payload.storeId) {
    return failureByCode({
      code: ERROR_CODES.PARAM_ERROR,
      data: { missingFields: ["storeId"] },
      requestRef: context
    })
  }

  const store = findOne(
    "stores",
    (row) => row._id === payload.storeId && row.status === "active"
  )
  if (!store) {
    return failureByCode({
      code: ERROR_CODES.NOT_FOUND,
      requestRef: context
    })
  }

  return success(toStoreInfoData(store), context)
}
