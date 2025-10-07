// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title LiquidityPool
 * @dev AMM-style liquidity pool for cross-chain swaps
 */
contract LiquidityPool {
    // Events
    event LiquidityAdded(
        address indexed provider,
        uint256 amountA,
        uint256 amountB,
        uint256 liquidity
    );
    
    event LiquidityRemoved(
        address indexed provider,
        uint256 amountA,
        uint256 amountB,
        uint256 liquidity
    );
    
    event Swap(
        address indexed user,
        uint256 amountIn,
        uint256 amountOut,
        bool isTokenA
    );

    // State variables
    address public tokenA;
    address public tokenB;
    uint256 public reserveA;
    uint256 public reserveB;
    uint256 public totalLiquidity;
    mapping(address => uint256) public liquidityBalances;
    
    uint256 private constant FEE_PERCENT = 3; // 0.3% fee
    uint256 private constant FEE_DENOMINATOR = 1000;

    constructor(address _tokenA, address _tokenB) {
        tokenA = _tokenA;
        tokenB = _tokenB;
    }

    /**
     * @dev Add liquidity to the pool
     * @param amountA Amount of token A
     * @param amountB Amount of token B
     */
    function addLiquidity(uint256 amountA, uint256 amountB) external returns (uint256 liquidity) {
        require(amountA > 0 && amountB > 0, "Amounts must be greater than 0");
        
        // Transfer tokens
        _transferFrom(tokenA, msg.sender, address(this), amountA);
        _transferFrom(tokenB, msg.sender, address(this), amountB);
        
        // Calculate liquidity shares
        if (totalLiquidity == 0) {
            liquidity = sqrt(amountA * amountB);
        } else {
            liquidity = min(
                (amountA * totalLiquidity) / reserveA,
                (amountB * totalLiquidity) / reserveB
            );
        }
        
        require(liquidity > 0, "Insufficient liquidity minted");
        
        liquidityBalances[msg.sender] += liquidity;
        totalLiquidity += liquidity;
        reserveA += amountA;
        reserveB += amountB;
        
        emit LiquidityAdded(msg.sender, amountA, amountB, liquidity);
    }

    /**
     * @dev Remove liquidity from the pool
     * @param liquidity Amount of liquidity to remove
     */
    function removeLiquidity(uint256 liquidity) external returns (uint256 amountA, uint256 amountB) {
        require(liquidity > 0, "Liquidity must be greater than 0");
        require(liquidityBalances[msg.sender] >= liquidity, "Insufficient liquidity");
        
        amountA = (liquidity * reserveA) / totalLiquidity;
        amountB = (liquidity * reserveB) / totalLiquidity;
        
        require(amountA > 0 && amountB > 0, "Insufficient amounts");
        
        liquidityBalances[msg.sender] -= liquidity;
        totalLiquidity -= liquidity;
        reserveA -= amountA;
        reserveB -= amountB;
        
        _transfer(tokenA, msg.sender, amountA);
        _transfer(tokenB, msg.sender, amountB);
        
        emit LiquidityRemoved(msg.sender, amountA, amountB, liquidity);
    }

    /**
     * @dev Swap tokens
     * @param amountIn Amount of input token
     * @param isTokenA True if swapping token A for B, false otherwise
     */
    function swap(uint256 amountIn, bool isTokenA) external returns (uint256 amountOut) {
        require(amountIn > 0, "Amount must be greater than 0");
        
        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_PERCENT);
        
        if (isTokenA) {
            amountOut = (amountInWithFee * reserveB) / (reserveA * FEE_DENOMINATOR + amountInWithFee);
            require(amountOut < reserveB, "Insufficient liquidity");
            
            _transferFrom(tokenA, msg.sender, address(this), amountIn);
            _transfer(tokenB, msg.sender, amountOut);
            
            reserveA += amountIn;
            reserveB -= amountOut;
        } else {
            amountOut = (amountInWithFee * reserveA) / (reserveB * FEE_DENOMINATOR + amountInWithFee);
            require(amountOut < reserveA, "Insufficient liquidity");
            
            _transferFrom(tokenB, msg.sender, address(this), amountIn);
            _transfer(tokenA, msg.sender, amountOut);
            
            reserveB += amountIn;
            reserveA -= amountOut;
        }
        
        emit Swap(msg.sender, amountIn, amountOut, isTokenA);
    }

    // Helper functions
    function _transfer(address token, address to, uint256 amount) private {
        (bool success, ) = token.call(
            abi.encodeWithSignature("transfer(address,uint256)", to, amount)
        );
        require(success, "Transfer failed");
    }

    function _transferFrom(address token, address from, address to, uint256 amount) private {
        (bool success, ) = token.call(
            abi.encodeWithSignature("transferFrom(address,address,uint256)", from, to, amount)
        );
        require(success, "Transfer failed");
    }

    function sqrt(uint256 x) private pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }

    function min(uint256 a, uint256 b) private pure returns (uint256) {
        return a < b ? a : b;
    }
}
