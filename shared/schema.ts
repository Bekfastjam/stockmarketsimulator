import { pgTable, text, serial, integer, boolean, decimal, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  cashBalance: decimal("cash_balance", { precision: 12, scale: 2 }).notNull().default("100000.00"),
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
  preferences: json("preferences").$type<{
    theme: 'light' | 'dark' | 'system';
    defaultTimeframe: '1D' | '1W' | '1M' | '3M' | '1Y';
    notifications: boolean;
  }>(),
});

export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }).notNull(),
  previousClose: decimal("previous_close", { precision: 10, scale: 2 }).notNull(),
  change: decimal("change", { precision: 10, scale: 2 }).notNull(),
  changePercent: decimal("change_percent", { precision: 5, scale: 2 }).notNull(),
  open: decimal("open", { precision: 10, scale: 2 }),
  high: decimal("high", { precision: 10, scale: 2 }),
  low: decimal("low", { precision: 10, scale: 2 }),
  volume: integer("volume"),
  marketCap: decimal("market_cap", { precision: 15, scale: 2 }),
  peRatio: decimal("pe_ratio", { precision: 8, scale: 2 }),
  dividendYield: decimal("dividend_yield", { precision: 5, scale: 2 }),
  sector: text("sector"),
  industry: text("industry"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  stockId: integer("stock_id").notNull(),
  symbol: text("symbol").notNull(),
  shares: integer("shares").notNull(),
  avgCost: decimal("avg_cost", { precision: 10, scale: 2 }).notNull(),
  totalCost: decimal("total_cost", { precision: 12, scale: 2 }).notNull(),
  unrealizedPL: decimal("unrealized_pl", { precision: 12, scale: 2 }).default("0.00"),
  unrealizedPLPercent: decimal("unrealized_pl_percent", { precision: 5, scale: 2 }).default("0.00"),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  stockId: integer("stock_id").notNull(),
  symbol: text("symbol").notNull(),
  type: text("type").notNull(), // 'BUY' or 'SELL'
  shares: integer("shares").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  orderType: text("order_type").notNull().default('MARKET'), // 'MARKET', 'LIMIT', 'STOP'
  limitPrice: decimal("limit_price", { precision: 10, scale: 2 }),
  stopPrice: decimal("stop_price", { precision: 10, scale: 2 }),
  status: text("status").notNull().default('COMPLETED'), // 'PENDING', 'COMPLETED', 'CANCELLED'
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const watchlist = pgTable("watchlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  stockId: integer("stock_id").notNull(),
  symbol: text("symbol").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  symbol: text("symbol").notNull(),
  type: text("type").notNull(), // 'PRICE_ABOVE', 'PRICE_BELOW', 'PERCENT_CHANGE'
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  triggeredAt: timestamp("triggered_at"),
});

export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  summary: text("summary"),
  source: text("source").notNull(),
  publishedAt: timestamp("published_at").notNull(),
  sentiment: text("sentiment"), // 'positive', 'negative', 'neutral'
  sentimentScore: decimal("sentiment_score", { precision: 3, scale: 2 }),
  relatedSymbols: json("related_symbols").$type<string[]>(),
  bannerImage: text("banner_image"),
});

export const marketData = pgTable("market_data", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  date: timestamp("date").notNull(),
  open: decimal("open", { precision: 10, scale: 2 }).notNull(),
  high: decimal("high", { precision: 10, scale: 2 }).notNull(),
  low: decimal("low", { precision: 10, scale: 2 }).notNull(),
  close: decimal("close", { precision: 10, scale: 2 }).notNull(),
  volume: integer("volume").notNull(),
  interval: text("interval").notNull().default('daily'), // 'daily', 'weekly', 'monthly'
});

export const pendingOrders = pgTable("pending_orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  symbol: text("symbol").notNull(),
  type: text("type").notNull(), // 'BUY' or 'SELL'
  shares: integer("shares").notNull(),
  orderType: text("order_type").notNull(), // 'LIMIT', 'STOP', 'STOP_LIMIT'
  limitPrice: decimal("limit_price", { precision: 10, scale: 2 }),
  stopPrice: decimal("stop_price", { precision: 10, scale: 2 }),
  status: text("status").notNull().default('PENDING'), // 'PENDING', 'FILLED', 'CANCELLED'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLogin: true,
});

export const insertStockSchema = createInsertSchema(stocks).omit({
  id: true,
  lastUpdated: true,
});

export const insertPortfolioSchema = createInsertSchema(portfolios).omit({
  id: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  timestamp: true,
});

export const insertWatchlistSchema = createInsertSchema(watchlist).omit({
  id: true,
  addedAt: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
  triggeredAt: true,
});

export const insertNewsSchema = createInsertSchema(news).omit({
  id: true,
});

export const insertMarketDataSchema = createInsertSchema(marketData).omit({
  id: true,
});

export const insertPendingOrderSchema = createInsertSchema(pendingOrders).omit({
  id: true,
  createdAt: true,
});

// Trade order schema
export const tradeOrderSchema = z.object({
  symbol: z.string().min(1).max(10),
  type: z.enum(['BUY', 'SELL']),
  shares: z.number().min(1),
  orderType: z.enum(['MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT']).default('MARKET'),
  limitPrice: z.number().optional(),
  stopPrice: z.number().optional(),
});

// Alert schema
export const alertSchema = z.object({
  symbol: z.string().min(1).max(10),
  type: z.enum(['PRICE_ABOVE', 'PRICE_BELOW', 'PERCENT_CHANGE']),
  value: z.number().positive(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Stock = typeof stocks.$inferSelect;
export type InsertStock = z.infer<typeof insertStockSchema>;

export type Portfolio = typeof portfolios.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Watchlist = typeof watchlist.$inferSelect;
export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;

export type MarketData = typeof marketData.$inferSelect;
export type InsertMarketData = z.infer<typeof insertMarketDataSchema>;

export type PendingOrder = typeof pendingOrders.$inferSelect;
export type InsertPendingOrder = z.infer<typeof insertPendingOrderSchema>;

export type TradeOrder = z.infer<typeof tradeOrderSchema>;
export type AlertRequest = z.infer<typeof alertSchema>;

// Portfolio summary types
export type PortfolioSummary = {
  totalValue: number;
  dailyPL: number;
  totalPL: number;
  dailyPLPercent: number;
  totalPLPercent: number;
  openPositions: number;
  cashBalance: number;
  totalInvested: number;
};

export type StockPrice = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
  timestamp: Date;
};

export type MarketIndex = {
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
};

export type ChartDataPoint = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};
