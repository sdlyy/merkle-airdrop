import { ethers } from "ethers";
import keccak256 from "keccak256";
import MerkleTree from "merkletreejs";

const encode = ethers.utils.solidityKeccak256;

export const getMerkleTreeForAirDrop = (leaves: [string, string][]) => {
  const encodedLeaves = leaves.map((leave) => encode(["address", "uint256"], [leave[0], leave[1]]));

  const tree = new MerkleTree(encodedLeaves, keccak256, { sort: true });

  const root = tree.getHexRoot();

  return [encodedLeaves, root, tree] as const;
};

export const getEncodedLeaf = ([address, amount]: [string, string]) =>
  encode(["address", "uint256"], [address, amount]);
