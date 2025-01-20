import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import Index from "./pages/Index";
import LendPage from "./components/LendPage";
import BorrowPage from "./components/BorrowPage";
import AboutPage from "./components/AboutPage";
import { WagmiProvider } from 'wagmi';
import { mainnet, sepolia } from 'viem/chains';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createAppKit }  from "@reown/appkit/react";
import { type AppKitNetwork } from '@reown/appkit/networks';

const queryClient = new QueryClient();
const projectId = '612505aa4c4b5494c81fcf295bc5b512';
const metadata = {
  name:'AsterLend',
  description: 'P2P Lending Platform',
  url: 'localhost:8080',
  icons: ['https://assets.reown.com/reown-profile-pic.png']
};
const networks: [AppKitNetwork, ...AppKitNetwork[]] = [
  {
    ...mainnet,
    name: 'Ethereum',
    network: 'mainnet',
  } as AppKitNetwork,
  {
    ...sepolia,
    name: 'Sepolia',
    network: 'sepolia',
  } as AppKitNetwork,
];
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
});
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true
  }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
    <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/lend" element={<LendPage />} />
              <Route path="/borrow" element={<BorrowPage />} />
              <Route path="/loans" element={<LendPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
      </WagmiProvider>
  </QueryClientProvider>
);

export default App;