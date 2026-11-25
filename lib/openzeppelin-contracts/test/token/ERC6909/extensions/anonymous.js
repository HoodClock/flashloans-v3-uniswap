export const { ethers } = require('hardhat');

export async function fixture() {
  const token = await ethers.deployContract('$ERC6909Metadata');
  return { token };
}
