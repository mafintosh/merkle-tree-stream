export interface Base <Hash> {
  index: number;
  parent: number;
  size: number;
  hash: Hash;
}

export interface Parent <Hash> extends Base<Hash> {
  data: null;
}

export type LeafPreHash = Omit<Leaf<any>, 'hash'>;

export interface Leaf <Hash> extends Base<Hash> {
  data: Buffer;
}

export type Node <Hash> = Parent<Hash> | Leaf<Hash>;
export type LeafHash <Hash> = (node: Omit<Leaf<Hash>, 'hash'>, roots: Array<Parent<Hash>>) => Hash;
export type ParentHash <Hash> = (a: Node<Hash>, b: Node<Hash>) => Hash;

export interface MerkleGeneratorOpts <Hash> {
  leaf: LeafHash<Hash>;
  parent: ParentHash<Hash>;
  roots?: Array<Parent<Hash>>;
}

export interface MerkleTreeOpts <Hash> extends MerkleGeneratorOpts<Hash> {
  highWaterMark?: number;
}
