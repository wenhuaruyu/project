const { success, failureByCode } = require("../common/response")
const { ERROR_CODES } = require("../common/error-codes")
const { findOne } = require("../common/mock-db")
const { toGuideDetail } = require("../common/mappers")

exports.main = async (event, context) => {
  const payload = event || {}
  if (!payload.guideId) {
    return failureByCode({
      code: ERROR_CODES.PARAM_ERROR,
      data: { missingFields: ["guideId"] },
      requestRef: context
    })
  }

  const guide = findOne("guides", (row) => row._id === payload.guideId && row.status === "online")
  if (!guide) {
    return failureByCode({
      code: ERROR_CODES.NOT_FOUND,
      requestRef: context
    })
  }

  return success(toGuideDetail(guide), context)
}
