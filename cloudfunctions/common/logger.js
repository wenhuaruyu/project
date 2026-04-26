const { maskPhone, maskSecret } = require("./crypto-utils")

function sanitizeMeta(meta) {
  if (!meta || typeof meta !== "object") {
    return {}
  }

  const cloned = { ...meta }
  if (cloned.phone) {
    cloned.phone = maskPhone(cloned.phone)
  }
  if (cloned.idNo) {
    cloned.idNo = maskSecret(cloned.idNo)
  }
  if (cloned.wifiPassword) {
    cloned.wifiPassword = maskSecret(cloned.wifiPassword)
  }
  return cloned
}

function logAction({ requestId, action, meta }) {
  const safeMeta = sanitizeMeta(meta)
  console.info(`[${requestId}] ${action}`, safeMeta)
}

module.exports = {
  logAction
}
