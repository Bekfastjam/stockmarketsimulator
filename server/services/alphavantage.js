import axios from 'axios';

class AlphaVantageService {
  constructor() {
    this.apiKey = process.env.ALPHA_VANTAGE_API_KEY || 'F79LIF1JLYSZLGHH';
    this.baseUrl = 'https://www.alphavantage.co/query';
    this.timeout = 5000; // Reduced timeout to 5 seconds
  }

  async makeRequest(params) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          ...params,
          apikey: this.apiKey,
        },
        timeout: this.timeout,
      });
      
      return response.data;
    } catch (error) {
      console.error(`AlphaVantage API error for ${params.function}:`, error.message);
      return null;
    }
  }

  async getQuote(symbol) {
    try {
      const data = await this.makeRequest({
        function: 'GLOBAL_QUOTE',
        symbol: symbol,
      });

      if (!data || data['Error Message'] || data['Note']) {
        console.log(`No real data available for ${symbol}, using simulation`);
        return null;
      }

      const quote = data['Global Quote'];
      if (!quote || !quote['05. price']) {
        return null;
      }

      return {
        symbol: quote['01. symbol'],
        open: quote['02. open'],
        high: quote['03. high'],
        low: quote['04. low'],
        price: quote['05. price'],
        volume: quote['06. volume'],
        latestTradingDay: quote['07. latest trading day'],
        previousClose: quote['08. previous close'],
        change: quote['09. change'],
        changePercent: quote['10. change percent'],
      };
    } catch (error) {
      console.error(`Failed to get quote for ${symbol}:`, error.message);
      return null;
    }
  }

  async getTimeSeries(symbol, interval = 'daily') {
    try {
      const functionMap = {
        daily: 'TIME_SERIES_DAILY',
        weekly: 'TIME_SERIES_WEEKLY',
        monthly: 'TIME_SERIES_MONTHLY',
      };

      const data = await this.makeRequest({
        function: functionMap[interval],
        symbol: symbol.toUpperCase(),
        outputsize: 'compact',
      });

      const timeSeriesKey = Object.keys(data).find(key => key.includes('Time Series'));
      if (!timeSeriesKey) return [];

      const timeSeries = data[timeSeriesKey];
      const result = [];

      for (const [date, values] of Object.entries(timeSeries)) {
        const v = values;
        result.push({
          date,
          open: v['1. open'],
          high: v['2. high'],
          low: v['3. low'],
          close: v['4. close'],
          volume: v['5. volume'],
        });
      }

      return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error) {
      console.error(`Failed to get time series for ${symbol}:`, error);
      return [];
    }
  }

  async getNews(symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA']) {
    try {
      const allNews = [];
      
      for (const symbol of symbols.slice(0, 2)) { // Limit to 2 symbols to avoid rate limits
        const data = await this.makeRequest({
          function: 'NEWS_SENTIMENT',
          tickers: symbol,
          limit: 5,
        });

        if (data && data.feed && !data['Error Message'] && !data['Note']) {
          const newsItems = data.feed.map(item => ({
            id: item.uuid,
            title: item.title,
            summary: item.summary,
            url: item.url,
            publishedAt: item.time_published,
            source: item.source,
            sentiment: item.overall_sentiment_label,
            relevanceScore: item.relevance_score,
            symbol: symbol,
          }));
          
          allNews.push(...newsItems);
        }
      }

      return allNews.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    } catch (error) {
      console.error('Failed to get news:', error.message);
      return [];
    }
  }

  async getMarketIndices() {
    try {
      const indices = ['SPY', 'QQQ', 'IWM']; // S&P 500, NASDAQ, Russell 2000
      const results = [];

      for (const symbol of indices) {
        const quote = await this.getQuote(symbol);
        if (quote) {
          results.push({
            symbol,
            name: this.getIndexName(symbol),
            price: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Failed to get market indices:', error.message);
      return [];
    }
  }

  getIndexName(symbol) {
    const names = {
      'SPY': 'S&P 500 ETF',
      'QQQ': 'NASDAQ-100 ETF',
      'IWM': 'Russell 2000 ETF',
    };
    return names[symbol] || symbol;
  }

  async searchStocks(keywords) {
    try {
      const data = await this.makeRequest({
        function: 'SYMBOL_SEARCH',
        keywords: keywords.toUpperCase(),
      });

      const matches = data.bestMatches || [];
      return matches.map((match) => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
      }));
    } catch (error) {
      console.error('Failed to search stocks:', error);
      return [];
    }
  }

  async getCompanyOverview(symbol) {
    try {
      const data = await this.makeRequest({
        function: 'OVERVIEW',
        symbol: symbol.toUpperCase(),
      });

      return data;
    } catch (error) {
      console.error(`Failed to get company overview for ${symbol}:`, error);
      return null;
    }
  }
}

export const alphaVantageService = new AlphaVantageService(); 