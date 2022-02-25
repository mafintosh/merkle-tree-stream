module.exports = {
  isParent: function (node) {
    return node.data === null
  },
  isLeaf: function (node) {
    return node.data !== null
  }
}
