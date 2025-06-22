import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, getChangeColor } from "@/lib/utils";
import type { StockPrice } from "@shared/schema";

interface HoldingsProps {
  realtimePrices: StockPrice[];
}

export default function Holdings({ realtimePrices }: HoldingsProps) {
  const { data: portfolio = [] } = useQuery({
    queryKey: ['/api/portfolio'],
  });

  const { data: stocks = [] } = useQuery({
    queryKey: ['/api/stocks'],
  });

  // Get real-time price for a stock
  const getRealTimePrice = (symbol: string) => {
    const realtimeStock = realtimePrices.find(p => p.symbol === symbol);
    if (realtimeStock) return realtimeStock.price;
    
    const stock = stocks.find((s: any) => s.symbol === symbol);
    return stock ? parseFloat(stock.currentPrice) : 0;
  };

  const calculatePL = (position: any) => {
    const currentPrice = getRealTimePrice(position.symbol);
    const currentValue = currentPrice * position.shares;
    const totalCost = parseFloat(position.totalCost);
    const pl = currentValue - totalCost;
    const plPercent = totalCost > 0 ? (pl / totalCost) * 100 : 0;
    
    return { pl, plPercent, currentValue };
  };

  if (portfolio.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Current Holdings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p>No positions found.</p>
            <p className="text-sm mt-1">Start trading to see your holdings here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Current Holdings
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {portfolio.map((position: any) => {
            const { pl, plPercent, currentValue } = calculatePL(position);
            
            return (
              <div key={position.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {position.symbol}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {position.shares} shares
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Avg. Cost: {formatCurrency(parseFloat(position.avgCost))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(currentValue)}
                    </p>
                    <p className={`text-sm ${getChangeColor(pl)}`}>
                      {pl >= 0 ? '+' : ''}{formatCurrency(pl)} ({pl >= 0 ? '+' : ''}{plPercent.toFixed(2)}%)
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-1 text-xs text-primary hover:text-blue-700"
                    >
                      Trade
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
