const assert = require("assert")

const authVerifyBooking = require("../cloudfunctions/auth-verify-booking/index")
const storeInfoGet = require("../cloudfunctions/store-info-get/index")
const guestProfileSubmit = require("../cloudfunctions/guest-profile-submit/index")
const guideQuery = require("../cloudfunctions/guide-query/index")
const guideDetailGet = require("../cloudfunctions/guide-detail-get/index")
const productQuery = require("../cloudfunctions/product-query/index")
const productDetailGet = require("../cloudfunctions/product-detail-get/index")
const orderCreate = require("../cloudfunctions/order-create/index")
const orderPay = require("../cloudfunctions/order-pay/index")
const paymentCallback = require("../cloudfunctions/payment-callback/index")
const orderListQuery = require("../cloudfunctions/order-list-query/index")
const orderDetailGet = require("../cloudfunctions/order-detail-get/index")
const adminContentManage = require("../cloudfunctions/admin-content-manage/index")
const { state, resetState } = require("../cloudfunctions/common/mock-db")

function ensureBaseShape(result) {
  assert.ok(result && typeof result === "object")
  assert.ok(Object.prototype.hasOwnProperty.call(result, "code"))
  assert.ok(Object.prototype.hasOwnProperty.call(result, "message"))
  assert.ok(Object.prototype.hasOwnProperty.call(result, "data"))
  assert.ok(Object.prototype.hasOwnProperty.call(result, "requestId"))
}

async function run() {
  resetState()
  const context = { requestId: "verify_all_steps" }

  const step5Ok = await authVerifyBooking.main(
    { bookingNo: "BK1001", phone: "13800138000", openid: "openid_customer_001" },
    context
  )
  ensureBaseShape(step5Ok)
  assert.strictEqual(step5Ok.code, 0)
  assert.strictEqual(step5Ok.data.verified, true)

  const step6Ok = await storeInfoGet.main({ storeId: step5Ok.data.storeId }, context)
  ensureBaseShape(step6Ok)
  assert.strictEqual(step6Ok.code, 0)
  assert.ok(step6Ok.data.wifiPasswordMasked.includes("*"))

  const step7Ok = await guestProfileSubmit.main(
    {
      bookingId: step5Ok.data.bookingId,
      userId: step5Ok.data.userId,
      name: "张三",
      phone: "13800138000",
      idNo: "330102199001011234",
      arrivalTime: new Date().toISOString(),
      specialNeeds: "靠窗房间"
    },
    context
  )
  ensureBaseShape(step7Ok)
  assert.strictEqual(step7Ok.code, 0)
  const profileInDb = state.guest_profiles.find((row) => row._id === step7Ok.data.profileId)
  assert.ok(profileInDb)
  assert.notStrictEqual(profileInDb.phone_encrypted, "13800138000")
  assert.notStrictEqual(profileInDb.id_no_encrypted, "330102199001011234")

  const step9Ok = await guideQuery.main(
    { storeId: step5Ok.data.storeId, category: "spot", sortBy: "distance", pageNo: 1, pageSize: 10 },
    context
  )
  ensureBaseShape(step9Ok)
  assert.strictEqual(step9Ok.code, 0)
  assert.ok(Array.isArray(step9Ok.data.list))
  assert.ok(step9Ok.data.list.length > 0)

  const step10Ok = await guideDetailGet.main({ guideId: step9Ok.data.list[0].guideId }, context)
  ensureBaseShape(step10Ok)
  assert.strictEqual(step10Ok.code, 0)
  assert.ok(step10Ok.data.content)

  const step12Ok = await productQuery.main(
    { storeId: step5Ok.data.storeId, pageNo: 1, pageSize: 10 },
    context
  )
  ensureBaseShape(step12Ok)
  assert.strictEqual(step12Ok.code, 0)
  assert.ok(step12Ok.data.list.length > 0)

  const step12Detail = await productDetailGet.main(
    { productId: step12Ok.data.list[0].productId },
    context
  )
  ensureBaseShape(step12Detail)
  assert.strictEqual(step12Detail.code, 0)

  const step13Fail = await orderCreate.main(
    {
      userId: step5Ok.data.userId,
      storeId: step5Ok.data.storeId,
      deliveryType: "pickup",
      forceStockInsufficient: true,
      items: [{ productId: step12Ok.data.list[0].productId, quantity: 1 }]
    },
    context
  )
  ensureBaseShape(step13Fail)
  assert.strictEqual(step13Fail.code, 40901)

  const step13Ok = await orderCreate.main(
    {
      userId: step5Ok.data.userId,
      storeId: step5Ok.data.storeId,
      deliveryType: "pickup",
      items: [{ productId: step12Ok.data.list[0].productId, quantity: 1 }]
    },
    context
  )
  ensureBaseShape(step13Ok)
  assert.strictEqual(step13Ok.code, 0)

  const step14Pay = await orderPay.main({ orderId: step13Ok.data.orderId }, context)
  ensureBaseShape(step14Pay)
  assert.strictEqual(step14Pay.code, 0)

  const orderBeforeCallback = await orderDetailGet.main(
    { orderId: step13Ok.data.orderId, userId: step5Ok.data.userId },
    context
  )
  ensureBaseShape(orderBeforeCallback)
  assert.strictEqual(orderBeforeCallback.data.payStatus, "UNPAID")

  const step14Callback = await paymentCallback.main(
    { orderId: step13Ok.data.orderId, transactionId: "tx_001", paySuccess: true },
    context
  )
  ensureBaseShape(step14Callback)
  assert.strictEqual(step14Callback.code, 0)

  const step15List = await orderListQuery.main(
    { userId: step5Ok.data.userId, pageNo: 1, pageSize: 10, status: "PAID" },
    context
  )
  ensureBaseShape(step15List)
  assert.strictEqual(step15List.code, 0)
  assert.ok(step15List.data.list.length >= 1)

  const step15Detail = await orderDetailGet.main(
    { orderId: step13Ok.data.orderId, userId: step5Ok.data.userId },
    context
  )
  ensureBaseShape(step15Detail)
  assert.strictEqual(step15Detail.code, 0)
  assert.strictEqual(step15Detail.data.payStatus, "PAID")

  const step17Forbidden = await adminContentManage.main(
    { isAdmin: false, resource: "guide", action: "update", payload: { guideId: "guide_001", title: "x" } },
    context
  )
  ensureBaseShape(step17Forbidden)
  assert.strictEqual(step17Forbidden.code, 40301)

  const step17Admin = await adminContentManage.main(
    { isAdmin: true, resource: "guide", action: "update", payload: { guideId: "guide_001", title: "西湖晨行路线（已更新）" } },
    context
  )
  ensureBaseShape(step17Admin)
  assert.strictEqual(step17Admin.code, 0)

  console.log("验证完成：步骤 5-17 与关键口径通过。")
  console.log("补充确认：支付仅在 payment-callback 后进入 PAID。")
  console.log("补充确认：guest_profiles 敏感字段为加密存储。")
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
