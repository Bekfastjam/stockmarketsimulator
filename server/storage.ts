import { 
  users, stocks, portfolios, transactions, watchlist,
  type User, type InsertUser,
  type Stock, type InsertStock,
  type Portfolio, type InsertPortfolio,
  type Transaction, type InsertTransaction,
  type Watchlist, type InsertWatchlist,
  type PortfolioSummary, type TradeOrder
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCash(userId: number, amount: number): Promise<User>;

  // Stock operations
  getAllStocks(): Promise<Stock[]>;
  getStock(symbol: string): Promise<Stock | undefined>;
  getStockById(id: number): Promise<Stock | undefined>;
  createStock(stock: InsertStock): Promise<Stock>;
  updateStock(id: number, updates: Partial<Stock>): Promise<Stock>;
  updateStockPrice(symbol: string, price: number, change: number, changePercent: number): Promise<Stock>;

  // Portfolio operations
  getUserPortfolio(userId: number): Promise<Portfolio[]>;
  getPortfolioPosition(userId: number, symbol: string): Promise<Portfolio | undefined>;
  createPortfolioPosition(position: InsertPortfolio): Promise<Portfolio>;
  updatePortfolioPosition(id: number, shares: number, avgCost: number, totalCost: number): Promise<Portfolio>;
  deletePortfolioPosition(id: number): Promise<void>;

  // Transaction operations
  getUserTransactions(userId: number, limit?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  // Watchlist operations
  getUserWatchlist(userId: number): Promise<Watchlist[]>;
  addToWatchlist(watchlist: InsertWatchlist): Promise<Watchlist>;
  removeFromWatchlist(userId: number, symbol: string): Promise<void>;

  // Portfolio summary
  getPortfolioSummary(userId: number): Promise<PortfolioSummary>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private stocks: Map<number, Stock>;
  private portfolios: Map<number, Portfolio>;
  private transactions: Map<number, Transaction>;
  private watchlists: Map<number, Watchlist>;
  private currentUserId: number;
  private currentStockId: number;
  private currentPortfolioId: number;
  private currentTransactionId: number;
  private currentWatchlistId: number;

  constructor() {
    this.users = new Map();
    this.stocks = new Map();
    this.portfolios = new Map();
    this.transactions = new Map();
    this.watchlists = new Map();
    this.currentUserId = 1;
    this.currentStockId = 1;
    this.currentPortfolioId = 1;
    this.currentTransactionId = 1;
    this.currentWatchlistId = 1;

    // Initialize with sample stocks
    this.initializeStocks();
  }

  private initializeStocks() {
    const sampleStocks = [
      { symbol: 'AAPL', name: 'Apple Inc.', currentPrice: '173.24', previousClose: '171.10', change: '2.14', changePercent: '1.25' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', currentPrice: '2641.30', previousClose: '2656.72', change: '-15.42', changePercent: '-0.58' },
      { symbol: 'TSLA', name: 'Tesla, Inc.', currentPrice: '208.91', previousClose: '200.70', change: '8.21', changePercent: '4.09' },
      { symbol: 'MSFT', name: 'Microsoft Corp.', currentPrice: '378.85', previousClose: '374.62', change: '4.23', changePercent: '1.13' },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', currentPrice: '429.00', previousClose: '418.25', change: '10.75', changePercent: '2.57' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', currentPrice: '3285.51', previousClose: '3270.00', change: '15.51', changePercent: '0.47' },
    ];

    sampleStocks.forEach(stock => {
      const id = this.currentStockId++;
      this.stocks.set(id, {
        id,
        ...stock,
        lastUpdated: new Date(),
      });
    });
  }

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

  async updateStockPrice(symbol: string, price: number, change: number, changePercent: number): Promise<Stock> {
    const stock = await this.getStock(symbol);
    if (!stock) throw new Error('Stock not found');
    
    const updatedStock = {
      ...stock,
      currentPrice: price.toFixed(2),
      change: change.toFixed(2),
      changePercent: changePercent.toFixed(2),
      lastUpdated: new Date(),
    };
    this.stocks.set(stock.id, updatedStock);
    return updatedStock;
  }

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
    };
    this.portfolios.set(id, position);
    return position;
  }

  async updatePortfolioPosition(id: number, shares: number, avgCost: number, totalCost: number): Promise<Portfolio> {
    const position = this.portfolios.get(id);
    if (!position) throw new Error('Portfolio position not found');
    
    const updatedPosition = {
      ...position,
      shares,
      avgCost: avgCost.toFixed(2),
      totalCost: totalCost.toFixed(2),
    };
    this.portfolios.set(id, updatedPosition);
    return updatedPosition;
  }

  async deletePortfolioPosition(id: number): Promise<void> {
    this.portfolios.delete(id);
  }

  async getUserTransactions(userId: number, limit?: number): Promise<Transaction[]> {
    const userTransactions = Array.from(this.transactions.values())
      .filter(t => t.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return limit ? userTransactions.slice(0, limit) : userTransactions;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      timestamp: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getUserWatchlist(userId: number): Promise<Watchlist[]> {
    return Array.from(this.watchlists.values()).filter(w => w.userId === userId);
  }

  async addToWatchlist(insertWatchlist: InsertWatchlist): Promise<Watchlist> {
    const id = this.currentWatchlistId++;
    const watchlistItem: Watchlist = {
      ...insertWatchlist,
      id,
    };
    this.watchlists.set(id, watchlistItem);
    return watchlistItem;
  }

  async removeFromWatchlist(userId: number, symbol: string): Promise<void> {
    const item = Array.from(this.watchlists.values()).find(w => w.userId === userId && w.symbol === symbol);
    if (item) {
      this.watchlists.delete(item.id);
    }
  }

  async getPortfolioSummary(userId: number): Promise<PortfolioSummary> {
    const user = await this.getUser(userId);
    const portfolio = await this.getUserPortfolio(userId);
    
    if (!user) throw new Error('User not found');

    let totalValue = parseFloat(user.cashBalance);
    let totalCost = 0;
    let dailyPL = 0;

    for (const position of portfolio) {
      const stock = await this.getStock(position.symbol);
      if (stock) {
        const currentValue = parseFloat(stock.currentPrice) * position.shares;
        const positionCost = parseFloat(position.totalCost);
        const previousValue = parseFloat(stock.previousClose) * position.shares;
        
        totalValue += currentValue;
        totalCost += positionCost;
        dailyPL += currentValue - previousValue;
      }
    }

    const totalPL = totalValue - parseFloat(user.cashBalance) - totalCost;
    const dailyPLPercent = totalValue > 0 ? (dailyPL / (totalValue - dailyPL)) * 100 : 0;
    const totalPLPercent = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;

    return {
      totalValue,
      dailyPL,
      totalPL,
      dailyPLPercent,
      totalPLPercent,
      openPositions: portfolio.length,
    };
  }
}

export const storage = new MemStorage();
