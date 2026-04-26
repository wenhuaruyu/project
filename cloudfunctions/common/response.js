const DEFAULT_SUCCESS_CODE = 0
const DEFAULT_SUCCESS_MESSAGE = "ok"
const { resolveErrorMessage } = require("./error-codes")

function createFallbackRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

function resolveRequestId(requestRef) {
  if (typeof requestRef === "string" && requestRef.trim() !== "") {
    return requestRef
  }

  if (requestRef && typeof requestRef === "object") {
    const candidate =
      requestRef.requestId || requestRef.awsRequestId || requestRef.request_id
    if (typeof candidate === "string" && candidate.trim() !== "") {
      return candidate
    }
  }

  return createFallbackRequestId()
}

function buildResponse({ code, message, data, requestRef }) {
  return {
    code,
    message,
    data,
    requestId: resolveRequestId(requestRef)
  }
}

function success(data = {}, requestRef) {
  return buildResponse({
    code: DEFAULT_SUCCESS_CODE,
    message: DEFAULT_SUCCESS_MESSAGE,
    data,
    requestRef
  })
}

function failure({ code, message, data = {}, requestRef }) {
  return buildResponse({
    code,
    message,
    data,
    requestRef
  })
}

function failureByCode({ code, data = {}, requestRef, message }) {
  return failure({
    code,
    message: message || resolveErrorMessage(code),
    data,
    requestRef
  })
}

module.exports = {
  success,
  failure,
  failureByCode
}
