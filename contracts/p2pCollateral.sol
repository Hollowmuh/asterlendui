// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

// Custom errors for gas optimization
error InvalidParameters();
error UnauthorizedAccess();
error InsufficientCollateral();
error StalePrice();
error CollateralNotActive();
error InvalidPriceFeed();
error LiquidationFailed();
error TransferFailed();

/**
 * @title CollateralManager
 * @notice Manages collateral for the P2P lending marketplace
 */
contract CollateralManager is ReentrancyGuard, Ownable {
    using Math for uint256;

    // Constants
    uint256 private constant BASIS_POINTS = 10000;
    uint256 private constant PRICE_PRECISION = 8;
    uint256 private constant MIN_COLLATERAL_RATIO = 125; // 125%
    uint256 private constant LIQUIDATION_THRESHOLD = 110; // 110%
    uint256 private constant LIQUIDATION_BONUS = 500; // 5%
    uint256 private constant MAX_LIQUIDATION_DISCOUNT = 1000; // 10%
    uint256 private constant STALENESS_PERIOD = 1 hours;

    struct CollateralInfo {
        address token;
        uint256 amount;
        address borrower;
        uint256 lastPrice;
        bool isActive;
        bool requiresTopUp;
    }

    struct PriceFeed {
        AggregatorV3Interface feed;
        uint256 lastUpdate;
        uint256 price;
        bool isActive;
    }

    // State variables
    address public marketplace;
    mapping(uint256 => CollateralInfo) public collaterals;
    mapping(address => PriceFeed) public priceFeeds;
    mapping(uint256 => bool) public liquidatedLoans;

    // Events
    event CollateralDeposited(uint256 indexed loanId, address token, uint256 amount);
    event CollateralReleased(uint256 indexed loanId, address borrower, uint256 amount);
    event CollateralLiquidated(uint256 indexed loanId, address liquidator, uint256 amount);
    event PriceUpdated(address indexed token, uint256 price);
    event TopUpRequired(uint256 indexed loanId, uint256 requiredAmount);


    // Additional state variables
    mapping(address => bool) public whitelistedTokens;
    mapping(address => uint256) public tokenDecimals;

    // Constructor remains unchanged

    // Modifier for marketplace-only functions
    modifier onlyMarketplace() {
        if (msg.sender != marketplace) revert UnauthorizedAccess();
        _;
    }
    constructor () Ownable(msg.sender) {
        
    }
    // Setup functions
    function setMarketplace(address _marketplace) external onlyOwner {
        if (_marketplace == address(0)) revert InvalidParameters();
        marketplace = _marketplace;
    }

    function setTokenPriceFeed(
        address token,
        address priceFeed,
        uint8 decimals
    ) external onlyOwner {
        if (token == address(0) || priceFeed == address(0)) revert InvalidParameters();
        
        whitelistedTokens[token] = true;
        tokenDecimals[token] = decimals;
        priceFeeds[token] = PriceFeed({
            feed: AggregatorV3Interface(priceFeed),
            lastUpdate: block.timestamp,
            price: 0,
            isActive: true
        });
    }

    function updatePrice(address token) public {
        PriceFeed storage feed = priceFeeds[token];
        if (!feed.isActive) revert InvalidPriceFeed();

        (, int256 price,, uint256 updatedAt,) = feed.feed.latestRoundData();
        if (price <= 0) revert InvalidPriceFeed();
        if (block.timestamp - updatedAt > STALENESS_PERIOD) revert StalePrice();

        feed.price = uint256(price);
        feed.lastUpdate = block.timestamp;

        emit PriceUpdated(token, uint256(price));
    }

    function initializeLoan(
        uint256 loanId,
        address borrower,
        address token,
        uint256 amount
    ) external nonReentrant onlyMarketplace {
        if (!whitelistedTokens[token]) revert InvalidParameters();
        if (amount == 0) revert InsufficientCollateral();

        updatePrice(token);

        collaterals[loanId] = CollateralInfo({
            token: token,
            amount: amount,
            borrower: borrower,
            lastPrice: priceFeeds[token].price,
            isActive: true,
            requiresTopUp: false
        });

        // Transfer collateral from borrower
        if (!IERC20(token).transferFrom(borrower, address(this), amount)) {
            revert TransferFailed();
        }

        emit CollateralDeposited(loanId, token, amount);
    }

    function checkCollateralization(
        uint256 loanId,
        uint256 loanAmount
    ) external returns (bool) {
        CollateralInfo storage collateral = collaterals[loanId];
        if (!collateral.isActive) revert CollateralNotActive();

        updatePrice(collateral.token);
        uint256 collateralValue = getCollateralValue(loanId);
        uint256 requiredCollateral = loanAmount*(MIN_COLLATERAL_RATIO)/(100);

        bool isSufficient = collateralValue >= requiredCollateral;
        
        if (!isSufficient && !collateral.requiresTopUp) {
            collateral.requiresTopUp = true;
            emit TopUpRequired(loanId, requiredCollateral - (collateralValue));
        }

        return isSufficient;
    }

    function topUpCollateral(uint256 loanId, uint256 amount) external nonReentrant {
        CollateralInfo storage collateral = collaterals[loanId];
        if (!collateral.isActive) revert CollateralNotActive();
        if (msg.sender != collateral.borrower) revert UnauthorizedAccess();

        collateral.amount = collateral.amount+(amount);
        collateral.requiresTopUp = false;

        if (!IERC20(collateral.token).transferFrom(msg.sender, address(this), amount)) {
            revert TransferFailed();
        }

        emit CollateralDeposited(loanId, collateral.token, amount);
    }

    function liquidateCollateral(
        uint256 loanId,
        uint256 loanAmount
    ) external nonReentrant onlyMarketplace {
        CollateralInfo storage collateral = collaterals[loanId];
        if (!collateral.isActive) revert CollateralNotActive();
        
        updatePrice(collateral.token);
        uint256 collateralValue = getCollateralValue(loanId);
        uint256 liquidationThreshold = loanAmount*(LIQUIDATION_THRESHOLD)/(100);

        if (collateralValue > liquidationThreshold) revert LiquidationFailed();

        uint256 bonusAmount = collateral.amount*(LIQUIDATION_BONUS)/(BASIS_POINTS);
        uint256 liquidationAmount = collateral.amount+(bonusAmount);

        collateral.isActive = false;
        liquidatedLoans[loanId] = true;

        // Transfer collateral to liquidator
        if (!IERC20(collateral.token).transfer(msg.sender, liquidationAmount)) {
            revert TransferFailed();
        }

        emit CollateralLiquidated(loanId, msg.sender, liquidationAmount);
    }

    function releaseLoanCollateral(
        uint256 loanId,
        address borrower
    ) external nonReentrant onlyMarketplace {
        CollateralInfo storage collateral = collaterals[loanId];
        if (!collateral.isActive) revert CollateralNotActive();
        if (collateral.borrower != borrower) revert UnauthorizedAccess();

        uint256 amount = collateral.amount;
        collateral.isActive = false;
        collateral.amount = 0;

        if (!IERC20(collateral.token).transfer(borrower, amount)) {
            revert TransferFailed();
        }

        emit CollateralReleased(loanId, borrower, amount);
    }

    // View functions
    function getCollateralValue(uint256 loanId) public view returns (uint256) {
        CollateralInfo storage collateral = collaterals[loanId];
        if (!collateral.isActive) revert CollateralNotActive();

        PriceFeed storage feed = priceFeeds[collateral.token];
        uint256 decimals = tokenDecimals[collateral.token];
        
        return collateral.amount
            *(feed.price)
            /(10 ** decimals)
            /(10 ** (PRICE_PRECISION - decimals));
    }

    function isCollateralActive(uint256 loanId) external view returns (bool) {
        return collaterals[loanId].isActive;
    }

    function getCollateralInfo(uint256 loanId) external view returns (CollateralInfo memory) {
        return collaterals[loanId];
    }
}