const INDEX_PLAN = {
  bookings: [
    { keys: { booking_no: 1 }, unique: true },
    { keys: { guest_phone_hash: 1, checkin_date: 1 }, unique: false }
  ],
  guides: [{ keys: { store_id: 1, status: 1, sort: 1 }, unique: false }],
  orders: [
    { keys: { order_no: 1 }, unique: true },
    { keys: { user_id: 1, created_at: -1 }, unique: false },
    { keys: { store_id: 1, order_status: 1, created_at: -1 }, unique: false }
  ]
}

module.exports = {
  INDEX_PLAN
}
