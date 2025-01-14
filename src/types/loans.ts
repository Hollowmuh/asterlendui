export interface LendOffer {
  lender: string;
  amount: number;
  minInterestRate: number;
  maxDuration: number;
  acceptedCollateralTokens: string[];
  minCollateralRatio: number;
}

export interface BorrowRequest {
  borrower: string;
  amount: number;
  maxInterestRate: number;
  duration: number;
  acceptedCollateralToken: string;
  maxCollateralRatio: number;
}