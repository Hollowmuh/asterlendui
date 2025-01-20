import Navigation from "@/components/Navigation";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Activity, TrendingUp, Users, Wallet, Percent, AlertTriangle, Shield, Clock, Target } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import BrandLogo from '@/components/BrandLogo';
import LendPage from "./LendPage";

const AboutPage = () => {
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
        averageLoanDuration: "180",
        customerSatisfaction: "95",
        totalTransactions: "3500"
      };
    }
  });

  const monthlyData = [
    { month: 'Jan', loans: 120, volume: 95000 },
    { month: 'Feb', loans: 150, volume: 125000 },
    { month: 'Mar', loans: 180, volume: 150000 },
    { month: 'Apr', loans: 220, volume: 180000 },
    { month: 'May', loans: 250, volume: 200000 },
    { month: 'Jun', loans: 280, volume: 230000 },
  ];

  const features = [
    {
      title: "Secure Lending",
      icon: Shield,
      description: "State-of-the-art encryption and blockchain technology ensuring your investments are safe."
    },
    {
      title: "Quick Processing",
      icon: Clock,
      description: "Fast loan processing and disbursement with automated smart contracts."
    },
    {
      title: "High Returns",
      icon: Target,
      description: "Competitive interest rates and optimized return on investment."
    }
  ];

  const teamMembers = [
    {
      name: "Eng. Mubarak",
      role: "Chief Executive Officer",
      bio: "15+ years in FinTech and blockchain technology"
    },
    {
      name: "Whisphers",
      role: "Chief Operation Officer",
      bio: "Former lead developer at major cryptocurrency exchanges"
    },
    {
      name: "0xShorwonor",
      role: "Head of Risk Management",
      bio: "Expert in DeFi protocols and risk assessment"
    }
  ];

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-blue-100 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      <Navigation />
      {/* Hero Section */}
      <div className="w-full py-20 px-4 text-center bg-gradient-to-b from-transparent to-white/10">
  <div className="flex justify-center mb-8">
    <BrandLogo size="large" />
  </div>
        <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
          Revolutionizing DeFi Lending
        </h2>
        <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
          Building the future of decentralized finance through secure, transparent, and efficient lending solutions
        </p>
      </div>

      <div className="container mx-auto ml-20 lg:ml-64 p-6 space-y-12">
        {/* Main Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Total Value Locked", value: `$${stats?.totalLent || "0"}`, icon: Wallet, color: "#8B5CF6" },
            { title: "Platform Users", value: stats?.platformUsers || "0", icon: Users, color: "#0EA5E9" },
            { title: "Total Transactions", value: stats?.totalTransactions || "0", icon: Activity, color: "#10B981" },
            { title: "Customer Satisfaction", value: `${stats?.customerSatisfaction || "0"}%`, icon: Target, color: "#F97316" }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <HoverCard key={index}>
                <HoverCardTrigger>
                  <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border border-purple-100 dark:border-purple-900">
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
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">{stat.title} Explained</h4>
                    <p className="text-sm">
                      Track our platform's growth and success through this key metric.
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            );
          })}
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border border-purple-100 dark:border-purple-900">
                <CardHeader>
                  <Icon className="h-8 w-8 mb-4 text-blue-600" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Performance Metrics */}
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 lg:max-w-[400px] mx-auto bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="projections">Projections</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="loans" fill="#8B5CF6" />
                      <Bar dataKey="volume" fill="#0EA5E9" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Success Rate</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {((parseInt(stats?.successfulRepayments || '0') / (parseInt(stats?.successfulRepayments || '0') + parseInt(stats?.defaults || '0'))) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Average Loan Duration</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats?.averageLoanDuration} days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projections">
            <Card className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Growth Projections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    Based on current trends, we project continued growth in both user base and total value locked.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                      <h4 className="font-semibold">Q4 2024 Projection</h4>
                      <p className="text-lg font-bold text-blue-600">$2.5M TVL</p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/50 rounded-lg">
                      <h4 className="font-semibold">User Growth</h4>
                      <p className="text-lg font-bold text-purple-600">+150% YoY</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Team Section */}
        <div className="py-12">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border border-purple-100 dark:border-purple-900">
                <CardHeader>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <CardDescription className="text-blue-600 dark:text-blue-400">{member.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border border-purple-100 dark:border-purple-900">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How does the lending process work?</AccordionTrigger>
                <AccordionContent>
                  Our platform uses smart contracts to facilitate peer-to-peer lending. Lenders can provide liquidity to the pool, 
                  and borrowers can take loans against collateral. All transactions are recorded on the blockchain for maximum transparency.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>What are the interest rates?</AccordionTrigger>
                <AccordionContent>
                  Interest rates are dynamically adjusted based on market conditions, typically ranging from 3% to 8% APY. 
                  The current average rate is {stats?.averageInterestRate}%.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>How is my investment protected?</AccordionTrigger>
                <AccordionContent>
                  We implement multiple security measures including smart contract audits, collateral requirements, and insurance pools. 
                  Our risk assessment algorithm helps maintain a low default rate of only {((parseInt(stats?.defaults || '0') / parseInt(stats?.activeLoans || '1')) * 100).toFixed(1)}%.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Ready to Start?</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6">
              Join thousands of users already benefiting from our secure lending platform
            </p>
            <div className="flex justify-center gap-4">
              <Button className="bg-white text-blue-600 hover:bg-white/20" onClick={LendPage}>Start Lending</Button>
              <Button variant="outline" className="border-white text-blue-600 hover:bg-white/20" onClick={AboutPage}>
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;