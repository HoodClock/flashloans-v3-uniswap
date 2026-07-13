// spdx-license-identifier:
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {FlashLoansReciever} from '../src/FlashLoansReciever.sol';
import {IERC20} from '../src/interfaces/IERC20.sol';

contract FlashLoanRecieverTester is Test {

    FlashLoansReciever public receiver;

    // FACTORY & ROUTER CONTRACT ADDRESS
    address constant UNISWAP_V3_FACTORY = 0x1F98431c8aD98523631AE4a59f267346ea31F984;
    address constant SWAP_ROUTER = 0xE592427A0AEce92De3Edee1F18E0157C05861564;

    // TARGETED POOL: USDC -> WETH (0.05% FEE)
    address constant USDC_WETH_POOL_05 = 0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640;

    // ASSETS ADDRESSES
    address constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; // token0
    address constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2; // token1

    function setUp() public {
        string memory rpcUrl = vm.envString("RPC_MAINNET");
        vm.createSelectFork(rpcUrl);

        receiver = new FlashLoansReciever(UNISWAP_V3_FACTORY, SWAP_ROUTER);
    }

    function test_ArbitrageExecution() public {
        // so we borrow USDC (100,000) multipy with 1e^6 (because USDC have 6 decimals & WETH has 18 decimals)
        uint256 borrowAmount = 100_000 * 1e6;

        // pre-funding with 500 USDC to contract to cover (flash_loan_tx_fee + slippage_fee) aka swap losses
        uint256 safetyBuffer = 2000 * 1e6;

        // foundry [deal] cheatcode to instantlt mint USDC to reciever
        deal(USDC, address(receiver), safetyBuffer);


        uint256 usdcBefore = IERC20(USDC).balanceOf(address(receiver));
        console.log("USDC Balance Before Execution:", usdcBefore);

        // Slippage is set to 0 for seamless exec
        uint256 minAmountOut0 = 0;
        uint256 minAmountOut1 = 0;

        // Execute the Flash Loan
        vm.prank(receiver.owner());
        receiver.initFlashLoan(
            USDC_WETH_POOL_05,
            borrowAmount, // passing to amount0 (USDC)
            0, // passing to amount1 (WETH)
            minAmountOut0,
            minAmountOut1
        );


        uint256 usdcAfter = IERC20(USDC).balanceOf(address(receiver));
        console.log("USDC Balance After Execution:", usdcAfter);


        require(usdcAfter < usdcBefore, "Mechanics succeeded, spread/fees consumed the safety buffer");
    }
}
