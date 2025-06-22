import { alphaVantageService } from './services/alphavantage.js';
import { spawn } from 'child_process';

// In-memory database for Replit compatibility
const db = {
  users: new Map(),
  portfolios: new Map(),
  transactions: new Map(),
  watchlists: new Map(),
  alerts: new Map(),
  orders: new Map(),
  news: new Map(),
  marketData: new Map(),
};

// Initialize with demo data
const initializeDemoData = () => {
  // Demo user
  const demoUser = {
    id: 'demo-user',
    username: 'demo',
    password: 'demo123',
    balance: 100000,
    createdAt: new Date().toISOString(),
  };
  db.users.set(demoUser.id, demoUser);

  // Demo portfolio
  const demoPortfolio = {
    id: 'demo-portfolio',
    userId: demoUser.id,
    holdings: [
      {
        symbol: 'AAPL',
        shares: 10,
        avgPrice: 150.00,
        currentPrice: 175.50,
      },
      {
        symbol: 'GOOGL',
        shares: 5,
        avgPrice: 2800.00,
        currentPrice: 2950.00,
      },
      {
        symbol: 'TSLA',
        shares: 20,
        avgPrice: 200.00,
        currentPrice: 220.00,
      },
    ],
    totalValue: 0,
    totalGainLoss: 0,
    totalGainLossPercent: 0,
  };
  db.portfolios.set(demoPortfolio.id, demoPortfolio);

  // Demo transactions
  const demoTransactions = [
    {
      id: 'txn-1',
      userId: demoUser.id,
      symbol: 'AAPL',
      type: 'BUY',
      shares: 10,
      price: 150.00,
      total: 1500.00,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'txn-2',
      userId: demoUser.id,
      symbol: 'GOOGL',
      type: 'BUY',
      shares: 5,
      price: 2800.00,
      total: 14000.00,
      timestamp: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: 'txn-3',
      userId: demoUser.id,
      symbol: 'TSLA',
      type: 'BUY',
      shares: 20,
      price: 200.00,
      total: 4000.00,
      timestamp: new Date(Date.now() - 259200000).toISOString(),
    },
  ];
  demoTransactions.forEach(txn => db.transactions.set(txn.id, txn));

  // Demo watchlist
  const demoWatchlist = {
    id: 'demo-watchlist',
    userId: demoUser.id,
    symbols: ['MSFT', 'AMZN', 'NVDA', 'META', 'NFLX'],
  };
  db.watchlists.set(demoWatchlist.id, demoWatchlist);

  // Demo alerts
  const demoAlerts = [
    {
      id: 'alert-1',
      userId: demoUser.id,
      symbol: 'AAPL',
      type: 'PRICE_ABOVE',
      targetPrice: 180.00,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'alert-2',
      userId: demoUser.id,
      symbol: 'TSLA',
      type: 'PRICE_BELOW',
      targetPrice: 200.00,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];
  demoAlerts.forEach(alert => db.alerts.set(alert.id, alert));
};

// Initialize demo data
initializeDemoData();

class StorageService {
  // User management
  async getUser(userId) {
    return db.users.get(userId) || null;
  }

  async getUserByUsername(username) {
    for (const user of db.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return null;
  }

  async createUser(userData) {
    const user = {
      id: `user-${Date.now()}`,
      ...userData,
      createdAt: new Date().toISOString(),
    };
    db.users.set(user.id, user);
    return user;
  }

  async updateUser(userId, updates) {
    const user = db.users.get(userId);
    if (!user) return null;
    
    const updatedUser = { ...user, ...updates };
    db.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Portfolio management
  async getPortfolio(userId) {
    for (const portfolio of db.portfolios.values()) {
      if (portfolio.userId === userId) {
        return portfolio;
      }
    }
    return null;
  }

  async updatePortfolio(userId, updates) {
    let portfolio = await this.getPortfolio(userId);
    if (!portfolio) {
      portfolio = {
        id: `portfolio-${Date.now()}`,
        userId,
        holdings: [],
        totalValue: 0,
        totalGainLoss: 0,
        totalGainLossPercent: 0,
      };
    }
    
    const updatedPortfolio = { ...portfolio, ...updates };
    db.portfolios.set(updatedPortfolio.id, updatedPortfolio);
    return updatedPortfolio;
  }

  async addHolding(userId, symbol, shares, price) {
    const portfolio = await this.getPortfolio(userId);
    if (!portfolio) return null;

    const existingHolding = portfolio.holdings.find(h => h.symbol === symbol);
    
    if (existingHolding) {
      // Update existing holding
      const totalShares = existingHolding.shares + shares;
      const totalCost = (existingHolding.shares * existingHolding.avgPrice) + (shares * price);
      existingHolding.avgPrice = totalCost / totalShares;
      existingHolding.shares = totalShares;
    } else {
      // Add new holding
      portfolio.holdings.push({
        symbol,
        shares,
        avgPrice: price,
        currentPrice: price,
      });
    }

    await this.updatePortfolio(userId, portfolio);
    return portfolio;
  }

  async removeHolding(userId, symbol, shares) {
    const portfolio = await this.getPortfolio(userId);
    if (!portfolio) return null;

    const holding = portfolio.holdings.find(h => h.symbol === symbol);
    if (!holding || holding.shares < shares) return null;

    holding.shares -= shares;
    if (holding.shares === 0) {
      portfolio.holdings = portfolio.holdings.filter(h => h.symbol !== symbol);
    }

    await this.updatePortfolio(userId, portfolio);
    return portfolio;
  }

  // Transaction management
  async getTransactions(userId, limit = 50) {
    const userTransactions = [];
    for (const transaction of db.transactions.values()) {
      if (transaction.userId === userId) {
        userTransactions.push(transaction);
      }
    }
    
    return userTransactions
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async addTransaction(transactionData) {
    const transaction = {
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...transactionData,
      timestamp: new Date().toISOString(),
    };
    db.transactions.set(transaction.id, transaction);
    return transaction;
  }

  // Watchlist management
  async getWatchlist(userId) {
    for (const watchlist of db.watchlists.values()) {
      if (watchlist.userId === userId) {
        return watchlist;
      }
    }
    return null;
  }

  async updateWatchlist(userId, symbols) {
    let watchlist = await this.getWatchlist(userId);
    if (!watchlist) {
      watchlist = {
        id: `watchlist-${Date.now()}`,
        userId,
        symbols: [],
      };
    }
    
    watchlist.symbols = symbols;
    db.watchlists.set(watchlist.id, watchlist);
    return watchlist;
  }

  async addToWatchlist(userId, symbol) {
    const watchlist = await this.getWatchlist(userId);
    if (!watchlist) {
      return await this.updateWatchlist(userId, [symbol]);
    }
    
    if (!watchlist.symbols.includes(symbol)) {
      watchlist.symbols.push(symbol);
      db.watchlists.set(watchlist.id, watchlist);
    }
    return watchlist;
  }

  async removeFromWatchlist(userId, symbol) {
    const watchlist = await this.getWatchlist(userId);
    if (!watchlist) return null;
    
    watchlist.symbols = watchlist.symbols.filter(s => s !== symbol);
    db.watchlists.set(watchlist.id, watchlist);
    return watchlist;
  }

  // Alert management
  async getAlerts(userId) {
    const userAlerts = [];
    for (const alert of db.alerts.values()) {
      if (alert.userId === userId) {
        userAlerts.push(alert);
      }
    }
    return userAlerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createAlert(alertData) {
    const alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...alertData,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    db.alerts.set(alert.id, alert);
    return alert;
  }

  async updateAlert(alertId, updates) {
    const alert = db.alerts.get(alertId);
    if (!alert) return null;
    
    const updatedAlert = { ...alert, ...updates };
    db.alerts.set(alertId, updatedAlert);
    return updatedAlert;
  }

  async deleteAlert(alertId) {
    return db.alerts.delete(alertId);
  }

  // Order management
  async getOrders(userId) {
    const userOrders = [];
    for (const order of db.orders.values()) {
      if (order.userId === userId) {
        userOrders.push(order);
      }
    }
    return userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createOrder(orderData) {
    const order = {
      id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...orderData,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    db.orders.set(order.id, order);
    return order;
  }

  async updateOrder(orderId, updates) {
    const order = db.orders.get(orderId);
    if (!order) return null;
    
    const updatedOrder = { ...order, ...updates };
    db.orders.set(orderId, updatedOrder);
    return updatedOrder;
  }

  // Market data management
  async getMarketData(symbol) {
    return db.marketData.get(symbol) || null;
  }

  async setMarketData(symbol, data) {
    db.marketData.set(symbol, {
      ...data,
      lastUpdated: new Date().toISOString(),
    });
  }

  // News management
  async getNews() {
    const news = db.news.get('latest') || [];
    return news;
  }

  async setNews(newsData) {
    db.news.set('latest', newsData);
  }

  // Market simulation
  async getSimulatedMarketData(symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN']) {
    try {
      const results = [];
      
      for (const symbol of symbols) {
        // Try to get real data first
        let quote = await alphaVantageService.getQuote(symbol);
        
        if (!quote) {
          // Fallback to simulated data
          quote = await this.generateSimulatedQuote(symbol);
        }
        
        if (quote) {
          results.push(quote);
          await this.setMarketData(symbol, quote);
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error getting market data:', error);
      // Return simulated data as fallback
      return symbols.map(symbol => this.generateSimulatedQuote(symbol));
    }
  }

  async generateSimulatedQuote(symbol) {
    // Use Python script for simulation
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python3', ['server/market-engine.py', symbol]);
      
      let dataString = '';
      
      pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        console.error(`Python script error: ${data}`);
      });
      
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`Python script exited with code ${code}`);
          // Fallback to basic simulation
          resolve(this.createBasicSimulatedQuote(symbol));
          return;
        }
        
        try {
          const quote = JSON.parse(dataString);
          resolve(quote);
        } catch (error) {
          console.error('Error parsing Python output:', error);
          resolve(this.createBasicSimulatedQuote(symbol));
        }
      });
    });
  }

  createBasicSimulatedQuote(symbol) {
    const basePrice = Math.random() * 500 + 50;
    const change = (Math.random() - 0.5) * 20;
    const price = basePrice + change;
    const changePercent = (change / basePrice) * 100;
    
    return {
      symbol,
      open: basePrice.toFixed(2),
      high: (basePrice + Math.random() * 10).toFixed(2),
      low: (basePrice - Math.random() * 10).toFixed(2),
      price: price.toFixed(2),
      volume: Math.floor(Math.random() * 10000000 + 1000000).toString(),
      latestTradingDay: new Date().toISOString().split('T')[0],
      previousClose: basePrice.toFixed(2),
      change: change.toFixed(2),
      changePercent: changePercent.toFixed(2) + '%',
    };
  }

  // Portfolio calculations
  async updatePortfolioValues(userId) {
    const portfolio = await this.getPortfolio(userId);
    if (!portfolio) return null;

    let totalValue = 0;
    let totalCost = 0;

    for (const holding of portfolio.holdings) {
      const marketData = await this.getMarketData(holding.symbol);
      if (marketData) {
        holding.currentPrice = parseFloat(marketData.price);
        const holdingValue = holding.shares * holding.currentPrice;
        const holdingCost = holding.shares * holding.avgPrice;
        
        totalValue += holdingValue;
        totalCost += holdingCost;
      }
    }

    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

    const updatedPortfolio = {
      ...portfolio,
      totalValue,
      totalGainLoss,
      totalGainLossPercent,
    };

    await this.updatePortfolio(userId, updatedPortfolio);
    return updatedPortfolio;
  }
}

export const storageService = new StorageService(); 