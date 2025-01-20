import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "./Navigation";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { WalletConnect } from "@/components/WalletConnect";
// Extended mock data
const mockBorrowerListings = [
  {
    id: "1",
    borrower: "0x1234...5678",
    amount: 1000,
    maxInterestRate: 5,
    duration: 30,
    collateralToken: "ETH",
    collateralAmount: 0.5,
    isActive: true,
    createdAt: new Date()
  },
  {
    id: "2",
    borrower: "0x8765...4321",
    amount: 2000,
    maxInterestRate: 7,
    duration: 60,
    collateralToken: "WBTC",
    collateralAmount: 0.1,
    isActive: true,
    createdAt: new Date()
  },
  {
    id: "3",
    borrower: "0x9999...1111",
    amount: 5000,
    maxInterestRate: 6.5,
    duration: 90,
    collateralToken: "ETH",
    collateralAmount: 2.5,
    isActive: true,
    createdAt: new Date()
  },
  {
    id: "4",
    borrower: "0x2222...3333",
    amount: 3000,
    maxInterestRate: 8,
    duration: 45,
    collateralToken: "USDC",
    collateralAmount: 3600,
    isActive: true,
    createdAt: new Date()
  }
];

const BorrowPage = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [newListing, setNewListing] = useState({
    amount: "",
    maxInterestRate: "",
    duration: "",
    collateralToken: "",
    collateralAmount: ""
  });

  const [lendingDetails, setLendingDetails] = useState({
    amount: "",
    minInterestRate: "",
    maxDuration: "",
    minCollateralRatio: "12000",
    acceptedCollateralTokens: []
  });

  const handleCreateListing = async () => {
    try {
      // Contract interaction simulation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsDialogOpen(false);
      setShowConfirmation(true);
      
      toast({
        title: "Success!",
        description: "Your borrow request has been created successfully.",
      });
    } catch (error) {
      console.error("Error creating listing:", error);
      toast({
        title: "Error",
        description: "Failed to create borrow request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLend = async (listingId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Success!",
        description: "Your lending offer has been processed successfully.",
      });
    } catch (error) {
      console.error("Error processing loan:", error);
      toast({
        title: "Error",
        description: "Failed to process loan. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-blue-100 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      <Navigation />
      <div className="container mx-auto ml-20 lg:ml-64 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Borrow Requests
          </h1>
          <WalletConnect />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Create New Borrow Request
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Borrow Request</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Loan Amount (USDC)</label>
                  <Input
                    type="number"
                    min="0"
                    value={newListing.amount}
                    onChange={(e) => setNewListing({ ...newListing, amount: e.target.value })}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Maximum Interest Rate (%)</label>
                  <Input
                    type="number"
                    max={30}
                    min={0}
                    value={newListing.maxInterestRate}
                    onChange={(e) => setNewListing({ ...newListing, maxInterestRate: e.target.value })}
                    placeholder="Max 30%"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration (days)</label>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={newListing.duration}
                    onChange={(e) => setNewListing({ ...newListing, duration: e.target.value })}
                    placeholder="1-365 days"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Collateral Token</label>
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
                  <label className="text-sm font-medium">Collateral Amount</label>
                  <Input
                    type="number"
                    min="0"
                    value={newListing.collateralAmount}
                    onChange={(e) => setNewListing({ ...newListing, collateralAmount: e.target.value })}
                    placeholder="Enter collateral amount"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateListing}>Create Request</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border border-purple-100 dark:border-purple-900">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Borrower</TableHead>
                    <TableHead>Amount (USDC)</TableHead>
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
                      <TableCell>${listing.amount.toLocaleString()}</TableCell>
                      <TableCell>{listing.maxInterestRate}%</TableCell>
                      <TableCell>{listing.duration} days</TableCell>
                      <TableCell>
                        {listing.collateralAmount} {listing.collateralToken}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Active
                        </span>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline"
                              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                            >
                              Lend
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Specify Lending Terms</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="space-y-2">
                                <label>Lending Amount (USDC)</label>
                                <Input
                                  type="number"
                                  min="0"
                                  max={listing.amount}
                                  value={lendingDetails.amount}
                                  onChange={(e) => setLendingDetails({ ...lendingDetails, amount: e.target.value })}
                                  placeholder={`Max ${listing.amount}`}
                                />
                              </div>
                              <div className="space-y-2">
                                <label>Minimum Interest Rate (%)</label>
                                <Input
                                  type="number"
                                  min="0"
                                  max={listing.maxInterestRate}
                                  value={lendingDetails.minInterestRate}
                                  onChange={(e) => setLendingDetails({ ...lendingDetails, minInterestRate: e.target.value })}
                                  placeholder={`Max ${listing.maxInterestRate}%`}
                                />
                              </div>
                              <div className="space-y-2">
                                <label>Maximum Duration (days)</label>
                                <Input
                                  type="number"
                                  min="1"
                                  max={listing.duration}
                                  value={lendingDetails.maxDuration}
                                  onChange={(e) => setLendingDetails({ ...lendingDetails, maxDuration: e.target.value })}
                                  placeholder={`Max ${listing.duration} days`}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={() => handleLend(listing.id)}>
                                Confirm Lending Terms
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Borrow Request Created!</AlertDialogTitle>
            <AlertDialogDescription>
              Your borrow request has been successfully created and is now active on the marketplace.
              Lenders will be able to view and respond to your request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
export default BorrowPage;