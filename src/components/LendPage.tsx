import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { BorrowRequest } from "@/types/loans";
import { useState } from "react";

// TODO: Replace with actual smart contract integration
const mockBorrowRequests: BorrowRequest[] = [
  {
    borrower: "0x1234...5678",
    amount: 1000,
    maxInterestRate: 5,
    duration: 30,
    acceptedCollateralToken: "0xdef...789",
    maxCollateralRatio: 150,
    dueDate: new Date(Date.now() + 86400000), // 24 hours from now
    status: "active"
  },
  {
    borrower: "0x8765...4321",
    amount: 500,
    maxInterestRate: 4,
    duration: 15,
    acceptedCollateralToken: "0xabc...123",
    maxCollateralRatio: 130,
    dueDate: new Date(Date.now() - 86400000), // 24 hours ago (overdue)
    status: "overdue"
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
  const [selectedLoan, setSelectedLoan] = useState<BorrowRequest | null>(null);

  // TODO: Implement actual smart contract interaction
  const handleMatch = async (request: BorrowRequest) => {
    try {
      toast({
        title: "Processing loan match",
        description: `Attempting to match borrow request from ${request.borrower}`,
      });
      // Contract interaction would go here
      console.log("Matching borrow request:", request);
    } catch (error) {
      console.error("Error matching request:", error);
      toast({
        title: "Error",
        description: "Failed to match borrow request. Please try again.",
        variant: "destructive",
      });
    }
  };

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

  const isLoanOverdue = (dueDate: Date) => {
    return new Date() > new Date(dueDate);
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
                <TableHead>Borrower</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Interest Rate (%)</TableHead>
                <TableHead>Duration (days)</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBorrowRequests.map((request, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono">{request.borrower}</TableCell>
                  <TableCell>{request.amount} ETH</TableCell>
                  <TableCell>{request.maxInterestRate}%</TableCell>
                  <TableCell>{request.duration}</TableCell>
                  <TableCell>{request.dueDate.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      request.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {request.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="space-x-2">
                      <Button
                        onClick={() => handleAddGrace(request)}
                        variant="outline"
                        disabled={!isLoanOverdue(request.dueDate)}
                      >
                        Add Grace
                      </Button>
                      <Button
                        onClick={() => handleLiquidate(request)}
                        variant="destructive"
                        disabled={!isLoanOverdue(request.dueDate)}
                      >
                        Liquidate
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
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

export default LendPage;