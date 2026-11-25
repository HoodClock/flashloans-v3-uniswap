export const { ethers } = require('hardhat');

export async function fixture() {
  const [user, other] = await ethers.getSigners();

  const mock = await ethers.deployContract('$AuthorityUtils');
  const notAuthorityMock = await ethers.deployContract('NotAuthorityMock');
  const authorityNoDelayMock = await ethers.deployContract('AuthorityNoDelayMock');
  const authorityDelayMock = await ethers.deployContract('AuthorityDelayMock');
  const authorityNoResponse = await ethers.deployContract('AuthorityNoResponse');

  return {
    user,
    other,
    mock,
    notAuthorityMock,
    authorityNoDelayMock,
    authorityDelayMock,
    authorityNoResponse,
  };
}
