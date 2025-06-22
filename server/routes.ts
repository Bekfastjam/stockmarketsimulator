import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { spawn } from "child_process";
import cron from "node-cron";
import { storage } from "./storage";
import { alphaVantageService } from "./services/alphavantage";
import { 
  tradeOrderSchema, 
  alertSchema,
  type TradeOrder, 
  type StockPrice,
  type AlertRequest,
  type MarketIndex,
  type ChartDataPoint
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time price updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Store active WebSocket connections
  const activeConnections = new Set<WebSocket>();

  // Start market simulation with AlphaVantage integration
  startMarketSimulation(activeConnections);

  // Schedule regular market data updates
  scheduleMarketUpdates();

  wss.on('connection', (ws) => {
    activeConnections.add(ws);
    console.log('Client connected to WebSocket');

    ws.on('close', () => {
      activeConnections.delete(ws);
      console.log('Client disconnected from WebSocket');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      activeConnections.delete(ws);
    });
  });

  // Demo user ID (in a real app, this would come from authentication)
  const DEMO_USER_ID = 1;

  // Ensure demo user exists
  setTimeout(async () => {
    try {
      let user = await storage.getUser(DEMO_USER_ID);
      if (!user) {
        user = await storage.createUser({
          username: "demo",
          password: "demo",
        });
      }
    } catch (error) {
      console.error("Failed to create demo user:", error);
    }
  }, 100);

  // API Routes

  // Get all stocks
  app.get("/api/stocks", async (req, res) => {
    try {
      const stocks = await storage.getAllStocks();
      res.json(stocks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stocks" });
    }
  });

  // Get stock by symbol
  app.get("/api/stocks/:symbol", async (req, res) => {
    try {
      const stock = await storage.getStock(req.params.symbol.toUpperCase());
      if (!stock) {
        return res.status(404).json({ message: "Stock not found" });
      }
      res.json(stock);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stock" });
    }
  });

  // Search stocks
  app.get("/api/stocks/search/:query", async (req, res) => {
    try {
      const stocks = await storage.searchStocks(req.params.query);
      res.json(stocks);
    } catch (error) {
      res.status(500).json({ message: "Failed to search stocks" });
    }
  });

  // Get historical data for a stock
  app.get("/api/stocks/:symbol/historical", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      const days = parseInt(req.query.days as string) || 30;
      const interval = (req.query.interval as string) || 'daily';
      
      let chartData: ChartDataPoint[] = [];
      
      // Try to get from AlphaVantage first
      try {
        const alphaVantageData = await alphaVantageService.getTimeSeries(symbol, interval as any);
        if (alphaVantageData.length > 0) {
          chartData = alphaVantageData.map(item => ({
            date: item.date,
            open: parseFloat(item.open),
            high: parseFloat(item.high),
            low: parseFloat(item.low),
            close: parseFloat(item.close),
            volume: parseInt(item.volume),
          }));
        }
      } catch (error) {
        console.error('AlphaVantage historical data error:', error);
      }
      
      // Fallback to simulated data if no AlphaVantage data
      if (chartData.length === 0) {
        chartData = await getHistoricalData(symbol, days);
      }
      
      res.json(chartData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch historical data" });
    }
  });

  // Get company overview
  app.get("/api/stocks/:symbol/overview", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      const overview = await alphaVantageService.getCompanyOverview(symbol);
      
      if (!overview) {
        return res.status(404).json({ message: "Company overview not found" });
      }
      
      res.json(overview);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch company overview" });
    }
  });

  // Get market indices
  app.get("/api/market/indices", async (req, res) => {
    try {
      const indices = await alphaVantageService.getMarketIndices();
      res.json(indices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch market indices" });
    }
  });

  // Get user portfolio
  app.get("/api/portfolio", async (req, res) => {
    try {
      const portfolio = await storage.getUserPortfolio(DEMO_USER_ID);
      res.json(portfolio);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  // Get portfolio summary
  app.get("/api/portfolio/summary", async (req, res) => {
    try {
      const summary = await storage.getPortfolioSummary(DEMO_USER_ID);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch portfolio summary" });
    }
  });

  // Get user info (cash balance, etc.)
  app.get("/api/user", async (req, res) => {
    try {
      const user = await storage.getUser(DEMO_USER_ID);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        id: user.id,
        username: user.username,
        cashBalance: user.cashBalance,
        preferences: user.preferences,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user preferences
  app.put("/api/user/preferences", async (req, res) => {
    try {
      const preferences = req.body;
      const user = await storage.updateUserPreferences(DEMO_USER_ID, preferences);
      res.json({ preferences: user.preferences });
    } catch (error) {
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  // Execute trade
  app.post("/api/trade", async (req, res) => {
    try {
      const tradeData = tradeOrderSchema.parse(req.body);
      
      const stock = await storage.getStock(tradeData.symbol);
      if (!stock) {
        return res.status(404).json({ message: "Stock not found" });
      }

      const user = await storage.getUser(DEMO_USER_ID);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const currentPrice = parseFloat(stock.currentPrice);
      const totalCost = currentPrice * tradeData.shares;

      if (tradeData.type === 'BUY') {
        // Check if user has enough cash
        if (parseFloat(user.cashBalance) < totalCost) {
          return res.status(400).json({ message: "Insufficient funds" });
        }

        // Deduct cash
        await storage.updateUserCash(DEMO_USER_ID, -totalCost);

        // Update or create portfolio position
        const existingPosition = await storage.getPortfolioPosition(DEMO_USER_ID, tradeData.symbol);
        
        if (existingPosition) {
          const newShares = existingPosition.shares + tradeData.shares;
          const newTotalCost = parseFloat(existingPosition.totalCost) + totalCost;
          const newAvgCost = newTotalCost / newShares;
          
          await storage.updatePortfolioPosition(
            existingPosition.id,
            newShares,
            newAvgCost,
            newTotalCost
          );
        } else {
          await storage.createPortfolioPosition({
            userId: DEMO_USER_ID,
            stockId: stock.id,
            symbol: tradeData.symbol,
            shares: tradeData.shares,
            avgCost: currentPrice.toFixed(2),
            totalCost: totalCost.toFixed(2),
          });
        }

      } else { // SELL
        const position = await storage.getPortfolioPosition(DEMO_USER_ID, tradeData.symbol);
        if (!position || position.shares < tradeData.shares) {
          return res.status(400).json({ message: "Insufficient shares" });
        }

        // Add cash
        await storage.updateUserCash(DEMO_USER_ID, totalCost);

        // Update portfolio position
        const newShares = position.shares - tradeData.shares;
        if (newShares === 0) {
          await storage.deletePortfolioPosition(position.id);
        } else {
          const newTotalCost = parseFloat(position.totalCost) - (parseFloat(position.avgCost) * tradeData.shares);
          await storage.updatePortfolioPosition(
            position.id,
            newShares,
            parseFloat(position.avgCost),
            newTotalCost
          );
        }
      }

      // Create transaction record
      await storage.createTransaction({
        userId: DEMO_USER_ID,
        stockId: stock.id,
        symbol: tradeData.symbol,
        type: tradeData.type,
        shares: tradeData.shares,
        price: currentPrice.toFixed(2),
        total: totalCost.toFixed(2),
        orderType: tradeData.orderType,
        limitPrice: tradeData.limitPrice ? tradeData.limitPrice.toFixed(2) : null,
        stopPrice: tradeData.stopPrice ? tradeData.stopPrice.toFixed(2) : null,
      });

      res.json({ 
        message: "Trade executed successfully",
        trade: {
          symbol: tradeData.symbol,
          type: tradeData.type,
          shares: tradeData.shares,
          price: currentPrice,
          total: totalCost,
        }
      });
    } catch (error) {
      console.error("Trade execution error:", error);
      res.status(500).json({ message: "Failed to execute trade" });
    }
  });

  // Get user transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const transactions = await storage.getUserTransactions(DEMO_USER_ID, limit);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Watchlist operations
  app.get("/api/watchlist", async (req, res) => {
    try {
      const watchlist = await storage.getUserWatchlist(DEMO_USER_ID);
      res.json(watchlist);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch watchlist" });
    }
  });

  app.post("/api/watchlist", async (req, res) => {
    try {
      const { symbol } = req.body;
      const stock = await storage.getStock(symbol);
      if (!stock) {
        return res.status(404).json({ message: "Stock not found" });
      }

      const watchlistItem = await storage.addToWatchlist({
        userId: DEMO_USER_ID,
        stockId: stock.id,
        symbol: symbol,
      });

      res.json(watchlistItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to add to watchlist" });
    }
  });

  app.delete("/api/watchlist/:symbol", async (req, res) => {
    try {
      await storage.removeFromWatchlist(DEMO_USER_ID, req.params.symbol.toUpperCase());
      res.json({ message: "Removed from watchlist" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove from watchlist" });
    }
  });

  // Alert operations
  app.get("/api/alerts", async (req, res) => {
    try {
      const alerts = await storage.getUserAlerts(DEMO_USER_ID);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      const alertData = alertSchema.parse(req.body);
      const alert = await storage.createAlert({
        userId: DEMO_USER_ID,
        symbol: alertData.symbol,
        type: alertData.type,
        value: alertData.value.toFixed(2),
      });
      res.json(alert);
    } catch (error) {
      res.status(500).json({ message: "Failed to create alert" });
    }
  });

  app.delete("/api/alerts/:id", async (req, res) => {
    try {
      await storage.deleteAlert(parseInt(req.params.id));
      res.json({ message: "Alert deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete alert" });
    }
  });

  // News operations
  app.get("/api/news", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const symbols = req.query.symbols ? (req.query.symbols as string).split(',') : undefined;
      
      const news = await storage.getNews(limit, symbols);
      res.json(news);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  app.get("/api/news/:symbol", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const news = await storage.getNewsBySymbol(req.params.symbol.toUpperCase(), limit);
      res.json(news);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  // Pending orders operations
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getUserPendingOrders(DEMO_USER_ID);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = tradeOrderSchema.parse(req.body);
      
      if (orderData.orderType === 'MARKET') {
        return res.status(400).json({ message: "Market orders are executed immediately" });
      }

      const stock = await storage.getStock(orderData.symbol);
      if (!stock) {
        return res.status(404).json({ message: "Stock not found" });
      }

      const order = await storage.createPendingOrder({
        userId: DEMO_USER_ID,
        symbol: orderData.symbol,
        type: orderData.type,
        shares: orderData.shares,
        orderType: orderData.orderType,
        limitPrice: orderData.limitPrice ? orderData.limitPrice.toFixed(2) : null,
        stopPrice: orderData.stopPrice ? orderData.stopPrice.toFixed(2) : null,
      });

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to create pending order" });
    }
  });

  app.delete("/api/orders/:id", async (req, res) => {
    try {
      await storage.deletePendingOrder(parseInt(req.params.id));
      res.json({ message: "Order cancelled" });
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel order" });
    }
  });

  return httpServer;
}

// Market simulation with AlphaVantage integration
function startMarketSimulation(connections: Set<WebSocket>) {
  const updateInterval = 10000; // 10 seconds

  setInterval(async () => {
    try {
      const marketPrices = await getMarketPrices();
      
      // Check for triggered alerts and pending orders
      for (const price of marketPrices) {
        const triggeredAlerts = await storage.checkAlerts(price.symbol, price.price);
        const triggeredOrders = await storage.checkPendingOrders(price.symbol, price.price);
        
        // Handle triggered alerts
        for (const alert of triggeredAlerts) {
          console.log(`Alert triggered: ${alert.symbol} ${alert.type} ${alert.value}`);
          // In a real app, you'd send notifications here
        }
        
        // Handle triggered orders
        for (const order of triggeredOrders) {
          console.log(`Order triggered: ${order.symbol} ${order.type} ${order.shares} shares`);
          // Execute the order
          // This would call the trade execution logic
        }
      }

      // Send updates to connected clients
      const message = {
        type: 'PRICE_UPDATE',
        data: marketPrices,
        timestamp: new Date().toISOString(),
      };

      connections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(message));
        }
      });
    } catch (error) {
      console.error('Market simulation error:', error);
    }
  }, updateInterval);
}

// Schedule regular market data updates
function scheduleMarketUpdates() {
  // Update market data every hour
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('Updating market data...');
      const stocks = await storage.getAllStocks();
      
      for (const stock of stocks) {
        const quote = await alphaVantageService.getQuote(stock.symbol);
        if (quote) {
          await storage.updateStockPrice(
            stock.symbol,
            parseFloat(quote.price),
            parseFloat(quote.change),
            parseFloat(quote.changePercent.replace('%', '')),
            {
              open: quote.open,
              high: quote.high,
              low: quote.low,
              volume: parseInt(quote.volume),
            }
          );
        }
      }
    } catch (error) {
      console.error('Market data update error:', error);
    }
  });

  // Fetch news every 4 hours
  cron.schedule('0 */4 * * *', async () => {
    try {
      console.log('Fetching news...');
      const news = await alphaVantageService.getNews(['AAPL', 'GOOGL', 'TSLA', 'MSFT', 'NVDA', 'AMZN'], ['earnings', 'technology'], 20);
      
      for (const newsItem of news) {
        await storage.createNews({
          title: newsItem.title,
          url: newsItem.url,
          summary: newsItem.summary,
          source: newsItem.source,
          publishedAt: new Date(newsItem.time_published),
          sentiment: newsItem.overall_sentiment_label.toLowerCase(),
          sentimentScore: newsItem.overall_sentiment_score.toFixed(2),
          relatedSymbols: newsItem.topics
            .filter(topic => ['AAPL', 'GOOGL', 'TSLA', 'MSFT', 'NVDA', 'AMZN'].includes(topic.topic))
            .map(topic => topic.topic),
          bannerImage: newsItem.banner_image,
        });
      }
    } catch (error) {
      console.error('News fetch error:', error);
    }
  });
}

async function getMarketPrices(): Promise<StockPrice[]> {
  try {
    // Try to get real data from AlphaVantage first
    const symbols = ['AAPL', 'GOOGL', 'TSLA', 'MSFT', 'NVDA', 'AMZN'];
    const prices: StockPrice[] = [];
    
    for (const symbol of symbols) {
      const quote = await alphaVantageService.getQuote(symbol);
      if (quote) {
        prices.push({
          symbol: quote.symbol,
          price: parseFloat(quote.price),
          change: parseFloat(quote.change),
          changePercent: parseFloat(quote.changePercent.replace('%', '')),
          open: parseFloat(quote.open),
          high: parseFloat(quote.high),
          low: parseFloat(quote.low),
          volume: parseInt(quote.volume),
          timestamp: new Date(),
        });
      }
    }
    
    if (prices.length > 0) {
      return prices;
    }
  } catch (error) {
    console.error('Failed to get real market prices:', error);
  }

  // Fallback to simulated data
  return getSimulatedMarketPrices();
}

function getSimulatedMarketPrices(): Promise<StockPrice[]> {
  return new Promise((resolve) => {
    const pythonProcess = spawn('python3', ['server/market-engine.py', 'get_prices']);
    let output = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const prices = JSON.parse(output);
          resolve(prices.map((p: any) => ({
            ...p,
            timestamp: new Date(),
          })));
        } catch (error) {
          console.error('Failed to parse market prices:', error);
          resolve([]);
        }
      } else {
        console.error('Market engine failed with code:', code);
        resolve([]);
      }
    });
  });
}

async function getHistoricalData(symbol: string, days: number): Promise<ChartDataPoint[]> {
  try {
    // Try to get real historical data from AlphaVantage
    const data = await alphaVantageService.getTimeSeries(symbol, 'daily');
    if (data.length > 0) {
      return data.slice(-days).map(item => ({
        date: item.date,
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: parseInt(item.volume),
      }));
    }
  } catch (error) {
    console.error('Failed to get real historical data:', error);
  }

  // Fallback to simulated data
  return new Promise((resolve) => {
    const pythonProcess = spawn('python3', ['server/market-engine.py', 'get_historical', symbol, days.toString()]);
    let output = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const data = JSON.parse(output);
          resolve(data);
        } catch (error) {
          console.error('Failed to parse historical data:', error);
          resolve([]);
        }
      } else {
        console.error('Market engine failed with code:', code);
        resolve([]);
      }
    });
  });
}
