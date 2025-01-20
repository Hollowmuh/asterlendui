// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { useQuery } from "@tanstack/react-query";
// import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
// import { Activity, TrendingUp, Users, Wallet, Percent, AlertTriangle } from "lucide-react";

// // Updated color scheme for better readability and aesthetics
// const COLORS = [
//   '#8B5CF6', // Vivid Purple
//   '#F97316', // Bright Orange
//   '#0EA5E9', // Ocean Blue
//   '#10B981', // Emerald
//   '#EF4444', // Red
//   '#F59E0B'  // Amber
// ];

// const AboutPage = () => {
//   // TODO: Replace with actual smart contract call
//   const { data: stats } = useQuery({
//     queryKey: ['projectStats'],
//     queryFn: async () => {
//       // const provider = new ethers.providers.Web3Provider(window.ethereum);
//       // const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
//       // const stats = await contract.getProjectStats();
//       return {
//         totalLent: "1000000",
//         totalBorrowed: "800000",
//         activeLoans: "150",
//         successfulRepayments: "450",
//         defaults: "20",
//         averageInterestRate: "4.5"
//       };
//     }
//   });

//   const pieData = [
//     { name: 'Total Lent', value: parseInt(stats?.totalLent || '0') },
//     { name: 'Total Borrowed', value: parseInt(stats?.totalBorrowed || '0') },
//     { name: 'Active Loans', value: parseInt(stats?.activeLoans || '0') * 1000 },
//     { name: 'Successful Repayments', value: parseInt(stats?.successfulRepayments || '0') * 1000 },
//     { name: 'Defaults', value: parseInt(stats?.defaults || '0') * 1000 },
//   ];

//   return (
//     <div className="container mx-auto p-6 space-y-8 animate-fadeIn">
//       <h1 className="text-3xl font-bold mb-8">Project Statistics</h1>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {[
//           { title: "Total Value Lent", value: `$${stats?.totalLent || "0"}`, icon: Wallet, color: COLORS[0] },
//           { title: "Total Value Borrowed", value: `$${stats?.totalBorrowed || "0"}`, icon: TrendingUp, color: COLORS[1] },
//           { title: "Active Loans", value: stats?.activeLoans || "0", icon: Activity, color: COLORS[2] },
//           { title: "Successful Repayments", value: stats?.successfulRepayments || "0", icon: Users, color: COLORS[3] },
//           { title: "Defaults", value: stats?.defaults || "0", icon: AlertTriangle, color: COLORS[4] },
//           { title: "Average Interest Rate", value: `${stats?.averageInterestRate || "0"}%`, icon: Percent, color: COLORS[5] }
//         ].map((stat, index) => {
//           const Icon = stat.icon;
//           return (
//             <Card key={index} className="transition-all duration-300 hover:shadow-lg dark:bg-gray-800">
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">
//                   {stat.title}
//                 </CardTitle>
//                 <Icon className="h-4 w-4" style={{ color: stat.color }} />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
//               </CardContent>
//             </Card>
//           );
//         })}
//       </div>

//       <Card className="mt-8 p-6 dark:bg-gray-800">
//         <CardHeader>
//           <CardTitle>Distribution Overview</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="h-[400px] w-full">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   data={pieData}
//                   cx="50%"
//                   cy="50%"
//                   labelLine={false}
//                   outerRadius={150}
//                   fill="#8884d8"
//                   dataKey="value"
//                   label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
//                 >
//                   {pieData.map((entry, index) => (
//                     <Cell 
//                       key={`cell-${index}`} 
//                       fill={COLORS[index % COLORS.length]}
//                       className="hover:opacity-80 transition-opacity"
//                     />
//                   ))}
//                 </Pie>
//                 <Tooltip 
//                   contentStyle={{ 
//                     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//                     border: '1px solid #ccc',
//                     borderRadius: '8px',
//                     padding: '10px'
//                   }}
//                 />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default AboutPage;


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity, TrendingUp, Users, Wallet, Percent, AlertTriangle, ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COLORS = {
  primary: '#8B5CF6',
  secondary: '#F97316',
  accent: '#0EA5E9',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  background: {
    light: '#F8FAFC',
    dark: '#1E293B'
  },
  gradient: {
    start: '#C084FC',
    end: '#818CF8'
  }
};

const AboutPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: stats } = useQuery({
    queryKey: ['projectStats'],
    queryFn: async () => {
      return {
        totalLent: "1000000",
        totalBorrowed: "800000",
        activeLoans: "150",
        successfulRepayments: "450",
        defaults: "20",
        averageInterestRate: "4.5",
        platformUsers: "2500",
        averageLoanDuration: "180"
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

  const faqs = [
    {
      question: "How does the lending process work?",
      answer: "Our platform connects lenders with borrowers through a secure smart contract system. Lenders can provide funds, which are then matched with qualified borrowers. All transactions are recorded on the blockchain for transparency and security."
    },
    {
      question: "What are the interest rates?",
      answer: "Interest rates vary based on multiple factors including loan duration, borrower credit score, and market conditions. Our current average interest rate is 4.5%, with rates typically ranging from 3% to 8%."
    },
    {
      question: "How is my investment protected?",
      answer: "We implement multiple security measures including smart contract audits, collateral requirements, and insurance pools. Additionally, our risk assessment algorithm helps maintain a low default rate."
    },
    {
      question: "What happens in case of defaults?",
      answer: "In case of defaults, our platform's insurance pool covers a portion of the losses. We also work with collection agencies to recover the funds while maintaining compliance with regulations."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-50 to-background-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6 space-y-8 animate-fadeIn">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Platform Overview
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Empowering financial freedom through secure, transparent, and efficient lending
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Total Value Lent", value: `$${stats?.totalLent || "0"}`, icon: Wallet, color: COLORS.primary },
                { title: "Total Value Borrowed", value: `$${stats?.totalBorrowed || "0"}`, icon: TrendingUp, color: COLORS.secondary },
                { title: "Active Loans", value: stats?.activeLoans || "0", icon: Activity, color: COLORS.accent },
                { title: "Successful Repayments", value: stats?.successfulRepayments || "0", icon: Users, color: COLORS.success },
                { title: "Platform Users", value: stats?.platformUsers || "0", icon: Users, color: COLORS.warning },
                { title: "Average Loan Duration", value: `${stats?.averageLoanDuration || "0"} days`, icon: Activity, color: COLORS.error }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800/50 backdrop-blur-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {stat.title}
                      </CardTitle>
                      <Icon className="h-4 w-4" style={{ color: stat.color }} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <Card className="dark:bg-gray-800/50 backdrop-blur-lg">
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
                          <Cell 
                            key={`cell-${index}`} 
                            fill={Object.values(COLORS)[index]}
                            className="hover:opacity-80 transition-opacity"
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid #ccc',
                          borderRadius: '8px',
                          padding: '10px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card className="dark:bg-gray-800/50 backdrop-blur-lg">
              <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Success Metrics</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      With a {((parseInt(stats?.successfulRepayments || '0') / (parseInt(stats?.successfulRepayments || '0') + parseInt(stats?.defaults || '0'))) * 100).toFixed(1)}% repayment rate, 
                      our platform demonstrates strong performance in risk management and borrower selection.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Risk Management</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Our advanced risk assessment algorithms and strict collateral requirements help maintain 
                      a low default rate of {((parseInt(stats?.defaults || '0') / parseInt(stats?.activeLoans || '1')) * 100).toFixed(1)}%.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq">
            <Card className="dark:bg-gray-800/50 backdrop-blur-lg">
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8 dark:bg-gray-800/50 backdrop-blur-lg">
          <CardHeader>
            <CardTitle>Get Started Today</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Join thousands of users already benefiting from our secure lending platform
            </p>
            <div className="flex justify-center gap-4">
              <Button className="bg-primary hover:bg-primary/90">Start Lending</Button>
              <Button variant="outline">Learn More</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;