import CurrentPositions from "./CurrentPositions";
import { useAccount } from "wagmi";
import { WalletConnect } from "./WalletConnect";
import Navigation from "./Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet } from "lucide-react";

const LoansPage = () => {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-blue-100 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      <Navigation />
      <main className="transition-all duration-300 ml-20 lg:ml-64 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Active Loans
          </h1>
          <WalletConnect />
        </div>
        
        {isConnected ? (
          <CurrentPositions />
        ) : (
          <Card className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border border-purple-100 dark:border-purple-900">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <Wallet className="w-16 h-16 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                Connect your wallet to view your token balances and lending activity
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default LoansPage;