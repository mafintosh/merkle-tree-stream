import { MerkleGeneratorOpts, Node, Parent, LeafHash, ParentHash } from './types.js';

declare class MerkleGenerator<Hash> {
  roots: Array<Parent<Hash>>;
  blocks: number;

  _leaf: LeafHash<Hash>;
  _parent: ParentHash<Hash>;

  constructor(opts: MerkleGeneratorOpts<Hash>, roots?: Array<Parent<Hash>>);
  next(data: Buffer | Uint8Array | string, nodes: Array<Node<Hash>>): Array<Node<Hash>>;
}

export = MerkleGenerator;
