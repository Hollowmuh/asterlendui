import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { LendOffer } from "@/types/loans";

// TODO: Replace with actual smart contract integration
const mockLendOffers: LendOffer[] = [
  {
    lender: "0x9876...5432",
    amount: 2000,
    minInterestRate: 3,
    maxDuration: 45,
    acceptedCollateralTokens: ["0xabc...def", "0x123...456"],
    minCollateralRatio: 120
  },
  {
    lender: "0x5432...9876",
    amount: 1500,
    minInterestRate: 4,
    maxDuration: 30,
    acceptedCollateralTokens: ["0xfed...cba"],
    minCollateralRatio: 140
  }
];

const BorrowPage = () => {
  const { toast } = useToast();

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Lending Offers</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lender</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Min Interest Rate (%)</TableHead>
              <TableHead>Max Duration (days)</TableHead>
              <TableHead>Accepted Collateral</TableHead>
              <TableHead>Min Collateral Ratio (%)</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockLendOffers.map((offer, index) => (
              <TableRow key={index}>
                <TableCell className="font-mono">{offer.lender}</TableCell>
                <TableCell>{offer.amount} ETH</TableCell>
                <TableCell>{offer.minInterestRate}%</TableCell>
                <TableCell>{offer.maxDuration}</TableCell>
                <TableCell className="font-mono">
                  {offer.acceptedCollateralTokens.join(", ")}
                </TableCell>
                <TableCell>{offer.minCollateralRatio}%</TableCell>
                <TableCell>
                  <Button 
                    onClick={() => handleMatch(offer)}
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

export default BorrowPage;