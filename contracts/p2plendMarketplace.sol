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
error InvalidToken();

interface ICollateralManager {
    struct CollateralInfo {
        address token;
        uint256 amount;
        address borrower;
        uint256 lastPrice;
        bool isActive;
        bool requiresTopUp;
        address lendingToken;
    }
    
    function initializeLoan(uint256 loanId, address borrower, address token, uint256 amount, address lendingToken) external payable;
    function releaseLoanCollateral(uint256 loanId, address borrower) external;
    function checkCollateralization(uint256 loanId, uint256 loanAmount) external returns (bool);
    function liquidateCollateral(uint256 loanId, uint256 loanAmount) external;
    function getCollateralInfo(uint256 loanId) external view returns (CollateralInfo memory);
}

contract P2PLendingMarketplace is ReentrancyGuard, Ownable {
    using Math for uint256;

    // Pack constants into single storage slot
    struct Constants {
        uint256 basisPoints;
        uint256 maxInterestRate;
        uint256 minLoanDuration;
        uint256 maxGracePeriod;
        uint256 maxLoanDuration;
    }

    // Packed struct for storage optimization
    struct LenderListing {
        address lender;          // 20 bytes
        uint256 amount;          // 12 bytes
        uint256 minInterestRate; // 2 bytes
        uint256 maxDuration;     // 4 bytes
        uint256 minCollateralRatio; // 2 bytes
        bool isActive;          // 1 byte
        address lendingToken;   // 20 bytes
        address[] acceptedCollateralTokens; // separate array storage
    }

    struct BorrowerListing {
        address borrower;       // 20 bytes
        uint256 amount;         // 12 bytes
        uint256 maxInterestRate; // 2 bytes
        uint256 duration;       // 4 bytes
        address collateralToken; // 20 bytes
        uint256 collateralAmount; // 12 bytes
        bool isActive;         // 1 byte
        address lendingToken;  // 20 bytes
    }

    // Packed loan struct
    struct Loan {
        address lender;        // 20 bytes
        address borrower;      // 20 bytes
        uint256 amount;        // 12 bytes
        uint256 interestRate;  // 2 bytes
        uint256 duration;      // 4 bytes
        uint256 startTime;     // 4 bytes
        uint256 gracePeriodEnd; // 4 bytes
        uint256 lastInterestUpdate; // 4 bytes
        uint256 accumulatedInterest; // 12 bytes
        address collateralToken;   // 20 bytes
        uint256 collateralAmount;  // 12 bytes
        bool isActive;            // 1 byte
        address lendingToken;     // 20 bytes
    }

    // Constants
    Constants private constants = Constants({
        basisPoints: 10000,
        maxInterestRate: 3000,
        minLoanDuration: 1 days,
        maxGracePeriod: 30 days,
        maxLoanDuration: 365 days
    });

    // State variables
    ICollateralManager public immutable collateralManager;
    
    mapping(uint256 => LenderListing) private lenderListings;
    mapping(uint256 => BorrowerListing) private borrowerListings;
    mapping(uint256 => Loan) private loans;
    mapping(address => mapping(address => uint256)) private userVolumeByToken;
    mapping(address => uint256) private userReputation;
    mapping(address => uint256) private userActiveLoans;
    mapping(address => bool) private validTokens;
    
    uint256 private nextListingId;
    uint256 private nextLoanId;
    mapping(address => uint256) private totalVolumeByToken;

    // Events
    event ListingCreated(uint256 indexed id, address indexed user, uint256 amount, uint256 rate, bool isLender, address token);
    event LoanMatched(uint256 indexed id, address indexed lender, address indexed borrower, uint256 amount, address token);
    event LoanRepaid(uint256 indexed id, uint256 amount, uint256 interest, address token);
    event LoanLiquidated(uint256 indexed id, address indexed liquidator);
    event GracePeriodSet(uint256 indexed id, uint256 endTime);
    event TokenStatusChanged(address indexed token, bool status);

    constructor(address _collateralManager) Ownable(msg.sender) {
        if (_collateralManager == address(0)) revert InvalidParams();
        collateralManager = ICollateralManager(_collateralManager);
        validTokens[address(0)] = true; // Enable ETH by default
    }

    // Optimized token management
    function setTokenStatus(address token, bool status) external onlyOwner {
        validTokens[token] = status;
        emit TokenStatusChanged(token, status);
    }

    function createLenderListing(
        uint256 amount,
        uint256 minInterestRate,
        uint256 maxDuration,
        address[] calldata acceptedTokens,
        uint256 minCollateralRatio,
        address lendingToken
    ) external payable nonReentrant returns (uint256) {
        if (!_validateListingParams(amount, minInterestRate, maxDuration, lendingToken)) 
            revert InvalidParams();

        uint256 listingId = nextListingId++;
        
        if (lendingToken == address(0)) {
            if (msg.value != amount) revert InsufficientAmount();
        } else {
            if (msg.value > 0) revert InvalidParams();
            if (!_transferToken(lendingToken, msg.sender, address(this), amount))
                revert TransferFailed();
        }

        lenderListings[listingId] = LenderListing({
            lender: msg.sender,
            amount: amount,
            minInterestRate: minInterestRate,
            maxDuration: maxDuration,
            minCollateralRatio: minCollateralRatio,
            isActive: true,
            lendingToken: lendingToken,
            acceptedCollateralTokens: acceptedTokens
        });

        emit ListingCreated(listingId, msg.sender, amount, minInterestRate, true, lendingToken);
        return listingId;
    }

    function createBorrowerListing(
        uint256 amount,
        uint256 maxInterestRate,
        uint256 duration,
        address collateralToken,
        uint256 collateralAmount,
        address lendingToken
    ) external payable nonReentrant returns (uint256) {
        if (!_validateListingParams(amount, maxInterestRate, duration, lendingToken))
            revert InvalidParams();
        ICollateralManager.CollateralInfo memory collateralConfig = collateralManager.getCollateralInfo(0);
        if (!collateralConfig.isActive)        revert InvalidCollateral();
        if (collateralToken == address(0)) {
        if (msg.value != collateralAmount)
            revert InsufficientAmount();
    }

        uint256 listingId = nextListingId++;
        
        borrowerListings[listingId] = BorrowerListing({
            borrower: msg.sender,
            amount: amount,
            maxInterestRate: maxInterestRate,
            duration: duration,
            collateralToken: collateralToken,
            collateralAmount: collateralAmount,
            isActive: true,
            lendingToken: lendingToken
        });

        emit ListingCreated(listingId, msg.sender, amount, maxInterestRate, false, lendingToken);
        return listingId;
    }

    function matchLoan(uint256 lenderListingId, uint256 borrowerListingId) external nonReentrant {
        LenderListing storage lenderListing = lenderListings[lenderListingId];
        BorrowerListing storage borrowerListing = borrowerListings[borrowerListingId];
        
        if (!_validateMatch(lenderListing, borrowerListing)) revert InvalidParams();

        uint256 loanId = _createLoan(lenderListing, borrowerListing);

        // Update state
        lenderListing.isActive = false;
        borrowerListing.isActive = false;
        
        // Update volume tracking
        totalVolumeByToken[borrowerListing.lendingToken] += borrowerListing.amount;
        userVolumeByToken[lenderListing.lender][borrowerListing.lendingToken] += borrowerListing.amount;
        userVolumeByToken[borrowerListing.borrower][borrowerListing.lendingToken] += borrowerListing.amount;

        emit LoanMatched(loanId, lenderListing.lender, borrowerListing.borrower, borrowerListing.amount, borrowerListing.lendingToken);
    }

    // Internal optimized functions
    function _validateListingParams(
        uint256 amount,
        uint256 interestRate,
        uint256 duration,
        address token
    ) private view returns (bool) {
        return amount > 0 && 
               interestRate <= constants.maxInterestRate && 
               duration >= constants.minLoanDuration && 
               duration <= constants.maxLoanDuration &&
               validTokens[token];
    }

    function _validateMatch(
        LenderListing storage lenderListing,
        BorrowerListing storage borrowerListing
    ) private view returns (bool) {
        if (!lenderListing.isActive || !borrowerListing.isActive) return false;
        if (borrowerListing.maxInterestRate < lenderListing.minInterestRate) return false;
        if (borrowerListing.duration > lenderListing.maxDuration) return false;
        if (borrowerListing.amount > lenderListing.amount) return false;
        if (borrowerListing.lendingToken != lenderListing.lendingToken) return false;

        // Check if collateral token is accepted using inline assembly for gas optimization
        bool validCollateral;
        address[] storage acceptedTokens = lenderListing.acceptedCollateralTokens;
        assembly {
            let len := sload(acceptedTokens.slot)
            for { let i := 0 } lt(i, len) { i := add(i, 1) } {
                let tokenSlot := keccak256(add(acceptedTokens.slot, i), 256)
                let currentToken := sload(tokenSlot)
                if eq(currentToken, sload(borrowerListing.slot)) {
                    validCollateral := 1
                    break
                }
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
            startTime: uint256(block.timestamp),
            gracePeriodEnd: uint256(block.timestamp + borrowerListing.duration),
            lastInterestUpdate: uint256(block.timestamp),
            accumulatedInterest: 0,
            collateralToken: borrowerListing.collateralToken,
            collateralAmount: borrowerListing.collateralAmount,
            isActive: true,
            lendingToken: borrowerListing.lendingToken
        });
        if (borrowerListing.collateralToken == address(0)) {
        collateralManager.initializeLoan{value: borrowerListing.collateralAmount}(
            loanId,
            borrowerListing.borrower,
            borrowerListing.collateralToken,
            borrowerListing.collateralAmount,
            borrowerListing.lendingToken
        );
    } else {
        collateralManager.initializeLoan(
            loanId,
            borrowerListing.borrower,
            borrowerListing.collateralToken,
            borrowerListing.collateralAmount,
            borrowerListing.lendingToken
        );
    }

        return loanId;
    }

    function _transferToken(
        address token,
        address from,
        address to,
        uint256 amount
    ) private returns (bool) {
        if (token == address(0)) {
            (bool success,) = to.call{value: amount}("");
            return success;
        } else {
            return IERC20(token).transferFrom(from, to, amount);
        }
    }
    // Add these functions to the P2PLendingMarketplace contract

function repayLoan(uint256 loanId) external payable nonReentrant {
    Loan storage loan = loans[loanId];
    if (!loan.isActive) revert LoanInactive();
    if (loan.borrower != msg.sender) revert Unauthorized();

    uint256 totalDue = _calculateTotalDue(loanId);
    
    if (loan.lendingToken == address(0)) {
        if (msg.value < totalDue) revert InsufficientAmount();
        (bool success,) = loan.lender.call{value: totalDue}("");
        if (!success) revert RepayFailed();
        if (msg.value > totalDue) {
            (bool refundSuccess,) = msg.sender.call{value: msg.value - totalDue}("");
            if (!refundSuccess) revert RepayFailed();
        }
    } else {
        if (!_transferToken(loan.lendingToken, msg.sender, loan.lender, totalDue))
            revert RepayFailed();
    }

    // Release collateral
    collateralManager.releaseLoanCollateral(loanId, loan.borrower);
    
    loan.isActive = false;
    userActiveLoans[loan.borrower]--;
    userReputation[loan.borrower]++;

    emit LoanRepaid(loanId, loan.amount, totalDue - loan.amount, loan.lendingToken);
}

function setGracePeriod(uint256 loanId, uint256 newEndTime) external nonReentrant {
    Loan storage loan = loans[loanId];
    if (!loan.isActive) revert LoanInactive();
    if (loan.lender != msg.sender) revert Unauthorized();
    
    uint256 maxAllowedEnd = loan.gracePeriodEnd + constants.maxGracePeriod;
    if (newEndTime > maxAllowedEnd) revert BadGracePeriod();
    
    loan.gracePeriodEnd = newEndTime;
    emit GracePeriodSet(loanId, newEndTime);
}

function liquidateLoan(uint256 loanId) external nonReentrant {
    Loan storage loan = loans[loanId];
    if (!loan.isActive) revert LoanInactive();
    
    // Check if loan is eligible for liquidation
    if (block.timestamp <= loan.gracePeriodEnd) revert Unauthorized();
    
    // Check collateralization status
    if (!collateralManager.checkCollateralization(loanId, _calculateTotalDue(loanId)))
        revert CollateralCheckFailed();
    
    // Perform liquidation
    collateralManager.liquidateCollateral(loanId, _calculateTotalDue(loanId));
    
    loan.isActive = false;
    userActiveLoans[loan.borrower]--;
    userReputation[loan.borrower]--;

    emit LoanLiquidated(loanId, msg.sender);
}

function _calculateTotalDue(uint256 loanId) internal view returns (uint256) {
    Loan storage loan = loans[loanId];
    uint256 timeElapsed = block.timestamp - loan.lastInterestUpdate;
    uint256 additionalInterest = (loan.amount * loan.interestRate * timeElapsed) / 
                                (constants.basisPoints * 365 days);
    return loan.amount + loan.accumulatedInterest + additionalInterest;
}

function getLoanStatus(uint256 loanId) external view returns (
    bool isActive,
    bool isOverdue,
    uint256 totalDue,
    uint256 gracePeriodEnd
) {
    Loan storage loan = loans[loanId];
    return (
        loan.isActive,
        block.timestamp > loan.gracePeriodEnd,
        _calculateTotalDue(loanId),
        loan.gracePeriodEnd
    );
}

    // View functions optimized for gas
    function getLoan(uint256 loanId) external view returns (Loan memory) {
        return loans[loanId];
    }

    function getUserVolume(address user, address token) external view returns (uint256) {
        return userVolumeByToken[user][token];
    }

    function getUserReputation(address user) external view returns (uint256) {
        return userReputation[user];
    }
    // Add these functions to your P2PLendingMarketplace contract

function getLenderListing(uint256 listingId) external view returns (
    address lender,
    uint256 amount,
    uint256 minInterestRate,
    uint256 maxDuration,
    address[] memory acceptedCollateralTokens,
    uint256 minCollateralRatio,
    bool isActive,
    address lendingToken
) {
    LenderListing storage listing = lenderListings[listingId];
    return (
        listing.lender,
        listing.amount,
        listing.minInterestRate,
        listing.maxDuration,
        listing.acceptedCollateralTokens,
        listing.minCollateralRatio,
        listing.isActive,
        listing.lendingToken
    );
}

function getBorrowerListing(uint256 listingId) external view returns (
    address borrower,
    uint256 amount,
    uint256 maxInterestRate,
    uint256 duration,
    address collateralToken,
    uint256 collateralAmount,
    bool isActive,
    address lendingToken
) {
    BorrowerListing storage listing = borrowerListings[listingId];
    return (
        listing.borrower,
        listing.amount,
        listing.maxInterestRate,
        listing.duration,
        listing.collateralToken,
        listing.collateralAmount,
        listing.isActive,
        listing.lendingToken
    );
}

    receive() external payable {}
    fallback() external payable {}
}