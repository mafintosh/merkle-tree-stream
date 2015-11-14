var through = require('through2')
var flat = require('flat-tree')

module.exports = function (opts) {
  if (!opts || !opts.data || !opts.tree) throw new Error('opts.data and opts.tree required')

  var hashData = opts.data
  var hashTree = opts.tree
  var stream = through.obj(write)
  stream.head = 0
  stream.roots = []
  return stream

  function write (data, enc, cb) {
    var hash = hashData(data, stream.roots, stream.head)
    var root = {
      index: stream.head,
      parent: flat.parent(stream.head),
      hash: hash,
      data: data
    }

    stream.push(root)
    stream.roots.push(root)
    stream.head += 2

    while (stream.roots.length > 1) {
      var left = stream.roots[stream.roots.length - 2]
      var right = stream.roots[stream.roots.length - 1]

      if (left.parent !== right.parent) break

      stream.roots.pop()
      stream.roots[stream.roots.length - 1] = root = {
        index: left.parent,
        parent: flat.parent(left.parent),
        hash: hashTree(left.hash, right.hash),
        data: null
      }
      stream.push(root)
    }

    cb()
  }
}
