import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { spawn } from "child_process";
import { storage } from "./storage";
import { tradeOrderSchema, type TradeOrder, type StockPrice } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time price updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Store active WebSocket connections
  const activeConnections = new Set<WebSocket>();

  // Start market simulation
  startMarketSimulation(activeConnections);

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

  // Get historical data for a stock
  app.get("/api/stocks/:symbol/historical", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      const days = parseInt(req.query.days as string) || 30;
      
      const historicalData = await getHistoricalData(symbol, days);
      res.json(historicalData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch historical data" });
    }
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
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
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

      // Record transaction
      await storage.createTransaction({
        userId: DEMO_USER_ID,
        stockId: stock.id,
        symbol: tradeData.symbol,
        type: tradeData.type,
        shares: tradeData.shares,
        price: currentPrice.toFixed(2),
        total: totalCost.toFixed(2),
      });

      res.json({ message: "Trade executed successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid trade data", errors: error.errors });
      }
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

  // Get user watchlist
  app.get("/api/watchlist", async (req, res) => {
    try {
      const watchlist = await storage.getUserWatchlist(DEMO_USER_ID);
      res.json(watchlist);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch watchlist" });
    }
  });

  // Add to watchlist
  app.post("/api/watchlist", async (req, res) => {
    try {
      const { symbol } = req.body;
      if (!symbol) {
        return res.status(400).json({ message: "Symbol is required" });
      }

      const stock = await storage.getStock(symbol.toUpperCase());
      if (!stock) {
        return res.status(404).json({ message: "Stock not found" });
      }

      const watchlistItem = await storage.addToWatchlist({
        userId: DEMO_USER_ID,
        stockId: stock.id,
        symbol: symbol.toUpperCase(),
      });

      res.json(watchlistItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to add to watchlist" });
    }
  });

  // Remove from watchlist
  app.delete("/api/watchlist/:symbol", async (req, res) => {
    try {
      await storage.removeFromWatchlist(DEMO_USER_ID, req.params.symbol.toUpperCase());
      res.json({ message: "Removed from watchlist" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove from watchlist" });
    }
  });

  return httpServer;
}

function startMarketSimulation(connections: Set<WebSocket>) {
  // Update prices every 5 seconds
  setInterval(async () => {
    try {
      const priceUpdates = await getMarketPrices();
      
      // Update prices in storage
      for (const update of priceUpdates) {
        await storage.updateStockPrice(
          update.symbol,
          update.price,
          update.change,
          update.changePercent
        );
      }

      // Broadcast to connected clients
      const message = JSON.stringify({
        type: 'PRICE_UPDATE',
        data: priceUpdates
      });

      connections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });
    } catch (error) {
      console.error('Market simulation error:', error);
    }
  }, 5000);
}

function getMarketPrices(): Promise<StockPrice[]> {
  return new Promise((resolve, reject) => {
    const python = spawn('python3', ['server/market-engine.py', 'get_prices']);
    let output = '';

    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      console.error('Python error:', data.toString());
    });

    python.on('close', (code) => {
      if (code === 0) {
        try {
          const prices = JSON.parse(output);
          resolve(prices.map((p: any) => ({
            symbol: p.symbol,
            price: p.price,
            change: p.change,
            changePercent: p.changePercent,
            timestamp: new Date(p.timestamp)
          })));
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error(`Python process exited with code ${code}`));
      }
    });
  });
}

function getHistoricalData(symbol: string, days: number): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const python = spawn('python3', ['server/market-engine.py', 'get_historical', symbol, days.toString()]);
    let output = '';

    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      console.error('Python error:', data.toString());
    });

    python.on('close', (code) => {
      if (code === 0) {
        try {
          const data = JSON.parse(output);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error(`Python process exited with code ${code}`));
      }
    });
  });
}
