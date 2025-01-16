import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LendOffer } from "@/types/loans";
import { useToast } from "@/components/ui/use-toast";

interface LendingListingsProps {
  listings: LendOffer[];
}

const LendingListings = ({ listings }: LendingListingsProps) => {
  const { toast } = useToast();
  const [selectedListing, setSelectedListing] = useState<LendOffer | null>(null);
  const [borrowAmount, setBorrowAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [collateralAmount, setCollateralAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("");

  const calculateInterest = (amount: string, duration: string, rate: number) => {
    const principal = parseFloat(amount);
    const days = parseFloat(duration);
    if (isNaN(principal) || isNaN(days)) return 0;
    return (principal * rate * days) / (365 * 100);
  };

  const handleBorrow = async () => {
    // TODO: Implement smart contract interaction for borrowing
    toast({
      title: "Processing Borrow Request",
      description: "Initiating transaction...",
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Lending Listings</h2>
      <div className="grid gap-4">
        {listings.map((listing, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg bg-card shadow-sm flex justify-between items-center"
          >
            <div className="space-y-2">
              <p className="font-medium">Amount: {listing.amount} USDC</p>
              <p>Interest Rate: {listing.minInterestRate}%</p>
              <p>Max Duration: {listing.maxDuration} days</p>
              <p>Min Collateral Ratio: {listing.minCollateralRatio}%</p>
              <p>Accepted Tokens: {listing.acceptedCollateralTokens.join(", ")}</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  onClick={() => setSelectedListing(listing)}
                  className="ml-4"
                >
                  Borrow
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create Borrow Request</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label>Borrow Amount (USDC)</label>
                    <Input
                      type="number"
                      max={listing.amount}
                      value={borrowAmount}
                      onChange={(e) => setBorrowAmount(e.target.value)}
                      placeholder="Enter amount to borrow"
                    />
                  </div>
                  <div className="space-y-2">
                    <label>Loan Duration (Days)</label>
                    <Input
                      type="number"
                      max={listing.maxDuration}
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="Enter loan duration"
                    />
                  </div>
                  <div className="space-y-2">
                    <label>Collateral Token</label>
                    <Select
                      value={selectedToken}
                      onValueChange={setSelectedToken}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select token" />
                      </SelectTrigger>
                      <SelectContent>
                        {listing.acceptedCollateralTokens.map((token) => (
                          <SelectItem key={token} value={token}>
                            {token}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label>Collateral Amount</label>
                    <Input
                      type="number"
                      value={collateralAmount}
                      onChange={(e) => setCollateralAmount(e.target.value)}
                      placeholder="Enter collateral amount"
                    />
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="font-medium">Loan Summary:</p>
                    <p>
                      Interest to Pay:{" "}
                      {calculateInterest(
                        borrowAmount,
                        duration,
                        listing.minInterestRate
                      ).toFixed(2)}{" "}
                      USDC
                    </p>
                    <p>
                      Total to Repay:{" "}
                      {(
                        parseFloat(borrowAmount || "0") +
                        calculateInterest(
                          borrowAmount,
                          duration,
                          listing.minInterestRate
                        )
                      ).toFixed(2)}{" "}
                      USDC
                    </p>
                  </div>
                  <Button onClick={handleBorrow}>Confirm Borrow</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LendingListings;