export const { ethers } = require('hardhat');

export async function fixture() {
  const chain = await getLocalChain();
  const accounts = await ethers.getSigners();

  // Mock gateway
  const gateway = await ethers.deployContract('$ERC7786GatewayMock');
  const gatewayAsEOA = await impersonate(gateway);

  // Chain A: legacy ERC20 with bridge
  const tokenA = await ethers.deployContract('$ERC20Crosschain', ['Token1', 'T1', []]);
  const bridgeA = tokenA; // self bridge

  // Chain B: ERC7802 with bridge
  const tokenB = await ethers.deployContract('$ERC20BridgeableMock', ['Token2', 'T2', ethers.ZeroAddress]);
  const bridgeB = await ethers.deployContract('$BridgeERC7802', [[[gateway, chain.toErc7930(bridgeA)]], tokenB]);

  // deployment check + counterpart setup
  await expect(bridgeA.$_setLink(gateway, chain.toErc7930(bridgeB), false))
    .to.emit(bridgeA, 'LinkRegistered')
    .withArgs(gateway, chain.toErc7930(bridgeB));
  await tokenB.$_setBridge(bridgeB);

  return { chain, accounts, gateway, gatewayAsEOA, tokenA, tokenB, bridgeA, bridgeB };
}
