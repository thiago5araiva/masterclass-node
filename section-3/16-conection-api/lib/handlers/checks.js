const _data = require("../data")
const helpers = require("../helpers")
const verify = require("./utils")
const { verifyToken } = require("./tokens")

const environmentToExport = require("../config")

const _checks = {}

const checks = (data, callback) => {
  const acceptableMethods = ["post", "get", "put", "delete"]
  if (acceptableMethods.indexOf(data.method) === -1) return callback(405)
  _checks[data.method](data, callback)
}

_checks.post = (data, callback) => {
  const protocol = verify.handleVerifyProtocols(data.payload.protocol)
  const url = verify.handleVerifyUrl(data.payload.url)
  const method = verify.handleVerifyMethod(data.payload.method)
  const successCodes = verify.handleVerifyStatusCodes(data.payload.successCodes)
  const timeoutSeconds = verify.handleVerifySeconds(data.payload.timeoutSeconds)

  if (!protocol && url && !method && !successCodes && !timeoutSeconds)
    return callback(400, { Error: "Missing required fields" })

  const token = verify.handleVerifyToken(data.headers.token)

  _data.read("tokens", token, (err, tokenData) => {
    if (err) return callback(403, { Error: "Token not found" })
    const phone = tokenData.phone

    _data.read("users", phone, (err, userData) => {
      if (err) return callback(403, { Error: "Could not retrieve token" })
      const userChecks =
        typeof userData.checks === "object" ? userData.checks : []
      const maximumChecks = userChecks.length > environmentToExport.maxChecks
      if (maximumChecks) return callback(400, { Error: "Maximum checks" })
      const checkId = helpers.createRandomString(20)
      const checkObject = {
        phone,
        checkId,
        protocol,
        url,
        method,
        successCodes,
        timeoutSeconds,
      }

      _data.create("checks", checkId, checkObject, (err) => {
        if (err) return callback(500, { Error: "Could not create new check" })
        userData.checks = userChecks
        userData.checks.push(checkId)
        userData.checks = [...userChecks, checkId]
        _data.update("users", phone, userData, (err) => {
          if (err) return callback(500, { Error: "Could not update user " })
          callback(200, checkObject)
        })
      })
    })
  })
}

_checks.get = (data, callback) => {
  const checkId = data.queryStringObject.checkId
  const checkIdValidated = verify.handleVerifyCheckId(checkId)
  if (!checkIdValidated) return callback(400, { Error: "Missing fields" })
  _data.read("checks", checkId, (err, checkData) => {
    if (err) return callback(404, { Error: "Check not found" })
    const token = verify.handleVerifyToken(data.headers.token)
    verifyToken(token, checkData.phone, (tokenIsValid) => {
      if (!tokenIsValid) return callback(403, { Error: "Token is invalid" })
      callback(200, checkData)
    })
  })
}

_checks.put = (data, callback) => {
  const id = data.queryStringObject.id
  const protocol = verify.handleVerifyProtocols(data.payload.protocol)
  const url = verify.handleVerifyUrl(data.payload.url)
  const method = verify.handleVerifyMethod(data.payload.method)
  const successCodes = verify.handleVerifyStatusCodes(data.payload.successCodes)
  const timeoutSeconds = verify.handleVerifySeconds(data.payload.timeoutSeconds)

  if (!id) return callback(400, { Error: "Missing ID" })
  if (!protocol || !url || !method || !successCodes || !timeoutSeconds)
    return callback(400, { Error: "Missing fields" })
  _data.read("checks", id, (err, checkData) => {
    if (err) return callback(404, { Error: "Could not find this check" })
    const token = verify.handleVerifyToken(data.headers.token)
    verifyToken(token, checkData.phone, (tokenIsValid) => {
      if (!tokenIsValid) return callback(403, { Error: "Token is invalid" })
      checkData = {
        ...checkData,
        protocol: protocol || checkData.protocol,
        url: url || checkData.url,
        method: method || checkData.method,
        successCodes: successCodes || checkData.successCodes,
        timeoutSeconds: timeoutSeconds || checkData.timeoutSeconds,
      }
      _read.update("checks", id, checkData, (err) => {
        if (err) return callback(500, { Error: "Could not update the check" })
        callback(200, checkData)
      })
    })
  })
}

_checks.delete = (data, callback) => {
  const checkId = data.queryStringObject.checkId
  const checkIdValidated = verify.handleVerifyCheckId(checkId)
  if (!checkIdValidated) return callback(400, { Error: "Missing fields" })

  _data.read("checks", checkId, (err, checkData) => {
    if (err) return callback(400, { Error: "Check ID does not exist" })
    const token = verify.handleVerifyToken(data.headers.token)
    verifyToken(token, checkData.phone, (tokenIsValid) => {
      if (!tokenIsValid) return callback(403, { Error: "Token is invalid" })
      _data.delete("checks", checkId, (err) => {
        if (err) return callback(500, { Error: "Could not delete the check" })
        _read.read("users", checkData.phone, (err, userData) => {
          if (err) return callback(500, { Error: "Could not find the user " })
          userData.checks = userData.checks.filter((check) => check !== checkId)
          _read.update("users", userData.phone, userData, (err) => {
            if (err)
              return callback(500, { Error: "Could not update the user" })
            callback(200)
          })
        })
      })
    })
  })
}

module.exports = checks
