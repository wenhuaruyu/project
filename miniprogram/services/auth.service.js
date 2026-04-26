const { callCloudFunction } = require("../utils/request")

function verifyBooking(data) {
  return callCloudFunction("auth-verify-booking", data)
}

module.exports = {
  verifyBooking
}
