import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navigation from "./Navigation";
import { useState } from 'react';
import { WalletConnect } from "@/components/WalletConnect";

const CurrentPositions = () => {
  const { toast } = useToast();
  const [gracePeriod, setGracePeriod] = useState("");
  const [repayAmount, setRepayAmount] = useState("");

  // Mock data based on smart contract structure
  const mockLoans = [
    {
      id: "1",
      type: "borrowed",
      amount: 1000,
      collateralToken: "ETH",
      collateralAmount: 0.5,
      interestRate: 5,
      dueDate: new Date(Date.now() + 86400000), // 24 hours from now
      status: "active",
      lender: "0x1234...5678",
      totalOwed: 1050
    },
    {
      id: "2",
      type: "lent",
      amount: 2000,
      collateralToken: "WBTC",
      collateralAmount: 0.1,
      interestRate: 7,
      dueDate: new Date(Date.now() - 86400000), // 24 hours ago (overdue)
      status: "active",
      borrower: "0x8765...4321",
      totalOwed: 2140
    }
  ];

  const handleRepay = async (loanId, amount) => {
    try {
      toast({
        title: "Processing Repayment",
        description: "Repaying loan...",
      });
      // Contract interaction: repayLoan(loanId, amount)
      console.log("Repaying loan:", loanId, amount);
      setRepayAmount(""); // Reset input after repayment
    } catch (error) {
      console.error("Error repaying loan:", error);
      toast({
        title: "Error",
        description: "Failed to repay loan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSetGracePeriod = async (loanId) => {
    try {
      if (!gracePeriod || isNaN(gracePeriod)) {
        throw new Error("Invalid grace period");
      }
      toast({
        title: "Setting Grace Period",
        description: "Processing grace period extension...",
      });
      // Contract interaction: setGracePeriod(loanId, gracePeriod)
      console.log("Setting grace period:", loanId, gracePeriod);
      setGracePeriod(""); // Reset input after setting grace period
    } catch (error) {
      console.error("Error setting grace period:", error);
      toast({
        title: "Error",
        description: "Failed to set grace period. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLiquidate = async (loanId) => {
    try {
      toast({
        title: "Initiating Liquidation",
        description: "Processing liquidation request...",
      });
      // Contract interaction: liquidateLoan(loanId)
      console.log("Liquidating loan:", loanId);
    } catch (error) {
      console.error("Error liquidating loan:", error);
      toast({
        title: "Error",
        description: "Failed to liquidate loan. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-blue-100 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      <Navigation />
      <div className="container mx-auto p-6 ml-20 lg:ml-64 space-y-6">
        <Card className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border border-purple-100 dark:border-purple-900">
          <CardHeader>
            <CardTitle className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Current Positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount (USDC)</TableHead>
                    <TableHead>Collateral</TableHead>
                    <TableHead>Interest Rate</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockLoans.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell className="capitalize">{loan.type}</TableCell>
                      <TableCell>{loan.amount} USDC</TableCell>
                      <TableCell>
                        {loan.collateralAmount} {loan.collateralToken}
                      </TableCell>
                      <TableCell>{loan.interestRate}%</TableCell>
                      <TableCell>{loan.dueDate.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          new Date() > loan.dueDate 
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        }`}>
                          {new Date() > loan.dueDate ? "Overdue" : "Active"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-x-2">
                          {loan.type === "borrowed" ? (
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
                              {new Date() > loan.dueDate && (
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CurrentPositions;