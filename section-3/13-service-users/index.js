/***
 * Primary file of the API
 */

//Dependencies
const http = require("http")
const https = require("https")
const url = require("url")
const StringDecoder = require("string_decoder").StringDecoder
const fs = require("fs")
const _data = require("./lib/data")
const handlers = require("./lib/handlers")
const helpers = require("./lib/helpers")

// Testing
// @TODO delete this
// _data.create("test", "newFile", { foo: "bar" }, function (err) {
//   console.log("this was the error", err)
// })
// _data.read("test", "newFile", function (err, data) {
//   console.log("this was the error", err, "and this was the data", data)
// })
_data.update("test", "newFile", { fizz: "buzz" }, function (err) {
  console.log("this was the error", err)
})

const config = require("./lib/config")

const httpServer = http.createServer(function (req, res) {
  unifiedServer(req, res)
})

//start http server
httpServer.listen(config.httpPort, function () {
  console.log(`The server is listening on port ${config.httpPort} `)
})
// instantiate the https server
const httpsServerOptions = {
  key: fs.readFileSync("./https/key.pem"),
  cert: fs.readFileSync("./https/cert.pem"),
}
const httpsServer = https.createServer(httpsServerOptions, function (req, res) {
  unifiedServer(req, res)
})
// start the https server
httpsServer.listen(config.httpsPort, function () {
  console.log(`The server is listening on port ${config.httpsPort} `)
})
// all the server logic for both the http and https server
const unifiedServer = function (req, res) {
  const parsedUrl = url.parse(req.url, true)
  const path = parsedUrl.pathname
  const trimmedPath = path.replace(/^\/+|\/+$/g, "")
  const queryStringObject = parsedUrl.query
  const method = req.method.toLowerCase()
  const headers = req.headers
  const decoder = new StringDecoder("utf-8")
  let buffer = ""
  req.on("data", function (data) {
    buffer += decoder.write(data)
  })
  req.on("end", function () {
    buffer += decoder.end()

    const chosenHandler =
      typeof router[trimmedPath] !== "undefined"
        ? router[trimmedPath]
        : handlers.notFound

    const data = {
      trimmedPath: trimmedPath,
      queryStringObject: queryStringObject,
      method: method,
      headers: headers,
      payload: buffer,
    }

    chosenHandler(data, function (statusCode, payload) {
      statusCode = typeof statusCode == "number" ? statusCode : 200
      payload = typeof payload == "object" ? payload : {}
      const payloadString = JSON.stringify(payload)
      res.setHeader("Content-Type", "application/json")
      res.writeHead(statusCode)
      res.end(payloadString)
      console.log("Returning this response: ", statusCode, payloadString)
    })

    console.log("Request received with this payload: ", buffer)
  })
}

const handlers = {}

handlers.sample = function (data, callback) {
  callback(406, { name: "sample handler" })
}

handlers.notFound = function (data, callback) {
  callback(404)
}

const router = {
  sample: handlers.sample,
}
