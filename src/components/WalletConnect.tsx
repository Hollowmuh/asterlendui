import { Button } from "../components/button";
import { Wallet } from "lucide-react";
import { useAccount, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';

export const WalletConnect = () => {
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();

  // Format the address to show only first and last 4 characters
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="px-4 py-2 rounded-md bg-green-100 text-green-800">
          {formatAddress(address)}
        </div>
        <Button
          variant="ghost"
          onClick={() => disconnect()}
          className="text-gray-600"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => open()}
      leftIcon={<Wallet className="h-4 w-4" />}
    >
      Connect Wallet
    </Button>
  );
};