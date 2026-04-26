const { callCloudFunction } = require("../utils/request")

function queryGuides(data) {
  return callCloudFunction("guide-query", data)
}

function getGuideDetail(guideId) {
  return callCloudFunction("guide-detail-get", { guideId })
}

module.exports = {
  queryGuides,
  getGuideDetail
}
