// a more low level interface to the merkle tree stream.
// useful for certain applications the require non-streamy access to the algos.
// versioned by the same semver as the stream interface.

var flat = require('flat-tree')

module.exports = MerkleGenerator

function MerkleGenerator (opts, roots) {
  if (!(this instanceof MerkleGenerator)) return new MerkleGenerator(opts, roots)
  if (!opts || !opts.data || !opts.tree) throw new Error('opts.data and opts.tree required')

  this.roots = opts.roots || []
  this.blocks = this.roots.length ? flat.rightSpan(this.roots[this.roots.length - 1].index) / 2 : 0

  this._data = opts.data
  this._tree = opts.tree
}

MerkleGenerator.prototype.next = function (data, nodes) {
  if (!Buffer.isBuffer(data)) data = new Buffer(data)
  if (!nodes) nodes = []

  var index = 2 * this.blocks++
  var hash = this._data(data)

  var root = {
    index: index,
    parent: flat.parent(index),
    hash: hash,
    data: data
  }

  this.roots.push(root)
  nodes.push(root)

  while (this.roots.length > 1) {
    var left = this.roots[this.roots.length - 2]
    var right = this.roots[this.roots.length - 1]

    if (left.parent !== right.parent) break

    this.roots.pop()
    this.roots[this.roots.length - 1] = root = {
      index: left.parent,
      parent: flat.parent(left.parent),
      hash: this._tree(left.hash, right.hash),
      data: null
    }
    nodes.push(root)
  }

  return nodes
}
