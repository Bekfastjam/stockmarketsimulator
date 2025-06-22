import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  cashBalance: decimal("cash_balance", { precision: 12, scale: 2 }).notNull().default("100000.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }).notNull(),
  previousClose: decimal("previous_close", { precision: 10, scale: 2 }).notNull(),
  change: decimal("change", { precision: 10, scale: 2 }).notNull(),
  changePercent: decimal("change_percent", { precision: 5, scale: 2 }).notNull(),
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
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const watchlist = pgTable("watchlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  stockId: integer("stock_id").notNull(),
  symbol: text("symbol").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
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
});

// Trade order schema
export const tradeOrderSchema = z.object({
  symbol: z.string().min(1).max(10),
  type: z.enum(['BUY', 'SELL']),
  shares: z.number().min(1),
  orderType: z.enum(['MARKET', 'LIMIT', 'STOP']).default('MARKET'),
  limitPrice: z.number().optional(),
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

export type TradeOrder = z.infer<typeof tradeOrderSchema>;

// Portfolio summary types
export type PortfolioSummary = {
  totalValue: number;
  dailyPL: number;
  totalPL: number;
  dailyPLPercent: number;
  totalPLPercent: number;
  openPositions: number;
};

export type StockPrice = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: Date;
};
