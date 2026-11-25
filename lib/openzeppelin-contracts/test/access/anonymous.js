export const { ethers } = require('hardhat');

export async function fixture() {
  const [defaultAdmin, ...accounts] = await ethers.getSigners();
  const mock = await ethers.deployContract('$AccessControl');
  await mock.$_grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
  return { mock, defaultAdmin, accounts };
}
