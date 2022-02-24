const { Transform } = require('streamx')
const MerkleGenerator = require('./generator')

class MerkleTreeStream extends Transform {
  constructor (opts, roots) {
    super({ highWaterMark: (opts && opts.highWaterMark) || 16 })
    if (!opts) opts = {}
    this._generator = new MerkleGenerator(opts, roots)
    this._closeUp = !!opts.closeUp
    this.roots = this._generator.roots
    this.blocks = 0
  }

  _transform (data, cb) {
    this._pushNodes(this._generator.next(data))
    cb()
  }

  _final (cb) {
    if (this._closeUp) {
      this._pushNodes(this._generator.next(MerkleGenerator.CLOSE_UP))
    }
    this.push(null)
    cb()
  }

  _pushNodes (nodes) {
    for (let i = 0; i < nodes.length; i++) this.push(nodes[i])
    this.blocks = this._generator.blocks
  }
}
MerkleTreeStream.CLOSE_UP = MerkleGenerator.CLOSE_UP

module.exports = MerkleTreeStream
