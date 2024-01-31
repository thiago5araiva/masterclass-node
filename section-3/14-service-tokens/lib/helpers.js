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

helpers.createRandomString = (strLength) => {
  strLength = typeof strLength === "number" && strLength > 0 ? strLength : false
  if (!strLength) return false
  const possibleCharacters = "abcdefghijklmnopqrstuvwxyz0123456789"
  let str = ""
  for (let i = 1; i <= strLength; i++) {
    const randomCharacter = possibleCharacters.charAt(
      Math.floor(Math.random() * possibleCharacters.length)
    )
    str += randomCharacter
  }
  return str
}

module.exports = helpers
