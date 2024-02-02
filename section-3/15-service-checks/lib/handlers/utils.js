const handleVerifyName = (value) => {
  const name = String(value).trim()
  return name.length > 0 ? name : undefined
}

const handleVerifyPhone = (value) => {
  const phone = String(value).trim()
  return phone.length == 10 ? phone : undefined
}

const handleVerifyPassword = (value) => {
  const password = String(value)
  return password.length > 0 ? password : undefined
}

const handleVerifyTosAgreement = (value) => {
  const tosAgreement = Boolean(value)
  return tosAgreement ? tosAgreement : undefined
}

const handleVerifyUpdatableFields = (params) => {
  const { firstName, lastName, password } = params
  const name = handleVerifyName(firstName)
  const surname = handleVerifyName(lastName)
  const pass = handleVerifyPassword(password)
  const validParams = [name, surname, pass]
  return validParams.includes(undefined) ? false : true
}

const handleVerifyAllFields = (params) => {
  const { firstName, lastName, phone, password, tosAgreement } = params
  const name = handleVerifyName(firstName)
  const surname = handleVerifyName(lastName)
  const phoneNumber = handleVerifyPhone(phone)
  const pass = handleVerifyPassword(password)
  const agreement = handleVerifyTosAgreement(tosAgreement)
  const validParams = [name, surname, phoneNumber, pass, agreement]
  return validParams.includes(undefined) ? false : true
}

const handleVerifyId = (value) => {
  const id = String(value).trim()
  return id.length === 20 ? id : undefined
}

const handleVerifyExtend = (value) => {
  const extend = Boolean(value)
  return extend ? extend : undefined
}

const handleVerifyToken = (value) => {
  const token = String(value).trim()
  return token ? token : undefined
}

const handleVerifyProtocols = (value) => {
  const protocol = String(value).trim()
  return ["http", "https"].includes(protocol) ? protocol : undefined
}

const handleVerifyUrl = (value) => {
  const url = String(value).trim()
  return url.length > 0 ? url : undefined
}

const handleVerifyMethod = (methods) => {
  const method = String(methods).trim()
  return ["post", "get", "put", "delete"].includes(method) ? method : undefined
}

const handleVerifyStatusCodes = (value) => {
  const successCodes = Array.isArray(value) ? value : undefined
  return successCodes && successCodes.length > 0 ? successCodes : undefined
}

const handleVerifySeconds = (value) => {
  const timeoutSeconds = Number(value)
  return timeoutSeconds && timeoutSeconds >= 1 ? timeoutSeconds : undefined
}

module.exports = {
  handleVerifySeconds,
  handleVerifyStatusCodes,
  handleVerifyMethod,
  handleVerifyUrl,
  handleVerifyProtocols,
  handleVerifyToken,
  handleVerifyExtend,
  handleVerifyName,
  handleVerifyPhone,
  handleVerifyPassword,
  handleVerifyTosAgreement,
  handleVerifyAllFields,
  handleVerifyUpdatableFields,
  handleVerifyId,
}
