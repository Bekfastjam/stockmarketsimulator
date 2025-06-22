import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Percent, Package } from 'lucide-react';

function PortfolioCards({ portfolio, loading, user }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const totalValue = portfolio?.totalValue || 0;
  const totalGainLoss = portfolio?.totalGainLoss || 0;
  const totalGainLossPercent = portfolio?.totalGainLossPercent || 0;
  const holdingsCount = portfolio?.holdings?.length || 0;

  const cards = [
    {
      title: 'Total Value',
      value: `$${totalValue.toLocaleString()}`,
      change: totalGainLoss,
      changePercent: totalGainLossPercent,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Total Gain/Loss',
      value: `$${Math.abs(totalGainLoss).toLocaleString()}`,
      change: totalGainLoss,
      changePercent: totalGainLossPercent,
      icon: totalGainLoss >= 0 ? TrendingUp : TrendingDown,
      color: totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: totalGainLoss >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20',
    },
    {
      title: 'Gain/Loss %',
      value: `${totalGainLossPercent.toFixed(2)}%`,
      change: totalGainLossPercent,
      icon: Percent,
      color: totalGainLossPercent >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: totalGainLossPercent >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20',
    },
    {
      title: 'Holdings',
      value: holdingsCount.toString(),
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {card.title}
            </h3>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {card.value}
            </p>
            
            {card.change !== undefined && (
              <div className="flex items-center space-x-1">
                {card.change >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={`text-xs font-medium ${
                  card.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {card.change >= 0 ? '+' : ''}{card.change.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default PortfolioCards; 