const http = require("http")
const https = require("https")
const url = require("url")
const StringDecoder = require("string_decoder").StringDecoder
const fs = require("fs")

const config = require("./config")

const handlers = {}
handlers.ping = (data, callback) => callback(200, { pong: "pong" })
handlers.notFound = (data, callback) => callback(404)

const router = {
  ping: handlers.ping,
  sample: handlers.sample,
}

const httpServer = http.createServer((req, res) => unifiedServer(req, res))

//start http server
httpServer.listen(config.httpPort, function () {
  console.log(`The server is listening on port ${config.httpPort} `)
})

// start the https server
// instantiate the https server
const httpsServer = https.createServer(
  {
    key: fs.readFileSync("./https/key.pem"),
    cert: fs.readFileSync("./https/cert.pem"),
  },
  (req, res) => unifiedServer(req, res)
)
httpsServer.listen(config.httpsPort, () =>
  console.log(`Server on port ${config.httpsPort} `)
)

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

  req.on("data", (data) => (buffer += decoder.write(data)))
  req.on("end", () => {
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

    chosenHandler(data, (statusCode, payload) => {
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
