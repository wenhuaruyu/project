const crypto = require("crypto")

function resolveRequestId(context) {
  return (context && context.requestId) || `req_${Date.now()}`
}

function success(data, context) {
  return {
    code: 0,
    message: "ok",
    data: data || {},
    requestId: resolveRequestId(context)
  }
}

function fail(code, message, data, context) {
  return {
    code,
    message,
    data: data || {},
    requestId: resolveRequestId(context)
  }
}

function isIdNo(idNo) {
  const source = String(idNo || "").toUpperCase()
  if (!/^\d{17}[\dX]$/.test(source)) {
    return false
  }
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checkMap = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"]
  const sum = source
    .slice(0, 17)
    .split("")
    .reduce((acc, num, index) => acc + Number(num) * weights[index], 0)
  return checkMap[sum % 11] === source[17]
}

function encryptText(raw) {
  const key = crypto.createHash("sha256").update("guihua-home-dev-key").digest()
  const iv = Buffer.alloc(16, 0)
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv)
  return Buffer.concat([cipher.update(String(raw), "utf8"), cipher.final()]).toString("base64")
}

exports.main = async (event, context) => {
  const payload = event || {}
  const required = ["name", "phone", "idNo", "idCardFrontImage", "idCardBackImage"]
  const missingFields = required.filter((field) => !payload[field])
  if (missingFields.length > 0) {
    return fail(40001, "参数错误", { missingFields }, context)
  }
  if (!/^1\d{10}$/.test(String(payload.phone))) {
    return fail(40001, "手机号格式不正确", { invalidField: "phone" }, context)
  }
  if (!isIdNo(payload.idNo)) {
    return fail(40001, "身份证号码格式不正确", { invalidField: "idNo" }, context)
  }

  return success(
    {
      profileId: `guest_profile_${Date.now()}`,
      submittedAt: new Date().toISOString(),
      preview: {
        phoneEncrypted: encryptText(payload.phone),
        idNoEncrypted: encryptText(payload.idNo)
      }
    },
    context
  )
}
