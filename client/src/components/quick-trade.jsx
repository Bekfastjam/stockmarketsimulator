import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, DollarSign, Package } from 'lucide-react';

function QuickTrade({ onTrade, marketData, user }) {
  const [symbol, setSymbol] = useState('AAPL');
  const [type, setType] = useState('BUY');
  const [shares, setShares] = useState('');
  const [orderType, setOrderType] = useState('MARKET');

  const currentPrice = marketData?.find(stock => stock.symbol === symbol)?.price || 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!symbol || !shares || shares <= 0) {
      return;
    }

    const tradeData = {
      symbol: symbol.toUpperCase(),
      type,
      shares: parseInt(shares),
      price: parseFloat(currentPrice),
      orderType,
    };

    onTrade(tradeData);
    
    // Reset form
    setShares('');
  };

  const totalCost = shares * currentPrice;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Trade
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Symbol Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Symbol
            </label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {marketData?.map((stock) => (
                <option key={stock.symbol} value={stock.symbol}>
                  {stock.symbol} - ${parseFloat(stock.price).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Trade Type */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setType('BUY')}
              className={`
                flex items-center justify-center space-x-2 px-4 py-2 rounded-md border-2 font-medium transition-colors
                ${type === 'BUY'
                  ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-green-500'
                }
              `}
            >
              <ArrowUpRight className="h-4 w-4" />
              <span>Buy</span>
            </button>
            <button
              type="button"
              onClick={() => setType('SELL')}
              className={`
                flex items-center justify-center space-x-2 px-4 py-2 rounded-md border-2 font-medium transition-colors
                ${type === 'SELL'
                  ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-red-500'
                }
              `}
            >
              <ArrowDownRight className="h-4 w-4" />
              <span>Sell</span>
            </button>
          </div>

          {/* Shares */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Shares
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                min="1"
                step="1"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Number of shares"
              />
            </div>
          </div>

          {/* Order Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Order Type
            </label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="MARKET">Market Order</option>
              <option value="LIMIT">Limit Order</option>
              <option value="STOP">Stop Order</option>
            </select>
          </div>

          {/* Price and Total */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Current Price:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                ${parseFloat(currentPrice).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Cost:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                ${totalCost.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Available Balance:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                ${user?.balance?.toLocaleString() || '0'}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!symbol || !shares || shares <= 0 || (type === 'BUY' && totalCost > user?.balance)}
            className={`
              w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors
              ${type === 'BUY'
                ? 'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed'
              }
            `}
          >
            {type === 'BUY' ? (
              <>
                <ArrowUpRight className="h-4 w-4" />
                <span>Buy {shares} Shares</span>
              </>
            ) : (
              <>
                <ArrowDownRight className="h-4 w-4" />
                <span>Sell {shares} Shares</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default QuickTrade; 