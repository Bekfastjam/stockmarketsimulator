import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import PortfolioCards from "@/components/portfolio-cards";
import MarketChart from "@/components/market-chart";
import QuickTrade from "@/components/quick-trade";
import Watchlist from "@/components/watchlist";
import Holdings from "@/components/holdings";
import Transactions from "@/components/transactions";
import TradeModal from "@/components/trade-modal";
import { useWebSocket } from "@/hooks/use-websocket";
import { useEffect, useState } from "react";
import type { StockPrice } from "@shared/schema";

export default function Dashboard() {
  const [realtimePrices, setRealtimePrices] = useState<StockPrice[]>([]);
  const { lastMessage } = useWebSocket('/ws');

  // Handle real-time price updates
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'PRICE_UPDATE') {
      setRealtimePrices(lastMessage.data);
    }
  }, [lastMessage]);

  const { data: portfolioSummary } = useQuery({
    queryKey: ['/api/portfolio/summary'],
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const { data: user } = useQuery({
    queryKey: ['/api/user'],
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        portfolioSummary={portfolioSummary} 
        user={user} 
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          <div className="lg:col-span-1">
            <Sidebar />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <PortfolioCards summary={portfolioSummary} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <MarketChart />
              </div>
              <div>
                <QuickTrade />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Watchlist realtimePrices={realtimePrices} />
              <Holdings realtimePrices={realtimePrices} />
            </div>

            <Transactions />
          </div>
        </div>
      </div>

      <TradeModal />
    </div>
  );
}
