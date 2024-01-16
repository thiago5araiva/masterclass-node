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
  //get the query string as an object
  const queryStringObject = parsedUrl.query
  // get the http methhod
  const method = req.method.toLowerCase()
  // get the headers as an object
  const headers = req.headers
  // send the response
  res.end("Hello World\n")
  // log the request
  console.log("Request received with these path:", trimmedPath)
  console.log("Request received with this method:", method)
  console.log("Request received with this query:", queryStringObject)
  console.log("Request received with these headers:", headers)
})
// Start the server, and have it listen on port 3000
server.listen(3000, function () {
  console.log("The server is listening on port 3000 now")
})