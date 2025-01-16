import { useToast } from "@/components/ui/use-toast";
import { BorrowRequest, LendOffer } from "@/types/loans";
import { useState } from "react";
import ActiveLoans from "./lend/ActiveLoans";
import TransactionHistory from "./lend/TransactionHistory";
import LendingListings from "./lend/LendingListings";

// Mock data for lending listings
const mockLendOffers: LendOffer[] = [
  {
    lender: "0x1234...5678",
    amount: 1000,
    minInterestRate: 5,
    maxDuration: 30,
    acceptedCollateralTokens: ["ETH", "WBTC", "USDC"],
    minCollateralRatio: 150,
  },
  {
    lender: "0x8765...4321",
    amount: 500,
    minInterestRate: 4,
    maxDuration: 15,
    acceptedCollateralTokens: ["ETH", "USDC"],
    minCollateralRatio: 130,
  }
];

const mockBorrowRequests: BorrowRequest[] = [
  {
    borrower: "0x1234...5678",
    amount: 1000,
    maxInterestRate: 5,
    duration: 30,
    acceptedCollateralToken: "0xdef...789",
    maxCollateralRatio: 150,
    dueDate: new Date(Date.now() + 86400000), // 24 hours from now
    status: "active",
    loanType: "lent",
    totalAmountOwed: 1050 // Including interest
  },
  {
    borrower: "0x8765...4321",
    amount: 500,
    maxInterestRate: 4,
    duration: 15,
    acceptedCollateralToken: "0xabc...123",
    maxCollateralRatio: 130,
    dueDate: new Date(Date.now() - 86400000), // 24 hours ago (overdue)
    status: "overdue",
    loanType: "borrowed",
    totalAmountOwed: 520 // Including interest
  }
];

const mockTransactions = [
  {
    id: 1,
    date: new Date(),
    type: "payment",
    amount: 100,
    token: "ETH"
  },
  // Add more mock transactions as needed
];

const LendPage = () => {
  const { toast } = useToast();

  const handleAddGrace = async (loan: BorrowRequest) => {
    // TODO: Implement smart contract interaction for adding grace period
    toast({
      title: "Adding Grace Period",
      description: "Processing grace period extension...",
    });
  };

  const handleLiquidate = async (loan: BorrowRequest) => {
    // TODO: Implement smart contract interaction for liquidation
    toast({
      title: "Initiating Liquidation",
      description: "Processing liquidation request...",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <LendingListings listings={mockLendOffers} />
      <ActiveLoans 
        loans={mockBorrowRequests}
        onAddGrace={handleAddGrace}
        onLiquidate={handleLiquidate}
      />
      <TransactionHistory transactions={mockTransactions} />
    </div>
  );
};

export default LendPage;