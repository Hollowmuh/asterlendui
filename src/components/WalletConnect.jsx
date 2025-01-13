import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Wallet, 
  ChevronDown,
  Coins
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const WalletConnect = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState<string>("");
  const { toast } = useToast();

  const fetchBalance = async (address: string) => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest']
        });
        const ethBalance = parseInt(balance, 16) / Math.pow(10, 18);
        setBalance(ethBalance.toFixed(4));
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    }
  };

  useEffect(() => {
    if (address) {
      fetchBalance(address);
    }
  }, [address]);

  const connectWallet = async (walletType: string) => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        setAddress(accounts[0]);
        setIsConnected(true);
        toast({
          title: `${walletType} Connected`,
          description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: "Failed to connect wallet. Please try again.",
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Wallet Not Found",
        description: `Please install ${walletType} to connect your wallet.`,
      });
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress("");
    setBalance("");
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  const walletOptions = [
    { name: "MetaMask", connect: () => connectWallet("MetaMask") },
    { name: "Coinbase Wallet", connect: () => connectWallet("Coinbase Wallet") },
    { name: "WalletConnect", connect: () => connectWallet("WalletConnect") }
  ];

  return (
    <div className="flex items-center gap-2">
      {!isConnected ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button className="gap-2">
              <Wallet size={16} />
              Connect Wallet
              <ChevronDown size={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="flex flex-col gap-2">
              {walletOptions.map((wallet) => (
                <Button
                  key={wallet.name}
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={wallet.connect}
                >
                  <Wallet size={16} />
                  {wallet.name}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <div className="flex items-center gap-4 bg-white/80 backdrop-blur-lg rounded-lg px-4 py-2 border border-gray-100">
          <div className="flex flex-col">
            <span className="text-sm text-gray-600">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Coins size={12} />
              {balance} ETH
            </span>
          </div>
          <Button variant="outline" onClick={disconnectWallet} size="sm">
            Disconnect
          </Button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;