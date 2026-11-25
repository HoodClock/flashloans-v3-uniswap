export const { ethers, predeploy } = require('hardhat');

export async function fixture() {
  // EOAs and environment
  const [other] = await ethers.getSigners();
  const target = await ethers.deployContract('CallReceiverMock');
  const anotherTarget = await ethers.deployContract('CallReceiverMock');

  // ERC-7579 validator
  const validator = await ethers.deployContract('$ERC7579ValidatorMock');

  // ERC-4337 signer
  const signer = ethers.Wallet.createRandom();

  // ERC-4337 account
  const helper = new ERC4337Helper();
  const mock = await helper.newAccount('$AccountERC7579HookedMock', [
    validator,
    ethers.solidityPacked(['address'], [signer.address]),
  ]);

  // ERC-4337 Entrypoint domain
  const entrypointDomain = await getDomain(predeploy.entrypoint.v09);

  return { helper, validator, mock, entrypointDomain, signer, target, anotherTarget, other };
}
