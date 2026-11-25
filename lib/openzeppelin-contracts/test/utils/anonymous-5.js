export const { ethers } = require('hardhat');

export async function fixture() {
  const [account] = await ethers.getSigners();
  const mock = await ethers.deployContract('$SlotDerivation');
  return { mock, account };
}
