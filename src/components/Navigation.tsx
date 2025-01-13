import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Wallet, 
  HandCoins, 
  FileText, 
  Shield, 
  Menu,
  X
} from "lucide-react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: Wallet, label: "Lend", path: "/lend" },
    { icon: HandCoins, label: "Borrow", path: "/borrow" },
    { icon: FileText, label: "Loans", path: "/loans" },
    { icon: Shield, label: "Collateral", path: "/collateral" },
  ];

  return (
    <div className={`fixed top-0 left-0 h-full bg-white/80 backdrop-blur-lg border-r border-gray-200 transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute right-[-12px] top-4 bg-white rounded-full p-2 shadow-lg"
      >
        {isOpen ? <X size={16} /> : <Menu size={16} />}
      </button>
      
      <div className="p-6">
        <h1 className={`text-2xl font-bold mb-8 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          LendingPool
        </h1>
        
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center p-3 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-gray-100 text-gray-700'
                  }`}
              >
                <Icon size={20} />
                <span className={`ml-3 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Navigation;