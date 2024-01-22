/***
 * Primary file of the API
 */

//Dependencies
const http = require("http")
const url = require("url")

// The server should respond all requests with a string
const server = http.createServer(function (req, res) {
  // get the url and parse it
  const parsedUrl = url.parse(req.url, true)
  // get the path
  const path = parsedUrl.pathname
  const trimmedPath = path.replace(/^\/+|\/+$/g, "")
  // send the response
  res.end("Hello World\n")
  // log the request
  console.log("Request received on path: " + trimmedPath)
})
// Start the server, and have it listen on port 3000
server.listen(3000, function () {
  console.log("The server is listening on port 3000 now")
})
