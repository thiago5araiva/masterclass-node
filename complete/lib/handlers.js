import {DataLibrary} from "./data-library.js";
import {helpers} from "./helpers.js";
import {environmentToExport} from "../config.js";

// Define a request router
export const handlers = {};

handlers._users = {};
handlers._tokens = {};
handlers._checks = {};

// USERS //

// Required fields: phone
// Optional data: none
handlers._users.get = (data, callback) => {
  const phone = data.queryStringObject.get('phone');
  const phoneValidated = (typeof (phone) === 'string' && phone.trim().length === 12) ? phone.trim() : null;

  const token = typeof (data.headers.token) === "string" ? data.headers.token : false;
  handlers._tokens.verifyToken(token, phoneValidated, (tokenIsValid) => {
    if (tokenIsValid) {
      if (phoneValidated) {
        DataLibrary.read('users', phoneValidated, (err, data) => {
          if (!err) {
            callback(200, {
              firstName: data.firstName,
              lastName: data.lastName,
              phone: data.phone,
              tosAgreement: data.tosAgreement,
            });
          } else {
            callback(404, {'Error': "User not found"});
          }
        });
      } else {
        callback(400, {'Error': "Missing required fields"});
      }
    } else {
      callback(403, {"Error": "Missing required token in header or token is invalid"})
    }
  });
};

// Required fields: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = (data, callback) => {
  // check that all required fields are filled out
  const firstName = helpers.requiredParamValidator(data, 'firstName', {
    type: 'string',
    minLength: 1,
  });
  const lastName = helpers.requiredParamValidator(data, 'lastName', {
    type: 'string',
    minLength: 1,
  });
  const phone = helpers.requiredParamValidator(data, 'phone', {
    type: 'string',
    exactLength: 12,
  });
  const password = helpers.requiredParamValidator(data, 'password', {
    type: 'string',
    minLength: 1,
  });
  const tosAgreement = helpers.requiredParamValidator(data, 'tosAgreement', {type: 'boolean'});

  if (firstName && lastName && phone && password && tosAgreement) {
    // Make sure that the user already exist
    DataLibrary.read('users', phone, (err) => {
      if (err) {
        // hash the password
        const hashPassword = helpers.hash(password);

        if (hashPassword) {
          const userObject = {
            firstName,
            lastName,
            phone,
            hashPassword,
            tosAgreement,
          };

          DataLibrary.create('users', phone, userObject, (err) => {
            if (!err) {
              callback(200);
            } else {
              console.error(err);
              callback(500, {'Error': 'Could not create the new user'});
            }
          });
        } else {
          callback(500, {'Error': 'Could not hash the user\'s password'});
        }
      } else {
        callback(400, {'Error': 'A user already exists'});
      }
    })

  } else {
    callback(400, {'Error': "Missing required fields"})
  }
};

// Required fields: phone
// Optional data: firstName, lastName, password (at least one must be specified)
handlers._users.put = (data, callback) => {
  const firstName = helpers.requiredParamValidator(data, 'firstName', {
    type: 'string',
    minLength: 1,
  });
  const lastName = helpers.requiredParamValidator(data, 'lastName', {
    type: 'string',
    minLength: 1,
  });
  const phone = helpers.requiredParamValidator(data, 'phone', {
    type: 'string',
    exactLength: 12,
  });
  const password = helpers.requiredParamValidator(data, 'password', {
    type: 'string',
    minLength: 1,
  });

  if (phone) {
    const token = typeof (data.headers.token) === "string" ? data.headers.token : false;
    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        if (firstName || lastName || password) {
          DataLibrary.read('users', phone, (err, data) => {
            if (!err && data) {
              if (firstName) {
                data.firstName = firstName;
              }
              if (lastName) {
                data.lastName = lastName;
              }
              if (password) {
                data.hashedPassword = helpers.hash(password);
              }

              DataLibrary.update('users', phone, data, (err) => {
                if (!err) {
                  callback(203);
                } else {
                  console.error(err);
                  callback(500, {'Error': 'Could not update the user data'});
                }
              });
            } else {
              callback(400, {'Error': 'A user doesn\'t exist'});
            }
          });
        } else {
          callback(400, {'Error': "One field at least should be specified"});
        }
      } else {
        callback(403, {"Error": "Missing required token in header or token is invalid"})
      }
    });
  } else {
    callback(400, {'Error': "Missing required fields"});
  }
};

