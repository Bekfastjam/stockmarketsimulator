import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, getChangeColor } from "@/lib/utils";
import type { StockPrice } from "@shared/schema";

interface WatchlistProps {
  realtimePrices: StockPrice[];
}

export default function Watchlist({ realtimePrices }: WatchlistProps) {
  const { data: stocks = [] } = useQuery({
    queryKey: ['/api/stocks'],
  });

  const { data: watchlist = [] } = useQuery({
    queryKey: ['/api/watchlist'],
  });

  // Get real-time price for a stock
  const getRealTimePrice = (symbol: string) => {
    const realtimeStock = realtimePrices.find(p => p.symbol === symbol);
    if (realtimeStock) return realtimeStock;
    
    const stock = stocks.find((s: any) => s.symbol === symbol);
    return stock ? {
      symbol: stock.symbol,
      price: parseFloat(stock.currentPrice),
      change: parseFloat(stock.change),
      changePercent: parseFloat(stock.changePercent),
    } : null;
  };

  // Show popular stocks if watchlist is empty
  const displayStocks = watchlist.length > 0 
    ? watchlist.map((w: any) => stocks.find((s: any) => s.symbol === w.symbol)).filter(Boolean)
    : stocks.slice(0, 4);

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {watchlist.length > 0 ? 'Watchlist' : 'Popular Stocks'}
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-primary hover:text-blue-700">
          <Plus className="h-4 w-4 mr-1" />
          Add Stock
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {displayStocks.map((stock: any) => {
            const priceData = getRealTimePrice(stock.symbol);
            
            return (
              <div 
                key={stock.symbol}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {stock.symbol}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {stock.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {priceData ? formatCurrency(priceData.price) : formatCurrency(parseFloat(stock.currentPrice))}
                    </p>
                    <p className={`text-sm ${getChangeColor(priceData?.change || parseFloat(stock.change))}`}>
                      {priceData ? (
                        <>
                          {priceData.change >= 0 ? '+' : ''}
                          {formatCurrency(priceData.change)} ({priceData.changePercent >= 0 ? '+' : ''}
                          {priceData.changePercent.toFixed(2)}%)
                        </>
                      ) : (
                        <>
                          {parseFloat(stock.change) >= 0 ? '+' : ''}
                          {formatCurrency(parseFloat(stock.change))} ({parseFloat(stock.changePercent) >= 0 ? '+' : ''}
                          {parseFloat(stock.changePercent).toFixed(2)}%)
                        </>
                      )}
                    </p>
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
