function createRequestId() {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

const mockState = {
  products: [
    {
      productId: "product_001",
      name: "桂花龙井礼盒",
      category: "giftbox",
      price: 12800,
      stock: 30,
      coverUrl: "",
      status: "online",
      images: [],
      desc: "桂花香型龙井礼盒装"
    },
    {
      productId: "product_002",
      name: "手作桂花香囊",
      category: "souvenir",
      price: 3900,
      stock: 100,
      coverUrl: "",
      status: "online",
      images: [],
      desc: "便携香囊"
    }
  ],
  orders: []
}

function success(data) {
  return {
    code: 0,
    message: "ok",
    data: data || {},
    requestId: createRequestId()
  }
}

function fail(code, message, data) {
  return {
    code,
    message,
    data: data || {},
    requestId: createRequestId()
  }
}

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
  return checkMap[sum % 11] === source[17]
}

function executeLocalMock(name, data) {
  const payload = data || {}

  if (name === "auth-verify-booking") {
    if (!payload.phone) {
      return fail(40001, "参数错误", { missingFields: ["phone"] })
    }
    return success({
      verified: true,
      userId: `user_${Date.now()}`,
      bookingId: "walkin",
      storeId: "store_001"
    })
  }

  if (name === "store-info-get") {
    if (!payload.storeId) {
      return fail(40001, "参数错误", { missingFields: ["storeId"] })
    }
    if (payload.storeId !== "store_001") {
      return fail(40401, "数据不存在", {})
    }
    return success({
      storeId: "store_001",
      name: "桂花小院",
      address: "杭州市西湖区文三路 18 号",
      lat: 30.2741,
      lng: 120.1551,
      wifiName: "GuihuaHome",
      wifiPasswordMasked: "********88",
      contactPhone: "0571-88886666",
      notice: "入住请携带有效证件，22:00 后保持安静。"
    })
  }

  if (name === "guest-profile-submit") {
    const required = ["name", "phone", "idNo", "idCardFrontImage", "idCardBackImage"]
    const missingFields = required.filter((field) => !payload[field])
    if (missingFields.length > 0) {
      return fail(40001, "参数错误", { missingFields })
    }
    if (!/^1\d{10}$/.test(String(payload.phone))) {
      return fail(40001, "手机号格式不正确", { invalidField: "phone" })
    }
    if (!isIdNo(payload.idNo)) {
      return fail(40001, "身份证号码格式不正确", { invalidField: "idNo" })
    }
    return success({
      profileId: `guest_profile_${Date.now()}`,
      submittedAt: new Date().toISOString()
    })
  }

  if (name === "product-query") {
    if (!payload.storeId) {
      return fail(40001, "参数错误", { missingFields: ["storeId"] })
    }
    const pageNo = Number(payload.pageNo || 1)
    const pageSize = Number(payload.pageSize || 10)
    let products = mockState.products.filter((item) => item.status === "online")
    if (payload.category) {
      products = products.filter((item) => item.category === payload.category)
    }
    const total = products.length
    const offset = (pageNo - 1) * pageSize
    return success({
      list: products.slice(offset, offset + pageSize),
      total,
      pageNo,
      pageSize
    })
  }

  if (name === "product-detail-get") {
    if (!payload.productId) {
      return fail(40001, "参数错误", { missingFields: ["productId"] })
    }
    const product = mockState.products.find((item) => item.productId === payload.productId)
    if (!product) {
      return fail(40401, "数据不存在", {})
    }
    return success(product)
  }

  if (name === "order-create") {
    const required = ["storeId", "deliveryType", "items"]
    const missingFields = required.filter((field) => !payload[field])
    if (missingFields.length > 0 || !Array.isArray(payload.items) || payload.items.length === 0) {
      return fail(40001, "参数错误", { missingFields })
    }

    let amountTotal = 0
    const orderItems = []
    for (const item of payload.items) {
      const product = mockState.products.find((row) => row.productId === item.productId)
      if (!product) {
        return fail(40401, "数据不存在", { productId: item.productId })
      }
      if (Number(item.quantity) > product.stock) {
        return fail(40901, "库存不足", { productId: item.productId })
      }
      const quantity = Number(item.quantity || 0)
      const amountSubtotal = product.price * quantity
      amountTotal += amountSubtotal
      orderItems.push({
        productId: product.productId,
        productName: product.name,
        price: product.price,
        quantity,
        amountSubtotal
      })
      product.stock -= quantity
    }

    const orderId = `order_${Date.now()}`
    const orderNo = `ON${Date.now()}`
    const order = {
      orderId,
      orderNo,
      userId: payload.userId || "guest_local",
      amountTotal,
      payStatus: "UNPAID",
      orderStatus: "PENDING_PAY",
      deliveryType: payload.deliveryType,
      remark: payload.remark || "",
      expiredAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      paidAt: "",
      createdAt: new Date().toISOString(),
      items: orderItems
    }
    mockState.orders.unshift(order)

    return success({
      orderId,
      orderNo,
      amountTotal,
      expiredAt: order.expiredAt
    })
  }

  if (name === "order-pay") {
    if (!payload.orderId) {
      return fail(40001, "参数错误", { missingFields: ["orderId"] })
    }
    return success({
      paymentParams: {
        timeStamp: String(Date.now()),
        nonceStr: Math.random().toString(36).slice(2, 10),
        package: `prepay_id=${payload.orderId}`,
        signType: "RSA",
        paySign: `mock_sign_${payload.orderId}`
      }
    })
  }

  if (name === "payment-callback") {
    if (!payload.orderId) {
      return fail(40001, "参数错误", { missingFields: ["orderId"] })
    }
    const order = mockState.orders.find((item) => item.orderId === payload.orderId)
    if (!order) {
      return fail(40401, "数据不存在", {})
    }
    order.payStatus = "PAID"
    order.orderStatus = "PAID"
    order.paidAt = new Date().toISOString()
    return success({ processed: true, payStatus: order.payStatus, orderStatus: order.orderStatus })
  }

  if (name === "order-list-query") {
    if (!payload.userId) {
      return fail(40003, "未登录或登录态失效", {})
    }
    const pageNo = Number(payload.pageNo || 1)
    const pageSize = Number(payload.pageSize || 10)
    let orders = mockState.orders.filter((item) => item.userId === payload.userId)
    if (payload.status) {
      orders = orders.filter((item) => item.orderStatus === payload.status)
    }
    const total = orders.length
    const offset = (pageNo - 1) * pageSize
    return success({
      list: orders.slice(offset, offset + pageSize),
      total,
      pageNo,
      pageSize
    })
  }

  if (name === "order-detail-get") {
    if (!payload.orderId) {
      return fail(40001, "参数错误", { missingFields: ["orderId"] })
    }
    const order = mockState.orders.find((item) => item.orderId === payload.orderId)
    if (!order) {
      return fail(40401, "数据不存在", {})
    }
    return success(order)
  }

  return fail(40401, `未找到本地模拟函数: ${name}`, {})
}

function canHandleLocalMock(name) {
  return (
    name === "auth-verify-booking" ||
    name === "store-info-get" ||
    name === "guest-profile-submit" ||
    name === "product-query" ||
    name === "product-detail-get" ||
    name === "order-create" ||
    name === "order-pay" ||
    name === "payment-callback" ||
    name === "order-list-query" ||
    name === "order-detail-get"
  )
}

module.exports = {
  executeLocalMock,
  canHandleLocalMock
}
