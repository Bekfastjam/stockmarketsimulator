import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MarketIndex {
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
}

interface MarketIndices {
  SPY: MarketIndex;
  QQQ: MarketIndex;
  IWM: MarketIndex;
}

export default function MarketIndices() {
  const { data: indices, isLoading, error } = useQuery<MarketIndices>({
    queryKey: ['/api/market/indices'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const getIndexName = (symbol: string) => {
    switch (symbol) {
      case 'SPY':
        return 'S&P 500';
      case 'QQQ':
        return 'NASDAQ-100';
      case 'IWM':
        return 'Russell 2000';
      default:
        return symbol;
    }
  };

  const getIndexDescription = (symbol: string) => {
    switch (symbol) {
      case 'SPY':
        return 'Large-cap US stocks';
      case 'QQQ':
        return 'Technology & growth stocks';
      case 'IWM':
        return 'Small-cap US stocks';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Indices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !indices) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Indices</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Failed to load market indices</p>
        </CardContent>
      </Card>
    );
  }

  const indexArray = Object.values(indices);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Indices</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {indexArray.map((index) => (
            <div key={index.symbol} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{getIndexName(index.symbol)}</h3>
                  <span className="text-sm text-gray-500">({index.symbol})</span>
                </div>
                <p className="text-sm text-gray-600">{getIndexDescription(index.symbol)}</p>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-semibold">
                  ${index.value.toLocaleString()}
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  index.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {index.change >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>
                    {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} 
                    ({index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Market Status</span>
            <span className="text-green-600 font-medium">Open</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 