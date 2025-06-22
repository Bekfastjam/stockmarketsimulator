import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

interface TradeModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  tradeData?: {
    symbol: string;
    action: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    total: number;
  };
}

export default function TradeModal({ isOpen = false, onClose, tradeData }: TradeModalProps) {
  const [isVisible, setIsVisible] = useState(isOpen);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleConfirm = () => {
    // This would typically trigger the actual trade execution
    handleClose();
  };

  if (!tradeData) return null;

  return (
    <Dialog open={isVisible} onOpenChange={setIsVisible}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Trade</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Symbol:</span>
            <span className="font-medium">{tradeData.symbol}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Action:</span>
            <span className={`font-medium ${tradeData.action === 'BUY' ? 'text-success' : 'text-danger'}`}>
              {tradeData.action}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
            <span className="font-medium">{tradeData.quantity} shares</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Price:</span>
            <span className="font-medium">{formatCurrency(tradeData.price)}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between">
            <span className="text-gray-900 dark:text-gray-100 font-semibold">Total:</span>
            <span className="font-semibold">{formatCurrency(tradeData.total)}</span>
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button 
            className="flex-1 bg-primary hover:bg-blue-700" 
            onClick={handleConfirm}
          >
            Confirm Trade
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
