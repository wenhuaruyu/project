const crypto = require("crypto")

const ALGORITHM = "aes-256-cbc"
const KEY = crypto
  .createHash("sha256")
  .update(process.env.GUIHUA_SECRET_KEY || "guihua-home-dev-key")
  .digest()
const IV = Buffer.alloc(16, 0)

function hashPhone(phone) {
  return crypto.createHash("sha256").update(String(phone)).digest("hex")
}

function encryptText(raw) {
  if (typeof raw !== "string" || raw.trim() === "") {
    return ""
  }

  const cipher = crypto.createCipheriv(ALGORITHM, KEY, IV)
  const encrypted = Buffer.concat([cipher.update(raw, "utf8"), cipher.final()])
  return encrypted.toString("base64")
}

function decryptText(cipherText) {
  if (typeof cipherText !== "string" || cipherText.trim() === "") {
    return ""
  }

  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, IV)
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(cipherText, "base64")),
      decipher.final()
    ])
    return decrypted.toString("utf8")
  } catch (_) {
    return ""
  }
}

function maskSecret(raw) {
  const source = String(raw || "")
  if (!source) {
    return ""
  }
  if (source.length <= 2) {
    return `${source[0]}*`
  }
  const visible = Math.min(2, source.length - 1)
  const tail = source.slice(source.length - visible)
  return `${"*".repeat(source.length - visible)}${tail}`
}

function maskPhone(phone) {
  const source = String(phone || "")
  if (source.length < 7) {
    return source
  }
  return `${source.slice(0, 3)}****${source.slice(-4)}`
}

module.exports = {
  hashPhone,
  encryptText,
  decryptText,
  maskSecret,
  maskPhone
}
