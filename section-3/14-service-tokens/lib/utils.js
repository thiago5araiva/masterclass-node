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

module.exports = {
  handleVerifyName,
  handleVerifyPhone,
  handleVerifyPassword,
  handleVerifyTosAgreement,
  handleVerifyAllFields,
  handleVerifyUpdatableFields,
}
