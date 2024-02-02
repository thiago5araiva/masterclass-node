const { tokens } = require("./tokens")

const handlers = {}

handlers.ping = require("./ping")
handlers.users = require("./users")
handlers.tokens = tokens
handlers.checks = require("./checks")
handlers.notFound = require("./notfound")

module.exports = handlers
