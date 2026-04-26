const { decryptText, maskSecret } = require("./crypto-utils")

function toStoreInfoData(store) {
  const wifiPassword = decryptText(store.wifi_password_encrypted)
  return {
    storeId: store._id,
    name: store.name,
    address: store.address,
    lat: store.lat,
    lng: store.lng,
    wifiName: store.wifi_name,
    wifiPasswordMasked: maskSecret(wifiPassword),
    contactPhone: store.contact_phone,
    notice: store.notice || ""
  }
}

function toGuideListItem(guide) {
  return {
    guideId: guide._id,
    title: guide.title,
    category: guide.category,
    coverUrl: guide.cover_url,
    distanceKm: guide.distance_km,
    durationText: guide.duration_text,
    tips: guide.tips
  }
}

function toGuideDetail(guide) {
  return {
    guideId: guide._id,
    title: guide.title,
    category: guide.category,
    content: guide.content,
    traffic: guide.traffic || {},
    durationText: guide.duration_text || "",
    tips: guide.tips || ""
  }
}

function toProductListItem(product) {
  return {
    productId: product._id,
    name: product.name,
    category: product.category,
    price: product.price,
    stock: product.stock,
    coverUrl: product.cover_url,
    status: product.status
  }
}

function toOrderData(order) {
  return {
    orderId: order._id,
    orderNo: order.order_no,
    amountTotal: order.amount_total,
    payStatus: order.pay_status,
    orderStatus: order.order_status,
    deliveryType: order.delivery_type,
    remark: order.remark || "",
    expiredAt: order.expire_at || "",
    paidAt: order.paid_at || "",
    createdAt: order.created_at,
    items: order.items.map((item) => ({
      productId: item.product_id,
      productName: item.product_name,
      price: item.price,
      quantity: item.quantity,
      amountSubtotal: item.amount_subtotal
    }))
  }
}

module.exports = {
  toStoreInfoData,
  toGuideListItem,
  toGuideDetail,
  toProductListItem,
  toOrderData
}
