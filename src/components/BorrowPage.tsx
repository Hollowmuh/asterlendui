import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { LendOffer } from "@/types/loans";

// TODO: Replace with actual smart contract integration
const mockLendOffers: LendOffer[] = [
  {
    lender: "0x9876...5432",
    amount: 2000,
    minInterestRate: 3,
    maxDuration: 45,
    acceptedCollateralTokens: ["0xabc...def", "0x123...456"],
    minCollateralRatio: 120,
    totalDebt: 2200,
    status: "active"
  },
  {
    lender: "0x5432...9876",
    amount: 1500,
    minInterestRate: 4,
    maxDuration: 30,
    acceptedCollateralTokens: ["0xfed...cba"],
    minCollateralRatio: 140,
    totalDebt: 1650,
    status: "active"
  }
];

const mockTransactions = [
  {
    id: 1,
    date: new Date(),
    type: "borrow",
    amount: 1500,
    token: "ETH"
  },
  // Add more mock transactions as needed
];

const BorrowPage = () => {
  const { toast } = useToast();
  const [selectedLoan, setSelectedLoan] = useState<LendOffer | null>(null);
  const [repaymentAmount, setRepaymentAmount] = useState<string>("");

  // TODO: Implement actual smart contract interaction
  const handleMatch = async (offer: LendOffer) => {
    try {
      toast({
        title: "Processing loan match",
        description: `Attempting to match loan offer from ${offer.lender}`,
      });
      // Contract interaction would go here
      console.log("Matching loan offer:", offer);
    } catch (error) {
      console.error("Error matching loan:", error);
      toast({
        title: "Error",
        description: "Failed to match loan offer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRepayment = async (loan: LendOffer, amount: string) => {
    // TODO: Implement smart contract interaction for loan repayment
    toast({
      title: "Processing Repayment",
      description: `Attempting to repay ${amount} ETH`,
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Active Loans</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lender</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Interest Rate (%)</TableHead>
                <TableHead>Duration (days)</TableHead>
                <TableHead>Total Debt</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLendOffers.map((offer, index) => (
                <>
                  <TableRow key={index}>
                    <TableCell className="font-mono">{offer.lender}</TableCell>
                    <TableCell>{offer.amount} ETH</TableCell>
                    <TableCell>{offer.minInterestRate}%</TableCell>
                    <TableCell>{offer.maxDuration}</TableCell>
                    <TableCell>{offer.totalDebt} ETH</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {offer.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="space-x-2">
                        <Button
                          onClick={() => setSelectedLoan(selectedLoan === offer ? null : offer)}
                          variant="outline"
                        >
                          Manage
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {selectedLoan === offer && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                          <div className="flex items-center space-x-4">
                            <Input
                              type="number"
                              placeholder="Enter amount to repay"
                              value={repaymentAmount}
                              onChange={(e) => setRepaymentAmount(e.target.value)}
                              className="max-w-xs"
                            />
                            <Button
                              onClick={() => handleRepayment(offer, repaymentAmount)}
                              variant="default"
                            >
                              Partial Repayment
                            </Button>
                            <Button
                              onClick={() => handleRepayment(offer, offer.totalDebt.toString())}
                              variant="default"
                            >
                              Repay Full Amount
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Token</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.date.toLocaleDateString()}</TableCell>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell>{tx.amount}</TableCell>
                  <TableCell>{tx.token}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BorrowPage;