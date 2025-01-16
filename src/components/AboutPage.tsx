import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Activity, TrendingUp, Users, Wallet, Percent, AlertTriangle } from "lucide-react";

const AboutPage = () => {
  // TODO: Replace with actual smart contract call
  const { data: stats } = useQuery({
    queryKey: ['projectStats'],
    queryFn: async () => {
      // const provider = new ethers.providers.Web3Provider(window.ethereum);
      // const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      // const stats = await contract.getProjectStats();
      // return stats;
      return {
        totalLent: "1000000",
        totalBorrowed: "800000",
        activeLoans: "150",
        successfulRepayments: "450",
        defaults: "20",
        averageInterestRate: "4.5"
      };
    }
  });

  const statCards = [
    { title: "Total Value Lent", value: stats?.totalLent || "0", icon: Wallet },
    { title: "Total Value Borrowed", value: stats?.totalBorrowed || "0", icon: TrendingUp },
    { title: "Active Loans", value: stats?.activeLoans || "0", icon: Activity },
    { title: "Successful Repayments", value: stats?.successfulRepayments || "0", icon: Users },
    { title: "Defaults", value: stats?.defaults || "0", icon: AlertTriangle },
    { title: "Average Interest Rate", value: `${stats?.averageInterestRate || "0"}%`, icon: Percent }
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">About LendingPool</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="transition-all duration-300 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AboutPage;