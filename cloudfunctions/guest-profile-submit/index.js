const { success, failureByCode } = require("../common/response")
const { ERROR_CODES } = require("../common/error-codes")
const { findOne, insert } = require("../common/mock-db")
const { encryptText } = require("../common/crypto-utils")
const { logAction } = require("../common/logger")

exports.main = async (event, context) => {
  const payload = event || {}
  const required = ["bookingId", "name", "phone", "arrivalTime"]
  const missingFields = required.filter((field) => !payload[field])
  if (missingFields.length > 0) {
    return failureByCode({
      code: ERROR_CODES.PARAM_ERROR,
      data: { missingFields },
      requestRef: context
    })
  }

  const booking = findOne("bookings", (row) => row._id === payload.bookingId)
  if (!booking) {
    return failureByCode({
      code: ERROR_CODES.NOT_FOUND,
      requestRef: context
    })
  }

  const profile = insert("guest_profiles", {
    booking_id: payload.bookingId,
    user_id: payload.userId || "",
    name: payload.name,
    phone_encrypted: encryptText(payload.phone),
    id_no_encrypted: encryptText(payload.idNo || ""),
    arrival_time: payload.arrivalTime,
    special_needs: payload.specialNeeds || "",
    created_at: new Date().toISOString()
  })

  logAction({
    requestId: context && context.requestId,
    action: "guest-profile-submit.success",
    meta: {
      bookingId: payload.bookingId,
      phone: payload.phone,
      idNo: payload.idNo || ""
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
