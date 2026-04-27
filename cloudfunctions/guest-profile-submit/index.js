const { success, failureByCode } = require("../common/response")
const { ERROR_CODES } = require("../common/error-codes")
const { insert } = require("../common/mock-db")
const { encryptText, hashPhone, maskPhone } = require("../common/crypto-utils")

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

exports.main = async (event, context) => {
  const payload = event || {}
  const required = ["name", "phone", "idNo", "idCardFrontImage", "idCardBackImage"]
  const missingFields = required.filter((field) => !payload[field])
  if (missingFields.length > 0) {
    return failureByCode({
      code: ERROR_CODES.PARAM_ERROR,
      data: { missingFields },
      requestRef: context
    })
  }

  if (!/^1\d{10}$/.test(String(payload.phone))) {
    return failureByCode({
      code: ERROR_CODES.PARAM_ERROR,
      message: "手机号格式不正确",
      data: { invalidField: "phone" },
      requestRef: context
    })
  }

  if (!isIdNo(payload.idNo)) {
    return failureByCode({
      code: ERROR_CODES.PARAM_ERROR,
      message: "身份证号码格式不正确",
      data: { invalidField: "idNo" },
      requestRef: context
    })
  }

  const profileDoc = insert("guest_profiles", {
    booking_id: payload.bookingId || "walkin",
    user_id: payload.userId || "guest_local",
    name: String(payload.name),
    phone_encrypted: encryptText(String(payload.phone)),
    phone_hash: hashPhone(String(payload.phone)),
    phone_masked: maskPhone(String(payload.phone)),
    id_no_encrypted: encryptText(String(payload.idNo).toUpperCase()),
    id_card_front_url: String(payload.idCardFrontImage),
    id_card_back_url: String(payload.idCardBackImage),
    status: "submitted",
    submitted_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })

  return success(
    {
      profileId: profileDoc._id,
      submittedAt: profileDoc.submitted_at
    },
    context
  )
}
