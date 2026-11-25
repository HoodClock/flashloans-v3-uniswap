export const { ethers } = require('hardhat');

export async function fixture() {
  const [owner, accountA, accountB] = await ethers.getSigners();
  const ownable2Step = await ethers.deployContract('$Ownable2Step', [owner]);
  return {
    ownable2Step,
    owner,
    accountA,
    accountB,
  };
}
