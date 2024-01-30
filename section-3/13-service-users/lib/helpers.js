const crypto = require("crypto")
const config = require("./config")

const helpers = {}

helpers.hash = (value) => {
  const str = String(value).trim()
  if (str.length === 0) return null
  const hash = crypto
    .createHmac("sha256", config.hashingSecret)
    .update(str)
    .digest("hex")
  return hash
}
helpers.parseJsonToString = (obj) => JSON.stringify(obj)
helpers.parseJsonToObject = (str) => {
  try {
    const obj = JSON.parse(str)
    return obj
  } catch (e) {
    return {}
  }
}
module.exports = helpers
