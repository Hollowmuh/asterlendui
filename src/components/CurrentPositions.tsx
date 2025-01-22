import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from 'react';
import { WalletConnect } from "@/components/WalletConnect";
import { useAccount } from 'wagmi';
import { useLoanActivity } from '@/hooks/loans';
import { ethers} from 'ethers';
import { useToast } from "@/components/ui/use-toast";

const CurrentPositions = () => {
  const { address: userAddress, isConnected } = useAccount();
  const [gracePeriod, setGracePeriod] = useState("");
  const [repayAmount, setRepayAmount] = useState("");
  const { loans, isLoading, repayLoan, setGracePeriod: setLoanGracePeriod, liquidateLoan } = useLoanActivity();
    const { toast } = useToast();

  const handleRepay = async (loanId, amount) => {
    await repayLoan(loanId, amount);
    setRepayAmount("");
  };

  const handleSetGracePeriod = async (loanId) => {
    if (!gracePeriod || parseFloat(gracePeriod) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid number of days.",
        variant: "destructive",
      });
      return;
    }
    
    await setLoanGracePeriod(loanId, parseFloat(gracePeriod));
    setGracePeriod("");
  };

  const handleLiquidate = async (loanId) => {
    await liquidateLoan(loanId);
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 bg-accent/10 rounded-lg">
        <p className="text-muted-foreground">Connect your wallet to view your loan activity</p>
        <WalletConnect />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-blue-100 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      <div className="w-full">
        <Card className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border border-purple-100 dark:border-purple-900">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Current Positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <p className="text-muted-foreground">Loading your positions...</p>
              </div>
            ) : loans.length === 0 ? (
              <div className="flex justify-center p-8">
                <p className="text-muted-foreground">No active loans found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount (USDC)</TableHead>
                      <TableHead>Total Owed</TableHead>
                      <TableHead>Collateral</TableHead>
                      <TableHead>Interest Rate</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loans.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell className="capitalize">
                          {loan.borrower.toLowerCase() === userAddress?.toLowerCase() ? 'borrowed' : 'lent'}
                        </TableCell>
                        <TableCell>{loan.amount} USDC</TableCell>
                        <TableCell>{loan.totalOwed} USDC</TableCell>
                        <TableCell>
                          {loan.collateralAmount} {loan.collateralToken === ethers.ZeroAddress ? 'ETH' : 'WBTC'}
                        </TableCell>
                        <TableCell>{loan.interestRate}%</TableCell>
                        <TableCell>{loan.gracePeriodEnd.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            loan.isOverdue
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          }`}>
                            {loan.isOverdue ? "Overdue" : "Active"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="space-x-2">
                            {loan.borrower.toLowerCase() === userAddress?.toLowerCase() ? (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline"
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                                  >
                                    Repay
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Repay Loan</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label>Amount to Repay (USDC)</Label>
                                      <Input
                                        type="number"
                                        placeholder="Enter amount"
                                        value={repayAmount}
                                        onChange={(e) => setRepayAmount(e.target.value)}
                                      />
                                      <p className="text-sm text-gray-500">
                                        Total owed: {loan.totalOwed} USDC
                                      </p>
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      onClick={() => handleRepay(loan.id, repayAmount)}
                                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                                    >
                                      Confirm Repayment
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            ) : (
                              <>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="outline"
                                      className="bg-yellow-500 text-white hover:bg-yellow-600"
                                    >
                                      Set Grace Period
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Set Grace Period</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <Label>Grace Period (days)</Label>
                                        <Input
                                          type="number"
                                          placeholder="Enter number of days"
                                          value={gracePeriod}
                                          onChange={(e) => setGracePeriod(e.target.value)}
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button
                                        onClick={() => handleSetGracePeriod(loan.id)}
                                        className="bg-yellow-500 text-white hover:bg-yellow-600"
                                      >
                                        Confirm Grace Period
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                                {loan.isOverdue && (
                                  <Button 
                                    variant="outline"
                                    className="bg-red-500 text-white hover:bg-red-600"
                                    onClick={() => handleLiquidate(loan.id)}
                                  >
                                    Liquidate
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CurrentPositions;