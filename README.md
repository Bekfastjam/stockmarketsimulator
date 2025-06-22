# 🚀 Stock Market Simulator v2.0

A comprehensive, real-time stock market simulation platform built with **JavaScript/Node.js** and **React**. Features real market data integration, advanced trading capabilities, and a modern, responsive UI.

## ✨ Features

### 📊 **Real-Time Market Data**
- **AlphaVantage API Integration** - Live stock quotes and market data
- **Real-time price updates** every 30 seconds
- **Market indices** (SPY, QQQ, IWM) tracking
- **Historical data** and price charts
- **Fallback simulation** when API is unavailable

### 💼 **Advanced Trading System**
- **Market, Limit, and Stop Orders**
- **Real-time portfolio tracking**
- **Buy/Sell functionality** with balance management
- **Transaction history** with detailed records
- **Portfolio analytics** (gains/losses, performance metrics)

### 🔔 **Smart Alerts & Notifications**
- **Price alerts** (above/below target prices)
- **Real-time notifications** via WebSocket
- **Alert management** (create, edit, delete)
- **Email-style notifications** with toast messages

### 📰 **Market Intelligence**
- **Real-time news feed** with sentiment analysis
- **Company overviews** and financial data
- **Market sentiment** indicators
- **News filtering** by tickers and topics

### 👀 **Watchlist Management**
- **Custom watchlists** with real-time updates
- **Add/remove stocks** dynamically
- **Price tracking** with change indicators
- **Quick access** to favorite stocks

### 📱 **Modern UI/UX**
- **Responsive design** (mobile-first approach)
- **Dark/Light mode** support
- **Real-time updates** without page refresh
- **Intuitive navigation** with sidebar
- **Beautiful charts** and data visualization

### 🔧 **Technical Features**
- **WebSocket connections** for real-time updates
- **In-memory database** for Replit compatibility
- **Scheduled tasks** (market updates, news, alerts)
- **Error handling** and fallback mechanisms
- **Performance optimized** with React Query

## 🏗️ Architecture

### **Frontend (React)**
- **React 18** with modern hooks
- **React Query** for data fetching and caching
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Wouter** for routing

### **Backend (Node.js)**
- **Express.js** server
- **WebSocket** for real-time communication
- **Node-cron** for scheduled tasks
- **Axios** for API requests
- **In-memory storage** for data persistence

### **External APIs**
- **AlphaVantage** for market data
- **Python market engine** for simulation fallback

## 🚀 Quick Start

### **For Replit Deployment**

1. **Fork/Clone** this repository to Replit
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the development server**:
   ```bash
   npm run dev
   ```
4. **Access the application** at your Replit URL

### **For Local Development**

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd stockmarketsimulator-2
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:5000`

## 📁 Project Structure

```
stockmarketsimulator-2/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   └── main.jsx       # Entry point
│   └── index.html
├── server/                # Node.js backend
│   ├── services/          # API services
│   ├── index.js          # Server entry point
│   ├── routes.js         # API routes
│   ├── storage.js        # Data storage
│   └── vite.js           # Vite configuration
├── shared/               # Shared schemas
└── package.json
```

## 🔧 Configuration

### **Environment Variables**
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `ALPHA_VANTAGE_API_KEY` - Your AlphaVantage API key

### **API Keys**
The application includes a demo AlphaVantage API key. For production use, get your own key from [AlphaVantage](https://www.alphavantage.co/).

## 📊 Demo Data

The application comes with pre-loaded demo data:
- **Demo User**: `demo` / `demo123`
- **Starting Balance**: $100,000
- **Sample Holdings**: AAPL, GOOGL, TSLA
- **Sample Watchlist**: MSFT, AMZN, NVDA, META, NFLX
- **Sample Alerts**: Price alerts for AAPL and TSLA

## 🎯 Key Features Explained

### **Real-Time Trading**
- Execute buy/sell orders instantly
- Real-time balance updates
- Portfolio value calculations
- Transaction history tracking

### **Market Data Integration**
- Live stock quotes from AlphaVantage
- Fallback to Python simulation engine
- Historical price data
- Market indices tracking

### **Smart Alerts**
- Set price targets for any stock
- Real-time alert notifications
- Alert management interface
- WebSocket-powered updates

### **News & Sentiment**
- Real-time market news
- Sentiment analysis
- Company-specific news filtering
- Market impact indicators

## 🔒 Security Features

- **Input validation** on all forms
- **Error handling** for API failures
- **Rate limiting** for external APIs
- **Secure WebSocket connections**
- **Data sanitization**

## 📱 Mobile Responsiveness

- **Mobile-first design**
- **Touch-friendly interface**
- **Responsive charts**
- **Optimized for all screen sizes**

## 🚀 Deployment

### **Replit (Recommended)**
1. Import the repository to Replit
2. The `.replit` file is already configured
3. Click "Run" to start the application

### **Vercel/Netlify**
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Configure environment variables

### **Heroku**
1. Add a `Procfile` with: `web: npm start`
2. Set environment variables
3. Deploy using Heroku CLI

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **AlphaVantage** for market data API
- **React Query** for data management
- **Tailwind CSS** for styling
- **Lucide** for beautiful icons

## 📞 Support

For support or questions:
- Create an issue on GitHub
- Check the documentation
- Review the code comments

---

**Built with ❤️ for the trading community** 