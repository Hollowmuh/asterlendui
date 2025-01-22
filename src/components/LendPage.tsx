import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

const COLLATERAL_TOKENS = [
  { id: "ETH", address: ethers.ZeroAddress, name: "Ethereum" },
  { id: "DAI", address: "0x5c22ea5efC8a9BA988709aC3bb4D7f3B1c2913c5", name: "DAI" },
  { id: "USDT", address: "0xfD4Ef88580EA4379090dA6C31585944567da5688", name: "USDT" },
  { id: "NGNA", address: "0x5652DBd5c763Fe2135618cB83Ceb26Cb66Fb0dD6", name: "NGNA" },
];
const LENDING_TOKENS = [
  { id: "ETH", address: ethers.ZeroAddress, name: "Ethereum" },
  { id: "DAI", address: "0x5c22ea5efC8a9BA988709aC3bb4D7f3B1c2913c5", name: "DAI" },
  { id: "USDT", address: "0xfD4Ef88580EA4379090dA6C31585944567da5688", name: "USDT" },
  { id: "NGNA", address: "0x5652DBd5c763Fe2135618cB83Ceb26Cb66Fb0dD6", name: "NGNA" },
];


const LendPage = () => {
  const { toast } = useToast();
  const { createLenderListing, fetchListings, listings, isLoading, isConnected, isInitializing, forceInitializeContract, contract } = useP2PLending();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedTokens, setSelectedTokens] = useState([]);
  const [selectedLendingToken, setSelectedLendingToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [isProcessing, setProcessing] = useState(false);
const [lastUpdate, setLastUpdate] = useState(0);

  const [newListing, setNewListing] = useState({
    amount: "",
    minInterestRate: "",
    maxDuration: "",
    minCollateralRatio: "125",
    lendingToken: ethers.ZeroAddress
  });

  // Modified useEffect to handle wallet connection and contract initialization
useEffect(() => {
    let isMounted = true;
    
    const initializeAndFetch = async () => {
      if (!isConnected || isInitializing) return;
      
      try {
        console.log('Starting initialization and fetch...');
        
        // Only initialize contract if needed
        if (!contract) {
          console.log('Initializing contract...');
          await forceInitializeContract();
        }
        
        // Fetch listings if component is still mounted
        if (isMounted) {
          console.log('Fetching listings...');
          await fetchListings(true);
        }
      } catch (error) {
        console.error("Initialization/fetch error:", error);
        if (isMounted) {
          toast({
            title: "Error",
            description: "Failed to load listings. Please try refreshing the page.",
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
    }, 15000); // Refresh every 15 seconds

    // Cleanup function
    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, [isConnected, isInitializing, contract, lastUpdate]);
 

  const validateListingData = () => {
    const validations = [
      {
        condition: !newListing.amount || parseFloat(newListing.amount) <= 0,
        message: "Please enter a valid amount"
      },
      {
        condition: !newListing.minInterestRate || parseFloat(newListing.minInterestRate) > 30 || parseFloat(newListing.minInterestRate) < 0,
        message: "Interest rate must be between 0% and 30%"
      },
      {
        condition: !newListing.maxDuration || parseInt(newListing.maxDuration) < 1 || parseInt(newListing.maxDuration) > 365,
        message: "Duration must be between 1 and 365 days"
      },
      {
        condition: selectedTokens.length === 0,
        message: "Please select at least one collateral token"
      },
      {
        condition: !selectedLendingToken,
        message: "Please select a lending token"
      },
      {
        condition: parseFloat(newListing.minCollateralRatio) < 125,
        message: "Minimum collateral ratio must be at least 125%"
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
    setProcessing(true);
    
    try {
      const lendingTokenAddress = LENDING_TOKENS.find(t => t.id === selectedLendingToken)?.address;
      if (!lendingTokenAddress) {
        throw new Error("Invalid lending token selected");
      }

      const listingData = {
        amount: ethers.parseEther(newListing.amount),
        minInterestRate: newListing.minInterestRate,
        maxDuration: newListing.maxDuration,
        minCollateralRatio: newListing.minCollateralRatio,
        acceptedCollateralTokens: selectedTokens.map(token => 
          COLLATERAL_TOKENS.find(t => t.id === token)?.address
        ).filter(Boolean),
        lendingToken: lendingTokenAddress
      };

      const success = await createLenderListing(listingData);

      if (success) {
        // Close dialogs
        setIsDialogOpen(false);
        setShowConfirmation(true);
        resetForm();
        
        // Force immediate refresh
        try {
          await fetchListings(true);
        } catch (error) {
          console.error("Error fetching listings after creation:", error);
        }
        
        // Trigger state update to ensure UI refresh
        setLastUpdate(Date.now());
      }
    } catch (error) {
      console.error("Error creating listing:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create lending offer",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setProcessing(false);
    }
  };


  const resetForm = () => {
    setNewListing({
      amount: "",
      minInterestRate: "",
      maxDuration: "",
      minCollateralRatio: "125",
      lendingToken: ethers.ZeroAddress
    });
    setSelectedTokens([]);
    setSelectedLendingToken("");
  };

  const getTokenName = (address) => {
    const token = COLLATERAL_TOKENS.find(t => t.address.toLowerCase() === address.toLowerCase());
    return token ? token.name : 'Unknown';
  };

  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-purple-900">
      <Navigation />
      <div className="container mx-auto ml-20 lg:ml-64 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Lending Marketplace
          </h1>
          <div className="flex gap-4">
            <WalletConnect />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={!isConnected}
                >
                  Create Lending Offer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Lending Offer</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Lending Token</label>
                    <Select
                      value={selectedLendingToken}
                      onValueChange={setSelectedLendingToken}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select token to lend" />
                      </SelectTrigger>
                      <SelectContent>
                        {LENDING_TOKENS.map(token => (
                          <SelectItem key={token.id} value={token.id}>
                            {token.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amount to Lend</label>
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
                    <label className="text-sm font-medium">Minimum Interest Rate (%)</label>
                    <Input
                      type="number"
                      max={30}
                      min={0}
                      step="0.1"
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
  {COLLATERAL_TOKENS.map((token) => (
    <div key={token.id} className="flex items-center gap-2">
      <input
        type="checkbox"
        id={token.id}
        value={token.id}
        checked={selectedTokens.includes(token.id)}
        onChange={(e) => {
          if (e.target.checked) {
            setSelectedTokens([...selectedTokens, token.id]);
          } else {
            setSelectedTokens(selectedTokens.filter((t) => t !== token.id));
          }
        }}
      />
      <label htmlFor={token.id}>{token.name}</label>
    </div>
  ))}
</div>
<div className="flex flex-wrap gap-2 mt-2">
  {selectedTokens.map((token) => (
    <div
      key={token}
      className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full text-sm flex items-center gap-2"
    >
      {token}
      <button
        onClick={() => setSelectedTokens(selectedTokens.filter((t) => t !== token))}
        className="hover:text-blue-600 dark:hover:text-blue-400"
      >
        ×
      </button>
    </div>
  ))}
</div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Minimum Collateral Ratio (%)</label>
                    <Input
                      type="number"
                      min={125}
                      step="1"
                      value={newListing.minCollateralRatio}
                      onChange={(e) => setNewListing({ 
                        ...newListing, 
                        minCollateralRatio: e.target.value
                      })}
                      placeholder="Min 125%"
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
        "Create Offer"
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
                  <p className="text-lg">No active listings found.</p>
                  {isConnected && (
                    <p className="mt-2">Create a new lending offer to get started!</p>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lender</TableHead>
                      <TableHead>Token</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Interest Rate</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Collateral Ratio</TableHead>
                      <TableHead>Accepted Collateral</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listings.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell className="font-mono">{formatAddress(listing.lender)}</TableCell>
                        <TableCell>{getTokenName(listing.lendingToken)}</TableCell>
                        <TableCell>{parseFloat(listing.amount).toFixed(4)}</TableCell>
                        <TableCell>{listing.minInterestRate}%</TableCell>
                        <TableCell>{listing.maxDuration} days</TableCell>
                        <TableCell>{listing.minCollateralRatio}%</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {listing.acceptedCollateralTokens.map((token, index) => (
                              <span key={index} className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 rounded-full">
                                {getTokenName(token)}
                              </span>
                            ))}
                          </div>
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

export default LendPage;