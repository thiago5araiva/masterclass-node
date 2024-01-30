const http = require("http")
const https = require("https")
const url = require("url")
const StringDecoder = require("string_decoder").StringDecoder
const fs = require("fs")

const config = require("./config")

const handlers = {}

handlers.sample = (data, callback) => callback(406, { name: "sample handler" })
handlers.notFound = (data, callback) => callback(404)

const router = {
  sample: handlers.sample,
}

const httpServer = http.createServer(function (req, res) {
  unifiedServer(req, res)
})
httpServer.listen(config.httpPort, function () {
  console.log(`Listen port ${config.httpPort}`)
})
const httpsServerOptions = {
  key: fs.readFileSync("./https/key.pem"),
  cert: fs.readFileSync("./https/cert.pem"),
}

const httpsServer = https.createServer(httpsServerOptions, (req, res) =>
  unifiedServer(req, res)
)
httpsServer.listen(config.httpsPort, function () {
  console.log(`Listening on port ${config.httpsPort} `)
})

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
