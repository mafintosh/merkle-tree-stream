const tape = require('tape')
const crypto = require('crypto')
const MerkleTreeStream = require('./')

tape('hashes', function (t) {
  const stream = new MerkleTreeStream({
    leaf: function (leaf) {
      return hash([leaf.data])
    },
    parent: function (a, b) {
      return hash([a.hash, b.hash])
    }
  })

  stream.write('a')
  stream.write('b')
  stream.end()

  const expected = [{
    index: 0,
    parent: 1,
    hash: hash(['a']),
    size: 1,
    data: Buffer.from('a')
  }, {
    index: 2,
    parent: 1,
    hash: hash(['b']),
    size: 1,
    data: Buffer.from('b')
  }, {
    index: 1,
    parent: 3,
    size: 2,
    hash: hash([hash(['a']), hash(['b'])]),
    data: null
  }]

  stream.on('data', function (data) {
    t.same(data, expected.shift(), 'hashes data')
  })

  stream.on('end', function () {
    t.same(expected.length, 0, 'no more data')
    t.end()
  })
})

tape('one root on power of two', function (t) {
  const stream = new MerkleTreeStream({
    leaf: function (leaf) {
      return hash([leaf.data])
    },
    parent: function (a, b) {
      return hash([a.hash, b.hash])
    }
  })

  stream.write('a')
  stream.write('b')
  stream.write('c')
  stream.write('d')
  stream.end()

  stream.resume()
  stream.on('end', function () {
    t.same(stream.roots.length, 1, 'one root')
    t.end()
  })
})

tape('multiple roots if not power of two', function (t) {
  const stream = new MerkleTreeStream({
    leaf: function (leaf) {
      return hash([leaf.data])
    },
    parent: function (a, b) {
      return hash([a.hash, b.hash])
    }
  })

  stream.write('a')
  stream.write('b')
  stream.write('c')
  stream.end()

  stream.resume()
  stream.on('end', function () {
    t.ok(stream.roots.length > 1, 'more than one root')
    t.end()
  })
})

;[true, false].forEach(function (manual) {
  tape('close up to one root [' + (manual ? 'manual' : 'automatic') + ']', function (t) {
    const stream = new MerkleTreeStream({
      leaf: function (leaf) {
        return Buffer.from(leaf.data + leaf.data)
      },
      parent: function (a, b) {
        return Buffer.concat([a.hash, b.hash])
      },
      closeUp: !manual
    })

    const nodes = []
    stream.on('data', function (node) {
      nodes.push(node)
    })

    stream.write('a')
    stream.write('b')
    stream.write('c')
    stream.write('d')
    stream.write('e')
    if (manual) {
      stream.write(MerkleTreeStream.CLOSE_UP)
    }
    stream.end()

    stream.on('end', function () {
      t.notOk(stream.roots.length > 1, 'only one root')
      t.equal(stream.roots[0].hash.toString(), 'aabbccddeeeeeeee')

      nodes.sort(function (a, b) {
        return a.index - b.index
      })

      t.deepEqual(nodes.map(function (n) {
        n.data = n.data && n.data.toString()
        n.hash = n.hash.toString()
        return n
      }), [
        { data: 'a', hash: 'aa', index: 0, parent: 1, size: 1 },
        { data: null, hash: 'aabb', index: 1, parent: 3, size: 2 },
        { data: 'b', hash: 'bb', index: 2, parent: 1, size: 1 },
        { data: null, hash: 'aabbccdd', index: 3, parent: 7, size: 4 },
        { data: 'c', hash: 'cc', index: 4, parent: 5, size: 1 },
        { data: null, hash: 'ccdd', index: 5, parent: 3, size: 2 },
        { data: 'd', hash: 'dd', index: 6, parent: 5, size: 1 },
        { data: null, hash: 'aabbccddeeeeeeee', index: 7, parent: 15, size: 8 },
        { data: 'e', hash: 'ee', index: 8, parent: 9, size: 1 },
        { data: null, hash: 'eeee', index: 9, parent: 11, size: 2 },
        { data: null, hash: 'eeeeeeee', index: 11, parent: 7, size: 4 }
      ])

      t.end()
    })
  })
})

function hash (list) {
  const sha = crypto.createHash('sha256')
  for (let i = 0; i < list.length; i++) sha.update(list[i])
  return sha.digest()
}
