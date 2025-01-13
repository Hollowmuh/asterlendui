import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Wallet,
  Coins,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const WalletConnect = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
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
        setIsOpen(false);
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
    { 
      name: "MetaMask",
      icon: "🦊",
      description: "Connect using MetaMask browser extension",
      connect: () => connectWallet("MetaMask") 
    },
    { 
      name: "Coinbase Wallet",
      icon: "🔵",
      description: "Connect using Coinbase Wallet",
      connect: () => connectWallet("Coinbase Wallet") 
    },
    { 
      name: "WalletConnect",
      icon: "🔗",
      description: "Connect using WalletConnect",
      connect: () => connectWallet("WalletConnect") 
    }
  ];

  return (
    <div className="flex items-center gap-2">
      {!isConnected ? (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Wallet size={16} />
              Connect Wallet
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Connect Wallet</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {walletOptions.map((wallet) => (
                <button
                  key={wallet.name}
                  onClick={wallet.connect}
                  className="flex items-center gap-4 p-4 rounded-lg transition-all duration-200 hover:bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-100"
                >
                  <div className="flex-shrink-0 text-2xl">{wallet.icon}</div>
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-gray-900">{wallet.name}</span>
                    <span className="text-sm text-gray-500">{wallet.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <div className="flex items-center gap-4 bg-gradient-to-r from-gray-50 to-white backdrop-blur-lg rounded-lg px-4 py-2 border border-gray-100 shadow-sm">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Coins size={12} />
              {balance} ETH
            </span>
          </div>
          <Button 
            variant="outline" 
            onClick={disconnectWallet} 
            size="sm"
            className="ml-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            <X size={14} className="mr-1" />
            Disconnect
          </Button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;