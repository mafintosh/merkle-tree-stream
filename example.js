var merkleStream = require('./')
var crypto = require('crypto')

var stream = merkleStream({
  data: function (data, roots) {
    return crypto.createHash('sha256').update(data).digest()
  },
  tree: function (a, b) {
    return crypto.createHash('sha256').update(a).update(b).digest()
  }
})

stream.write('hello')
stream.write('hashed')
stream.write('world')

stream.on('data', function (data) {
  console.log(data)
})
