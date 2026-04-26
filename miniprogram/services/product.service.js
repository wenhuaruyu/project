const { callCloudFunction } = require("../utils/request")

function queryProducts(data) {
  return callCloudFunction("product-query", data)
}

function getProductDetail(productId) {
  return callCloudFunction("product-detail-get", { productId })
}

module.exports = {
  queryProducts,
  getProductDetail
}
