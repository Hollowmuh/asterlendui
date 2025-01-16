import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface PartialRepaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: {
    totalAmountOwed: number;
    borrower: string;
  };
  onRepay: (amount: number) => Promise<void>;
}

const PartialRepaymentModal = ({ isOpen, onClose, loan, onRepay }: PartialRepaymentModalProps) => {
  const [amount, setAmount] = useState("");
  const { toast } = useToast();

  const handleRepay = async () => {
    const repayAmount = parseFloat(amount);
    if (isNaN(repayAmount) || repayAmount <= 0 || repayAmount > loan.totalAmountOwed) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount less than or equal to the total owed",
        variant: "destructive",
      });
      return;
    }

    try {
      await onRepay(repayAmount);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process repayment",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Partial Repayment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Amount Owed</p>
            <p className="text-lg font-semibold">{loan.totalAmountOwed} ETH</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Repayment Amount</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount to repay"
              max={loan.totalAmountOwed}
              min={0}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleRepay}>Confirm Repayment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PartialRepaymentModal;