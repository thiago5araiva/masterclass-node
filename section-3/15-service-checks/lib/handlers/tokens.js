const _data = require("../data")
const verify = require("./utils")
const helpers = require("../helpers")

const _tokens = {}

const tokens = (data, callback) => {
  const acceptableMethods = ["post", "get", "put", "delete"]
  if (acceptableMethods.indexOf(data.method) === -1) return callback(405)
  _tokens[data.method](data, callback)
}
_tokens.post = (data, callback) => {
  const phone = verify.handleVerifyPhone(data.payload.phone)
  const password = verify.handleVerifyPassword(data.payload.password)
  if (!phone || !password) return callback(400, { Error: "Missing fields" })
  _data.read("users", phone, (err, userData) => {
    if (err) return callback(400, { Error: "Could not find the user" })
    const hashedPassword = helpers.hash(password)
    const currPass = hashedPassword !== userData.password
    if (currPass) return callback(400, { Error: "Password did not match" })
    const tokenId = helpers.createRandomString(20)
    const expires = Date.now() + 1000 * 60 * 60
    const tokenObject = {
      phone,
      id: tokenId,
      expires,
    }
    _data.create("tokens", tokenId, tokenObject, (err) => {
      if (err) return callback(500, { Error: "Could not create the new token" })
      callback(200, tokenObject)
    })
  })
}

_tokens.get = (data, callback) => {
  const id = verify.handleVerifyId(data.queryStringObject.id)
  if (!id) return callback(400, { Error: "Missing required field" })
  _data.read("tokens", id, (err, tokenData) => {
    if (err) return callback(404, { Error: "Token not found" })
    callback(200, tokenData)
  })
}

_tokens.put = (data, callback) => {
  const id = verify.handleVerifyId(data.payload.id)
  const extend = verify.handleVerifyExtend(data.payload.extend)
  if (!id || !extend) return callback(400, { Error: "Missing required fields" })
  _data.read("tokens", id, (err, tokenData) => {
    if (err) return callback(400, { Error: "Token does not exist" })
    const expires = tokenData.expires < Date.now()
    if (expires) return callback(400, { Error: "The token has expired" })
    tokenData.expires = Date.now() + 1000 * 60 * 60
    _data.update("tokens", id, tokenData, (err) => {
      if (err) return callback(500, { Error: "Could not update the token" })
      callback(200, { message: "Token expiration extended" })
    })
  })
}

_tokens.delete = (data, callback) => {
  const id = verify.handleVerifyId(data.payload.id)
  if (!id) return callback(400, { Error: "Missing required field" })
  _data.read("tokens", id, (err, data) => {
    if (err) return callback(400, { Error: "Could not find the token" })
    _data.delete("tokens", id, (err) => {
      if (err) return callback(500, { Error: "Could not delete the token" })
      callback(200, { message: "Token deleted successfully" })
    })
  })
}

verifyToken = (id, phone, callback) => {
  _data.read("tokens", id, (err, tokenData) => {
    if (err) return callback(false, { Error: "Token not found" })
    const valid = tokenData.phone === phone && tokenData.expires > Date.now()
    callback(valid)
  })
}

module.exports = { tokens, verifyToken }
