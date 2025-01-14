import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { BorrowRequest } from "@/types/loans";

// TODO: Replace with actual smart contract integration
const mockBorrowRequests: BorrowRequest[] = [
  {
    borrower: "0x1234...5678",
    amount: 1000,
    maxInterestRate: 5,
    duration: 30,
    acceptedCollateralToken: "0xabc...def",
    maxCollateralRatio: 150
  },
  {
    borrower: "0x8765...4321",
    amount: 500,
    maxInterestRate: 4,
    duration: 15,
    acceptedCollateralToken: "0xfed...cba",
    maxCollateralRatio: 130
  }
];

const LendPage = () => {
  const { toast } = useToast();

  // TODO: Implement actual smart contract interaction
  const handleMatch = async (request: BorrowRequest) => {
    try {
      toast({
        title: "Processing loan match",
        description: `Attempting to match loan request from ${request.borrower}`,
      });
      // Contract interaction would go here
      console.log("Matching loan request:", request);
    } catch (error) {
      console.error("Error matching loan:", error);
      toast({
        title: "Error",
        description: "Failed to match loan request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Borrow Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Borrower</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Max Interest Rate (%)</TableHead>
              <TableHead>Duration (days)</TableHead>
              <TableHead>Collateral Token</TableHead>
              <TableHead>Max Collateral Ratio (%)</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockBorrowRequests.map((request, index) => (
              <TableRow key={index}>
                <TableCell className="font-mono">{request.borrower}</TableCell>
                <TableCell>{request.amount} ETH</TableCell>
                <TableCell>{request.maxInterestRate}%</TableCell>
                <TableCell>{request.duration}</TableCell>
                <TableCell className="font-mono">{request.acceptedCollateralToken}</TableCell>
                <TableCell>{request.maxCollateralRatio}%</TableCell>
                <TableCell>
                  <Button 
                    onClick={() => handleMatch(request)}
                    variant="default"
                  >
                    Match
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default LendPage;