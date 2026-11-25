export const { ethers } = require('hardhat');

export async function fixture() {
  return { mock: await forceDeployCode('$Packing') };
}
