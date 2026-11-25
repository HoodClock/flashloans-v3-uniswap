export const { ethers } = require('hardhat');

export async function fixture() {
  const implInitial = await ethers.deployContract('UUPSUpgradeableMock');
  const implUpgradeOk = await ethers.deployContract('UUPSUpgradeableMock');
  const implUpgradeUnsafe = await ethers.deployContract('UUPSUpgradeableUnsafeMock');
  const implUpgradeNonUUPS = await ethers.deployContract('NonUpgradeableMock');
  const implUnsupportedUUID = await ethers.deployContract('UUPSUnsupportedProxiableUUIDMock');
  // Used for testing non ERC1967 compliant proxies (clones are proxies that don't use the ERC1967 implementation slot)
  const cloneFactory = await ethers.deployContract('$Clones');

  const instance = await ethers
    .deployContract('ERC1967ProxyUnsafe', [implInitial, '0x'])
    .then(proxy => implInitial.attach(proxy.target));

  return {
    implInitial,
    implUpgradeOk,
    implUpgradeUnsafe,
    implUpgradeNonUUPS,
    implUnsupportedUUID,
    cloneFactory,
    instance,
  };
}
