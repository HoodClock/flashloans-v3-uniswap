// spdx-license-identifier:
pragma solidity ^0.8.26;

abstract contract IUniswapV3Pool {

    function flash(
        address recipient,
        uint256 amount0,
        uint256 amount1,
        bytes calldata data
    ) external virtual;

    function fee() external virtual view returns (uint24);
    function token0() external virtual view returns(address);
    function token1() external virtual view returns(address);
}
