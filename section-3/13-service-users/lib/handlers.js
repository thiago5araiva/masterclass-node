const _data = require("./data")
const helpers = require("./helpers")

const {
  handleVerifyAllFields,
  handleVerifyPhone,
  handleVerifyUpdatableFields,
} = require("./utils")

const handlers = {}

handlers.users = (data, callback) => {
  const acceptableMethods = ["post", "get", "put", "delete"]
  if (acceptableMethods.indexOf(data.method) === -1) return callback(405)
  handlers._users[data.method](data, callback)
}

handlers._users = {}

handlers._users.post = (data, callback) => {
  const verifiedFields = handleVerifyAllFields(data.payload)
  if (!verifiedFields) return callback(400, { Error: "Missing fields" })

  _data.read("users", data.payload.phone, function (err) {
    if (!err) return callback(400, { Error: "A user already exists" })
    const hashedPassword = helpers.hash(data.payload.password)
    if (!hashedPassword) callback(500, { Error: "Could not hash password." })
    _data.create("users", data.payload.phone, data.payload, (err) => {
      if (err) return callback(500, { Error: "Could not create the new user" })
      callback(200, { message: "User created successfully" })
    })
  })
}

handlers._users.get = function (data, callback) {
  const phone = handleVerifyPhone(data.queryStringObject.phone)
  if (!phone) return callback(400, { Error: "Missing required field" })
  _data.read("users", phone, (err, data) => {
    if (err) return callback(404, { Error: "User not found" })
    delete data.hashedPassword
    callback(200, data)
  })
}

handlers._users.put = function (data, callback) {
  const { phone, firstName, lastName, password } = data.payload
  const verifiedFields = handleVerifyUpdatableFields(data.payload)
  if (!verifiedFields) return callback(400, { Error: "Missing fields" })
  if (!phone) return callback(400, { Error: "Missing ID" })
  if (!firstName || !lastName || !password) {
    return callback(400, { Error: "Missing to update" })
  }
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

handlers._users.delete = function (data, callback) {
  const phone = handleVerifyPhone(data.payload.phone)
  if (!phone) return callback(400, { Error: "Missing field required" })
  _data.read("users", phone, (err) => {
    if (err) return callback(400, { Error: "Could not find  user" })
    _data.delete("users", phone, function (err) {
      if (err) return callback(500, { Error: "Could not delete  user" })
      callback(200, { message: "User deleted successfully" })
    })
  })
}

handlers.ping = (data, callback) => callback(200)
handlers.notFound = (data, callback) => callback(404)

module.exports = handlers
