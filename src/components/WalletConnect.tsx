import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import { useAccount, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';

export const WalletConnect = () => {
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Card className="bg-gradient-to-r from-blue-600 to-purple-600  dark:bg-gray-800/50 backdrop-blur-sm border border-purple-60 dark:border-purple-900">
      <CardContent className="p-2">
        {isConnected && address ? (
          <div className="flex items-center gap-2">
            <div className="px-4 py-2 rounded-md bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              {formatAddress(address)}
            </div>
            <Button
              variant="ghost"
              onClick={() => disconnect()}
              className="text-green-100 dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700"
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => open()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
          >
            <Wallet className="h-4 w-4 mr-2" />
            Connect Wallet
          </Button>
        )}
      </CardContent>
    </Card>
  );
};