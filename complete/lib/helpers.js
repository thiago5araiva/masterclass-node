import crypto from 'crypto';
import {environmentToExport as config} from '../config.js';

export const helpers = {
  hash(str) {
    if (typeof (str) === 'string' && str.length > 0) {
      return crypto
        .createHmac('sha256', config.hashingSecret)
        .update(str)
        .digest('hex');
    }
    return null;
  },

  // Parse a JSON string to an object
  parseJsonToObject(buffer) {
    let obj = {};
    try {
      obj = JSON.parse(buffer);
    } catch (err) {
      return {};
    }

    return obj;
  },

  requiredParamValidator: (data, fieldName, validationParams) => {
    let isValid =
      helpers.primitiveTypeIsCorrect(data.payload[fieldName], validationParams.type) ||
      helpers.objectTypeIsCorrect(data.payload[fieldName], validationParams.type);
    let value = null;

    if (isValid) {
      switch (validationParams.type) {
        case 'string':
          value = data.payload[fieldName].trim();
          break;
        case 'number':
          value = +data.payload[fieldName];
          break;
        case 'boolean':
          value = !!data.payload[fieldName];
          break;
        case 'array':
          value = data.payload[fieldName];
      }
    }

    if (!value) return null;

    if (isValid && validationParams.minLength) {
      isValid = value.length >= validationParams.minLength;
    }

    if (isValid && validationParams.maxLength) {
      isValid = value.length <= validationParams.maxLength;
    }

    if (isValid && validationParams.exactLength) {
      isValid = value.length === validationParams.exactLength;
    }

    if (isValid && validationParams.contains?.length) {
      isValid = validationParams.contains.includes(value);
    }

    if (isValid && validationParams.min) {
      isValid = value >= validationParams.min;
    }

    if (isValid && validationParams.max) {
      isValid = value <= validationParams.max;
    }

    return isValid ? value : null;
  },

  createRandomString: (strLength) => {
    if (typeof strLength === "number" && strLength > 0) {
      const possibleChars = "abcdefghijklmnopqrstuvwxyz0123456789";
      let randomString = "";

      for (let i = 0; i < strLength; i++) {
        const randomChar = possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
        randomString += randomChar;
      }

      return randomString;
    } else {
      return false;
    }
  },

  primitiveTypeIsCorrect(value, type) {
    return typeof (value) === type;
  },

  objectTypeIsCorrect(objectValue, type) {
    switch (type) {
      case 'array':
        return Array.isArray(objectValue);
      case 'object':
        return Object.prototype.toString.call(objectValue).includes("Object");
      case 'function':
        return Object.prototype.toString.call(objectValue).includes("Function");
    }
  }
};
