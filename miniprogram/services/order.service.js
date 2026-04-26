const { callCloudFunction } = require("../utils/request")

function createOrder(data) {
  return callCloudFunction("order-create", data)
}

function payOrder(orderId) {
  return callCloudFunction("order-pay", { orderId })
}

function queryOrderList(data) {
  return callCloudFunction("order-list-query", data)
}

function getOrderDetail(orderId, userId) {
  return callCloudFunction("order-detail-get", { orderId, userId })
}

module.exports = {
  createOrder,
  payOrder,
  queryOrderList,
  getOrderDetail
}
