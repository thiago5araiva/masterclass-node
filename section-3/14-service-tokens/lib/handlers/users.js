const _data = require("../data")
const verify = require("./utils")
const helpers = require("../helpers")

const { verifyToken } = require("./tokens")

const _users = {}

const users = (data, callback) => {
  const acceptableMethods = ["post", "get", "put", "delete"]
  if (acceptableMethods.indexOf(data.method) === -1) return callback(405)
  _users[data.method](data, callback)
}

_users.post = (data, callback) => {
  const verifiedFields = verify.handleVerifyAllFields(data.payload)
  if (!verifiedFields) return callback(400, { Error: "Missing fields" })
  _data.read("users", data.payload.phone, function (err) {
    if (!err) return callback(400, { Error: "A user already exists" })
    const hashedPassword = helpers.hash(data.payload.password)
    if (!hashedPassword) callback(500, { Error: "Could not hash password." })

    const userObject = {
      firstName: data.payload.firstName,
      lastName: data.payload.lastName,
      phone: data.payload.phone,
      password: hashedPassword,
    }

    _data.create("users", data.payload.phone, userObject, (err) => {
      if (err) return callback(500, { Error: "Could not create the new user" })
      callback(200, { message: "User created successfully" })
    })
  })
}

_users.get = function (data, callback) {
  const phone = verify.handleVerifyPhone(data.queryStringObject.phone)
  if (!phone) return callback(400, { Error: "Missing required field" })

  const token = verify.handleVerifyToken(data.headers.token)
  verifyToken(token, phone, (tokenIsValid) => {
    if (!tokenIsValid) callback(403, { Error: "Missing token header" })
    _data.read("users", phone, (err, data) => {
      if (err) return callback(404, { Error: "User not found" })
      delete data.password
      callback(200, data)
    })
  })

  _data.read("users", phone, (err, data) => {
    if (err) return callback(404, { Error: "User not found" })
    delete data.hashedPassword
    callback(200, data)
  })
}

_users.put = function (data, callback) {
  const { phone, firstName, lastName, password } = data.payload
  const verifiedFields = verify.handleVerifyUpdatableFields(data.payload)
  if (!verifiedFields) return callback(400, { Error: "Missing fields" })
  if (!phone) return callback(400, { Error: "Missing ID" })

  const validFields = !firstName || !lastName || !password
  if (validFields) return callback(400, { Error: "Missing to update" })

  const token = verify.handleVerifyToken(data.headers.token)
  verifyToken(token, phone, (tokenIsValid) => {
    if (!tokenIsValid) callback(403, { Error: "Missing token header" })
    _data.read("users", phone, (err, data) => {
      if (err) return callback(404, { Error: "User not found" })
      delete data.password
      callback(200, data)
    })
  })

  _data.read("users", phone, (err, userData) => {
    if (err) callback(400, { Error: "The specified user does not exist" })
    if (firstName) userData.firstName = firstName
    if (lastName) userData.lastName = lastName
    if (password) userData.hashedPassword = helpers.hash(password)
    _data.update("users", phone, userData, (err) => {
      if (err) callback(500, { Error: "Could not update the user" })
      callback(200, { meesage: "User updated successfully" })
    })
  })
}

_users.delete = function (data, callback) {
  const phone = verify.handleVerifyPhone(data.payload.phone)
  if (!phone) return callback(400, { Error: "Missing field required" })

  const token = verify.handleVerifyToken(data.headers.token)
  verifyToken(token, phone, (tokenIsValid) => {
    if (!tokenIsValid) callback(403, { Error: "Missing token header" })
    _data.read("users", phone, (err, data) => {
      if (err) return callback(404, { Error: "User not found" })
      delete data.password
      callback(200, data)
    })
  })

  _data.read("users", phone, (err) => {
    if (err) return callback(400, { Error: "Could not find user" })
    _data.delete("users", phone, function (err) {
      if (err) return callback(500, { Error: "Could not delete user" })
      callback(200, { message: "User deleted successfully" })
    })
  })
}

module.exports = users
