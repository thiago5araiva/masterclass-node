const http = require("http")
const url = require("url")

const server = http.createServer(function (req, res) {
  const parsedUrl = url.parse(req.url, true)
  const path = parsedUrl.pathname
  const trimmedPath = path.replace(/^\/+|\/+$/g, "")
  const queryStringObject = parsedUrl.query
  const method = req.method.toLowerCase()
  res.end()
  console.log({
    path: trimmedPath,
    method,
    query: queryStringObject,
  })
})
server.listen(3000, () => console.log("Listening on port 3000 now"))
