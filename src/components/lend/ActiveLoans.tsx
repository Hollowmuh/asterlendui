import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { BorrowRequest } from "@/types/loans";

interface ActiveLoansProps {
  loans: BorrowRequest[];
  onAddGrace: (loan: BorrowRequest) => void;
  onLiquidate: (loan: BorrowRequest) => void;
}

const ActiveLoans = ({ loans, onAddGrace, onLiquidate }: ActiveLoansProps) => {
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
            {loans.map((request, index) => (
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
                      onClick={() => onAddGrace(request)}
                      variant="outline"
                      disabled={!isLoanOverdue(request.dueDate)}
                    >
                      Add Grace
                    </Button>
                    <Button
                      onClick={() => onLiquidate(request)}
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
  );
};

export default ActiveLoans;