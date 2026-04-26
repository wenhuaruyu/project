const { success, failureByCode } = require("../common/response")
const { ERROR_CODES } = require("../common/error-codes")
const { findOne, insert } = require("../common/mock-db")
const { hashPhone, maskPhone } = require("../common/crypto-utils")
const { logAction } = require("../common/logger")
const { generateId } = require("../common/id")

function createWalkInBooking(phoneHash) {
  const now = new Date()
  const checkinDate = now.toISOString().slice(0, 10)
  const checkoutDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)

  return insert("bookings", {
    booking_no: generateId("walkin"),
    guest_phone_hash: phoneHash,
    store_id: "store_001",
    checkin_date: checkinDate,
    checkout_date: checkoutDate,
    status: "booked",
    created_at: now.toISOString()
  })
}

exports.main = async (event, context) => {
  const payload = event || {}
  const requestId = context && context.requestId
  if (!payload.phone) {
    return failureByCode({
      code: ERROR_CODES.PARAM_ERROR,
      data: {
        missingFields: ["phone"].filter((field) => !payload[field])
      },
      requestRef: context
    })
  }

  const phoneHash = hashPhone(payload.phone)
  let booking = null

  if (payload.bookingNo) {
    booking = findOne(
      "bookings",
      (row) =>
        row.booking_no === payload.bookingNo &&
        row.guest_phone_hash === phoneHash &&
        row.status !== "cancelled"
    )
    if (!booking) {
      return failureByCode({
        code: ERROR_CODES.BOOKING_VERIFY_FAILED,
        requestRef: context
      })
    }
  } else {
    booking = findOne(
      "bookings",
      (row) => row.guest_phone_hash === phoneHash && row.status !== "cancelled"
    )
    if (!booking) {
      booking = createWalkInBooking(phoneHash)
    }
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
      bookingNo: payload.bookingNo || "",
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
