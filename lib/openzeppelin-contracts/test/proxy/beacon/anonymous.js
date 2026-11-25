export const { ethers } = require('hardhat');

export async function fixture() {
  const [admin, other] = await ethers.getSigners();

  const v1 = await ethers.deployContract('Implementation1');
  const v2 = await ethers.deployContract('Implementation2');
  const beacon = await ethers.deployContract('UpgradeableBeacon', [v1, admin]);

  return { admin, other, beacon, v1, v2 };
}
