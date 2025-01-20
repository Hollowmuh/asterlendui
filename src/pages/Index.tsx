import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { WalletConnect } from "@/components/WalletConnect";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { useAccount} from 'wagmi';
import DashboardMetrics from '@/components/DashboardMetrics';

const Index = () => {
    const { isConnected } = useAccount();
    
  
  // Enhanced mock token data with prices and 24h changes
  const mockBalances = [
    { 
      token: "USDC",
      symbol: "₮",
      balance: "1,000.00",
      price: 1.00,
      priceChange: 0.00,
      value: "$1,000.00",
      iconUrl: "/api/placeholder/24/24"
    },
    { 
      token: "ETH",
      symbol: "Ξ",
      balance: "5.5",
      price: 2300.00,
      priceChange: 2.5,
      value: "$12,650.00",
      iconUrl: "/api/placeholder/24/24"
    },
    { 
      token: "WBTC",
      symbol: "₿",
      balance: "0.25",
      price: 41000.00,
      priceChange: -1.2,
      value: "$10,250.00",
      iconUrl: "/api/placeholder/24/24"
    },
    { 
      token: "MATIC",
      symbol: "M",
      balance: "1,500.00",
      price: 1.15,
      priceChange: 5.3,
      value: "$1,725.00",
      iconUrl: "/api/placeholder/24/24"
    },
    { 
      token: "LINK",
      symbol: "L",
      balance: "100.00",
      price: 14.50,
      priceChange: -0.8,
      value: "$1,450.00",
      iconUrl: "/api/placeholder/24/24"
    },
    { 
      token: "UNI",
      symbol: "U",
      balance: "50.00",
      price: 6.00,
      priceChange: 3.2,
      value: "$300.00",
      iconUrl: "/api/placeholder/24/24"
    }
  ];

  const mockActivity = [
    {
      id: 1,
      type: "Lend",
      amount: "500 USDC",
      timestamp: "2024-01-20 14:30",
      status: "Active",
      interestRate: "5%"
    },
    {
      id: 2,
      type: "Borrow",
      amount: "200 USDC",
      timestamp: "2024-01-19 09:15",
      status: "Active",
      collateral: "0.5 ETH"
    }
  ];

  // TODO: Contract and price feed interaction points
  // const fetchTokenData = async (address) => {
  //   // For each supported token:
  //   // const balance = await tokenContract.balanceOf(address)
  //   // const decimals = await tokenContract.decimals()
  //   // Fetch token price from oracle
  //   // const price = await priceOracle.getPrice(tokenAddress)
  //   // const priceChange = await priceOracle.get24HourChange(tokenAddress)
  // };

  const formatPrice = (price) => {
    return price < 0.01 
      ? price.toFixed(6)
      : price < 1 
        ? price.toFixed(4)
        : price.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-blue-100 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      <Navigation />
      <div className={`transition-all duration-300 ml-20 lg:ml-64 p-6 space-y-6`}>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <WalletConnect />
        </div>

        {isConnected ? (
                  <>
                      <DashboardMetrics/>
            <Card className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border border-purple-100 dark:border-purple-900">
              <CardHeader>
                <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Token Balances
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Token</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>24h Change</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead className="text-right">Value (USD)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockBalances.map((token) => (
                        <TableRow key={token.token}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <img 
                                src={token.iconUrl} 
                                alt={token.token}
                                className="w-6 h-6 rounded-full bg-gray-200"
                              />
                              <span className="font-medium">{token.token}</span>
                              <span className="text-gray-500 text-sm">{token.symbol}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono">
                            ${formatPrice(token.price)}
                          </TableCell>
                          <TableCell>
                            <div className={`flex items-center gap-1 ${
                              token.priceChange > 0 
                                ? 'text-green-600 dark:text-green-400' 
                                : token.priceChange < 0 
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              {token.priceChange > 0 ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : token.priceChange < 0 ? (
                                <TrendingDown className="w-4 h-4" />
                              ) : null}
                              {token.priceChange > 0 ? '+' : ''}{token.priceChange}%
                            </div>
                          </TableCell>
                          <TableCell className="font-mono">{token.balance}</TableCell>
                          <TableCell className="text-right font-mono">{token.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border border-purple-100 dark:border-purple-900">
              <CardHeader>
                <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockActivity.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>{activity.type}</TableCell>
                        <TableCell>{activity.amount}</TableCell>
                        <TableCell>
                          {activity.type === "Lend" 
                            ? `Interest Rate: ${activity.interestRate}`
                            : `Collateral: ${activity.collateral}`
                          }
                        </TableCell>
                        <TableCell>{activity.timestamp}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {activity.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
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
      </div>
    </div>
  );
};

export default Index;