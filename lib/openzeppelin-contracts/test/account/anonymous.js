export const { ethers, predeploy } = require('hardhat');

export async function fixture() {
  // EOAs and environment
  const [beneficiary, other] = await ethers.getSigners();
  const target = await ethers.deployContract('CallReceiverMock');

  // ERC-4337 signer
  const signer = new NonNativeSigner(P256SigningKey.random());

  // ERC-4337 account
  const helper = new ERC4337Helper();
  const mock = await helper.newAccount('$AccountP256Mock', [
    signer.signingKey.publicKey.qx,
    signer.signingKey.publicKey.qy,
    'AccountP256',
    '1',
  ]);

  // ERC-4337 Entrypoint domain
  const entrypointDomain = await getDomain(predeploy.entrypoint.v09);

  // domain cannot be fetched using getDomain(mock) before the mock is deployed
  const domain = {
    name: 'AccountP256',
    version: '1',
    chainId: entrypointDomain.chainId,
    verifyingContract: mock.address,
  };

  const signUserOp = userOp =>
    signer
      .signTypedData(entrypointDomain, { PackedUserOperation }, userOp.packed)
      .then(signature => Object.assign(userOp, { signature }));

  return { helper, mock, domain, signer, target, beneficiary, other, signUserOp };
}
