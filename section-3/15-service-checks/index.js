const http = require("http")
const https = require("https")

const { httpPort, httpsPort, httpsOptions } = require("./lib/config")
const server = require("./server")

const init = (protocol = "http") => {
  const op = httpsOptions
  if (protocol === "https") {
    const httpsServer = https.createServer(op, (req, res) => server(req, res))
    httpsServer.listen(httpsPort, () => console.log(`Server on ${httpsPort}`))
  }
  const httpServer = http.createServer((req, res) => server(req, res))
  httpServer.listen(httpPort, () => console.log(`Server on port ${httpPort}`))
}

init()
