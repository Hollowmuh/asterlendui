import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { WalletConnect } from "./WalletConnect";
import { useAccount, useDisconnect } from 'wagmi';
import Navigation from "./Navigation";

// TODO: Replace with actual smart contract integration
const mockTransactions = [
  {
    id: 1,
    type: "lend",
    amount: "5.0",
    token: "ETH",
    interest: "0.25",
    status: "completed",
    timestamp: "2024-01-14T10:00:00Z"
  },
  {
    id: 2,
    type: "borrow",
    amount: "1000",
    token: "USDC",
    interest: "50",
    status: "active",
    timestamp: "2024-01-13T15:30:00Z"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'defaulted':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'liquidated':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    default:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  }
};

const RecentActivity = () => {
  const { isConnected } = useAccount();

  // TODO: Implement contract call to fetch recent transactions
  // const fetchTransactions = async () => {
  //   const provider = new ethers.providers.Web3Provider(window.ethereum);
  //   const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
  //   const transactions = await contract.getUserTransactions(address);
  //   return transactions;
  // };



  return (
    <div className="overflow-hidden">
      <Navigation />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Interest</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockTransactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell>
                <Badge variant={tx.type === 'lend' ? 'default' : 'secondary'}>
                  {tx.type.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell>{tx.amount} {tx.token}</TableCell>
              <TableCell>{tx.interest} {tx.token}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                  {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RecentActivity;