/***
 * Primary file of the API
 */

//Dependencies
const http = require("http")
const url = require("url")
const StringDecoder = require("string_decoder").StringDecoder

// The server should respond all requests with a string
const server = http.createServer(function (req, res) {
  const parsedUrl = url.parse(req.url, true)
  const path = parsedUrl.pathname
  const trimmedPath = path.replace(/^\/+|\/+$/g, "")
  const queryStringObject = parsedUrl.query
  const method = req.method.toLowerCase()
  const headers = req.headers

  // get the payload, if any
  const decoder = new StringDecoder("utf-8")
  let buffer = ""
  req.on("data", function (data) {
    buffer += decoder.write(data)
  })
  req.on("end", function () {
    buffer += decoder.end()
    res.end("Hello World\n")
    console.log("Request received with this payload: ", buffer)
  })
})

server.listen(3000, function () {
  console.log("The server is listening on port 3000 now")
})
