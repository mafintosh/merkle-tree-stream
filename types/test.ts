import MerkleTreeStream = require('merkle-tree-stream');
import MerkleTreeStreamGenerator = require('merkle-tree-stream/generator');
import type { LeafPreHash, Parent, Node } from 'merkle-tree-stream/types';
import { isParent, isLeaf } from 'merkle-tree-stream/util';

const x = new MerkleTreeStream({
  leaf(node: LeafPreHash, roots: Array<Parent<string>>) {
    // @ExpectType Buffer
    node.data;
    // @ExpectType number
    node.index;
    // @ExpectType number
    node.parent;
    // @ExpectType number
    node.size;
    return "hi";
  },
  parent(a: Node<string>, b: Node<string>) {
    return "hi";
  }
});

x.write('hi');
x.write(new Uint8Array());
x.write(Buffer.from('hello'));

const y = new MerkleTreeStreamGenerator({
  leaf: () => Buffer.alloc(0),
  parent: () => Buffer.alloc(0)
});

let nodes: Array<Node<Buffer>> = [];
nodes = y.next('hello', nodes);

const node = x.read();
// $ExpectType string
node.hash;
// $ExpectType number
node.index;
// $ExpectType number
node.size;
// $ExpectType number
node.parent;
if (isParent(node)) {
  // $ExpectType null
  node.data;
}
if (isLeaf(node)) {
  // $ExpectType Buffer
  node.data;
}
