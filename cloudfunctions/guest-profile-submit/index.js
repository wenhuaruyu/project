const { success, failureByCode } = require("../common/response")
const { ERROR_CODES } = require("../common/error-codes")
const { insert } = require("../common/mock-db")
const { encryptText } = require("../common/crypto-utils")
const { logAction } = require("../common/logger")

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
  const checkCode = checkMap[sum % 11]
  return checkCode === source[17]
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

  if (!isIdNo(payload.idNo)) {
    return failureByCode({
      code: ERROR_CODES.PARAM_ERROR,
      data: { invalidField: "idNo" },
      requestRef: context,
      message: "身份证号码格式不正确"
    })
  }

  const profile = insert("guest_profiles", {
    booking_id: payload.bookingId || "walkin",
    user_id: payload.userId || "",
    name: payload.name,
    phone_encrypted: encryptText(payload.phone),
    id_no_encrypted: encryptText(payload.idNo),
    id_card_front_url: payload.idCardFrontImage,
    id_card_back_url: payload.idCardBackImage,
    created_at: new Date().toISOString()
  })

  logAction({
    requestId: context && context.requestId,
    action: "guest-profile-submit.success",
    meta: {
      bookingId: payload.bookingId || "walkin",
      phone: payload.phone,
      idNo: payload.idNo
    }
  })

  return success(
    {
      profileId: profile._id,
      submittedAt: profile.created_at
    },
    context
  )
}
