# StockSim Pro - Virtual Stock Trading Platform

## Overview
StockSim Pro is a full-stack virtual stock trading platform that allows users to trade stocks with simulated money in a realistic market environment. The application features real-time stock price updates, portfolio management, trading capabilities, and comprehensive tracking of user transactions.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite for development and production builds
- **Real-time Updates**: WebSocket connection for live stock prices

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Market Simulation**: Python script for realistic stock price generation
- **Real-time Communication**: WebSocket server for broadcasting price updates
- **Session Management**: Express sessions with PostgreSQL store

## Key Components

### Database Layer (Drizzle ORM)
- **Users**: Store user accounts with cash balance and authentication
- **Stocks**: Real-time stock data with current prices and historical changes
- **Portfolios**: User stock holdings with average cost basis tracking
- **Transactions**: Complete history of all buy/sell operations
- **Watchlist**: User-curated list of stocks to monitor

### Market Engine
- **Python-based simulation**: Generates realistic price movements with volatility and trends
- **WebSocket broadcasting**: Real-time price updates to all connected clients
- **Stock data management**: Maintains current prices, changes, and percentage movements

### Trading System
- **Order validation**: Ensures users have sufficient funds and shares
- **Portfolio management**: Automatic calculation of average cost basis and profit/loss
- **Transaction logging**: Complete audit trail of all trading activity

### User Interface Components
- **Dashboard**: Main trading interface with portfolio overview
- **Real-time charts**: Live price visualization with HTML5 Canvas
- **Quick trade**: Simplified buy/sell interface
- **Holdings view**: Detailed portfolio positions with P&L calculations
- **Transaction history**: Complete trading history with filtering

## Data Flow

1. **Market Data**: Python market engine generates realistic price movements
2. **Price Updates**: WebSocket server broadcasts real-time prices to all clients
3. **User Actions**: Frontend sends trading requests to Express API
4. **Trade Execution**: Server validates and executes trades, updating database
5. **Portfolio Updates**: Real-time portfolio calculations based on current prices
6. **Client Updates**: React Query automatically refetches affected data

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database queries and migrations
- **express**: Web server framework
- **ws**: WebSocket implementation for real-time communication
- **react**: Frontend framework with hooks and context
- **@tanstack/react-query**: Server state management
- **tailwindcss**: Utility-first CSS framework

### UI Components
- **@radix-ui**: Headless UI primitives for accessibility
- **shadcn/ui**: Pre-built component library
- **lucide-react**: Icon library
- **class-variance-authority**: Component variant management

## Deployment Strategy

### Development Environment
- **Replit Integration**: Configured for Replit development environment
- **Hot Module Replacement**: Vite HMR for rapid development
- **PostgreSQL**: Built-in database provisioning
- **WebSocket Support**: Real-time development testing

### Production Build
- **Vite Build**: Optimized client-side bundle generation
- **ESBuild**: Server-side bundling for Node.js deployment
- **Static Assets**: Served from Express with proper caching headers
- **Environment Variables**: Database URL and configuration management

### Scaling Considerations
- **Database**: PostgreSQL with connection pooling
- **WebSocket**: Single server instance with horizontal scaling potential
- **Market Data**: Python process can be scaled independently
- **Caching**: React Query provides client-side caching for performance

## Changelog
- June 22, 2025. Initial setup

## User Preferences
Preferred communication style: Simple, everyday language.