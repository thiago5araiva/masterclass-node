const fs = require("fs")

const enviroments = {}

enviroments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: "staging",
}
enviroments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: "production",
}

const currentEnviroment =
  typeof process.env.NODE_ENV == "string"
    ? process.env.NODE_ENV.toLowerCase()
    : ""
const enviromentToExport =
  typeof enviroments[currentEnviroment] == "object"
    ? enviroments[currentEnviroment]
    : enviroments.staging

const httpsServerOptions = {
  key: fs.readFileSync("./https/key.pem"),
  cert: fs.readFileSync("./https/cert.pem"),
}

module.exports = enviromentToExport
