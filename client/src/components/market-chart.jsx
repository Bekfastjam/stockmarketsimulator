import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

function MarketChart({ symbol, marketData, loading }) {
  const stockData = marketData?.find(stock => stock.symbol === symbol);
  
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Market Chart
          </h3>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!stockData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Market Chart - {symbol}
          </h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <Activity className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No data available for {symbol}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const change = parseFloat(stockData.change);
  const changePercent = parseFloat(stockData.changePercent);
  const price = parseFloat(stockData.price);
  const high = parseFloat(stockData.high);
  const low = parseFloat(stockData.low);
  const volume = parseInt(stockData.volume);

  // Generate a simple mock chart data
  const generateChartData = () => {
    const data = [];
    const basePrice = price;
    for (let i = 0; i < 50; i++) {
      const randomChange = (Math.random() - 0.5) * 0.02; // ±1% change
      data.push(basePrice * (1 + randomChange));
    }
    return data;
  };

  const chartData = generateChartData();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {symbol} Chart
          </h3>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${price.toFixed(2)}
              </p>
              <div className="flex items-center space-x-1">
                {change >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${
                  change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {change >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Simple Chart */}
        <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
          <svg className="w-full h-full" viewBox="0 0 400 200">
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={change >= 0 ? "#10B981" : "#EF4444"} stopOpacity="0.3"/>
                <stop offset="100%" stopColor={change >= 0 ? "#10B981" : "#EF4444"} stopOpacity="0.1"/>
              </linearGradient>
            </defs>
            
            {/* Chart line */}
            <path
              d={chartData.map((value, index) => {
                const x = (index / (chartData.length - 1)) * 380 + 10;
                const y = 190 - ((value - Math.min(...chartData)) / (Math.max(...chartData) - Math.min(...chartData))) * 160;
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              stroke={change >= 0 ? "#10B981" : "#EF4444"}
              strokeWidth="2"
              fill="none"
            />
            
            {/* Chart area */}
            <path
              d={`M 10 190 ${chartData.map((value, index) => {
                const x = (index / (chartData.length - 1)) * 380 + 10;
                const y = 190 - ((value - Math.min(...chartData)) / (Math.max(...chartData) - Math.min(...chartData))) * 160;
                return `L ${x} ${y}`;
              }).join(' ')} L 390 190 Z`}
              fill="url(#chartGradient)"
            />
          </svg>
        </div>

        {/* Stock Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">High</p>
            <p className="font-semibold text-gray-900 dark:text-white">${high.toFixed(2)}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Low</p>
            <p className="font-semibold text-gray-900 dark:text-white">${low.toFixed(2)}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Change</p>
            <p className={`font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change.toFixed(2)}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Volume</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {(volume / 1000000).toFixed(1)}M
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarketChart; 