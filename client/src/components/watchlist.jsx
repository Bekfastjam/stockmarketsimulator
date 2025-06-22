import React, { useState } from 'react';
import { Plus, X, TrendingUp, TrendingDown, Star } from 'lucide-react';

function Watchlist({ watchlist, loading, marketData, onAdd, onRemove, onSelectSymbol }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (newSymbol.trim()) {
      onAdd(newSymbol.trim().toUpperCase());
      setNewSymbol('');
      setShowAddForm(false);
    }
  };

  const getStockData = (symbol) => {
    return marketData?.find(stock => stock.symbol === symbol);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Watchlist
          </h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Watchlist
          </h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Add Symbol Form */}
        {showAddForm && (
          <form onSubmit={handleAdd} className="mb-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                placeholder="Enter symbol (e.g., AAPL)"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                maxLength="5"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Watchlist Items */}
        <div className="space-y-3">
          {watchlist?.symbols?.length > 0 ? (
            watchlist.symbols.map((symbol) => {
              const stockData = getStockData(symbol);
              const change = stockData ? parseFloat(stockData.change) : 0;
              const changePercent = stockData ? parseFloat(stockData.changePercent) : 0;

              return (
                <div
                  key={symbol}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => onSelectSymbol(symbol)}
                >
                  <div className="flex items-center space-x-3">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {symbol}
                      </p>
                      {stockData && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ${parseFloat(stockData.price).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {stockData && (
                      <div className="text-right">
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
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(symbol);
                      }}
                      className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <Star className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No stocks in watchlist
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Add stocks to track their performance
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Watchlist; 