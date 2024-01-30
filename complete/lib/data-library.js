import * as fs from "fs";
import * as path from "path";
import {helpers} from './helpers.js';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DataLibrary {
  static create(dir, file, data, callback) {
    fs.open(`${DataLibrary.baseDir}${dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
      if (!err) {
        const stringData = JSON.stringify(data);

        fs.writeFile(fileDescriptor, stringData, (err) => {
          if (!err) {
            fs.close(fileDescriptor, (err) => {
              if (!err) {
                callback(false);
              } else {
                callback("Error closing new file");
              }
            });
          } else {
            callback("Error writing to new file");
          }
        });
      } else {
        callback("Could not create new file, it already exist");
      }
    });
  }

  static read(dir, file, callback) {
    fs.readFile(`${DataLibrary.baseDir}${dir}/${file}.json`, "utf8", (err, data) => {
      !err ? callback(false, helpers.parseJsonToObject(data)) : callback(err, data);
    });
  }

  static update(dir, file, data, callback) {
    fs.open(`${DataLibrary.baseDir}${dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
      if (!err) {
        const stringData = JSON.stringify(data);

        fs.ftruncate(fileDescriptor, (err) => {
          if (!err) {
            fs.writeFile(fileDescriptor, stringData, (err) => {
              if (!err) {
                fs.close(fileDescriptor, (err) => {
                  !err ? callback(false) : callback("Error while closing the file");
                });
              } else callback("Error writing to existing file");
            });
          } else callback("Error truncating file");
        });
      } else callback("could not open the file for update - it may not exist yet.");
    });
  }

  static delete(dir, file, callback) {
    fs.unlink(`${DataLibrary.baseDir}${dir}/${file}.json`, (err) => {
      !err ? callback(false) : callback("Could not delete file");
    });
  }
}

DataLibrary.baseDir = path.join(__dirname, '/../.data/');
