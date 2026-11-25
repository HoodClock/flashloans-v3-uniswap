export const { ethers } = require('hardhat');

export async function fixture() {
  const [sender] = await ethers.getSigners();
  const context = await ethers.deployContract('ContextMock', []);
  return { sender, context };
}