// Required fields: phone
// Optional data: none
handlers._users.delete = (data, callback) => {
  const phone = data.queryStringObject.get('phone');
  const phoneValidated = (typeof (phone) === 'string' && phone.trim().length === 12) ? phone.trim() : null;

  const token = typeof (data.headers.token) === "string" ? data.headers.token : false;
  handlers._tokens.verifyToken(token, phoneValidated, (tokenIsValid) => {
    if (tokenIsValid) {
      if (phoneValidated) {
        DataLibrary.read('users', phoneValidated, (err, userData) => {
          if (!err) {
            DataLibrary.delete('users', phoneValidated, (err) => {
              if (!err) {
                let deletionErrors = false;
                userData.checks.length && userData.checks.forEach((checkId) => {
                  DataLibrary.delete('checks', checkId, (err) => {
                    deletionErrors = !!err;
                  });
                });
                console.log(deletionErrors);
                deletionErrors ? callback(200, {"Message": "Not all checks might be successfully deleted"}) : callback(200);
              } else {
                console.error(err);
                callback(500, {'Error': 'Could not delete the user'});
              }
            });
          } else {
            callback(404, {'Error': "User not found"});
          }
        });
      } else {
        callback(400, {'Error': "Missing required fields"});
      }
    } else {
      callback(403, {"Error": "Missing required token in header or token is invalid"})
    }
  });
};

// TOKENS //

// Required data: tokenId
// Optional data: none
handlers._tokens.get = (data, callback) => {
  const tokenId = data.queryStringObject.get('tokenId');
  const tokenIdValidated = (typeof (tokenId) === 'string' && tokenId.trim().length === 20) ? tokenId.trim() : null;

  if (tokenIdValidated) {
    DataLibrary.read('tokens', tokenIdValidated, (err, tokenData) => {
      if (!err && tokenData) {
        callback(200, {tokenData});
      } else {
        callback(404, {'Error': "Token not found"});
      }
    });
  } else {
    callback(400, {'Error': "Missing required fields or values are incorrect"});
  }

};

// Required data: phone, password
// Optional data: none
handlers._tokens.post = (data, callback) => {
  const phone = helpers.requiredParamValidator(data, 'phone', {
    type: 'string',
    exactLength: 12,
  });

  const password = helpers.requiredParamValidator(data, 'password', {
    type: 'string',
    minLength: 1,
  });

  if (phone && password) {
    DataLibrary.read('users', phone, (err, userData) => {
      if (!err && userData) {
        const hashedPassword = helpers.hash(password);

        if (hashedPassword === userData.hashPassword) {
          const tokenId = helpers.createRandomString(20);
          const expires = Date.now() + 1000 * 60 * 60;
          const tokenObject = {phone, tokenId, expires};

          DataLibrary.create('tokens', tokenId, tokenObject, (err) => {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, {"Error": "Could not create the new token"});
            }
          });
        } else {
          callback(400, {"Error": "Password did not match the specified user's stored password"});
        }
      } else {
        callback(400, {"Error": "Could not find the specified user"});
      }
    });
  } else {
    callback(400, {"Error": "Missing required field(s)"});
  }
};

handlers._tokens.put = (data, callback) => {
  const tokenId = helpers.requiredParamValidator(data, 'tokenId', {
    type: 'string',
    exactLength: 20
  });

  const extend = helpers.requiredParamValidator(data, 'extend', {
    type: 'boolean',
  });

  if (tokenId && extend) {
    DataLibrary.read('tokens', tokenId, (err, tokenData) => {
      if (!err && tokenData) {

        if (tokenData.expires > Date.now()) {
          tokenData.expires = Date.now() + 1000 * 60 * 60;

          DataLibrary.update('tokens', tokenId, tokenData, (err) => {
            if (!err) {
              callback(200);
            } else {
              callback(500, {"Error": "Could not update the token\'s expiration"});
            }
          });
        } else {
          callback(400, {"Error": "The token has already expired and cannot be extended"});
        }
      } else {
        callback(400, {"Error": "Specified token does not exist"});
      }
    });
  } else {
    callback(400, {"Error": "Missing required field(s) or field(s) are invalid"});
  }
};

