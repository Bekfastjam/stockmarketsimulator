import axios from 'axios';

const ALPHA_VANTAGE_API_KEY = 'F79LIF1JLYSZLGHH';
const BASE_URL = 'https://www.alphavantage.co/query';

export interface AlphaVantageQuote {
  symbol: string;
  open: string;
  high: string;
  low: string;
  price: string;
  volume: string;
  latestTradingDay: string;
  previousClose: string;
  change: string;
  changePercent: string;
}

export interface AlphaVantageTimeSeries {
  date: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

export interface AlphaVantageNews {
  title: string;
  url: string;
  time_published: string;
  authors: string[];
  summary: string;
  banner_image: string;
  source: string;
  category_within_source: string;
  source_domain: string;
  topics: Array<{
    topic: string;
    relevance_score: string;
  }>;
  overall_sentiment_score: number;
  overall_sentiment_label: string;
}

export interface MarketIndices {
  SPY: AlphaVantageQuote;
  QQQ: AlphaVantageQuote;
  IWM: AlphaVantageQuote;
}

class AlphaVantageService {
  private async makeRequest(params: Record<string, string>) {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          ...params,
          apikey: ALPHA_VANTAGE_API_KEY,
        },
        timeout: 10000,
      });

      if (response.data['Error Message']) {
        throw new Error(response.data['Error Message']);
      }

      if (response.data['Note']) {
        throw new Error('API rate limit exceeded');
      }

      return response.data;
    } catch (error) {
      console.error('AlphaVantage API error:', error);
      throw error;
    }
  }

  async getQuote(symbol: string): Promise<AlphaVantageQuote | null> {
    try {
      const data = await this.makeRequest({
        function: 'GLOBAL_QUOTE',
        symbol: symbol.toUpperCase(),
      });

      const quote = data['Global Quote'];
      if (!quote) return null;

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
      console.error(`Failed to get quote for ${symbol}:`, error);
      return null;
    }
  }

  async getTimeSeries(symbol: string, interval: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<AlphaVantageTimeSeries[]> {
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
      const result: AlphaVantageTimeSeries[] = [];

      for (const [date, values] of Object.entries(timeSeries)) {
        const v = values as any;
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

  async getNews(tickers?: string[], topics?: string[], limit: number = 50): Promise<AlphaVantageNews[]> {
    try {
      const params: Record<string, string> = {
        function: 'NEWS_SENTIMENT',
        limit: limit.toString(),
      };

      if (tickers && tickers.length > 0) {
        params.tickers = tickers.join(',');
      }

      if (topics && topics.length > 0) {
        params.topics = topics.join(',');
      }

      const data = await this.makeRequest(params);
      return data.feed || [];
    } catch (error) {
      console.error('Failed to get news:', error);
      return [];
    }
  }

  async getMarketIndices(): Promise<MarketIndices> {
    try {
      const [spy, qqq, iwm] = await Promise.all([
        this.getQuote('SPY'),
        this.getQuote('QQQ'),
        this.getQuote('IWM'),
      ]);

      return {
        SPY: spy!,
        QQQ: qqq!,
        IWM: iwm!,
      };
    } catch (error) {
      console.error('Failed to get market indices:', error);
      throw error;
    }
  }

  async searchStocks(keywords: string): Promise<Array<{ symbol: string; name: string }>> {
    try {
      const data = await this.makeRequest({
        function: 'SYMBOL_SEARCH',
        keywords: keywords.toUpperCase(),
      });

      const matches = data.bestMatches || [];
      return matches.map((match: any) => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
      }));
    } catch (error) {
      console.error('Failed to search stocks:', error);
      return [];
    }
  }

  async getCompanyOverview(symbol: string): Promise<any> {
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