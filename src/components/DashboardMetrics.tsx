import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Activity, Clock } from "lucide-react";

const MetricCard = ({ title, value, icon: Icon, trend }: {
  title: string;
  value: string;
  icon: any;
  trend?: { value: string; positive: boolean };
}) => (
  <Card className="p-6 backdrop-blur-lg bg-white/80 border border-gray-100 hover:shadow-lg transition-all duration-300">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-semibold mt-1">{value}</h3>
        {trend && (
          <div className="flex items-center mt-2">
            {trend.positive ? (
              <ArrowUpRight className="w-4 h-4 text-green-500" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm ml-1 ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.value}
            </span>
          </div>
        )}
      </div>
      <div className="p-3 bg-gray-50 rounded-lg">
        <Icon className="w-6 h-6 text-gray-700" />
      </div>
    </div>
  </Card>
);

const DashboardMetrics = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Value Locked"
        value="$1,234,567"
        icon={Activity}
        trend={{ value: "12.3%", positive: true }}
      />
      <MetricCard
        title="Active Loans"
        value="156"
        icon={Clock}
        trend={{ value: "5.2%", positive: true }}
      />
      <MetricCard
        title="Total Borrowed"
        value="$890,123"
        icon={ArrowDownRight}
        trend={{ value: "3.1%", positive: false }}
      />
      <MetricCard
        title="Total Supplied"
        value="$2,345,678"
        icon={ArrowUpRight}
        trend={{ value: "8.7%", positive: true }}
      />
    </div>
  );
};

export default DashboardMetrics;