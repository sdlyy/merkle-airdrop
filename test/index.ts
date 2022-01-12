import { expect } from "chai";
import { ethers } from "hardhat";
import { deployContract } from "./utils/deployContract";
import { AirdropToken, MerkleAirdrop } from "../typechain";

import { getEncodedLeaf, getMerkleTreeForAirDrop } from "./utils/merkleUtils";

describe("MerkleAirDrop", function () {
  it("Should work", async function () {
    const [deployer, alice, bob, evilUser] = await ethers.getSigners();

    const Token = (await deployContract(
      "AirdropToken",
      ["Airdrop Token", "AIR"],
      deployer
    )) as AirdropToken;

    const airdropAmount = ethers.utils.parseEther("5").toString();

    const [leaves, root, tree] = getMerkleTreeForAirDrop([
      [alice.address, airdropAmount],
      [bob.address, airdropAmount],
    ]);

    const Airdrop = (await deployContract(
      "MerkleAirdrop",
      [root, Token.address],
      deployer
    )) as MerkleAirdrop;

    await Token.transfer(Airdrop.address, ethers.utils.parseEther("10"));

    // Simulate claim
    const AirdropAsAlice = Airdrop.connect(alice);
    const AirdropAsBob = Airdrop.connect(bob);
    const AirdropAsEvilUser = Airdrop.connect(evilUser);

    const aliceLeaf = leaves[0];
    const bobLeaf = leaves[1];
    const aliceProof = tree.getHexProof(aliceLeaf);
    const bobProof = tree.getHexProof(bobLeaf);

    await AirdropAsAlice.claim(alice.address, airdropAmount, aliceProof);

    await AirdropAsBob.claim(bob.address, airdropAmount, bobProof);

    // Airdrop should be emptied out
    expect((await Token.balanceOf(Airdrop.address)).toString()).to.be.eql("0");

    // Receivers should get encoded amount of tokens
    expect((await Token.balanceOf(alice.address)).toString()).to.be.eql(airdropAmount);
    expect((await Token.balanceOf(bob.address)).toString()).to.be.eql(airdropAmount);

    // Claim all only once
    await expect(AirdropAsAlice.claim(alice.address, airdropAmount, aliceProof)).to.be.revertedWith(
      "Already claimed"
    );
    await expect(
      AirdropAsBob.claim(bob.address, airdropAmount, bobProof)
    ).to.be.reverted.revertedWith("Already claimed");

    // Get some wrong signatures
    const evilLeaf = getEncodedLeaf([evilUser.address, airdropAmount]);
    const evilProof = tree.getHexProof(evilLeaf);

    // Reject wrong signatures
    await expect(
      AirdropAsEvilUser.claim(evilUser.address, airdropAmount, evilProof)
    ).to.be.revertedWith("Invalid leaf");
  });
});
