import { 
  users, stocks, portfolios, transactions, watchlist, alerts, news, marketData, pendingOrders,
  type User, type InsertUser,
  type Stock, type InsertStock,
  type Portfolio, type InsertPortfolio,
  type Transaction, type InsertTransaction,
  type Watchlist, type InsertWatchlist,
  type Alert, type InsertAlert,
  type News, type InsertNews,
  type MarketData, type InsertMarketData,
  type PendingOrder, type InsertPendingOrder,
  type PortfolioSummary, type TradeOrder, type AlertRequest
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCash(userId: number, amount: number): Promise<User>;
  updateUserPreferences(userId: number, preferences: any): Promise<User>;

  // Stock operations
  getAllStocks(): Promise<Stock[]>;
  getStock(symbol: string): Promise<Stock | undefined>;
  getStockById(id: number): Promise<Stock | undefined>;
  createStock(stock: InsertStock): Promise<Stock>;
  updateStock(id: number, updates: Partial<Stock>): Promise<Stock>;
  updateStockPrice(symbol: string, price: number, change: number, changePercent: number, additionalData?: any): Promise<Stock>;
  searchStocks(query: string): Promise<Stock[]>;

  // Portfolio operations
  getUserPortfolio(userId: number): Promise<Portfolio[]>;
  getPortfolioPosition(userId: number, symbol: string): Promise<Portfolio | undefined>;
  createPortfolioPosition(position: InsertPortfolio): Promise<Portfolio>;
  updatePortfolioPosition(id: number, shares: number, avgCost: number, totalCost: number, unrealizedPL?: number, unrealizedPLPercent?: number): Promise<Portfolio>;
  deletePortfolioPosition(id: number): Promise<void>;

  // Transaction operations
  getUserTransactions(userId: number, limit?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  // Watchlist operations
  getUserWatchlist(userId: number): Promise<Watchlist[]>;
  addToWatchlist(watchlist: InsertWatchlist): Promise<Watchlist>;
  removeFromWatchlist(userId: number, symbol: string): Promise<void>;

  // Alert operations
  getUserAlerts(userId: number): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: number, updates: Partial<Alert>): Promise<Alert>;
  deleteAlert(id: number): Promise<void>;
  checkAlerts(symbol: string, currentPrice: number): Promise<Alert[]>;

  // News operations
  getNews(limit?: number, symbols?: string[]): Promise<News[]>;
  createNews(news: InsertNews): Promise<News>;
  getNewsBySymbol(symbol: string, limit?: number): Promise<News[]>;

  // Market data operations
  getMarketData(symbol: string, interval?: string, limit?: number): Promise<MarketData[]>;
  createMarketData(data: InsertMarketData): Promise<MarketData>;
  updateMarketData(symbol: string, date: Date, data: Partial<MarketData>): Promise<MarketData>;

  // Pending orders operations
  getUserPendingOrders(userId: number): Promise<PendingOrder[]>;
  createPendingOrder(order: InsertPendingOrder): Promise<PendingOrder>;
  updatePendingOrder(id: number, updates: Partial<PendingOrder>): Promise<PendingOrder>;
  deletePendingOrder(id: number): Promise<void>;
  checkPendingOrders(symbol: string, currentPrice: number): Promise<PendingOrder[]>;

  // Portfolio summary
  getPortfolioSummary(userId: number): Promise<PortfolioSummary>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private stocks: Map<number, Stock>;
  private portfolios: Map<number, Portfolio>;
  private transactions: Map<number, Transaction>;
  private watchlists: Map<number, Watchlist>;
  private alerts: Map<number, Alert>;
  private news: Map<number, News>;
  private marketData: Map<number, MarketData>;
  private pendingOrders: Map<number, PendingOrder>;
  
  private currentUserId: number;
  private currentStockId: number;
  private currentPortfolioId: number;
  private currentTransactionId: number;
  private currentWatchlistId: number;
  private currentAlertId: number;
  private currentNewsId: number;
  private currentMarketDataId: number;
  private currentPendingOrderId: number;

  constructor() {
    this.users = new Map();
    this.stocks = new Map();
    this.portfolios = new Map();
    this.transactions = new Map();
    this.watchlists = new Map();
    this.alerts = new Map();
    this.news = new Map();
    this.marketData = new Map();
    this.pendingOrders = new Map();
    
    this.currentUserId = 1;
    this.currentStockId = 1;
    this.currentPortfolioId = 1;
    this.currentTransactionId = 1;
    this.currentWatchlistId = 1;
    this.currentAlertId = 1;
    this.currentNewsId = 1;
    this.currentMarketDataId = 1;
    this.currentPendingOrderId = 1;

    // Initialize with sample data
    this.initializeStocks();
    this.initializeNews();
  }

  private initializeStocks() {
    const sampleStocks = [
      { 
        symbol: 'AAPL', 
        name: 'Apple Inc.', 
        currentPrice: '173.24', 
        previousClose: '171.10', 
        change: '2.14', 
        changePercent: '1.25',
        open: '172.50',
        high: '174.20',
        low: '171.80',
        volume: 45678900,
        marketCap: '2720000000000',
        peRatio: '28.45',
        dividendYield: '0.52',
        sector: 'Technology',
        industry: 'Consumer Electronics'
      },
      { 
        symbol: 'GOOGL', 
        name: 'Alphabet Inc.', 
        currentPrice: '2641.30', 
        previousClose: '2656.72', 
        change: '-15.42', 
        changePercent: '-0.58',
        open: '2650.00',
        high: '2660.50',
        low: '2635.20',
        volume: 23456700,
        marketCap: '1750000000000',
        peRatio: '24.12',
        dividendYield: '0.00',
        sector: 'Technology',
        industry: 'Internet Content & Information'
      },
      { 
        symbol: 'TSLA', 
        name: 'Tesla, Inc.', 
        currentPrice: '208.91', 
        previousClose: '200.70', 
        change: '8.21', 
        changePercent: '4.09',
        open: '202.30',
        high: '210.50',
        low: '201.10',
        volume: 67890100,
        marketCap: '650000000000',
        peRatio: '45.67',
        dividendYield: '0.00',
        sector: 'Consumer Cyclical',
        industry: 'Auto Manufacturers'
      },
      { 
        symbol: 'MSFT', 
        name: 'Microsoft Corp.', 
        currentPrice: '378.85', 
        previousClose: '374.62', 
        change: '4.23', 
        changePercent: '1.13',
        open: '375.20',
        high: '380.10',
        low: '374.50',
        volume: 34567800,
        marketCap: '2810000000000',
        peRatio: '32.18',
        dividendYield: '0.78',
        sector: 'Technology',
        industry: 'Software - Infrastructure'
      },
      { 
        symbol: 'NVDA', 
        name: 'NVIDIA Corp.', 
        currentPrice: '429.00', 
        previousClose: '418.25', 
        change: '10.75', 
        changePercent: '2.57',
        open: '420.50',
        high: '432.80',
        low: '419.20',
        volume: 56789000,
        marketCap: '1050000000000',
        peRatio: '38.92',
        dividendYield: '0.12',
        sector: 'Technology',
        industry: 'Semiconductors'
      },
      { 
        symbol: 'AMZN', 
        name: 'Amazon.com Inc.', 
        currentPrice: '3285.51', 
        previousClose: '3270.00', 
        change: '15.51', 
        changePercent: '0.47',
        open: '3275.30',
        high: '3290.40',
        low: '3268.70',
        volume: 45678900,
        marketCap: '1680000000000',
        peRatio: '42.15',
        dividendYield: '0.00',
        sector: 'Consumer Cyclical',
        industry: 'Internet Retail'
      },
    ];

    sampleStocks.forEach(stock => {
      const id = this.currentStockId++;
      this.stocks.set(id, {
        id,
        ...stock,
        lastUpdated: new Date(),
      } as Stock);
    });
  }

  private initializeNews() {
    const sampleNews = [
      {
        title: 'Apple Reports Strong Q4 Earnings, iPhone Sales Surge',
        url: 'https://example.com/apple-earnings',
        summary: 'Apple Inc. reported better-than-expected quarterly earnings driven by strong iPhone sales and services revenue growth.',
        source: 'Financial Times',
        publishedAt: new Date(),
        sentiment: 'positive',
        sentimentScore: '0.85',
        relatedSymbols: ['AAPL'],
        bannerImage: 'https://example.com/apple-news.jpg'
      },
      {
        title: 'Tesla Announces New Gigafactory in Asia',
        url: 'https://example.com/tesla-gigafactory',
        summary: 'Tesla plans to build a new Gigafactory in Asia to meet growing demand for electric vehicles in the region.',
        source: 'Reuters',
        publishedAt: new Date(),
        sentiment: 'positive',
        sentimentScore: '0.72',
        relatedSymbols: ['TSLA'],
        bannerImage: 'https://example.com/tesla-news.jpg'
      }
    ];

    sampleNews.forEach(newsItem => {
      const id = this.currentNewsId++;
      this.news.set(id, {
        id,
        ...newsItem,
      } as News);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      cashBalance: '100000.00',
      createdAt: new Date(),
      lastLogin: null,
      email: insertUser.email || null,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      preferences: {
        theme: 'system',
        defaultTimeframe: '1M',
        notifications: true
      }
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserCash(userId: number, amount: number): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    
    const newBalance = parseFloat(user.cashBalance) + amount;
    const updatedUser = { ...user, cashBalance: newBalance.toFixed(2) };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserPreferences(userId: number, preferences: any): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, preferences: { ...user.preferences, ...preferences } };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Stock operations
  async getAllStocks(): Promise<Stock[]> {
    return Array.from(this.stocks.values());
  }

  async getStock(symbol: string): Promise<Stock | undefined> {
    return Array.from(this.stocks.values()).find(stock => stock.symbol === symbol);
  }

  async getStockById(id: number): Promise<Stock | undefined> {
    return this.stocks.get(id);
  }

  async createStock(insertStock: InsertStock): Promise<Stock> {
    const id = this.currentStockId++;
    const stock: Stock = {
      ...insertStock,
      id,
      lastUpdated: new Date(),
    };
    this.stocks.set(id, stock);
    return stock;
  }

  async updateStock(id: number, updates: Partial<Stock>): Promise<Stock> {
    const stock = this.stocks.get(id);
    if (!stock) throw new Error('Stock not found');
    
    const updatedStock = { ...stock, ...updates, lastUpdated: new Date() };
    this.stocks.set(id, updatedStock);
    return updatedStock;
  }

  async updateStockPrice(symbol: string, price: number, change: number, changePercent: number, additionalData?: any): Promise<Stock> {
    const stock = await this.getStock(symbol);
    if (!stock) throw new Error('Stock not found');
    
    const updatedStock = {
      ...stock,
      currentPrice: price.toFixed(2),
      change: change.toFixed(2),
      changePercent: changePercent.toFixed(2),
      lastUpdated: new Date(),
      open: additionalData?.open ?? stock.open,
      high: additionalData?.high ?? stock.high,
      low: additionalData?.low ?? stock.low,
      volume: additionalData?.volume ?? stock.volume,
      marketCap: additionalData?.marketCap ?? stock.marketCap,
      peRatio: additionalData?.peRatio ?? stock.peRatio,
      dividendYield: additionalData?.dividendYield ?? stock.dividendYield,
      sector: additionalData?.sector ?? stock.sector,
      industry: additionalData?.industry ?? stock.industry,
    };
    this.stocks.set(stock.id, updatedStock);
    return updatedStock;
  }

  async searchStocks(query: string): Promise<Stock[]> {
    const stocks = Array.from(this.stocks.values());
    return stocks.filter(stock => 
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Portfolio operations
  async getUserPortfolio(userId: number): Promise<Portfolio[]> {
    return Array.from(this.portfolios.values()).filter(p => p.userId === userId);
  }

  async getPortfolioPosition(userId: number, symbol: string): Promise<Portfolio | undefined> {
    return Array.from(this.portfolios.values()).find(p => p.userId === userId && p.symbol === symbol);
  }

  async createPortfolioPosition(insertPosition: InsertPortfolio): Promise<Portfolio> {
    const id = this.currentPortfolioId++;
    const position: Portfolio = {
      ...insertPosition,
      id,
      unrealizedPL: '0.00',
      unrealizedPLPercent: '0.00'
    };
    this.portfolios.set(id, position);
    return position;
  }

  async updatePortfolioPosition(id: number, shares: number, avgCost: number, totalCost: number, unrealizedPL?: number, unrealizedPLPercent?: number): Promise<Portfolio> {
    const position = this.portfolios.get(id);
    if (!position) throw new Error('Portfolio position not found');
    
    const updatedPosition = {
      ...position,
      shares,
      avgCost: avgCost.toFixed(2),
      totalCost: totalCost.toFixed(2),
      unrealizedPL: unrealizedPL ? unrealizedPL.toFixed(2) : position.unrealizedPL,
      unrealizedPLPercent: unrealizedPLPercent ? unrealizedPLPercent.toFixed(2) : position.unrealizedPLPercent
    };
    this.portfolios.set(id, updatedPosition);
    return updatedPosition;
  }

  async deletePortfolioPosition(id: number): Promise<void> {
    this.portfolios.delete(id);
  }

  // Transaction operations
  async getUserTransactions(userId: number, limit?: number): Promise<Transaction[]> {
    const transactions = Array.from(this.transactions.values())
      .filter(t => t.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return limit ? transactions.slice(0, limit) : transactions;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      timestamp: new Date(),
      status: 'COMPLETED',
      orderType: 'MARKET',
      limitPrice: null,
      stopPrice: null,
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  // Watchlist operations
  async getUserWatchlist(userId: number): Promise<Watchlist[]> {
    return Array.from(this.watchlists.values()).filter(w => w.userId === userId);
  }

  async addToWatchlist(insertWatchlist: InsertWatchlist): Promise<Watchlist> {
    const id = this.currentWatchlistId++;
    const watchlistItem: Watchlist = {
      ...insertWatchlist,
      id,
      addedAt: new Date(),
    };
    this.watchlists.set(id, watchlistItem);
    return watchlistItem;
  }

  async removeFromWatchlist(userId: number, symbol: string): Promise<void> {
    const watchlistItem = Array.from(this.watchlists.values())
      .find(w => w.userId === userId && w.symbol === symbol);
    if (watchlistItem) {
      this.watchlists.delete(watchlistItem.id);
    }
  }

  // Alert operations
  async getUserAlerts(userId: number): Promise<Alert[]> {
    return Array.from(this.alerts.values()).filter(a => a.userId === userId);
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const id = this.currentAlertId++;
    const newAlert: Alert = {
      ...alert,
      id,
      isActive: true,
      createdAt: new Date(),
      triggeredAt: null,
    };
    this.alerts.set(id, newAlert);
    return newAlert;
  }

  async updateAlert(id: number, updates: Partial<Alert>): Promise<Alert> {
    const alert = this.alerts.get(id);
    if (!alert) throw new Error('Alert not found');
    
    const updatedAlert = { ...alert, ...updates };
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }

  async deleteAlert(id: number): Promise<void> {
    this.alerts.delete(id);
  }

  async checkAlerts(symbol: string, currentPrice: number): Promise<Alert[]> {
    const triggeredAlerts: Alert[] = [];
    
    for (const alert of Array.from(this.alerts.values())) {
      if (alert.symbol === symbol && alert.isActive) {
        let triggered = false;
        
        switch (alert.type) {
          case 'PRICE_ABOVE':
            triggered = currentPrice > parseFloat(alert.value.toString());
            break;
          case 'PRICE_BELOW':
            triggered = currentPrice < parseFloat(alert.value.toString());
            break;
          case 'PERCENT_CHANGE':
            // This would need previous price data to calculate
            break;
        }
        
        if (triggered) {
          triggeredAlerts.push(alert);
          // Mark alert as triggered
          alert.triggeredAt = new Date();
          alert.isActive = false;
        }
      }
    }
    
    return triggeredAlerts;
  }

  // News operations
  async getNews(limit?: number, symbols?: string[]): Promise<News[]> {
    let news = Array.from(this.news.values())
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    if (symbols && symbols.length > 0) {
      news = news.filter(n => 
        n.relatedSymbols && n.relatedSymbols.some(symbol => symbols.includes(symbol))
      );
    }
    
    return limit ? news.slice(0, limit) : news;
  }

  async createNews(news: InsertNews): Promise<News> {
    const id = this.currentNewsId++;
    const newNews: News = {
      ...news,
      id,
      summary: news.summary ?? null,
      sentiment: news.sentiment ?? null,
      sentimentScore: news.sentimentScore ?? null,
      relatedSymbols: Array.isArray(news.relatedSymbols) ? news.relatedSymbols as string[] : null,
      bannerImage: news.bannerImage ?? null,
    };
    this.news.set(id, newNews);
    return newNews;
  }

  async getNewsBySymbol(symbol: string, limit?: number): Promise<News[]> {
    const news = Array.from(this.news.values())
      .filter(n => n.relatedSymbols && n.relatedSymbols.includes(symbol))
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    return limit ? news.slice(0, limit) : news;
  }

  // Market data operations
  async getMarketData(symbol: string, interval: string = 'daily', limit?: number): Promise<MarketData[]> {
    const data = Array.from(this.marketData.values())
      .filter(d => d.symbol === symbol && d.interval === interval)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return limit ? data.slice(0, limit) : data;
  }

  async createMarketData(data: InsertMarketData): Promise<MarketData> {
    const id = this.currentMarketDataId++;
    const newData: MarketData = {
      ...data,
      id,
      interval: data.interval || 'daily',
    };
    this.marketData.set(id, newData);
    return newData;
  }

  async updateMarketData(symbol: string, date: Date, data: Partial<MarketData>): Promise<MarketData> {
    const existingData = Array.from(this.marketData.values())
      .find(d => d.symbol === symbol && d.date.getTime() === date.getTime());
    
    if (!existingData) throw new Error('Market data not found');
    
    const updatedData = { ...existingData, ...data };
    this.marketData.set(existingData.id, updatedData);
    return updatedData;
  }

  // Pending orders operations
  async getUserPendingOrders(userId: number): Promise<PendingOrder[]> {
    return Array.from(this.pendingOrders.values())
      .filter(o => o.userId === userId && o.status === 'PENDING')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createPendingOrder(order: InsertPendingOrder): Promise<PendingOrder> {
    const id = this.currentPendingOrderId++;
    const newOrder: PendingOrder = {
      ...order,
      id,
      status: 'PENDING',
      createdAt: new Date(),
      limitPrice: order.limitPrice || null,
      stopPrice: order.stopPrice || null,
      expiresAt: order.expiresAt || null,
    };
    this.pendingOrders.set(id, newOrder);
    return newOrder;
  }

  async updatePendingOrder(id: number, updates: Partial<PendingOrder>): Promise<PendingOrder> {
    const order = this.pendingOrders.get(id);
    if (!order) throw new Error('Pending order not found');
    
    const updatedOrder = { ...order, ...updates };
    this.pendingOrders.set(id, updatedOrder);
    return updatedOrder;
  }

  async deletePendingOrder(id: number): Promise<void> {
    this.pendingOrders.delete(id);
  }

  async checkPendingOrders(symbol: string, currentPrice: number): Promise<PendingOrder[]> {
    const triggeredOrders: PendingOrder[] = [];
    
    for (const order of Array.from(this.pendingOrders.values())) {
      if (order.symbol === symbol && order.status === 'PENDING') {
        let triggered = false;
        
        switch (order.orderType) {
          case 'LIMIT':
            if (order.limitPrice) {
              if (order.type === 'BUY' && currentPrice <= parseFloat(order.limitPrice.toString())) {
                triggered = true;
              } else if (order.type === 'SELL' && currentPrice >= parseFloat(order.limitPrice.toString())) {
                triggered = true;
              }
            }
            break;
          case 'STOP':
            if (order.stopPrice) {
              if (order.type === 'BUY' && currentPrice >= parseFloat(order.stopPrice.toString())) {
                triggered = true;
              } else if (order.type === 'SELL' && currentPrice <= parseFloat(order.stopPrice.toString())) {
                triggered = true;
              }
            }
            break;
        }
        
        if (triggered) {
          triggeredOrders.push(order);
        }
      }
    }
    
    return triggeredOrders;
  }

  // Portfolio summary
  async getPortfolioSummary(userId: number): Promise<PortfolioSummary> {
    const portfolio = await this.getUserPortfolio(userId);
    const user = await this.getUser(userId);
    
    let totalValue = 0;
    let totalCost = 0;
    let dailyPL = 0;
    let totalPL = 0;
    
    for (const position of portfolio) {
      const stock = await this.getStock(position.symbol);
      if (stock) {
        const currentPrice = parseFloat(stock.currentPrice);
        const positionValue = currentPrice * position.shares;
        const positionCost = parseFloat(position.totalCost);
        
        totalValue += positionValue;
        totalCost += positionCost;
        
        const positionPL = positionValue - positionCost;
        totalPL += positionPL;
        
        // Calculate daily P&L based on change
        const dailyChange = parseFloat(stock.change);
        dailyPL += dailyChange * position.shares;
      }
    }
    
    const cashBalance = user ? parseFloat(user.cashBalance) : 0;
    totalValue += cashBalance;
    
    const dailyPLPercent = totalCost > 0 ? (dailyPL / totalCost) * 100 : 0;
    const totalPLPercent = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;
    
    return {
      totalValue,
      dailyPL,
      totalPL,
      dailyPLPercent,
      totalPLPercent,
      openPositions: portfolio.length,
      cashBalance,
      totalInvested: totalCost
    };
  }
}

export const storage = new MemStorage();
