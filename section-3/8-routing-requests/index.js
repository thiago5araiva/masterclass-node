/***
 * Primary file of the API
 */

//Dependencies
const http = require("http")
const url = require("url")
const StringDecoder = require("string_decoder").StringDecoder

const server = http.createServer(function (req, res) {
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

    // choose the handler this request should go to. If one is not found, use the notFound handler
    const chosenHandler =
      typeof router[trimmedPath] !== "undefined"
        ? router[trimmedPath]
        : handlers.notFound

    // construct the data object to send to the handler
    const data = {
      trimmedPath: trimmedPath,
      queryStringObject: queryStringObject,
      method: method,
      headers: headers,
      payload: buffer,
    }

    //router the request to the handler specified in the router
    chosenHandler(data, function (statusCode, payload) {
      // use the status code called back by the handler, or default to 200
      statusCode = typeof statusCode == "number" ? statusCode : 200
      // use the payload called back by the handler, or default to an empty object
      payload = typeof payload == "object" ? payload : {}
      // convert the payload to a string
      const payloadString = JSON.stringify(payload)
      // return the response
      res.writeHead(statusCode)
      res.end(payloadString)
      // log the request path
      console.log("Returning this response: ", statusCode, payloadString)
    })

    console.log("Request received with this payload: ", buffer)
  })
})

server.listen(3000, function () {
  console.log("The server is listening on port 3000 now")
})
//define our handlers
const handlers = {}

//sample handler
handlers.sample = function (data, callback) {
  // callback a http status code, and a payload object
  callback(406, { name: "sample handler" })
}

//notfound handler
handlers.notFound = function (data, callback) {
  callback(404)
}

//Define a request router
const router = {
  sample: handlers.sample,
}
