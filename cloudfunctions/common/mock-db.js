const { encryptText, hashPhone, maskPhone } = require("./crypto-utils")
const { generateId } = require("./id")

const state = {
  users: [
    {
      _id: "user_admin_001",
      openid: "openid_admin",
      phone_masked: maskPhone("13800138001"),
      role: "admin",
      status: "active",
      created_at: new Date().toISOString()
    }
  ],
  bookings: [
    {
      _id: "booking_001",
      booking_no: "BK1001",
      guest_phone_hash: hashPhone("13800138000"),
      store_id: "store_001",
      checkin_date: "2026-04-28",
      checkout_date: "2026-05-01",
      status: "booked",
      created_at: new Date().toISOString()
    }
  ],
  guest_profiles: [],
  stores: [
    {
      _id: "store_001",
      name: "桂花小院",
      address: "杭州市西湖区文三路 18 号",
      lat: 30.2741,
      lng: 120.1551,
      wifi_name: "GuihuaHome",
      wifi_password_encrypted: encryptText("osmanthus888"),
      contact_phone: "0571-88886666",
      notice: "入住请携带有效证件，22:00 后保持安静。",
      theme_config: { theme: "osmanthus" },
      status: "active",
      updated_at: new Date().toISOString()
    }
  ],
  guides: [
    {
      _id: "guide_001",
      store_id: "store_001",
      title: "西湖晨行路线",
      category: "spot",
      cover_url: "",
      distance_km: 2.1,
      popular_score: 95,
      duration_text: "2-3 小时",
      traffic: { mode: "taxi", text: "约 10 分钟" },
      content: "建议清晨 7 点前出发，沿湖步行体验最佳。",
      tips: "备一件薄外套。",
      status: "online",
      sort: 1,
      updated_at: new Date().toISOString()
    },
    {
      _id: "guide_002",
      store_id: "store_001",
      title: "河坊街夜游",
      category: "night",
      cover_url: "",
      distance_km: 4.8,
      popular_score: 89,
      duration_text: "2 小时",
      traffic: { mode: "metro", text: "约 20 分钟" },
      content: "晚饭后步行街体验本地小吃。",
      tips: "晚间游客较多注意保管物品。",
      status: "online",
      sort: 2,
      updated_at: new Date().toISOString()
    }
  ],
  products: [
    {
      _id: "product_001",
      store_id: "store_001",
      name: "桂花龙井礼盒",
      category: "giftbox",
      price: 12800,
      stock: 30,
      cover_url: "",
      images: [],
      desc: "桂花香型龙井礼盒装",
      status: "online",
      sales_count: 0,
      updated_at: new Date().toISOString()
    },
    {
      _id: "product_002",
      store_id: "store_001",
      name: "手作桂花香囊",
      category: "souvenir",
      price: 3900,
      stock: 100,
      cover_url: "",
      images: [],
      desc: "便携香囊",
      status: "online",
      sales_count: 0,
      updated_at: new Date().toISOString()
    }
  ],
  orders: [],
  order_logs: [],
  events: []
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function list(collection) {
  return state[collection] || []
}

function findOne(collection, predicate) {
  return clone(list(collection).find(predicate) || null)
}

function findMany(collection, predicate) {
  return clone(list(collection).filter(predicate))
}

function insert(collection, doc) {
  const target = list(collection)
  const nextDoc = {
    _id: doc._id || generateId(collection.slice(0, -1)),
    ...doc
  }
  target.push(nextDoc)
  return clone(nextDoc)
}

function updateOne(collection, predicate, updater) {
  const target = list(collection)
  const index = target.findIndex(predicate)
  if (index === -1) {
    return null
  }
  const current = target[index]
  const next = typeof updater === "function" ? updater({ ...current }) : { ...current, ...updater }
  target[index] = next
  return clone(next)
}

function resetState() {
  state.orders.length = 0
  state.order_logs.length = 0
  state.events.length = 0
  state.guest_profiles.length = 0
}

module.exports = {
  state,
  findOne,
  findMany,
  insert,
  updateOne,
  resetState
}
