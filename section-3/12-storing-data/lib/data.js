const fs = require("fs")
const path = require("path")

const lib = {}
lib.baseDir = path.join(__dirname, "/../.data/")
lib.baseFile = (dir, fileName) => lib.baseDir + dir + "/" + fileName + ".json"

lib.create = (dir, filename, data, callback) => {
  fs.open(lib.baseFile(dir, filename), "wx", (err, fileDescriptor) => {
    if (err) return callback("Could not create new file, it may already exist")
    const stringData = JSON.stringify(data)
    fs.writeFile(fileDescriptor, stringData, (err) => {
      if (err) return callback("Error writing to new file")
      fs.close(fileDescriptor, (err) => {
        if (err) return callback("Error closing new file")
        callback(false)
      })
    })
  })
}

lib.read = (dir, filename, callback) => {
  fs.readFile(lib.baseFile(dir, filename), "utf8", (err, data) => {
    if (err) return callback(err, data)
    const parsedData = JSON.stringify(data)
    callback(false, parsedData)
  })
}

lib.update = (dir, filename, data, callback) => {
  fs.open(lib.baseFile(dir, filename), "r+", (err, fileDescriptor) => {
    if (err) return callback("Could not open the file for updating")
    const stringData = JSON.stringify(data)
    fs.ftruncate(fileDescriptor, (err) => {
      if (err) return callback("Error truncating file")
      fs.writeFile(fileDescriptor, stringData, (err) => {
        if (err) return callback("Error writing to existing file")
        fs.close(fileDescriptor, (err) => {
          if (err) return callback("Error closing existing file")
          callback(false)
        })
      })
    })
  })
}

lib.delete = (dir, filename, callback) => {
  fs.unlink(lib.baseFile(dir, filename), (err) => callback(err))
}

module.exports = lib
