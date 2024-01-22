// container for all the enviroments
const enviroments = {}
//staging (default) enviroment
enviroments.staging = {
  port: 3000,
  envName: "staging",
}
enviroments.production = {
  port: 5000,
  envName: "production",
}

// Determine which enviroment was passed as a command-line argument
const currentEnviroment =
  typeof process.env.NODE_ENV == "string"
    ? process.env.NODE_ENV.toLowerCase()
    : ""
// Check that the current enviroment is one of the enviroments above, if not, default to staging
const enviromentToExport =
  typeof enviroments[currentEnviroment] == "object"
    ? enviroments[currentEnviroment]
    : enviroments.staging
// Export the module
module.exports = enviromentToExport
