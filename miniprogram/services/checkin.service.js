const { callCloudFunction } = require("../utils/request")

function getStoreInfo(storeId) {
  return callCloudFunction("store-info-get", { storeId })
}

function submitGuestProfile(data) {
  return callCloudFunction("guest-profile-submit", data)
}

module.exports = {
  getStoreInfo,
  submitGuestProfile
}
