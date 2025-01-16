import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity, TrendingUp, Users, Wallet, Percent, AlertTriangle } from "lucide-react";

const COLORS = ['#4ADE80', '#F87171', '#60A5FA', '#FBBF24', '#A78BFA', '#34D399'];

const AboutPage = () => {
  // TODO: Replace with actual smart contract call
  const { data: stats } = useQuery({
    queryKey: ['projectStats'],
    queryFn: async () => {
      // const provider = new ethers.providers.Web3Provider(window.ethereum);
      // const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      // const stats = await contract.getProjectStats();
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

  const pieData = [
    { name: 'Total Lent', value: parseInt(stats?.totalLent || '0') },
    { name: 'Total Borrowed', value: parseInt(stats?.totalBorrowed || '0') },
    { name: 'Active Loans', value: parseInt(stats?.activeLoans || '0') * 1000 },
    { name: 'Successful Repayments', value: parseInt(stats?.successfulRepayments || '0') * 1000 },
    { name: 'Defaults', value: parseInt(stats?.defaults || '0') * 1000 },
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-8">Project Statistics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: "Total Value Lent", value: `$${stats?.totalLent || "0"}`, icon: Wallet },
          { title: "Total Value Borrowed", value: `$${stats?.totalBorrowed || "0"}`, icon: TrendingUp },
          { title: "Active Loans", value: stats?.activeLoans || "0", icon: Activity },
          { title: "Successful Repayments", value: stats?.successfulRepayments || "0", icon: Users },
          { title: "Defaults", value: stats?.defaults || "0", icon: AlertTriangle },
          { title: "Average Interest Rate", value: `${stats?.averageInterestRate || "0"}%`, icon: Percent }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="transition-all duration-300 hover:shadow-lg dark:bg-gray-800">
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

      <Card className="mt-8 p-6 dark:bg-gray-800">
        <CardHeader>
          <CardTitle>Distribution Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutPage;