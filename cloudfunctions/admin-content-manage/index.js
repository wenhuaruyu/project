const { success, failureByCode } = require("../common/response")
const { ERROR_CODES } = require("../common/error-codes")
const { findOne, insert, updateOne } = require("../common/mock-db")
const { generateId } = require("../common/id")

exports.main = async (event, context) => {
  const payload = event || {}
  if (!payload.isAdmin) {
    return failureByCode({
      code: ERROR_CODES.FORBIDDEN,
      requestRef: context
    })
  }

  if (!payload.resource || !payload.action) {
    return failureByCode({
      code: ERROR_CODES.PARAM_ERROR,
      data: { missingFields: ["resource", "action"] },
      requestRef: context
    })
  }

  const collection = payload.resource === "guide" ? "guides" : payload.resource === "product" ? "products" : ""
  if (!collection) {
    return failureByCode({
      code: ERROR_CODES.PARAM_ERROR,
      data: { message: "resource must be guide/product" },
      requestRef: context
    })
  }

  const data = payload.payload || {}
  let result = null

  if (payload.action === "create") {
    result = insert(collection, {
      _id: data.id || generateId(payload.resource),
      ...data,
      updated_at: new Date().toISOString()
    })
  } else if (payload.action === "update") {
    const targetId = data.guideId || data.productId || data.id
    if (!targetId) {
      return failureByCode({
        code: ERROR_CODES.PARAM_ERROR,
        data: { missingFields: ["guideId/productId"] },
        requestRef: context
      })
    }
    result = updateOne(collection, (row) => row._id === targetId, (row) => ({ ...row, ...data, updated_at: new Date().toISOString() }))
  } else if (payload.action === "setStatus") {
    const targetId = data.guideId || data.productId || data.id
    result = updateOne(collection, (row) => row._id === targetId, (row) => ({ ...row, status: data.status, updated_at: new Date().toISOString() }))
  } else if (payload.action === "sort") {
    const targetId = data.guideId || data.productId || data.id
    result = updateOne(collection, (row) => row._id === targetId, (row) => ({ ...row, sort: Number(data.sort || 0), updated_at: new Date().toISOString() }))
  }

  if (!result) {
    return failureByCode({
      code: ERROR_CODES.NOT_FOUND,
      requestRef: context
    })
  }

  return success(
    {
      operated: true,
      resource: payload.resource,
      action: payload.action,
      resourceId: result._id
    },
    context
  )
}
