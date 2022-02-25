import { Transform } from 'streamx';
import { MerkleTreeOpts, Parent, Node } from './types.js';

declare class MerkleTreeStream <Hash> extends Transform<
  Buffer | Uint8Array | string,
  Node<Hash>
> {
  constructor(opts: MerkleTreeOpts<Hash>, roots?: Array<Parent<Hash>>);
}

export = MerkleTreeStream;
