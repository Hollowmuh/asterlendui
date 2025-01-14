import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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
  },
  {
    id: 3,
    type: "lend",
    amount: "10000",
    token: "USDT",
    interest: "500",
    status: "defaulted",
    timestamp: "2024-01-12T09:15:00Z"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'defaulted':
      return 'bg-red-100 text-red-800';
    case 'liquidated':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

const RecentActivity = () => {
  // TODO: Implement contract call to fetch recent transactions
  // const fetchTransactions = async () => {
  //   const provider = new ethers.providers.Web3Provider(window.ethereum);
  //   const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
  //   const transactions = await contract.getUserTransactions(address);
  //   return transactions;
  // };

  return (
    <div className="overflow-hidden">
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
          {mockTransactions.slice(0, 5).map((tx) => (
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