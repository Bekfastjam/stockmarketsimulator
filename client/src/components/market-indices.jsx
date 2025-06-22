import React from 'react';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

function MarketIndices({ indices, loading }) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Market Indices
          </h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const indexData = [
    {
      symbol: 'SPY',
      name: 'S&P 500 ETF',
      data: indices?.SPY,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      symbol: 'QQQ',
      name: 'NASDAQ-100 ETF',
      data: indices?.QQQ,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      symbol: 'IWM',
      name: 'Russell 2000 ETF',
      data: indices?.IWM,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Market Indices
        </h3>

        <div className="space-y-3">
          {indexData.map((index) => {
            const data = index.data;
            if (!data) return null;

            const change = parseFloat(data.change);
            const changePercent = parseFloat(data.changePercent);
            const price = parseFloat(data.price);

            return (
              <div
                key={index.symbol}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${index.bgColor}`}>
                    <BarChart3 className={`h-4 w-4 ${index.color}`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {index.symbol}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {index.name}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">
                    ${price.toFixed(2)}
                  </p>
                  <div className="flex items-center space-x-1">
                    {change >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {change >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                    </span>
                  </div>
                  <p className={`text-xs ${
                    change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {change >= 0 ? '+' : ''}{change.toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {!indices || Object.keys(indices).length === 0 && (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              No market data available
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Check back later for updates
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MarketIndices; 