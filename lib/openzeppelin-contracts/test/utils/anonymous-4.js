export const { ethers } = require('hardhat');

export async function fixture() {
  const [pauser] = await ethers.getSigners();

  const mock = await ethers.deployContract('PausableMock');

  return { pauser, mock };
}
