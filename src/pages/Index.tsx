import Navigation from "@/components/Navigation";
import DashboardMetrics from "@/components/DashboardMetrics";
import WalletConnect from "@/components/WalletConnect";
import RecentActivity from "@/components/RecentActivity";
import CurrentPositions from "@/components/CurrentPositions";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="ml-20 lg:ml-64 p-8 animate-fadeIn">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-2 text-gray-600">Overview of your lending and borrowing activity</p>
            </div>
            <WalletConnect />
          </header>
          
          <DashboardMetrics />
          
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/80 backdrop-blur-lg rounded-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <RecentActivity />
            </div>
            
            <div className="bg-white/80 backdrop-blur-lg rounded-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">Your Positions</h2>
              <CurrentPositions />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;