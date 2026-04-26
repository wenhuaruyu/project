function isPhone(phone) {
  return /^1\d{10}$/.test(String(phone || ""))
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
  const checkCode = checkMap[sum % 11]
  return checkCode === source[17]
}

function required(value) {
  return !(value === undefined || value === null || String(value).trim() === "")
}

module.exports = {
  isPhone,
  isIdNo,
  required
}
