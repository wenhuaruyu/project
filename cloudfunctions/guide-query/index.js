const { success, failureByCode } = require("../common/response")
const { ERROR_CODES } = require("../common/error-codes")
const { findMany } = require("../common/mock-db")
const { toGuideListItem } = require("../common/mappers")

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
  if (pageNo < 1 || pageSize < 1 || pageSize > 20) {
    return failureByCode({
      code: ERROR_CODES.PARAM_ERROR,
      data: { message: "pageNo/pageSize invalid" },
      requestRef: context
    })
  }

  let guides = findMany(
    "guides",
    (row) => row.store_id === payload.storeId && row.status === "online"
  )

  if (payload.category) {
    guides = guides.filter((row) => row.category === payload.category)
  }

  if (payload.sortBy === "distance") {
    guides.sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0))
  } else if (payload.sortBy === "popular") {
    guides.sort((a, b) => (b.popular_score || 0) - (a.popular_score || 0))
  } else {
    guides.sort((a, b) => (a.sort || 0) - (b.sort || 0))
  }

  const total = guides.length
  const offset = (pageNo - 1) * pageSize
  const list = guides.slice(offset, offset + pageSize).map(toGuideListItem)

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
