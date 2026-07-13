// spdx-license-identifier:
pragma solidity ^0.8.26;

import {IERC20} from './interfaces/IERC20.sol';
import {IUniswapV3Pool} from "./interfaces/IUniswapV3Pool.sol";
import {ISwapRouter} from './interfaces/ISwapRouter.sol';

contract FlashLoansReciever {
    address private immutable FACTORY;
    ISwapRouter private immutable SWAP_ROUTER;
    address public owner;
    bool public isPaused;

    struct FlashLoanData {
        address pool;
        address token0;
        address token1;
        uint256 amount1;
        uint256 amount0;
        uint256 minAmountOut0; // for off-chain slippage on 1st swap
        uint256 minAmountOut1; // for off-chain slippage on 2nd swap
        address payer;
    }

    modifier whenNotPaused(){
        require(!isPaused, "Execution Paused");
        _;
    }

    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    function _checkOwner() internal view {
        require(msg.sender == owner, "Only owner can run this function");
    }

    // the execution stoper
    function _togglePause() external onlyOwner {
        isPaused = !isPaused;
    }

    constructor(address _factory, address _swapRouter) {
        FACTORY = _factory;
        SWAP_ROUTER = ISwapRouter(_swapRouter);
        owner = msg.sender;
    }

    function initFlashLoan(
        address _pool,
        uint256 _amount0,
        uint256 _amount1,
        uint256 _minAmountOut0,
        uint256 _minAmountOut1
    ) external onlyOwner whenNotPaused {

        IUniswapV3Pool pool = IUniswapV3Pool(_pool);
        address _token0 = pool.token0();
        address _token1 = pool.token1();

        require(_token0 != address(0) && _token1 != address(0), "invalid pool");

        bytes memory data = abi.encode(
            FlashLoanData({
                pool: _pool,
                token0: _token0,
                token1: _token1,
                amount0: _amount0,
                amount1: _amount1,
                minAmountOut0: _minAmountOut0,
                minAmountOut1: _minAmountOut1,
                payer: address(this)
            })
        );

        // calling IUniswapv3pool flash fn
        pool.flash(address(this), _amount0, _amount1, data);
    }

    // @notice Mandatory callback funciton invoking by the Uniswap v3 pool during flash loan execution
    // @param fee0 -> fee amount in token0
    // @param fee1 -> fee amount in token1
    // @paramdata -> encoded data from the initFlashLoan function

     function uniswapV3FlashCallback(
         uint256 _fee0,
         uint256 _fee1,
         bytes calldata data
     ) external {

         FlashLoanData memory decoded = abi.decode(data, (FlashLoanData));

         // check if caller is initiating the pool
         require(msg.sender == decoded.pool, "Unauthorize pool callback");

         // Now simple one hop arbitrage
         if (decoded.amount0 > 0){

             // allow router to spend borrowed token0
             IERC20(decoded.token0).approve(address(SWAP_ROUTER), decoded.amount0);

             ISwapRouter.ExactInputSingleParams memory params1 = ISwapRouter.ExactInputSingleParams({
                 tokenIn: decoded.token0,
                 tokenOut: decoded.token1,
                 fee: 3000, // here fee tier is 0.3% goes to LP's
                 recipient: address(this),
                 deadline: block.timestamp,
                 amountIn: decoded.amount0,
                 amountOutMinimum: decoded.minAmountOut1,
                 sqrtPriceLimitX96: 0
             });

             uint256 amountOutToken1 = SWAP_ROUTER.exactInputSingle(params1);

             // now swapping back to token 1 to token 0 on another pool
             IERC20(decoded.token1).approve(address(SWAP_ROUTER), amountOutToken1);

             ISwapRouter.ExactInputSingleParams memory params2 = ISwapRouter.ExactInputSingleParams({
                 tokenIn: decoded.token1,
                 tokenOut: decoded.token0,
                 fee: 100, // here fee tier is 0.1% goes to LP's
                 recipient: address(this),
                 deadline: block.timestamp,
                 amountIn: amountOutToken1,
                 amountOutMinimum: decoded.minAmountOut0,
                 sqrtPriceLimitX96: 0
             });

             SWAP_ROUTER.exactInputSingle(params2);
         }

         // check & transfer for token0 (if arbitrage was successful otherwise revert)
         if (decoded.amount0 > 0){
             uint256 totalDebt0 = decoded.amount0 + _fee0;
             require(IERC20(decoded.token0).balanceOf(address(this)) >= totalDebt0, "Arbitrage Failed: Not enough Token0 to repay the debt.");
             require(IERC20(decoded.token0).transfer(decoded.pool, totalDebt0), "Token0 transfer failed."); // this transfer the amount token0 made some profit if condition satisfy otherwise revert
         }

         // check & transfer for token1 (if arbitrage was successful otherwise revert)
         if (decoded.amount1 > 0){
             uint256 totalDebt1 = decoded.amount1 + _fee1;
             require(IERC20(decoded.token1).balanceOf(address(this)) >= totalDebt1, "Arbitrage Failed: Not enough Token1 to repay the debt.");
             require(IERC20(decoded.token1).transfer(decoded.pool, totalDebt1), "Token1 Transfer failed."); // this transfer the amount token1 made some profit
         }
     }

     // for reedeeming/withdraw amount
     function withdraw(address token) external onlyOwner {
         uint256 balance = IERC20(token).balanceOf(address(this));
         require(IERC20(token).transfer(owner, balance), "Withdraw Transfer Failed.");
     }
}
