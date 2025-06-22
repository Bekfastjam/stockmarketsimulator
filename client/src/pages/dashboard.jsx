import React, { useState, useEffect } from 'react';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from '../components/header.jsx';
import Sidebar from '../components/sidebar.jsx';
import PortfolioCards from '../components/portfolio-cards.jsx';
import MarketChart from '../components/market-chart.jsx';
import QuickTrade from '../components/quick-trade.jsx';
import Watchlist from '../components/watchlist.jsx';
import Transactions from '../components/transactions.jsx';
import NewsFeed from '../components/news-feed.jsx';
import AlertsPanel from '../components/alerts-panel.jsx';
import MarketIndices from '../components/market-indices.jsx';
import { useWebSocket } from '../hooks/use-websocket.jsx';
import { useToast } from '../hooks/use-toast.js';
import { useMobile } from '../hooks/use-mobile.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function DashboardContent() {
  const [user, setUser] = useState({ id: 'demo-user', username: 'demo', balance: 100000 });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const isMobile = useMobile();
  const { toast } = useToast();

  // WebSocket connection for real-time updates
  const { lastMessage } = useWebSocket('ws://localhost:3000');

  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage);
      
      switch (data.type) {
        case 'MARKET_UPDATE':
          queryClient.invalidateQueries(['marketData']);
          break;
        case 'TRADE_UPDATE':
          if (data.data.userId === user.id) {
            queryClient.invalidateQueries(['portfolio', user.id]);
            queryClient.invalidateQueries(['transactions', user.id]);
            toast({
              title: 'Trade Executed',
              description: `${data.data.transaction.type} ${data.data.transaction.shares} shares of ${data.data.transaction.symbol}`,
            });
          }
          break;
        case 'PRICE_ALERT':
          toast({
            title: 'Price Alert',
            description: `${data.data.symbol} ${data.data.type === 'PRICE_ABOVE' ? 'above' : 'below'} $${data.data.targetPrice}`,
            variant: 'destructive',
          });
          break;
        case 'NEWS_UPDATE':
          queryClient.invalidateQueries(['news']);
          break;
      }
    }
  }, [lastMessage, user.id, toast]);

  // Portfolio data
  const { data: portfolio, isLoading: portfolioLoading } = useQuery({
    queryKey: ['portfolio', user.id],
    queryFn: () => fetch(`/api/portfolio/${user.id}`).then(res => res.json()),
    refetchInterval: 30000,
  });

  // Market data
  const { data: marketData, isLoading: marketLoading } = useQuery({
    queryKey: ['marketData'],
    queryFn: () => fetch('/api/market/quotes?symbols=AAPL,GOOGL,MSFT,TSLA,AMZN,NVDA,META,NFLX').then(res => res.json()),
    refetchInterval: 30000,
  });

  // Transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions', user.id],
    queryFn: () => fetch(`/api/transactions/${user.id}?limit=10`).then(res => res.json()),
  });

  // Watchlist
  const { data: watchlist, isLoading: watchlistLoading } = useQuery({
    queryKey: ['watchlist', user.id],
    queryFn: () => fetch(`/api/watchlist/${user.id}`).then(res => res.json()),
  });

  // News
  const { data: news, isLoading: newsLoading } = useQuery({
    queryKey: ['news'],
    queryFn: () => fetch('/api/news?limit=5').then(res => res.json()),
    refetchInterval: 300000, // 5 minutes
  });

  // Alerts
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['alerts', user.id],
    queryFn: () => fetch(`/api/alerts/${user.id}`).then(res => res.json()),
  });

  // Market indices
  const { data: indices, isLoading: indicesLoading } = useQuery({
    queryKey: ['indices'],
    queryFn: () => fetch('/api/market/indices').then(res => res.json()),
    refetchInterval: 60000, // 1 minute
  });

  const handleTrade = async (tradeData) => {
    try {
      const response = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...tradeData, userId: user.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Trade failed');
      }

      const result = await response.json();
      queryClient.invalidateQueries(['portfolio', user.id]);
      queryClient.invalidateQueries(['transactions', user.id]);
      
      toast({
        title: 'Trade Successful',
        description: result.message,
      });
    } catch (error) {
      toast({
        title: 'Trade Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleAddToWatchlist = async (symbol) => {
    try {
      await fetch(`/api/watchlist/${user.id}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol }),
      });
      queryClient.invalidateQueries(['watchlist', user.id]);
      toast({
        title: 'Added to Watchlist',
        description: `${symbol} has been added to your watchlist`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add to watchlist',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveFromWatchlist = async (symbol) => {
    try {
      await fetch(`/api/watchlist/${user.id}/${symbol}`, {
        method: 'DELETE',
      });
      queryClient.invalidateQueries(['watchlist', user.id]);
      toast({
        title: 'Removed from Watchlist',
        description: `${symbol} has been removed from your watchlist`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove from watchlist',
        variant: 'destructive',
      });
    }
  };

  const handleCreateAlert = async (alertData) => {
    try {
      await fetch(`/api/alerts/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData),
      });
      queryClient.invalidateQueries(['alerts', user.id]);
      toast({
        title: 'Alert Created',
        description: `Price alert for ${alertData.symbol} has been created`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create alert',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAlert = async (alertId) => {
    try {
      await fetch(`/api/alerts/${alertId}`, {
        method: 'DELETE',
      });
      queryClient.invalidateQueries(['alerts', user.id]);
      toast({
        title: 'Alert Deleted',
        description: 'Price alert has been deleted',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete alert',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        user={user} 
        onMenuClick={() => setSidebarOpen(true)}
        isMobile={isMobile}
      />
      
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        user={user}
        isMobile={isMobile}
      />

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Portfolio Cards */}
              <PortfolioCards 
                portfolio={portfolio} 
                loading={portfolioLoading}
                user={user}
              />

              {/* Market Chart */}
              <MarketChart 
                symbol={selectedSymbol}
                marketData={marketData}
                loading={marketLoading}
              />

              {/* Quick Trade */}
              <QuickTrade 
                onTrade={handleTrade}
                marketData={marketData}
                user={user}
              />

              {/* Transactions */}
              <Transactions 
                transactions={transactions}
                loading={transactionsLoading}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Market Indices */}
              <MarketIndices 
                indices={indices}
                loading={indicesLoading}
              />

              {/* Watchlist */}
              <Watchlist 
                watchlist={watchlist}
                loading={watchlistLoading}
                marketData={marketData}
                onAdd={handleAddToWatchlist}
                onRemove={handleRemoveFromWatchlist}
                onSelectSymbol={setSelectedSymbol}
              />

              {/* Alerts Panel */}
              <AlertsPanel 
                alerts={alerts}
                loading={alertsLoading}
                onCreateAlert={handleCreateAlert}
                onDeleteAlert={handleDeleteAlert}
              />

              {/* News Feed */}
              <NewsFeed 
                news={news}
                loading={newsLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  );
}

export default Dashboard; 