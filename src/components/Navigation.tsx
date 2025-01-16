import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Wallet, 
  HandCoins, 
  FileText,
  Info,
  Menu,
  X,
  Moon,
  Sun
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: Wallet, label: "Lend", path: "/lend" },
    { icon: HandCoins, label: "Borrow", path: "/borrow" },
    { icon: FileText, label: "Loans", path: "/loans" },
    { icon: Info, label: "About", path: "/about" },
  ];

  return (
    <div className={`fixed top-0 left-0 h-full bg-background/80 backdrop-blur-lg border-r border-border transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="flex justify-between items-center p-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-[-12px] top-4 bg-background rounded-full p-2 shadow-lg border border-border"
        >
          {isOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-accent"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
      
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
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent text-foreground'
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