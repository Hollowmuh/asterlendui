import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useToast } from "@/components/ui/use-toast"; 
import P2PLendingMARKETPLACE from '@/artifacts/contracts/p2plendMarketplace.sol/P2PLendingMarketplace.json'
import { useAccount } from 'wagmi';

const CONTRACT_ADDRESS = import.meta.env.VITE_MARKETPLACE_ADDRESS;
const contractABI = P2PLendingMARKETPLACE.abi;

if (!CONTRACT_ADDRESS) {
  console.error('Contract address not found in environment variables');
}

export function useP2PLending() {
  const { toast } = useToast();
  const { address: userAddress, isConnected } = useAccount();
  const [contract, setContract] = useState(null);
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  const forceInitializeContract = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Ethereum provider not found. Please install MetaMask.');
      }

      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);

      if (!isConnected) {
        throw new Error('Wallet not connected');
      }

      const signerInstance = await web3Provider.getSigner();
      setSigner(signerInstance);

      if (!CONTRACT_ADDRESS || !contractABI) {
        throw new Error('Contract configuration missing');
      }

      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI,
        signerInstance
      );

      setContract(contractInstance);
      setIsInitializing(false);
      
      return contractInstance;
    } catch (error) {
      console.error('Error in force initialization:', error);
      toast({
        title: "Initialization Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await forceInitializeContract();
      } catch (error) {
        setIsInitializing(false);
      }
    };

    init();
  }, [isConnected]);

  useEffect(() => {
    const updateSigner = async () => {
      if (isConnected && provider) {
        try {
          const signerInstance = await provider.getSigner();
          setSigner(signerInstance);
          
          // Reinitialize contract with new signer
          if (CONTRACT_ADDRESS && contractABI) {
            const contractInstance = new ethers.Contract(
              CONTRACT_ADDRESS,
              contractABI,
              signerInstance
            );
            setContract(contractInstance);
          }
        } catch (error) {
          console.error('Error getting signer:', error);
        }
      } else {
        setSigner(null);
        setContract(null);
      }
    };

    updateSigner();
  }, [isConnected, provider]);

  

  const createLenderListing = async (listingData) => {
    if (!isConnected) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return false;
    }

    let contractInstance;
    try {
      contractInstance = await forceInitializeContract();
      
      const { 
        amount, 
        minInterestRate, 
        maxDuration, 
        acceptedCollateralTokens, 
        minCollateralRatio,
        lendingToken
      } = listingData;

      // Convert percentages to basis points (multiply by 100)
      const interestRateBips = Math.floor(parseFloat(minInterestRate) * 100);
      const durationSeconds = Math.floor(parseFloat(maxDuration)) * 86400;
      const collateralRatioBips = Math.floor(parseFloat(minCollateralRatio) * 100);

      // Handle token approval for ERC20
      if (lendingToken !== ethers.ZeroAddress) {
        try {
          const tokenContract = new ethers.Contract(
            lendingToken,
            ['function approve(address spender, uint256 amount) public returns (bool)'],
            signer
          );
          
          const approveTx = await tokenContract.approve(CONTRACT_ADDRESS, amount);
          await approveTx.wait();
        } catch (error) {
          throw new Error(`Token approval failed: ${error.message}`);
        }
      }

      const txOptions = {
        ...(lendingToken === ethers.ZeroAddress ? { value: amount } : {})
      };

      const tx = await contractInstance.createLenderListing(
        amount,
        BigInt(interestRateBips),
        BigInt(durationSeconds),
        acceptedCollateralTokens,
        BigInt(collateralRatioBips),
        lendingToken,
        txOptions
      );

      const receipt = await tx.wait();
      
      toast({
        title: "Success!",
        description: "Your lending offer has been created successfully.",
      });
      
      await fetchListings(true);
      return true;
    } catch (error) {
      console.error('Transaction error:', error);

      let errorMessage = 'Failed to create lending offer. ';
      
      if (error.message.includes('user rejected')) {
        errorMessage += 'Transaction was rejected.';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage += 'Insufficient funds for transaction.';
      } else {
        try {
          const iface = new ethers.Interface(contractABI);
          const decodedError = iface.parseError(error.data);
          errorMessage += `Contract error: ${decodedError.name}`;
        } catch (e) {
          errorMessage += 'Transaction failed. Please verify your inputs and try again.';
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };
  const fetchListings = async (isLenderPage = true) => {
  if (!contract || !isConnected) {
    console.log('Skipping fetch - conditions not met:', { 
      hasContract: !!contract, 
      isConnected 
    });
    setListings([]);
    return;
  }
  
  setIsLoading(true);
  try {
    let listingId = 0;
    const fetchedListings = [];
    let consecutiveEmptyListings = 0;
    const MAX_EMPTY_LISTINGS = 3;
    
    console.log('Starting to fetch listings...');
    
    while (consecutiveEmptyListings < MAX_EMPTY_LISTINGS) {
      try {
        const listing = await contract.getLenderListing(listingId);
        
        // Check if listing is empty (all values are zero/empty)
        const isEmpty = 
          listing[0] === '0x0000000000000000000000000000000000000000' && // lender address
          listing[1] === 0n && // amount
          listing[6] === false; // isActive
        
        if (isEmpty) {
          consecutiveEmptyListings++;
          if (consecutiveEmptyListings >= MAX_EMPTY_LISTINGS) {
            console.log('Reached end of listings after finding multiple empty entries');
            break;
          }
        } else if (listing[6]) { // isActive
          const processedListing = {
            id: listingId.toString(),
            lender: listing[0],
            amount: ethers.formatEther(listing[1]),
            minInterestRate: Number(listing[2]) / 100, // Convert basis points to percentage
            maxDuration: Number(listing[3]) / 86400, // Convert seconds to days
            acceptedCollateralTokens: listing[4],
            minCollateralRatio: Number(listing[5]) / 100, // Convert basis points to percentage
            isActive: listing[6],
            lendingToken: listing[7]
          };
          
          fetchedListings.push(processedListing);
          consecutiveEmptyListings = 0; // Reset counter when we find a valid listing
        }
        
        listingId++;
      } catch (error) {
        console.error(`Error fetching listing ${listingId}:`, error);
        consecutiveEmptyListings++;
        
        if (error.code === 'CALL_EXCEPTION') {
          console.log('Contract call exception - likely reached end of listings');
          break;
        }
        
        if (consecutiveEmptyListings >= MAX_EMPTY_LISTINGS) {
          console.log('Stopping fetch due to multiple consecutive errors');
          break;
        }
      }
    }
    
    console.log(`Fetch complete. Found ${fetchedListings.length} active listings`);
    setListings(fetchedListings);
  } catch (error) {
    console.error('Fatal error in fetchListings:', error);
    toast({
      title: "Error",
      description: "Failed to fetch listings. Please try again.",
      variant: "destructive",
    });
    setListings([]);
  } finally {
    setIsLoading(false);
  }
  };
    const fetchBorrowerListings = async () => {
    if (!contract || !isConnected) {
      setListings([]);
      return;
    }
    
    setIsLoading(true);
    try {
      let listingId = 0;
      const fetchedListings = [];
      let consecutiveEmptyListings = 0;
      const MAX_EMPTY_LISTINGS = 3;
      
      while (consecutiveEmptyListings < MAX_EMPTY_LISTINGS) {
        try {
          const listing = await contract.getBorrowerListing(listingId);
          
          const isEmpty = 
            listing[0] === '0x0000000000000000000000000000000000000000' && // borrower address
            listing[1] === 0n; // amount
          
          if (isEmpty) {
            consecutiveEmptyListings++;
          } else if (listing[6]) { // isActive
            const processedListing = {
              id: listingId.toString(),
              borrower: listing[0],
              amount: ethers.formatEther(listing[1]),
              maxInterestRate: Number(listing[2]) / 100,
              duration: Number(listing[3]) / 86400,
              collateralToken: listing[4],
              collateralAmount: ethers.formatEther(listing[5]),
              isActive: listing[6],
              lendingToken: listing[7]
            };
            
            fetchedListings.push(processedListing);
            consecutiveEmptyListings = 0;
          }
          
          listingId++;
        } catch (error) {
          console.error(`Error fetching borrower listing ${listingId}:`, error);
          consecutiveEmptyListings++;
          
          if (error.code === 'CALL_EXCEPTION') break;
          if (consecutiveEmptyListings >= MAX_EMPTY_LISTINGS) break;
        }
      }
      
      setListings(fetchedListings);
    } catch (error) {
      console.error('Error in fetchBorrowerListings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch borrower listings. Please try again.",
        variant: "destructive",
      });
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createBorrowerListing = async (listingData) => {
    if (!isConnected) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return false;
    }

    let contractInstance;
    try {
      contractInstance = await forceInitializeContract();
      
      const { 
        amount,
        maxInterestRate,
        duration,
        collateralToken,
        collateralAmount,
        lendingToken
      } = listingData;

      // Convert percentage to basis points
      const interestRateBips = Math.floor(parseFloat(maxInterestRate) * 100);
      const durationSeconds = Math.floor(parseFloat(duration)) * 86400;

      // Set up transaction options for ETH collateral
      const txOptions = {
        ...(collateralToken === ethers.ZeroAddress ? { 
          value: ethers.parseEther(collateralAmount.toString()) 
        } : {})
      };

      // If using ERC20 token as collateral, handle approval
      if (collateralToken !== ethers.ZeroAddress) {
        try {
          const tokenContract = new ethers.Contract(
            collateralToken,
            ['function approve(address spender, uint256 amount) public returns (bool)'],
            signer
          );
          
          const approveTx = await tokenContract.approve(
            CONTRACT_ADDRESS, 
            ethers.parseEther(collateralAmount.toString())
          );
          await approveTx.wait();
        } catch (error) {
          throw new Error(`Token approval failed: ${error.message}`);
        }
      }

      const tx = await contractInstance.createBorrowerListing(
        ethers.parseEther(amount.toString()),
        BigInt(interestRateBips),
        BigInt(durationSeconds),
        collateralToken,
        ethers.parseEther(collateralAmount.toString()),
        lendingToken,
        txOptions
      );

      await tx.wait();
      
      toast({
        title: "Success!",
        description: "Your borrow request has been created successfully.",
      });
      
      await fetchBorrowerListings();
      return true;
    } catch (error) {
      console.error('Transaction error:', error);

      let errorMessage = 'Failed to create borrow request. ';
      
      if (error.message.includes('user rejected')) {
        errorMessage += 'Transaction was rejected.';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage += 'Insufficient funds for transaction.';
      } else {
        try {
          const iface = new ethers.Interface(contractABI);
          const decodedError = iface.parseError(error.data);
          errorMessage += `Contract error: ${decodedError.name}`;
        } catch (e) {
          errorMessage += 'Transaction failed. Please verify your inputs and try again.';
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    createLenderListing,
    fetchListings,
    listings,
    isLoading,
    isInitializing,
    isConnected,
    userAddress,
    forceInitializeContract,
    contract,
    createBorrowerListing,
    fetchBorrowerListings
  };
}