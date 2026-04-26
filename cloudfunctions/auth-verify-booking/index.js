const { success, failureByCode } = require("../common/response")
const { ERROR_CODES } = require("../common/error-codes")
const { findOne, insert } = require("../common/mock-db")
const { hashPhone, maskPhone } = require("../common/crypto-utils")
const { logAction } = require("../common/logger")

exports.main = async (event, context) => {
  const payload = event || {}
  const requestId = context && context.requestId
  if (!payload.bookingNo || !payload.phone) {
    return failureByCode({
      code: ERROR_CODES.PARAM_ERROR,
      data: {
        missingFields: ["bookingNo", "phone"].filter((field) => !payload[field])
      },
      requestRef: context
    })
  }

  const booking = findOne(
    "bookings",
    (row) =>
      row.booking_no === payload.bookingNo &&
      row.guest_phone_hash === hashPhone(payload.phone) &&
      row.status !== "cancelled"
  )
  if (!booking) {
    return failureByCode({
      code: ERROR_CODES.BOOKING_VERIFY_FAILED,
      requestRef: context
    })
  }

  let user = findOne("users", (row) => row.openid === payload.openid)
  if (!user) {
    user = insert("users", {
      openid: payload.openid || `openid_${payload.phone}`,
      phone_masked: maskPhone(payload.phone),
      role: "customer",
      status: "active",
      created_at: new Date().toISOString()
    })
  }

  logAction({
    requestId,
    action: "auth-verify-booking.success",
    meta: {
      bookingNo: payload.bookingNo,
      phone: payload.phone,
      bookingId: booking._id,
      storeId: booking.store_id
    }
  })

  return success(
    {
      verified: true,
      userId: user._id,
      bookingId: booking._id,
      storeId: booking.store_id
    },
    context
  )
}
