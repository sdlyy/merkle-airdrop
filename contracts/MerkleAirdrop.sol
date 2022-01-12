// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { MerkleProof } from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MerkleAirdrop {
  bytes32 public merkleRoot;
  IERC20 public token;

  mapping(address => bool) public hasClaimed;

  constructor(bytes32 _merkleRoot, IERC20 _token) {
    merkleRoot = _merkleRoot;
    token = _token;
  }

  event Claim(address indexed to, uint256 amount);

  function claim(
    address to,
    uint256 amount,
    bytes32[] memory proof
  ) external {
    // Throw if address has already claimed tokens
    require(!hasClaimed[to], "Already claimed");

    // Verify merkle proof, or revert if not in tree
    bytes32 leaf = keccak256(abi.encodePacked(to, amount));

    bool isValidLeaf = MerkleProof.verify(proof, merkleRoot, leaf);
    require(isValidLeaf, "Invalid leaf");

    // Set address to claimed
    hasClaimed[to] = true;

    // Transfer tokens to address
    token.transfer(to, amount);

    // Emit claim event
    emit Claim(to, amount);
  }
}
