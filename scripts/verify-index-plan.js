const assert = require("assert")
const { INDEX_PLAN } = require("./db-indexes")

function run() {
  assert.ok(INDEX_PLAN.bookings)
  assert.ok(INDEX_PLAN.guides)
  assert.ok(INDEX_PLAN.orders)

  const bookingKeys = JSON.stringify(INDEX_PLAN.bookings.map((item) => item.keys))
  const guideKeys = JSON.stringify(INDEX_PLAN.guides.map((item) => item.keys))
  const orderKeys = JSON.stringify(INDEX_PLAN.orders.map((item) => item.keys))

  assert.ok(bookingKeys.includes("booking_no"))
  assert.ok(bookingKeys.includes("guest_phone_hash"))
  assert.ok(guideKeys.includes("store_id"))
  assert.ok(guideKeys.includes("sort"))
  assert.ok(orderKeys.includes("order_no"))
  assert.ok(orderKeys.includes("order_status"))

  console.log("索引计划校验通过：bookings/guides/orders 关键索引已定义。")
}

run()
