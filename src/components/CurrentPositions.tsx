import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// TODO: Replace with actual smart contract integration
const mockPositions = [
  {
    id: 1,
    type: "lend",
    amount: "10.0",
    token: "ETH",
    interestAccrued: "0.5",
    startDate: "2024-01-01T00:00:00Z"
  },
  {
    id: 2,
    type: "borrow",
    amount: "5000",
    token: "USDC",
    interestAccrued: "250",
    startDate: "2024-01-10T00:00:00Z"
  }
];

const CurrentPositions = () => {
  // TODO: Implement contract call to fetch current positions
  // const fetchPositions = async () => {
  //   const provider = new ethers.providers.Web3Provider(window.ethereum);
  //   const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
  //   const positions = await contract.getUserPositions(address);
  //   return positions;
  // };

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Interest Accrued</TableHead>
            <TableHead>Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockPositions.map((position) => (
            <TableRow key={position.id}>
              <TableCell>
                <Badge variant={position.type === 'lend' ? 'default' : 'secondary'}>
                  {position.type.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell>{position.amount} {position.token}</TableCell>
              <TableCell>{position.interestAccrued} {position.token}</TableCell>
              <TableCell>
                {Math.floor((new Date().getTime() - new Date(position.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CurrentPositions;