import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { storageService } from './storage.js';
import { alphaVantageService } from './services/alphavantage.js';
import cron from 'node-cron';

export async function registerRoutes(app) {
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  // WebSocket connections
  const clients = new Set();

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected');

    ws.on('close', () => {
      clients.delete(ws);
      console.log('Client disconnected');
    });
  });

  // Broadcast to all connected clients
  const broadcast = (data) => {
    clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(data));
      }
    });
  };

  // Scheduled tasks
  cron.schedule('*/30 * * * * *', async () => {
    try {
      // Update market data every 30 seconds
      const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX'];
      const marketData = await storageService.getSimulatedMarketData(symbols);
      
      // Update portfolio values for all users
      const users = Array.from(storageService.db?.users?.values() || []);
      for (const user of users) {
        await storageService.updatePortfolioValues(user.id);
      }

      // Broadcast market updates
      broadcast({
        type: 'MARKET_UPDATE',
        data: marketData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Scheduled task error:', error);
    }
  });

  // Update news every 5 minutes
  cron.schedule('0 */5 * * * *', async () => {
    try {
      const news = await alphaVantageService.getNews(['AAPL', 'GOOGL', 'MSFT', 'TSLA'], ['technology', 'earnings']);
      await storageService.setNews(news);
      
      broadcast({
        type: 'NEWS_UPDATE',
        data: news,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('News update error:', error);
    }
  });

  // Check price alerts every minute
  cron.schedule('0 * * * * *', async () => {
    try {
      const alerts = Array.from(storageService.db?.alerts?.values() || []);
      
      for (const alert of alerts) {
        if (!alert.isActive) continue;
        
        const marketData = await storageService.getMarketData(alert.symbol);
        if (!marketData) continue;
        
        const currentPrice = parseFloat(marketData.price);
        const targetPrice = parseFloat(alert.targetPrice);
        
        let shouldTrigger = false;
        
        if (alert.type === 'PRICE_ABOVE' && currentPrice >= targetPrice) {
          shouldTrigger = true;
        } else if (alert.type === 'PRICE_BELOW' && currentPrice <= targetPrice) {
          shouldTrigger = true;
        }
        
        if (shouldTrigger) {
          // Deactivate alert
          await storageService.updateAlert(alert.id, { isActive: false });
          
          // Broadcast alert
          broadcast({
            type: 'PRICE_ALERT',
            data: {
              alertId: alert.id,
              symbol: alert.symbol,
              currentPrice,
              targetPrice,
              type: alert.type,
            },
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error('Alert check error:', error);
    }
  });

  // API Routes

  // Authentication
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      const user = await storageService.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      res.json({
        user: {
          id: user.id,
          username: user.username,
          balance: user.balance,
        },
        message: 'Login successful',
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      const existingUser = await storageService.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      const user = await storageService.createUser({
        username,
        password,
        balance: 100000, // Starting balance
      });

      res.json({
        user: {
          id: user.id,
          username: user.username,
          balance: user.balance,
        },
        message: 'Registration successful',
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // User data
  app.get('/api/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storageService.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: user.id,
        username: user.username,
        balance: user.balance,
        createdAt: user.createdAt,
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Portfolio
  app.get('/api/portfolio/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const portfolio = await storageService.getPortfolio(userId);
      
      if (!portfolio) {
        return res.json({
          holdings: [],
          totalValue: 0,
          totalGainLoss: 0,
          totalGainLossPercent: 0,
        });
      }

      // Update portfolio values with current market data
      const updatedPortfolio = await storageService.updatePortfolioValues(userId);
      res.json(updatedPortfolio);
    } catch (error) {
      console.error('Get portfolio error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Transactions
  app.get('/api/transactions/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = 50 } = req.query;
      
      const transactions = await storageService.getTransactions(userId, parseInt(limit));
      res.json(transactions);
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Trading
  app.post('/api/trade', async (req, res) => {
    try {
      const { userId, symbol, type, shares, price, orderType = 'MARKET' } = req.body;
      
      if (!userId || !symbol || !type || !shares || !price) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const user = await storageService.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const totalCost = shares * price;
      
      if (type === 'BUY') {
        if (user.balance < totalCost) {
          return res.status(400).json({ error: 'Insufficient funds' });
        }
        
        // Update user balance
        await storageService.updateUser(userId, { balance: user.balance - totalCost });
        
        // Add to portfolio
        await storageService.addHolding(userId, symbol, shares, price);
      } else if (type === 'SELL') {
        const portfolio = await storageService.getPortfolio(userId);
        const holding = portfolio?.holdings?.find(h => h.symbol === symbol);
        
        if (!holding || holding.shares < shares) {
          return res.status(400).json({ error: 'Insufficient shares' });
        }
        
        // Update user balance
        await storageService.updateUser(userId, { balance: user.balance + totalCost });
        
        // Remove from portfolio
        await storageService.removeHolding(userId, symbol, shares);
      }

      // Record transaction
      const transaction = await storageService.addTransaction({
        userId,
        symbol,
        type,
        shares,
        price,
        total: totalCost,
        orderType,
      });

      // Update portfolio values
      const updatedPortfolio = await storageService.updatePortfolioValues(userId);
      
      // Broadcast trade update
      broadcast({
        type: 'TRADE_UPDATE',
        data: {
          userId,
          transaction,
          portfolio: updatedPortfolio,
        },
        timestamp: new Date().toISOString(),
      });

      res.json({
        transaction,
        portfolio: updatedPortfolio,
        message: `${type} order executed successfully`,
      });
    } catch (error) {
      console.error('Trade error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Market data
  app.get('/api/market/quote/:symbol', async (req, res) => {
    try {
      const { symbol } = req.params;
      
      // Try to get real data first
      let quote = await alphaVantageService.getQuote(symbol);
      
      if (!quote) {
        // Fallback to simulated data
        quote = await storageService.generateSimulatedQuote(symbol);
      }
      
      if (quote) {
        await storageService.setMarketData(symbol, quote);
      }
      
      res.json(quote);
    } catch (error) {
      console.error('Get quote error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/market/quotes', async (req, res) => {
    try {
      const { symbols } = req.query;
      const symbolList = symbols ? symbols.split(',') : ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'];
      
      const quotes = await storageService.getSimulatedMarketData(symbolList);
      res.json(quotes);
    } catch (error) {
      console.error('Get quotes error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/market/history/:symbol', async (req, res) => {
    try {
      const { symbol } = req.params;
      const { interval = 'daily' } = req.query;
      
      const history = await alphaVantageService.getTimeSeries(symbol, interval);
      res.json(history);
    } catch (error) {
      console.error('Get history error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/market/indices', async (req, res) => {
    try {
      const indices = await alphaVantageService.getMarketIndices();
      res.json(indices);
    } catch (error) {
      console.error('Get indices error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/market/search', async (req, res) => {
    try {
      const { keywords } = req.query;
      
      if (!keywords) {
        return res.status(400).json({ error: 'Keywords are required' });
      }
      
      const results = await alphaVantageService.searchStocks(keywords);
      res.json(results);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Watchlist
  app.get('/api/watchlist/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const watchlist = await storageService.getWatchlist(userId);
      
      if (!watchlist) {
        return res.json({ symbols: [] });
      }
      
      res.json(watchlist);
    } catch (error) {
      console.error('Get watchlist error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/watchlist/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { symbols } = req.body;
      
      const watchlist = await storageService.updateWatchlist(userId, symbols);
      res.json(watchlist);
    } catch (error) {
      console.error('Update watchlist error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/watchlist/:userId/add', async (req, res) => {
    try {
      const { userId } = req.params;
      const { symbol } = req.body;
      
      const watchlist = await storageService.addToWatchlist(userId, symbol);
      res.json(watchlist);
    } catch (error) {
      console.error('Add to watchlist error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/watchlist/:userId/:symbol', async (req, res) => {
    try {
      const { userId, symbol } = req.params;
      
      const watchlist = await storageService.removeFromWatchlist(userId, symbol);
      res.json(watchlist);
    } catch (error) {
      console.error('Remove from watchlist error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Alerts
  app.get('/api/alerts/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const alerts = await storageService.getAlerts(userId);
      res.json(alerts);
    } catch (error) {
      console.error('Get alerts error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/alerts/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { symbol, type, targetPrice } = req.body;
      
      if (!symbol || !type || !targetPrice) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const alert = await storageService.createAlert({
        userId,
        symbol,
        type,
        targetPrice: parseFloat(targetPrice),
      });
      
      res.json(alert);
    } catch (error) {
      console.error('Create alert error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/alerts/:alertId', async (req, res) => {
    try {
      const { alertId } = req.params;
      const updates = req.body;
      
      const alert = await storageService.updateAlert(alertId, updates);
      if (!alert) {
        return res.status(404).json({ error: 'Alert not found' });
      }
      
      res.json(alert);
    } catch (error) {
      console.error('Update alert error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/alerts/:alertId', async (req, res) => {
    try {
      const { alertId } = req.params;
      
      const deleted = await storageService.deleteAlert(alertId);
      if (!deleted) {
        return res.status(404).json({ error: 'Alert not found' });
      }
      
      res.json({ message: 'Alert deleted successfully' });
    } catch (error) {
      console.error('Delete alert error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Orders
  app.get('/api/orders/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const orders = await storageService.getOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/orders/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { symbol, type, shares, price, orderType } = req.body;
      
      if (!symbol || !type || !shares || !price || !orderType) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const order = await storageService.createOrder({
        userId,
        symbol,
        type,
        shares: parseInt(shares),
        price: parseFloat(price),
        orderType,
      });
      
      res.json(order);
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // News
  app.get('/api/news', async (req, res) => {
    try {
      const { tickers, topics, limit = 20 } = req.query;
      
      let news = await storageService.getNews();
      
      if (news.length === 0) {
        // Fetch fresh news
        const tickerList = tickers ? tickers.split(',') : ['AAPL', 'GOOGL', 'MSFT', 'TSLA'];
        const topicList = topics ? topics.split(',') : ['technology', 'earnings'];
        
        news = await alphaVantageService.getNews(tickerList, topicList, parseInt(limit));
        await storageService.setNews(news);
      }
      
      res.json(news);
    } catch (error) {
      console.error('Get news error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Company info
  app.get('/api/company/:symbol', async (req, res) => {
    try {
      const { symbol } = req.params;
      
      const overview = await alphaVantageService.getCompanyOverview(symbol);
      res.json(overview);
    } catch (error) {
      console.error('Get company info error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      features: [
        'Real-time market data',
        'Portfolio management',
        'Trading simulation',
        'Price alerts',
        'News feed',
        'Watchlists',
        'Advanced orders',
      ],
    });
  });

  return server;
} 