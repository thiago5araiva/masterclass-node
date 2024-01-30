const http = require("http")
const url = require("url")

const serverPath = (raw) => {}

const server = http.createServer((req, res) => {
  const parsedURL = url.parse(req.url, true)
  const path = parsedURL.pathname
  const trimmedPath = path.replace(/^\/+|\/+$/g, "")
  if (!trimmedPath) return raw
  const method = req.method.toLowerCase()
  console.log({ path: pathURL, method })
  res.end("")
})

server.listen(3000, () => console.log("Listening on port 3000 now"))
