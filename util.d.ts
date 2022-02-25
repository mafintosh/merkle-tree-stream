import { Node, Leaf, Parent } from './types.js';

export function isParent <Hash>(node: Node<Hash>): node is Parent<Hash>;
export function isLeaf <Hash>(node: Node<Hash>): node is Leaf<Hash>;
