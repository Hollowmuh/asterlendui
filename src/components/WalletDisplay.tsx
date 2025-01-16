import { useWallet } from "@/contexts/WalletContext";
import { Button } from "./ui/button";
import { Wallet } from "lucide-react";

const WalletDisplay = () => {
  const { isConnected, address, setIsConnected, setAddress } = useWallet();

  const handleDisconnect = () => {
    setIsConnected(false);
    setAddress('');
    // TODO: Implement wallet disconnect logic with ethers.js
  };

  if (!isConnected) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleDisconnect}
        className="flex items-center gap-2"
      >
        <Wallet className="w-4 h-4" />
        Disconnect
      </Button>
    </div>
  );
};

export default WalletDisplay;