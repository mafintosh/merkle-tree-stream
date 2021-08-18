// a more low level interface to the merkle tree stream.
// useful for certain applications the require non-streamy access to the algos.
// versioned by the same semver as the stream interface.

const flat = require('flat-tree')
const CLOSE_UP = Symbol('CLOSE_UP')

class MerkleGenerator {
  constructor (opts, roots) {
    if (!opts || !opts.leaf || !opts.parent) throw new Error('opts.leaf and opts.parent required')

    this.roots = roots || opts.roots || []
    this.blocks = this.roots.length ? 1 + flat.rightSpan(this.roots[this.roots.length - 1].index) / 2 : 0

    for (let i = 0; i < this.roots.length; i++) {
      const r = this.roots[i]
      if (r && !r.parent) r.parent = flat.parent(r.index)
    }

    this._leaf = opts.leaf
    this._parent = opts.parent
  }

  next (data, nodes) {
    const closeUp = data === CLOSE_UP
    if (!nodes) nodes = []
    if (!closeUp) {
      if (!Buffer.isBuffer(data)) data = Buffer.from(data)

      const index = 2 * this.blocks++

      const leaf = {
        index: index,
        parent: flat.parent(index),
        hash: null,
        size: data.length,
        data: data
      }

      leaf.hash = this._leaf(leaf, this.roots)
      this.roots.push(leaf)
      nodes.push(leaf)
    }

    return this._updateRoots(nodes, closeUp)
  }

  _updateRoots (nodes, closeUp) {
    let leaf
    while (this.roots.length > 1) {
      let left = this.roots[this.roots.length - 2]
      let right = this.roots[this.roots.length - 1]

      if (left.parent !== right.parent) {
        if (!closeUp) break

        // let a copy of the right root be its own partner
        left = right
        right = {
          index: flat.sibling(right.index),
          parent: right.parent,
          hash: right.hash,
          size: right.size,
          data: right.data
        }

        this.roots.push(right)
      }

      this.roots.pop()
      this.roots[this.roots.length - 1] = leaf = {
        index: left.parent,
        parent: flat.parent(left.parent),
        hash: this._parent(left, right),
        size: left.size + right.size,
        data: null
      }
      nodes.push(leaf)
    }

    return nodes
  }
}
MerkleGenerator.CLOSE_UP = CLOSE_UP

module.exports = MerkleGenerator
