export interface LendOffer {
  lender: string;
  amount: number;
  minInterestRate: number;
  maxDuration: number;
  acceptedCollateralTokens: string[];
  minCollateralRatio: number;
  totalDebt?: number;
  status?: string;
}

export interface BorrowRequest {
  borrower: string;
  amount: number;
  maxInterestRate: number;
  duration: number;
  acceptedCollateralToken: string;
  maxCollateralRatio: number;
  dueDate: Date;
  status: string;
  loanType: 'lent' | 'borrowed';
  totalAmountOwed?: number;
}

export interface BorrowerListingDetails {
  id: string;
  borrower: string;
  requestedAmount: number;
  maxInterestRate: number;
  desiredDuration: number;
  collateralToken: string;
  collateralAmount: number;
  status: 'active' | 'cancelled' | 'matched';
  createdAt: Date;
}