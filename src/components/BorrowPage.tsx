import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BorrowerListingDetails } from "@/types/loans";
import WalletRequired from "./WalletRequired";

// TODO: Replace with actual smart contract integration
const mockBorrowerListings: BorrowerListingDetails[] = [
  {
    id: "1",
    borrower: "0x1234...5678",
    requestedAmount: 1000,
    maxInterestRate: 5,
    desiredDuration: 30,
    collateralToken: "ETH",
    collateralAmount: 0.5,
    status: "active",
    createdAt: new Date()
  },
  {
    id: "2",
    borrower: "0x8765...4321",
    requestedAmount: 2000,
    maxInterestRate: 7,
    desiredDuration: 60,
    collateralToken: "WBTC",
    collateralAmount: 0.1,
    status: "active",
    createdAt: new Date()
  }
];

const BorrowPage = () => {
  const { toast } = useToast();
  const [newListing, setNewListing] = useState({
    requestedAmount: "",
    maxInterestRate: "",
    desiredDuration: "",
    collateralToken: "",
    collateralAmount: ""
  });

  // TODO: Implement actual smart contract interaction for creating listing
  const handleCreateListing = async () => {
    try {
      toast({
        title: "Creating Borrow Request",
        description: "Processing your borrow request...",
      });
      // Contract interaction would go here
      console.log("Creating borrow listing:", newListing);
    } catch (error) {
      console.error("Error creating listing:", error);
      toast({
        title: "Error",
        description: "Failed to create borrow request. Please try again.",
        variant: "destructive",
      });
    }
  };

  // TODO: Implement actual smart contract interaction for cancelling listing
  const handleCancelListing = async (listingId: string) => {
    try {
      toast({
        title: "Cancelling Request",
        description: "Processing cancellation...",
      });
      console.log("Cancelling listing:", listingId);
    } catch (error) {
      console.error("Error cancelling listing:", error);
      toast({
        title: "Error",
        description: "Failed to cancel request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <WalletRequired>
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Borrow Request</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label>Loan Amount Requested</label>
                <Input
                  type="number"
                  value={newListing.requestedAmount}
                  onChange={(e) => setNewListing({ ...newListing, requestedAmount: e.target.value })}
                  placeholder="Enter amount"
                />
              </div>
              <div className="space-y-2">
                <label>Maximum Interest Rate (%)</label>
                <Input
                  type="number"
                  max={30}
                  value={newListing.maxInterestRate}
                  onChange={(e) => setNewListing({ ...newListing, maxInterestRate: e.target.value })}
                  placeholder="Max 30%"
                />
              </div>
              <div className="space-y-2">
                <label>Desired Loan Duration (days)</label>
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={newListing.desiredDuration}
                  onChange={(e) => setNewListing({ ...newListing, desiredDuration: e.target.value })}
                  placeholder="1-365 days"
                />
              </div>
              <div className="space-y-2">
                <label>Collateral Token</label>
                <Select
                  value={newListing.collateralToken}
                  onValueChange={(value) => setNewListing({ ...newListing, collateralToken: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="WBTC">WBTC</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label>Collateral Amount</label>
                <Input
                  type="number"
                  value={newListing.collateralAmount}
                  onChange={(e) => setNewListing({ ...newListing, collateralAmount: e.target.value })}
                  placeholder="Enter collateral amount"
                />
              </div>
            </div>
            <Button onClick={handleCreateListing} className="mt-4">
              Create Borrow Request
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Borrow Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Borrower</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Max Interest</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Collateral</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockBorrowerListings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell className="font-mono">{listing.borrower}</TableCell>
                    <TableCell>{listing.requestedAmount} USDC</TableCell>
                    <TableCell>{listing.maxInterestRate}%</TableCell>
                    <TableCell>{listing.desiredDuration} days</TableCell>
                    <TableCell>
                      {listing.collateralAmount} {listing.collateralToken}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {listing.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleCancelListing(listing.id)}
                        variant="destructive"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </WalletRequired>
  );
};

export default BorrowPage;