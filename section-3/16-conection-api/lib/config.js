const fs = require("fs")

const enviroments = {}

enviroments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: "staging",
  hashingSecret: "thisIsASecret",
  maxChecks: 5,
  twilio: {
    accountSid: "ACb4e4e7d3f2b0b3e6e4e6e4e6e4e6e4e6",
    authToken: "",
    fromPhone: "",
  },
}
enviroments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: "production",
  hashingSecret: "thisIsASecret",
  maxChecks: 10,
  twilio: {
    accountSid: "",
    authToken: "",
    fromPhone: "",
  },
}

const currentEnviroment =
  typeof process.env.NODE_ENV == "string"
    ? process.env.NODE_ENV.toLowerCase()
    : ""

const enviromentToExport =
  typeof enviroments[currentEnviroment] == "object"
    ? enviroments[currentEnviroment]
    : enviroments.staging

const httpsOptions = {
  key: fs.readFileSync("./https/key.pem"),
  cert: fs.readFileSync("./https/cert.pem"),
}

module.exports = enviromentToExport
