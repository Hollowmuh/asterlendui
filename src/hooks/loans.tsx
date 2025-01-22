import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useToast } from "@/components/ui/use-toast";
import { useAccount } from 'wagmi';
import { useP2PLending } from './smart-contract';

export function useLoanActivity() {
  const [loans, setLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { isConnected, contract, forceInitializeContract } = useP2PLending();

  const fetchUserLoans = async () => {
    if (!isConnected || !contract) return;

    setIsLoading(true);
    try {
      let loanId = 0;
      const userLoans = [];
      let consecutiveEmptyLoans = 0;
      const MAX_EMPTY_LOANS = 3;

      while (consecutiveEmptyLoans < MAX_EMPTY_LOANS) {
        try {
          const loanData = await contract.getLoan(loanId);
          
          if (!loanData || !loanData.amount) {
            consecutiveEmptyLoans++;
            if (consecutiveEmptyLoans >= MAX_EMPTY_LOANS) break;
          } else {
            const loanStatus = await contract.getLoanStatus(loanId);
            
            const processedLoan = {
              id: loanId.toString(),
              lender: loanData.lender,
              borrower: loanData.borrower,
              amount: ethers.formatEther(loanData.amount),
              interestRate: Number(loanData.interestRate) / 100,
              duration: Number(loanData.duration) / 86400,
              startTime: new Date(Number(loanData.startTime) * 1000),
              gracePeriodEnd: new Date(Number(loanData.gracePeriodEnd) * 1000),
              collateralToken: loanData.collateralToken,
              collateralAmount: ethers.formatEther(loanData.collateralAmount),
              isActive: loanStatus[0],
              isOverdue: loanStatus[1],
              totalOwed: ethers.formatEther(loanStatus[2]),
              lendingToken: loanData.lendingToken
            };
            
            userLoans.push(processedLoan);
            consecutiveEmptyLoans = 0;
          }
          
          loanId++;
        } catch (error) {
          console.error(`Error fetching loan ${loanId}:`, error);
          consecutiveEmptyLoans++;
          if (consecutiveEmptyLoans >= MAX_EMPTY_LOANS) break;
        }
      }
      
      setLoans(userLoans);
    } catch (error) {
      console.error('Error fetching loans:', error);
      toast({
        title: "Error",
        description: "Failed to fetch loan activity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const repayLoan = async (loanId, amount) => {
    try {
      const contractInstance = await forceInitializeContract();
      const provider = new ethers.BrowserProvider(window.ethereum);
      const loanData = await contractInstance.getLoan(loanId);
      const txOptions = {
        ...(loanData.lendingToken === ethers.ZeroAddress ? { 
          value: ethers.parseEther(amount.toString()) 
        } : {})
      };
      
      // Handle ERC20 approval if needed
      if (loanData.lendingToken !== ethers.ZeroAddress) {
        const tokenContract = new ethers.Contract(
          loanData.lendingToken,
          ['function approve(address spender, uint256 amount) public returns (bool)'],
          await provider.getSigner()
        );
        
        const approveTx = await tokenContract.approve(
          contractInstance.target,
          ethers.parseEther(amount.toString())
        );
        await approveTx.wait();
      }

      const tx = await contractInstance.repayLoan(loanId, txOptions);
      await tx.wait();
      
      toast({
        title: "Success",
        description: "Loan repayment processed successfully.",
      });
      
      await fetchUserLoans();
      return true;
    } catch (error) {
      console.error('Repayment error:', error);
      toast({
        title: "Error",
        description: "Failed to process loan repayment. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const setGracePeriod = async (loanId, daysToAdd) => {
    try {
      const contractInstance = await forceInitializeContract();
      const loanData = await contractInstance.getLoan(loanId);
      
      const newEndTime = Math.floor(Number(loanData.gracePeriodEnd) + (daysToAdd * 86400));
      
      const tx = await contractInstance.setGracePeriod(loanId, newEndTime);
      await tx.wait();
      
      toast({
        title: "Success",
        description: "Grace period updated successfully.",
      });
      
      await fetchUserLoans();
      return true;
    } catch (error) {
      console.error('Grace period error:', error);
      toast({
        title: "Error",
        description: "Failed to update grace period. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const liquidateLoan = async (loanId) => {
    try {
      const contractInstance = await forceInitializeContract();
      const tx = await contractInstance.liquidateLoan(loanId);
      await tx.wait();
      
      toast({
        title: "Success",
        description: "Loan liquidation processed successfully.",
      });
      
      await fetchUserLoans();
      return true;
    } catch (error) {
      console.error('Liquidation error:', error);
      toast({
        title: "Error",
        description: "Failed to process loan liquidation. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (isConnected && contract) {
      fetchUserLoans();
    }
  }, [isConnected, contract]);

  return {
    loans,
    isLoading,
    repayLoan,
    setGracePeriod,
    liquidateLoan,
    fetchUserLoans
  };
}