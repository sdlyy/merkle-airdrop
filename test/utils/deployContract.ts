import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import type { Signer } from "ethers";
import { ethers } from "hardhat";

export const deployContract = async (
  contract: string,
  params: Array<string | number>,
  deployer: Signer | SignerWithAddress
) => {
  const ContractFactory = await ethers.getContractFactory(contract, deployer);

  const Contract = await ContractFactory.deploy(...params);

  await Contract.deployed();
  return Contract;
};
