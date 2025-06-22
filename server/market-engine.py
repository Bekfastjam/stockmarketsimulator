#!/usr/bin/env python3
"""
Advanced Stock Market Simulation Engine
Provides realistic market data generation using Python's financial libraries
"""

import json
import sys
import random
import math
from datetime import datetime, timedelta
import numpy as np
from typing import Dict, List, Optional

class MarketEngine:
    def __init__(self):
        # Base prices for popular stocks (realistic starting points)
        self.base_prices = {
            'AAPL': 175.0,
            'GOOGL': 140.0,
            'MSFT': 330.0,
            'TSLA': 250.0,
            'AMZN': 180.0,
            'NVDA': 800.0,
            'META': 350.0,
            'NFLX': 600.0,
            'SPY': 450.0,
            'QQQ': 380.0,
            'IWM': 200.0,
            'JPM': 180.0,
            'JNJ': 160.0,
            'PG': 150.0,
            'V': 250.0,
            'HD': 350.0,
            'DIS': 90.0,
            'PYPL': 60.0,
            'INTC': 45.0,
            'CSCO': 50.0
        }
        
        # Volatility profiles (daily volatility percentages)
        self.volatility = {
            'AAPL': 0.025,
            'GOOGL': 0.030,
            'MSFT': 0.020,
            'TSLA': 0.050,
            'AMZN': 0.035,
            'NVDA': 0.040,
            'META': 0.035,
            'NFLX': 0.040,
            'SPY': 0.015,
            'QQQ': 0.020,
            'IWM': 0.025,
            'JPM': 0.025,
            'JNJ': 0.015,
            'PG': 0.015,
            'V': 0.020,
            'HD': 0.025,
            'DIS': 0.030,
            'PYPL': 0.035,
            'INTC': 0.025,
            'CSCO': 0.020
        }
        
        # Market sentiment (trend bias)
        self.sentiment = {
            'AAPL': 0.001,
            'GOOGL': 0.002,
            'MSFT': 0.001,
            'TSLA': -0.003,
            'AMZN': 0.002,
            'NVDA': 0.003,
            'META': 0.002,
            'NFLX': 0.001,
            'SPY': 0.0005,
            'QQQ': 0.001,
            'IWM': 0.0005,
            'JPM': 0.001,
            'JNJ': 0.0005,
            'PG': 0.0005,
            'V': 0.001,
            'HD': 0.001,
            'DIS': -0.001,
            'PYPL': -0.002,
            'INTC': -0.001,
            'CSCO': 0.0005
        }
        
        # Market hours (9:30 AM - 4:00 PM ET)
        self.market_open = 9.5  # 9:30 AM
        self.market_close = 16.0  # 4:00 PM
        
    def generate_price_movement(self, symbol: str, base_price: float) -> Dict:
        """Generate realistic price movement using Brownian motion and market factors"""
        
        # Get stock-specific parameters
        vol = self.volatility.get(symbol, 0.025)
        trend = self.sentiment.get(symbol, 0.0)
        
        # Time-based volatility (higher during market hours)
        now = datetime.now()
        hour = now.hour + now.minute / 60.0
        
        if self.market_open <= hour <= self.market_close:
            # Market hours - normal volatility
            time_factor = 1.0
        else:
            # After hours - reduced volatility
            time_factor = 0.3
        
        # Generate price movement using geometric Brownian motion
        dt = 1/252  # Daily time step
        drift = trend * dt
        diffusion = vol * math.sqrt(dt) * time_factor
        
        # Random walk component
        random_walk = np.random.normal(0, 1)
        
        # Price change
        price_change = base_price * (drift + diffusion * random_walk)
        
        # Add some market noise
        noise = base_price * 0.001 * np.random.normal(0, 1)
        price_change += noise
        
        # Calculate new price
        new_price = base_price + price_change
        
        # Ensure price doesn't go negative
        new_price = max(new_price, base_price * 0.1)
        
        return {
            'price_change': price_change,
            'new_price': new_price,
            'volatility': vol,
            'trend': trend
        }
    
    def generate_ohlc(self, symbol: str, base_price: float) -> Dict:
        """Generate realistic OHLC (Open, High, Low, Close) data"""
        
        # Generate price movement
        movement = self.generate_price_movement(symbol, base_price)
        new_price = movement['new_price']
        
        # Generate OHLC
        open_price = base_price + (np.random.normal(0, 1) * base_price * 0.005)
        close_price = new_price
        
        # High and low based on daily range
        daily_range = base_price * movement['volatility'] * np.random.uniform(0.5, 1.5)
        
        if close_price > open_price:
            # Bullish day
            high = max(open_price, close_price) + np.random.uniform(0, daily_range * 0.3)
            low = min(open_price, close_price) - np.random.uniform(0, daily_range * 0.2)
        else:
            # Bearish day
            high = max(open_price, close_price) + np.random.uniform(0, daily_range * 0.2)
            low = min(open_price, close_price) - np.random.uniform(0, daily_range * 0.3)
        
        # Ensure logical OHLC relationship
        high = max(high, open_price, close_price)
        low = min(low, open_price, close_price)
        
        return {
            'open': round(open_price, 4),
            'high': round(high, 4),
            'low': round(low, 4),
            'close': round(close_price, 4)
        }
    
    def generate_volume(self, symbol: str, price: float) -> int:
        """Generate realistic trading volume"""
        
        # Base volume by market cap (approximate)
        volume_factors = {
            'AAPL': 50000000,
            'GOOGL': 30000000,
            'MSFT': 40000000,
            'TSLA': 80000000,
            'AMZN': 60000000,
            'NVDA': 70000000,
            'META': 50000000,
            'NFLX': 30000000,
            'SPY': 100000000,
            'QQQ': 80000000,
            'IWM': 40000000,
            'JPM': 20000000,
            'JNJ': 15000000,
            'PG': 12000000,
            'V': 25000000,
            'HD': 18000000,
            'DIS': 25000000,
            'PYPL': 35000000,
            'INTC': 30000000,
            'CSCO': 25000000
        }
        
        base_volume = volume_factors.get(symbol, 20000000)
        
        # Add randomness
        volume_variation = np.random.uniform(0.5, 1.5)
        
        # Time-based volume (higher during market hours)
        now = datetime.now()
        hour = now.hour + now.minute / 60.0
        
        if self.market_open <= hour <= self.market_close:
            time_factor = 1.0
        else:
            time_factor = 0.2
        
        volume = int(base_volume * volume_variation * time_factor)
        
        return volume
    
    def generate_quote(self, symbol: str) -> Dict:
        """Generate a complete stock quote"""
        
        # Get base price
        base_price = self.base_prices.get(symbol, 100.0)
        
        # Generate OHLC data
        ohlc = self.generate_ohlc(symbol, base_price)
        
        # Generate volume
        volume = self.generate_volume(symbol, ohlc['close'])
        
        # Calculate change and percentage
        previous_close = base_price
        current_price = ohlc['close']
        change = current_price - previous_close
        change_percent = (change / previous_close) * 100 if previous_close > 0 else 0
        
        # Update base price for next iteration
        self.base_prices[symbol] = current_price
        
        # Generate quote
        quote = {
            'symbol': symbol,
            'open': str(ohlc['open']),
            'high': str(ohlc['high']),
            'low': str(ohlc['low']),
            'price': str(ohlc['close']),
            'volume': str(volume),
            'latestTradingDay': datetime.now().strftime('%Y-%m-%d'),
            'previousClose': str(previous_close),
            'change': str(round(change, 4)),
            'changePercent': f"{round(change_percent, 4)}%"
        }
        
        return quote
    
    def generate_market_data(self, symbols: List[str]) -> List[Dict]:
        """Generate market data for multiple symbols"""
        quotes = []
        
        for symbol in symbols:
            try:
                quote = self.generate_quote(symbol)
                quotes.append(quote)
            except Exception as e:
                print(f"Error generating quote for {symbol}: {e}", file=sys.stderr)
                continue
        
        return quotes

def main():
    """Main function to handle command line arguments"""
    if len(sys.argv) < 2:
        print("Usage: python market-engine.py <symbol>")
        sys.exit(1)
    
    symbol = sys.argv[1].upper()
    
    try:
        engine = MarketEngine()
        quote = engine.generate_quote(symbol)
        print(json.dumps(quote))
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main() 