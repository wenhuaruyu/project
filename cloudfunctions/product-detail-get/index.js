const { success, failureByCode } = require("../common/response")
const { ERROR_CODES } = require("../common/error-codes")
const { findOne } = require("../common/mock-db")
const { toProductListItem } = require("../common/mappers")

exports.main = async (event, context) => {
  const payload = event || {}
  if (!payload.productId) {
    return failureByCode({
      code: ERROR_CODES.PARAM_ERROR,
      data: { missingFields: ["productId"] },
      requestRef: context
    })
  }

  const product = findOne("products", (row) => row._id === payload.productId && row.status === "online")
  if (!product) {
    return failureByCode({
      code: ERROR_CODES.NOT_FOUND,
      requestRef: context
    })
  }

  return success(
    {
      ...toProductListItem(product),
      images: product.images || [],
      desc: product.desc || ""
    },
    context
  )
}
