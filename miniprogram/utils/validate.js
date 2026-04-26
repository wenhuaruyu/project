function isPhone(phone) {
  return /^1\d{10}$/.test(String(phone || ""))
}

function required(value) {
  return !(value === undefined || value === null || String(value).trim() === "")
}

module.exports = {
  isPhone,
  required
}
