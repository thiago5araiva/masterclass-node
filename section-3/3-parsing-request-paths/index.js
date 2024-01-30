const http = require("http")
const url = require("url")

const serverPath = (raw) => {
  const parsed = url.parse(raw, true)
  const path = parsed.pathname
  const trimmed = path.replace(/^\/+|\/+$/g, "")
  if (!trimmed) return raw
  return trimmed
}

const server = http.createServer((req, res) => {
  const pathURL = serverPath(req.url)
  console.log({ path: pathURL, method })
  res.end("")
})

server.listen(3000, () => console.log("Listening on port 3000 now"))
