/**
 * Primary file for the API
 */

// Dependencies
import {createServer as createHttpServer} from "http";
import {createServer as createHttpsServer} from "https";
import {StringDecoder} from "string_decoder";
import {readFileSync} from "fs";

import {environmentToExport as config} from "./config.js";
import {handlers} from "./lib/handlers.js";
import {helpers} from "./lib/helpers.js";

// All the server logic for doth the http and https server
const unifiedServer = function (req, res) {
  // Get url and parse it.
  const parseURL = new URL(req.url, "http://localhost:3000");

  // Get path
  const path = parseURL.pathname;
  const trimPath = path.replace(/^\/+|\/+$/g, '');

  // Get the query string as an object
  const queryStringObject = parseURL.searchParams;

  // Get the HTTP Method
  const method = req.method.toLowerCase();

  // Get the headers as an object
  const headers = req.headers;

  // Get the payload, if any
  const decoder = new StringDecoder("utf-8");
  let buffer = "";

  req.on("data", function (data) {
    buffer += decoder.write(data);
  });

  req.on("end", function () {
    buffer += decoder.end();

    // Choose the handler this request should go to.
    const chosenHandler = typeof (router[trimPath]) !== "undefined" ? router[trimPath] : handlers.notFound;

    // Construct the data object to send to the handler
    const data = {
      trimPath,
      queryStringObject,
      method,
      headers,
      payload: helpers.parseJsonToObject(buffer)
    };

    // Route the request to the handler specify in the router
    chosenHandler(data, function (statusCode, payload) {
      // Use the status code called back by the handler, or default to 200
      statusCode = typeof (statusCode) === "number" ? statusCode : 200;

      // Use the payload called back by the handler, or default to
      payload = typeof (payload) === "object" ? payload : {};

      // Convert payload to a string
      const payloadString = JSON.stringify(payload);

      // send to response
      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);
      res.end(payloadString);

      // log the request path
      console.log("Returning the response:", statusCode, payloadString);
    });

    // log the request path.
    console.log(`
Request received on path: ${trimPath}
Request was w/ this method: ${method}
Query string parameters: ${queryStringObject}
Request received w/ headers: ${JSON.stringify(headers)}
Request received w/ payload: ${buffer}
        `);
  });
};

// Instantiate the HTTP server
const httpServer = createHttpServer(unifiedServer);

// Instantiate the HTTPS server
const httpsServerOptions = {
  "key": readFileSync("./https/key.pem"),
  "cert": readFileSync("./https/cert.pem"),
};
const httpsServer = createHttpsServer(httpsServerOptions, unifiedServer);

console.clear();

// Start the HTTP server
httpServer.listen(config.httpPort, function () {
  console.log(`The HTTP server is listening on port ${config.httpPort} in ${config.envName} now.`);
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort, function () {
  console.log(`The HTTPS server is listening on port ${config.httpsPort} in ${config.envName} now.`);
});

const router = {
  "ping": handlers.ping,
  "users": handlers.users,
  "tokens": handlers.tokens,
  "checks": handlers.checks,
};
