import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Wallet } from "lucide-react";

const WalletConnect = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState("");
  const { toast } = useToast();

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        setAddress(accounts[0]);
        setIsConnected(true);
        toast({
          title: "Wallet Connected",
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
        title: "MetaMask Not Found",
        description: "Please install MetaMask to connect your wallet.",
      });
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress("");
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  return (
    <div className="flex items-center gap-2">
      {!isConnected ? (
        <Button onClick={connectWallet} className="gap-2">
          <Wallet size={16} />
          Connect Wallet
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          <Button variant="outline" onClick={disconnectWallet} size="sm">
            Disconnect
          </Button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;