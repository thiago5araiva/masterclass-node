const crypto = require("crypto")
const config = require("./config")
const queryString = require("querystring")
const https = require("https")

const { handleVerifyPhone } = require("./handlers/utils")

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

helpers.createRandomString = (strLength) => {
  if (typeof strLength === "number" && strLength > 0) {
    const possibleChars = "abcdefghijklmnopqrstuvwxyz0123456789"
    let randomString = ""

    for (let i = 0; i < strLength; i++) {
      const randomChar = possibleChars.charAt(
        Math.floor(Math.random() * possibleChars.length)
      )
      randomString += randomChar
    }

    return randomString
  } else {
    return false
  }
}

const handleVerifyMSG = (msg) => {
  return typeof msg === "string" &&
    msg.trim().length > 0 &&
    msg.trim().length <= 1600
    ? msg.trim()
    : false
}

helpers.sendTwilioSms = (phone, msg, callback) => {
  const phone = handleVerifyPhone(phone)
  const msg = handleVerifyMSG(msg)
  if (!phone || !msg) return callback("Given parameters are invalid")
  const payload = {
    From: config.twilio.fromPhone,
    To: `+1${phone}`,
    Body: msg,
  }

  const stringPayload = queryString.stringify(payload)
  const requestDetails = {
    protocol: "https:",
    hostname: "api.twilio.com",
    method: "POST",
    path: `/2010-04-01/Accounts/${config.twilio.accountSid}/Messages.json`,
    auth: `${config.twilio.accountSid}:${config.twilio.authToken}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(stringPayload),
    },
  }
  const req = https.request(requestDetails, (res) => {
    const status = res.statusCode
    const verifyStatusCode = status !== 200 || status !== 201
    if (verifyStatusCode) return callback(`Status code returned was ${status}`)
    callback(false)
  })
  req.on("error", (e) => callback(e))
  req.write(stringPayload)
  req.end()
}

module.exports = helpers
