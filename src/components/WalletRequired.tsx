import { useWallet } from "@/contexts/WalletContext";
import WalletConnect from "./WalletConnect";

interface WalletRequiredProps {
  children: React.ReactNode;
}

const WalletRequired = ({ children }: WalletRequiredProps) => {
  const { isConnected } = useWallet();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to access this page</p>
        </div>
        <WalletConnect />
      </div>
    );
  }

  return <>{children}</>;
};

export default WalletRequired;