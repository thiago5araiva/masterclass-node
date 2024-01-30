const http = require("http")
const https = require("https")
const url = require("url")
const StringDecoder = require("string_decoder").StringDecoder

const handlers = {}
handlers.sample = function (data, callback) {
  callback(406, { name: "sample handler" })
}

handlers.notFound = function (data, callback) {
  callback(404)
}

const router = {
  sample: handlers.sample,
  ping: handlers.ping,
  users: handlers.users,
}

const { httpPort, httpsPort, httpsServerOptions } = require("./config")
const _data = require("./lib/data")

/**
  _data.create("test", "newFile", { fizz: "buzz" }, (err) => {
    if (err) console.log(err, data)
    console.log("File, created successfully")
  })

  _data.read("test", "newFile", (err, data) => {
    if (err) console.log(err, data)
    console.log("File, read successfully", data)
  })

  _data.update("test", "newFile", { fizz: "bozzo" }, (err) => {
    if (err) console.log(err)
    console.log("File updated successfully")
  })

  _data.delete("test", "newFile", (err) => {
    if (err) console.log(err)
    console.log("File deleted successfully")
  })
*/

const httpServer = http.createServer((req, res) => unifiedServer(req, res))
httpServer.listen(httpPort, () => console.log(`Server on port ${httpPort}`))

const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
  unifiedServer(req, res)
})
httpsServer.listen(httpsPort, () => console.log(`Server on port ${httpsPort}`))

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
