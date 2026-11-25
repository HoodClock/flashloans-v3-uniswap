export const { ethers } = require('hardhat');

export async function fixture() {
  const [sender, other] = await ethers.getSigners();

  const forwarder = await ethers.deployContract('ERC2771Forwarder', ['ERC2771Forwarder']);
  const forwarderAsSigner = await impersonate(forwarder.target);
  const context = await ethers.deployContract('ERC2771ContextMock', [forwarder]);
  const domain = await getDomain(forwarder);

  const prepareAndSignRequest = async (signer, request) => {
    // request.to is mandatory
    request.from ??= signer.address;
    request.value ??= 0n;
    request.data ??= '0x';
    request.gas ??= 100000n;
    request.nonce ??= await forwarder.nonces(signer);
    request.deadline ??= MAX_UINT48;
    request.signature = await signer.signTypedData(domain, { ForwardRequest }, request);
    return request;
  };

  return { sender, other, forwarder, forwarderAsSigner, context, prepareAndSignRequest };
}
