import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import Navigation from "./Navigation";
import { WalletConnect } from "@/components/WalletConnect";
import { useP2PLending } from '@/hooks/smart-contract';

const TOKENS = [
  { id: "ETH", address: ethers.ZeroAddress, name: "Ethereum" },
  { id: "DAI", address: "0x5c22ea5efC8a9BA988709aC3bb4D7f3B1c2913c5", name: "DAI" },
  { id: "USDT", address: "0xfD4Ef88580EA4379090dA6C31585944567da5688", name: "USDT" },
  { id: "NGNA", address: "0x5652DBd5c763Fe2135618cB83Ceb26Cb66Fb0dD6", name: "NGNA" },
];

const BorrowPage = () => {
  const { toast } = useToast();
  const { createBorrowerListing, fetchBorrowerListings, listings, isLoading, isConnected, isInitializing, forceInitializeContract, contract } = useP2PLending();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCollateralToken, setSelectedCollateralToken] = useState("");
  const [selectedLendingToken, setSelectedLendingToken] = useState("");
  const [lastUpdate, setLastUpdate] = useState(0);

  const [newListing, setNewListing] = useState({
    amount: "",
    maxInterestRate: "",
    duration: "",
    collateralAmount: ""
  });

  useEffect(() => {
    let isMounted = true;
    
    const initializeAndFetch = async () => {
      if (!isConnected || isInitializing) return;
      
      try {
        console.log('Starting initialization and fetch...');
        
        if (!contract) {
          console.log('Initializing contract...');
          await forceInitializeContract();
        }
        
        if (isMounted) {
          console.log('Fetching borrower listings...');
          await fetchBorrowerListings();
        }
      } catch (error) {
        console.error("Initialization/fetch error:", error);
        if (isMounted) {
          toast({
            title: "Error",
            description: "Failed to load borrower listings. Please try refreshing the page.",
            variant: "destructive",
          });
        }
      }
    };

    initializeAndFetch();
    const refreshInterval = setInterval(() => {
      if (isConnected && !isInitializing) {
        console.log('Running periodic refresh...');
        initializeAndFetch();
      }
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, [isConnected, isInitializing, contract, lastUpdate]);

  const validateListingData = () => {
    const validations = [
      {
        condition: !newListing.amount || parseFloat(newListing.amount) <= 0,
        message: "Please enter a valid borrow amount"
      },
      {
        condition: !newListing.maxInterestRate || parseFloat(newListing.maxInterestRate) > 30 || parseFloat(newListing.maxInterestRate) < 0,
        message: "Interest rate must be between 0% and 30%"
      },
      {
        condition: !newListing.duration || parseInt(newListing.duration) < 1 || parseInt(newListing.duration) > 365,
        message: "Duration must be between 1 and 365 days"
      },
      {
        condition: !selectedCollateralToken,
        message: "Please select a collateral token"
      },
      {
        condition: !selectedLendingToken,
        message: "Please select a lending token"
      },
      {
        condition: !newListing.collateralAmount || parseFloat(newListing.collateralAmount) <= 0,
        message: "Please enter a valid collateral amount"
      }
    ];

    const error = validations.find(v => v.condition);
    if (error) {
      toast({
        title: "Validation Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleCreateListing = async () => {
    if (!isConnected) {
      setShowWalletDialog(true);
      setIsDialogOpen(false);
      return;
    }

    if (!validateListingData()) return;

    setIsSubmitting(true);
    setIsProcessing(true);
    
    try {
      const collateralTokenAddress = TOKENS.find(t => t.id === selectedCollateralToken)?.address;
      const lendingTokenAddress = TOKENS.find(t => t.id === selectedLendingToken)?.address;

      if (!collateralTokenAddress || !lendingTokenAddress) {
        throw new Error("Invalid token selection");
      }

      const listingData = {
        amount: newListing.amount,
        maxInterestRate: newListing.maxInterestRate,
        duration: newListing.duration,
        collateralToken: collateralTokenAddress,
        collateralAmount: newListing.collateralAmount,
        lendingToken: lendingTokenAddress
      };

      const success = await createBorrowerListing(listingData);

      if (success) {
        setIsDialogOpen(false);
        setShowConfirmation(true);
        resetForm();
        
        try {
          await fetchBorrowerListings();
        } catch (error) {
          console.error("Error fetching listings after creation:", error);
        }
        
        setLastUpdate(Date.now());
      }
    } catch (error) {
      console.error("Error creating borrow listing:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create borrow request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setNewListing({
      amount: "",
      maxInterestRate: "",
      duration: "",
      collateralAmount: ""
    });
    setSelectedCollateralToken("");
    setSelectedLendingToken("");
  };

  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getTokenName = (address) => {
    const token = TOKENS.find(t => t.address.toLowerCase() === address.toLowerCase());
    return token ? token.name : 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-purple-900">
      <Navigation />
      <div className="container mx-auto ml-20 lg:ml-64 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Borrow Requests
          </h1>
          <div className="flex gap-4">
            <WalletConnect />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={!isConnected}
                >
                  Create Borrow Request
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Borrow Request</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Lending Token</label>
                    <Select
                      value={selectedLendingToken}
                      onValueChange={setSelectedLendingToken}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select token to borrow" />
                      </SelectTrigger>
                      <SelectContent>
                        {TOKENS.map(token => (
                          <SelectItem key={token.id} value={token.id}>
                            {token.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amount to Borrow</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
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
                      step="0.1"
                      value={newListing.maxInterestRate}
                      onChange={(e) => setNewListing({ ...newListing, maxInterestRate: e.target.value })}
                      placeholder="Max 30%"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Loan Duration (days)</label>
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
                      value={selectedCollateralToken}
                      onValueChange={setSelectedCollateralToken}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select collateral token" />
                      </SelectTrigger>
                      <SelectContent>
                        {TOKENS.map(token => (
                          <SelectItem key={token.id} value={token.id}>
                            {token.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Collateral Amount</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newListing.collateralAmount}
                      onChange={(e) => setNewListing({ ...newListing, collateralAmount: e.target.value })}
                      placeholder="Enter collateral amount"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleCreateListing}
                    disabled={isSubmitting || isProcessing}
                    className="relative"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <span className="animate-spin">⭮</span>
                        Processing...
                      </div>
                    ) : isSubmitting ? (
                      "Creating..."
                    ) : (
                      "Create Request"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border border-purple-100 dark:border-purple-900">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              {isLoading ? (
  <div className="text-center py-8">
    <p className="text-lg">Loading listings...</p>
  </div>
) : !listings || listings.length === 0 ? (
  <div className="text-center py-8">
    <p className="text-lg">No active borrow requests found.</p>
    {isConnected && (
      <p className="mt-2">Create a new borrow request to get started!</p>
    )}
  </div>
) : (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Borrower</TableHead>
        <TableHead>Borrowing Token</TableHead>
        <TableHead>Amount</TableHead>
        <TableHead>Max Interest</TableHead>
        <TableHead>Duration</TableHead>
        <TableHead>Collateral Token</TableHead>
        <TableHead>Collateral Amount</TableHead>
        <TableHead>Status</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {listings.map((listing) => (
        <TableRow key={listing.id}>
          <TableCell className="font-mono">
            {formatAddress(listing.borrower)}
          </TableCell>
          <TableCell>
            {getTokenName(listing.lendingToken)}
          </TableCell>
          <TableCell>
            {parseFloat(listing.amount).toFixed(4)}
          </TableCell>
          <TableCell>
            {listing.maxInterestRate}%
          </TableCell>
          <TableCell>
            {listing.duration} days
          </TableCell>
          <TableCell>
            {getTokenName(listing.collateralToken)}
          </TableCell>
          <TableCell>
            {parseFloat(listing.collateralAmount).toFixed(4)}
          </TableCell>
          <TableCell>
            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Active
            </span>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
)}
            </div>
          </CardContent>
        </Card>
      </div>
<AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lending Offer Created Successfully!</AlertDialogTitle>
            <AlertDialogDescription>
              Your lending offer has been submitted to the blockchain and is now active on the marketplace.
              Potential borrowers can now view and accept your offer. You will be notified when someone
              accepts your lending terms.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowConfirmation(false)}>
              View Listings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BorrowPage;