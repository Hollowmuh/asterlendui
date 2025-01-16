import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { BorrowRequest } from "@/types/loans";
import { useState } from "react";
import PartialRepaymentModal from "./PartialRepaymentModal";
import { ethers } from "ethers";

interface ActiveLoansProps {
  loans: BorrowRequest[];
  onAddGrace: (loan: BorrowRequest) => void;
  onLiquidate: (loan: BorrowRequest) => void;
}

const ActiveLoans = ({ loans, onAddGrace, onLiquidate }: ActiveLoansProps) => {
  const { toast } = useToast();
  const [selectedLoan, setSelectedLoan] = useState<BorrowRequest | null>(null);
  const [isRepaymentModalOpen, setIsRepaymentModalOpen] = useState(false);

  const handleRepayFull = async (loan: BorrowRequest) => {
    try {
      // TODO: Integrate with smart contract
      // const contract = new ethers.Contract(contractAddress, abi, signer);
      // await contract.repayLoan(loan.id, { value: ethers.utils.parseEther(loan.totalAmountOwed.toString()) });
      
      toast({
        title: "Processing Repayment",
        description: "Full repayment is being processed...",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process repayment",
        variant: "destructive",
      });
    }
  };

  const handlePartialRepay = async (amount: number) => {
    try {
      // TODO: Integrate with smart contract
      // const contract = new ethers.Contract(contractAddress, abi, signer);
      // await contract.partialRepayment(selectedLoan.id, { value: ethers.utils.parseEther(amount.toString()) });
      
      toast({
        title: "Processing Partial Repayment",
        description: `Partial repayment of ${amount} ETH is being processed...`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process partial repayment",
        variant: "destructive",
      });
    }
  };

  const isLoanOverdue = (dueDate: Date) => new Date() > new Date(dueDate);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Active Loans</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
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
            {loans.map((loan, index) => (
              <TableRow key={index}>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    loan.loanType === 'lent' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {loan.loanType === 'lent' ? 'Lent' : 'Borrowed'}
                  </span>
                </TableCell>
                <TableCell className="font-mono">{loan.borrower}</TableCell>
                <TableCell>{loan.amount} ETH</TableCell>
                <TableCell>{loan.maxInterestRate}%</TableCell>
                <TableCell>{loan.duration}</TableCell>
                <TableCell>{loan.dueDate.toLocaleDateString()}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    loan.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {loan.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="space-x-2">
                    {loan.loanType === 'lent' ? (
                      <>
                        <Button
                          onClick={() => onAddGrace(loan)}
                          variant="outline"
                          disabled={!isLoanOverdue(loan.dueDate)}
                        >
                          Add Grace
                        </Button>
                        <Button
                          onClick={() => onLiquidate(loan)}
                          variant="destructive"
                          disabled={!isLoanOverdue(loan.dueDate)}
                        >
                          Liquidate
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={() => handleRepayFull(loan)}
                          variant="default"
                        >
                          Repay Full
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedLoan(loan);
                            setIsRepaymentModalOpen(true);
                          }}
                          variant="outline"
                        >
                          Partial Repay
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {selectedLoan && (
        <PartialRepaymentModal
          isOpen={isRepaymentModalOpen}
          onClose={() => {
            setIsRepaymentModalOpen(false);
            setSelectedLoan(null);
          }}
          loan={{
            totalAmountOwed: selectedLoan.totalAmountOwed || selectedLoan.amount,
            borrower: selectedLoan.borrower
          }}
          onRepay={handlePartialRepay}
        />
      )}
    </Card>
  );
};

export default ActiveLoans;