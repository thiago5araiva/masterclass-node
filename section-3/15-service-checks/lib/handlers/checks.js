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
  const checkId = data.queryStringObject.get("checkId")
  const checkIdValidated =
    typeof checkId === "string" && checkId.trim().length === 20
      ? checkId.trim()
      : null
  if (!checkIdValidated) return callback(400, { Error: "Missing fields" })
  _read.read("checks", checkId, (err, checkData) => {
    if (err) return callback(404, { Error: "Check not found" })
    const token = verify.handleVerifyToken(data.headers.token)
    verifyToken.verifyToken(token, checkData.phone, (tokenIsValid) => {
      if (!tokenIsValid) return callback(403, { Error: "Token is invalid" })
      callback(200, checkData)
    })
  })
}

// // Required data: checkId
// // Optional data: protocol, url, method successCodes, timoutSeconds (one must be sent)
// handlers._checks.put = (data, callback) => {
//   const checkId = helpers.requiredParamValidator(data, "checkId", {
//     type: "string",
//     exactLength: 20,
//   })

//   const protocol = helpers.requiredParamValidator(data, "protocol", {
//     type: "string",
//     contains: ["http", "https"],
//   })

//   const url = helpers.requiredParamValidator(data, "url", {
//     type: "string",
//     minLength: 10,
//   })

//   const method = helpers.requiredParamValidator(data, "method", {
//     type: "string",
//     contains: ["post", "get", "put", "delete"],
//   })

//   const successCodes = helpers.requiredParamValidator(data, "successCodes", {
//     type: "array",
//     minLength: 1,
//   })

//   const timeoutSeconds = helpers.requiredParamValidator(
//     data,
//     "timeoutSeconds",
//     {
//       type: "number",
//       min: 1,
//     }
//   )

//   if (checkId) {
//     if (protocol || url || method || successCodes || timeoutSeconds) {
//       DataLibrary.read("checks", checkId, (err, checkData) => {
//         if (!err && checkData) {
//           const token =
//             typeof data.headers.token === "string" ? data.headers.token : false
//           handlers._tokens.verifyToken(
//             token,
//             checkData.phone,
//             (tokenIsValid) => {
//               if (tokenIsValid) {
//                 checkData = {
//                   ...checkData,
//                   protocol: protocol || checkData.protocol,
//                   url: url || checkData.url,
//                   method: method || checkData.method,
//                   successCodes: successCodes || checkData.successCodes,
//                   timeoutSeconds: timeoutSeconds || checkData.timeoutSeconds,
//                 }

//                 DataLibrary.update("checks", checkId, checkData, (err) => {
//                   if (!err) {
//                     callback(200, checkData)
//                   } else {
//                     callback(500, { Error: "Could not update the check" })
//                   }
//                 })
//               } else {
//                 callback(403, {
//                   Error: "Missing required token in header or token is invalid",
//                 })
//               }
//             }
//           )
//         } else {
//           callback(404, { Error: "Could not find this check" })
//         }
//       })
//     } else {
//       callback(400, {
//         Error: "Missing optional data: at least one field must be present",
//       })
//     }
//   } else {
//     callback(400, { Error: "Missing required field" })
//   }
// }

// handlers._checks.delete = (data, callback) => {
//   const checkId = data.queryStringObject.get("checkId")
//   const checkIdValidated =
//     typeof checkId === "string" && checkId.trim().length === 20
//       ? checkId.trim()
//       : null

//   if (checkIdValidated) {
//     DataLibrary.read("checks", checkId, (err, checkData) => {
//       if (!err && checkData) {
//         const token =
//           typeof data.headers.token === "string" ? data.headers.token : false
//         handlers._tokens.verifyToken(token, checkData.phone, (tokenIsValid) => {
//           if (tokenIsValid) {
//             DataLibrary.delete("checks", checkId, (err) => {
//               if (!err) {
//                 DataLibrary.read("users", checkData.phone, (err, userData) => {
//                   if (!err && userData) {
//                     userData.checks = userData.checks.filter(
//                       (check) => check !== checkId
//                     )
//                     DataLibrary.update(
//                       "users",
//                       userData.phone,
//                       userData,
//                       (err) => {
//                         if (!err) {
//                           callback(200)
//                         } else {
//                           callback(500, {
//                             Error:
//                               "Could not update the user data by removing check",
//                           })
//                         }
//                       }
//                     )
//                   } else {
//                     callback(500, {
//                       Error: "Could not find the user who created this checks",
//                     })
//                   }
//                 })
//               } else {
//                 callback(500, { Error: "Could not update the check" })
//               }
//             })
//           } else {
//             callback(403, {
//               Error: "Missing required token in header or token is invalid",
//             })
//           }
//         })
//       } else {
//         callback(400, { Error: "Specified Check ID does not exist" })
//       }
//     })
//   } else {
//     callback(400, { Error: "Missing required fields" })
//   }
// }

module.exports = checks
