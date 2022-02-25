const tape = require('tape')
const crypto = require('crypto')
const MerkleTreeStream = require('./')
const MerkleGenerator = require('./generator')

const opts = {
  leaf: function (leaf) {
    return hash([leaf.data])
  },
  parent: function (a, b) {
    return hash([a.hash, b.hash])
  }
}

tape('hashes', function (t) {
  const stream = new MerkleTreeStream(opts)

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
  const stream = new MerkleTreeStream(opts)

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
  const stream = new MerkleTreeStream(opts)

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

tape('starting of with roots for generation', function (t) {
  // Started with nodes 'a', 'b', 'c', 'd', 'e'
  const gen = new MerkleGenerator(Object.assign({}, opts, {
    roots: [
      {
        index: 3,
        size: 4,
        hash: Buffer.from('14ede5e8e97ad9372327728f5099b95604a39593cac3bd38a343ad76205213e7', 'hex'),
        data: null
      },
      {
        index: 8,
        size: 1,
        hash: Buffer.from('3f79bb7b435b05321651daefd374cdc681dc06faa65e374e38337b88ca046dea', 'hex'),
        data: Buffer.from('65', 'hex')
      }
    ]
  }))
  const nodes = []
  gen.next('f', nodes)
  gen.next('g', nodes)
  gen.next('h', nodes)

  t.deepEqual(gen.roots, [
    {
      index: 7,
      parent: 15,
      hash: Buffer.from('bd7c8a900be9b67ba7df5c78a652a8474aedd78adb5083e80e49d9479138a23f', 'hex'),
      size: 8,
      data: null
    }
  ])
  t.end()
})

tape('requiring input leaf/parent option', function (t) {
  t.throws(function () { return new MerkleGenerator({}) })
  t.throws(function () { return new MerkleGenerator({ leaf: function () {} }) })
  t.end()
})

tape('highwatermark while streaming', function (t) {
  // verified by coverage
  const stream = new MerkleTreeStream(Object.assign({}, opts, {
    highWaterMark: 8
  }))
  t.notEqual(stream, null)
  t.end()
})

function hash (list) {
  const sha = crypto.createHash('sha256')
  for (let i = 0; i < list.length; i++) sha.update(list[i])
  return sha.digest()
}
