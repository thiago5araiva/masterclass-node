const http = require("http")
const https = require("https")
const url = require("url")
const StringDecoder = require("string_decoder").StringDecoder

const { httpPort, httpsPort, httpsServerOptions } = require("./lib/config")
const handlers = require("./lib/handlers")
const helpers = require("./lib/helpers")

const httpServer = http.createServer((req, res) => unifiedServer(req, res))
httpServer.listen(httpPort, () => console.log(`Server on port ${httpPort}`))

const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
  unifiedServer(req, res)
})
httpsServer.listen(httpsPort, () => console.log(`Server on port ${httpsPort}`))

const unifiedServer = (req, res) => {
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
      payload: helpers.parseJsonToObject(buffer),
    }

    chosenHandler(data, function (statusCode, payload) {
      statusCode = typeof statusCode == "number" ? statusCode : 200
      payload = typeof payload == "object" ? payload : {}
      const payloadString = JSON.stringify(payload)
      res.setHeader("Content-Type", "application/json")
      res.writeHead(statusCode)
      res.end(payloadString)
    })
  })
}

const router = {
  ping: handlers.ping,
  users: handlers.users,
}
