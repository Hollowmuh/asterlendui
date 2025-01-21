// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

// Custom errors for gas optimization
error InvalidParams();
error Unauthorized();
error InsufficientAmount();
error ListingNotFound();
error InvalidCollateral();
error LoanInactive();
error RepayFailed();
error BadGracePeriod();
error CollateralCheckFailed();
error TransferFailed();

interface ICollateralManager {
    struct CollateralInfo {
        address token;
        uint256 amount;
        address borrower;
        uint256 lastPrice;
        bool isActive;
        bool requiresTopUp;
    }
    
    function initializeLoan(uint256 loanId, address borrower, address token, uint256 amount) external;
    function releaseLoanCollateral(uint256 loanId, address borrower) external;
    function checkCollateralization(uint256 loanId, uint256 loanAmount) external returns (bool);
    function liquidateCollateral(uint256 loanId, uint256 loanAmount) external;
    function getCollateralInfo(uint256 loanId) external view returns (CollateralInfo memory);
}

contract P2PLendingMarketplace is ReentrancyGuard, Ownable {
    using Math for uint256;

    // Constants - packed for gas optimization
    uint16 private constant BASIS_POINTS = 10000;
    uint16 private constant MAX_INTEREST_RATE = 3000; // 30%
    uint256 private constant MIN_LOAN_DURATION = 1 days;
    uint256 private constant MAX_GRACE_PERIOD = 30 days;
    uint256 private constant MAX_LOAN_DURATION = 365 days;

    // Compact structs for gas optimization
    struct LenderListing {
        address lender;
        uint256 amount;
        uint16 minInterestRate;
        uint32 maxDuration;
        uint16 minCollateralRatio;
        bool isActive;
        address[] acceptedCollateralTokens;
    }

    struct BorrowerListing {
        address borrower;
        uint256 amount;
        uint16 maxInterestRate;
        uint32 duration;
        address collateralToken;
        uint256 collateralAmount;
        bool isActive;
    }

    struct Loan {
        address lender;
        address borrower;
        uint256 amount;
        uint16 interestRate;
        uint32 duration;
        uint256 startTime;
        uint256 gracePeriodEnd;
        uint256 lastInterestUpdate;
        uint256 accumulatedInterest;
        address collateralToken;
        uint256 collateralAmount;
        bool isActive;
    }

    struct UserStats {
        uint256 activeLoans;
        uint256 totalInterest;
        uint256 reputation;
    }

    // State variables
    ICollateralManager public immutable collateralManager;
    IERC20 public immutable stablecoin;
    
    mapping(uint256 => LenderListing) public lenderListings;
    mapping(uint256 => BorrowerListing) public borrowerListings;
    mapping(uint256 => Loan) public loans;
    mapping(address => UserStats) public userStats;
    
    uint256 private nextListingId;
    uint256 private nextLoanId;
    uint256 public totalVolume;

    // Events
    event ListingCreated(uint256 indexed id, address indexed user, uint256 amount, uint16 rate, bool isLender);
    event LoanMatched(uint256 indexed id, address indexed lender, address indexed borrower, uint256 amount);
    event LoanRepaid(uint256 indexed id, uint256 amount, uint256 interest);
    event LoanLiquidated(uint256 indexed id, address indexed liquidator);
    event GracePeriodSet(uint256 indexed id, uint256 endTime);

    constructor(address _stablecoin, address _collateralManager) Ownable(msg.sender) {
        if (_stablecoin == address(0) || _collateralManager == address(0)) revert InvalidParams();
        stablecoin = IERC20(_stablecoin);
        collateralManager = ICollateralManager(_collateralManager);
    }

    function createLenderListing(
        uint256 amount,
        uint16 minInterestRate,
        uint32 maxDuration,
        address[] calldata acceptedTokens,
        uint16 minCollateralRatio
    ) external nonReentrant returns (uint256) {
        if (amount == 0 || 
            minInterestRate > MAX_INTEREST_RATE || 
            maxDuration > MAX_LOAN_DURATION || 
            maxDuration < MIN_LOAN_DURATION) revert InvalidParams();
        
        uint256 listingId = nextListingId++;
        
        lenderListings[listingId] = LenderListing({
            lender: msg.sender,
            amount: amount,
            minInterestRate: minInterestRate,
            maxDuration: maxDuration,
            minCollateralRatio: minCollateralRatio,
            isActive: true,
            acceptedCollateralTokens: acceptedTokens
        });

        if (!stablecoin.transferFrom(msg.sender, address(this), amount)) revert TransferFailed();

        emit ListingCreated(listingId, msg.sender, amount, minInterestRate, true);
        return listingId;
    }

    function createBorrowerListing(
        uint256 amount,
        uint16 maxInterestRate,
        uint32 duration,
        address collateralToken,
        uint256 collateralAmount
    ) external nonReentrant returns (uint256) {
        if (amount == 0 || 
            maxInterestRate > MAX_INTEREST_RATE || 
            duration > MAX_LOAN_DURATION || 
            duration < MIN_LOAN_DURATION) revert InvalidParams();
        
        uint256 listingId = nextListingId++;
        
        borrowerListings[listingId] = BorrowerListing({
            borrower: msg.sender,
            amount: amount,
            maxInterestRate: maxInterestRate,
            duration: duration,
            collateralToken: collateralToken,
            collateralAmount: collateralAmount,
            isActive: true
        });

        emit ListingCreated(listingId, msg.sender, amount, maxInterestRate, false);
        return listingId;
    }

    function matchLoan(uint256 lenderListingId, uint256 borrowerListingId) external nonReentrant {
        LenderListing storage lenderListing = lenderListings[lenderListingId];
        BorrowerListing storage borrowerListing = borrowerListings[borrowerListingId];
        
        if (!_validateMatch(lenderListing, borrowerListing)) revert InvalidParams();

        uint256 loanId = _createLoan(lenderListing, borrowerListing);
        _initializeLoan(loanId, borrowerListing);

        lenderListing.isActive = false;
        borrowerListing.isActive = false;

        totalVolume += borrowerListing.amount;

        emit LoanMatched(loanId, lenderListing.lender, borrowerListing.borrower, borrowerListing.amount);
    }

    function _validateMatch(
        LenderListing storage lenderListing,
        BorrowerListing storage borrowerListing
    ) private view returns (bool) {
        if (!lenderListing.isActive || !borrowerListing.isActive) return false;
        if (borrowerListing.maxInterestRate < lenderListing.minInterestRate) return false;
        if (borrowerListing.duration > lenderListing.maxDuration) return false;
        if (borrowerListing.amount > lenderListing.amount) return false;

        bool validCollateral;
        for (uint256 i = 0; i < lenderListing.acceptedCollateralTokens.length; i++) {
            if (lenderListing.acceptedCollateralTokens[i] == borrowerListing.collateralToken) {
                validCollateral = true;
                break;
            }
        }
        return validCollateral;
    }

    function _createLoan(
        LenderListing storage lenderListing,
        BorrowerListing storage borrowerListing
    ) private returns (uint256) {
        uint256 loanId = nextLoanId++;
        
        loans[loanId] = Loan({
            lender: lenderListing.lender,
            borrower: borrowerListing.borrower,
            amount: borrowerListing.amount,
            interestRate: lenderListing.minInterestRate,
            duration: borrowerListing.duration,
            startTime: block.timestamp,
            gracePeriodEnd: block.timestamp + borrowerListing.duration,
            lastInterestUpdate: block.timestamp,
            accumulatedInterest: 0,
            collateralToken: borrowerListing.collateralToken,
            collateralAmount: borrowerListing.collateralAmount,
            isActive: true
        });

        return loanId;
    }

    function _initializeLoan(uint256 loanId, BorrowerListing storage borrowerListing) private {
        collateralManager.initializeLoan(
            loanId,
            borrowerListing.borrower,
            borrowerListing.collateralToken,
            borrowerListing.collateralAmount
        );

        if (!stablecoin.transfer(borrowerListing.borrower, borrowerListing.amount)) 
            revert TransferFailed();
    }

    function repayLoan(uint256 loanId) external nonReentrant {
        Loan storage loan = loans[loanId];
        if (!loan.isActive) revert LoanInactive();
        if (msg.sender != loan.borrower) revert Unauthorized();

        _updateInterest(loanId);
        uint256 totalRepayment = loan.amount + loan.accumulatedInterest;

        loan.isActive = false;
        
        if (!stablecoin.transferFrom(msg.sender, loan.lender, totalRepayment)) 
            revert RepayFailed();
        
        collateralManager.releaseLoanCollateral(loanId, msg.sender);

        _updateUserStats(loan);

        emit LoanRepaid(loanId, loan.amount, loan.accumulatedInterest);
    }

    function liquidateLoan(uint256 loanId) external nonReentrant {
        Loan storage loan = loans[loanId];
        if (!loan.isActive) revert LoanInactive();

        if (!collateralManager.checkCollateralization(loanId, loan.amount)) {
            loan.isActive = false;
            collateralManager.liquidateCollateral(loanId, loan.amount);
            emit LoanLiquidated(loanId, msg.sender);
        } else {
            revert CollateralCheckFailed();
        }
    }

    function _updateInterest(uint256 loanId) private {
        Loan storage loan = loans[loanId];
        uint256 timeElapsed = block.timestamp - loan.lastInterestUpdate;
        if (timeElapsed == 0) return;

        uint256 newInterest = (loan.amount * loan.interestRate * timeElapsed) / (365 days) / BASIS_POINTS;
        loan.accumulatedInterest += newInterest;
        loan.lastInterestUpdate = block.timestamp;
    }

    function _updateUserStats(Loan storage loan) private {
        UserStats storage borrowerStats = userStats[loan.borrower];
        UserStats storage lenderStats = userStats[loan.lender];
        
        borrowerStats.activeLoans--;
        borrowerStats.totalInterest += loan.accumulatedInterest;
        borrowerStats.reputation++;
        
        lenderStats.activeLoans--;
        lenderStats.totalInterest += loan.accumulatedInterest;
        lenderStats.reputation++;
    }

    function setGracePeriod(uint256 loanId, uint256 gracePeriod) external {
        Loan storage loan = loans[loanId];
        if (msg.sender != loan.lender) revert Unauthorized();
        if (!loan.isActive) revert LoanInactive();
        if (gracePeriod > MAX_GRACE_PERIOD) revert BadGracePeriod();

        loan.gracePeriodEnd = block.timestamp + gracePeriod;
        emit GracePeriodSet(loanId, loan.gracePeriodEnd);
    }

    // View functions
    function getLoan(uint256 loanId) external view returns (Loan memory) {
        return loans[loanId];
    }

    function getUserStats(address user) external view returns (UserStats memory) {
        return userStats[user];
    }
}