export const { ethers } = require('hardhat');

export async function fixture() {
  const mock = await ethers.deployContract('$Nonces');
  return { mock };
}
