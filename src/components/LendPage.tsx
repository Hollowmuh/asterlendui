import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import Navigation from "./Navigation";
import { WalletConnect } from "@/components/WalletConnect";

const mockLenderListings = [
  {
    id: "1",
    lender: "0x1234...5678",
    amount: 1000,
    minInterestRate: 5,
    maxDuration: 30,
    acceptedCollateralTokens: ["ETH", "WBTC"],
    minCollateralRatio: 150,
    isActive: true,
    createdAt: new Date()
  },
  {
    id: "2",
    lender: "0x8765...4321",
    amount: 2000,
    minInterestRate: 6,
    maxDuration: 60,
    acceptedCollateralTokens: ["ETH", "USDC"],
    minCollateralRatio: 140,
    isActive: true,
    createdAt: new Date()
  }
];

const LendPage = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [newListing, setNewListing] = useState({
    amount: "",
    minInterestRate: "",
    maxDuration: "",
    acceptedCollateralTokens: [],
    minCollateralRatio: "12000", // Default 120% as per contract
  });

  const handleCreateListing = async () => {
    try {
      // Contract interaction simulation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsDialogOpen(false);
      setShowConfirmation(true);
      
      toast({
        title: "Success!",
        description: "Your lending offer has been created successfully.",
      });
    } catch (error) {
      console.error("Error creating listing:", error);
      toast({
        title: "Error",
        description: "Failed to create lending offer. Please try again.",
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
            Lending Offers
          </h1>
          <WalletConnect/>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Create New Lending Offer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Lending Offer</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount to Lend (USDC)</label>
                  <Input
                    type="number"
                    min="0"
                    value={newListing.amount}
                    onChange={(e) => setNewListing({ ...newListing, amount: e.target.value })}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Minimum Interest Rate (%)</label>
                  <Input
                    type="number"
                    max={30}
                    min={0}
                    value={newListing.minInterestRate}
                    onChange={(e) => setNewListing({ ...newListing, minInterestRate: e.target.value })}
                    placeholder="Max 30%"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Maximum Loan Duration (days)</label>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={newListing.maxDuration}
                    onChange={(e) => setNewListing({ ...newListing, maxDuration: e.target.value })}
                    placeholder="1-365 days"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Accepted Collateral Tokens</label>
                  <Select
                    value={newListing.acceptedCollateralTokens}
                    onValueChange={(value) => setNewListing({ 
                      ...newListing, 
                      acceptedCollateralTokens: [...newListing.acceptedCollateralTokens, value] 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tokens" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ETH">ETH</SelectItem>
                      <SelectItem value="WBTC">WBTC</SelectItem>
                      <SelectItem value="USDC">USDC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Minimum Collateral Ratio (%)</label>
                  <Input
                    type="number"
                    min={120}
                    value={parseInt(newListing.minCollateralRatio) / 100}
                    onChange={(e) => setNewListing({ 
                      ...newListing, 
                      minCollateralRatio: (parseInt(e.target.value) * 100).toString() 
                    })}
                    placeholder="Min 120%"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateListing}>Create Offer</Button>
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
                    <TableHead>Lender</TableHead>
                    <TableHead>Amount (USDC)</TableHead>
                    <TableHead>Min Interest</TableHead>
                    <TableHead>Max Duration</TableHead>
                    <TableHead>Accepted Collateral</TableHead>
                    <TableHead>Min Collateral Ratio</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockLenderListings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell className="font-mono">{listing.lender}</TableCell>
                      <TableCell>${listing.amount.toLocaleString()}</TableCell>
                      <TableCell>{listing.minInterestRate}%</TableCell>
                      <TableCell>{listing.maxDuration} days</TableCell>
                      <TableCell>{listing.acceptedCollateralTokens.join(", ")}</TableCell>
                      <TableCell>{listing.minCollateralRatio}%</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Active
                        </span>
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
            <AlertDialogTitle>Lending Offer Created!</AlertDialogTitle>
            <AlertDialogDescription>
              Your lending offer has been successfully created and is now active on the marketplace.
              Borrowers will be able to view and respond to your offer.
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

export default LendPage;