// Required data: tokenId
// Optional data: none
handlers._tokens.delete = (data, callback) => {
  const tokenId = data.queryStringObject.get('tokenId');
  const tokenIdValidated = (typeof (tokenId) === 'string' && tokenId.trim().length === 20) ? tokenId.trim() : null;

  if (tokenIdValidated) {
    DataLibrary.read('tokens', tokenIdValidated, (err) => {
      if (!err) {
        DataLibrary.delete('tokens', tokenIdValidated, (err) => {
          if (!err) {
            callback(200);
          } else {
            console.error(err);
            callback(500, {'Error': 'Could not delete the token'});
          }
        });
      } else {
        callback(404, {'Error': "Token not found"});
      }
    });
  } else {
    callback(400, {'Error': "Missing required fields"});
  }
};

handlers._tokens.verifyToken = (tokenId, phone, callback) => {
  DataLibrary.read("tokens", tokenId, (err, tokenData) => {
    if (!err && tokenData) {
      if (tokenData.phone === phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

// CHECKS //

// Required data: protocol, url, method, successCodes, timeoutSeconds
// Optional data: none
handlers._checks.post = (data, callback) => {
  const token = typeof (data.headers.token) === "string" ? data.headers.token : false;

  const protocol = helpers.requiredParamValidator(data, 'protocol', {
    type: 'string',
    contains: ['http', 'https'],
  });

  const url = helpers.requiredParamValidator(data, 'url', {
    type: 'string',
    minLength: 10,
  });

  const method = helpers.requiredParamValidator(data, 'method', {
    type: 'string',
    contains: ['post', 'get', 'put', 'delete'],
  });

  const successCodes = helpers.requiredParamValidator(data, 'successCodes', {
    type: 'array',
    minLength: 1,
  });

  const timeoutSeconds = helpers.requiredParamValidator(data, 'timeoutSeconds', {
    type: 'number',
    min: 1,
  });

  DataLibrary.read('tokens', token, (err, tokenData) => {
    if (!err && tokenData) {
      const phone = tokenData.phone;

      DataLibrary.read('users', phone, (err, userData) => {
        if (!err && userData) {
          const userChecks = helpers.objectTypeIsCorrect(userData.checks, 'array') ? userData.checks : [];

          if (userChecks.length < environmentToExport.maxChecks) {
            const checkId = helpers.createRandomString(20);
            const checkObject = {
              phone,
              checkId,
              protocol,
              url,
              method,
              successCodes,
              timeoutSeconds,
            };

            DataLibrary.create('checks', checkId, checkObject, (err) => {
              if (!err) {
                userData.checks = [...userChecks, checkId];
                DataLibrary.update('users', phone, userData, (err) => {
                  if (!err) {
                    callback(200, checkObject);
                  } else {
                    callback(500, {"Error": "Could not update user with the new check"});
                  }
                });
              } else {
                callback(500, {"Error": "Could not create new check"});
              }
            });
          } else {
            callback(400, {"Error": `The user already has the maximum number of checks: ${environmentToExport.maxChecks}`});
          }
        } else {
          callback(403, {"Error": "Could not retrieve user data from token"})
        }
      });
    }
  });
};

// Required data: checkId
// Optional data: none
handlers._checks.get = (data, callback) => {
  const checkId = data.queryStringObject.get('checkId');
  const checkIdValidated = (typeof (checkId) === 'string' && checkId.trim().length === 20) ? checkId.trim() : null;

  if (checkIdValidated) {
    DataLibrary.read('checks', checkId, (err, checkData) => {
      if (!err && checkData) {
        const token = typeof (data.headers.token) === "string" ? data.headers.token : false;
        handlers._tokens.verifyToken(token, checkData.phone, (tokenIsValid) => {
          if (tokenIsValid) {
            callback(200, checkData);
          } else {
            callback(403, {"Error": "Missing required token in header or token is invalid"});
          }
        });
      } else {
        callback(404, {"Error": "Check not found"});
      }
    });
  } else {
    callback(400, {"Error": "Missing required fields"});
  }
};

// Required data: checkId
// Optional data: protocol, url, method successCodes, timoutSeconds (one must be sent)
handlers._checks.put = (data, callback) => {
  const checkId = helpers.requiredParamValidator(data, 'checkId', {
    type: 'string',
    exactLength: 20,
  });

  const protocol = helpers.requiredParamValidator(data, 'protocol', {
    type: 'string',
    contains: ['http', 'https'],
  });

  const url = helpers.requiredParamValidator(data, 'url', {
    type: 'string',
    minLength: 10,
  });

  const method = helpers.requiredParamValidator(data, 'method', {
    type: 'string',
    contains: ['post', 'get', 'put', 'delete'],
  });

  const successCodes = helpers.requiredParamValidator(data, 'successCodes', {
    type: 'array',
    minLength: 1,
  });

  const timeoutSeconds = helpers.requiredParamValidator(data, 'timeoutSeconds', {
    type: 'number',
    min: 1,
  });

  if (checkId) {
    if (protocol || url || method || successCodes || timeoutSeconds) {
      DataLibrary.read('checks', checkId, (err, checkData) => {
        if (!err && checkData) {
          const token = typeof (data.headers.token) === "string" ? data.headers.token : false;
          handlers._tokens.verifyToken(token, checkData.phone, (tokenIsValid) => {
            if (tokenIsValid) {
              checkData = {
                ...checkData,
                protocol: protocol || checkData.protocol,
                url: url || checkData.url,
                method: method || checkData.method,
                successCodes: successCodes || checkData.successCodes,
                timeoutSeconds: timeoutSeconds || checkData.timeoutSeconds,
              }

              DataLibrary.update('checks', checkId, checkData, (err) => {
                if (!err) {
                  callback(200, checkData);
                } else {
                  callback(500, {"Error": "Could not update the check"});
                }
              });
            } else {
              callback(403, {"Error": "Missing required token in header or token is invalid"});
            }
          });
        } else {
          callback(404, {"Error": "Could not find this check"});
        }
      });
    } else {
      callback(400, {"Error": "Missing optional data: at least one field must be present"})
    }
  } else {
    callback(400, {"Error": "Missing required field"});
  }
};

// Required data: checkId
// Optional data: none
handlers._checks.delete = (data, callback) => {
  const checkId = data.queryStringObject.get('checkId');
  const checkIdValidated = (typeof (checkId) === 'string' && checkId.trim().length === 20) ? checkId.trim() : null;

  if (checkIdValidated) {
    DataLibrary.read('checks', checkId, (err, checkData) => {
      if (!err && checkData) {
        const token = typeof (data.headers.token) === "string" ? data.headers.token : false;
        handlers._tokens.verifyToken(token, checkData.phone, (tokenIsValid) => {
          if (tokenIsValid) {
            DataLibrary.delete('checks', checkId, (err) => {
              if (!err) {
                DataLibrary.read('users', checkData.phone, (err, userData) => {
                  if (!err && userData) {
                    userData.checks = userData.checks.filter((check) => check !== checkId);
                    DataLibrary.update('users', userData.phone, userData, (err) => {
                      if (!err) {
                        callback(200);
                      } else {
                        callback(500, {"Error": "Could not update the user data by removing check"});
                      }
                    });
                  } else {
                    callback(500, {"Error": "Could not find the user who created this checks"});
                  }
                });
              } else {
                callback(500, {"Error": "Could not update the check"});
              }
            });
          } else {
            callback(403, {"Error": "Missing required token in header or token is invalid"});
          }
        });

      } else {
        callback(400, {"Error": "Specified Check ID does not exist"});
      }
    });
  } else {
    callback(400, {'Error': "Missing required fields"});
  }

};

// HANDLERS BINDING
handlers.users = (data, callback) => {
  const acceptableMethods = ['get', 'post', 'put', 'delete'];

  if (acceptableMethods.includes(data.method)) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers.tokens = (data, callback) => {
  const acceptableMethods = ['get', 'post', 'put', 'delete'];

  if (acceptableMethods.includes(data.method)) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers.checks = (data, callback) => {
  const acceptableMethods = ['get', 'post', 'put', 'delete'];

  if (acceptableMethods.includes(data.method)) {
    handlers._checks[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers.ping = (data, callback) => callback(200);
handlers.notFound = (data, callback) => callback(404);
