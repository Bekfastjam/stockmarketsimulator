#!/usr/bin/env python3

import json
import random
import time
import math
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Tuple

class MarketEngine:
    def __init__(self):
        self.stocks = {
            'AAPL': {'base_price': 173.24, 'volatility': 0.02, 'trend': 0.001},
            'GOOGL': {'base_price': 2641.30, 'volatility': 0.025, 'trend': -0.0005},
            'TSLA': {'base_price': 208.91, 'volatility': 0.04, 'trend': 0.002},
            'MSFT': {'base_price': 378.85, 'volatility': 0.018, 'trend': 0.0008},
            'NVDA': {'base_price': 429.00, 'volatility': 0.035, 'trend': 0.0015},
            'AMZN': {'base_price': 3285.51, 'volatility': 0.022, 'trend': 0.0003},
        }
        self.current_prices = {}
        self.previous_prices = {}
        
        # Initialize current prices
        for symbol, data in self.stocks.items():
            self.current_prices[symbol] = data['base_price']
            self.previous_prices[symbol] = data['base_price']

    def simulate_price_movement(self, symbol: str) -> Tuple[float, float, float]:
        """Simulate realistic price movement for a stock"""
        if symbol not in self.stocks:
            return 0, 0, 0
        
        stock_data = self.stocks[symbol]
        current_price = self.current_prices[symbol]
        
        # Generate random walk with trend and volatility
        random_factor = random.gauss(0, 1)  # Normal distribution
        
        # Apply trend and volatility
        price_change_percent = (stock_data['trend'] + 
                              stock_data['volatility'] * random_factor)
        
        # Add some market correlation (all stocks tend to move somewhat together)
        market_factor = random.gauss(0, 0.005)  # Small market-wide movement
        price_change_percent += market_factor
        
        # Calculate new price
        new_price = current_price * (1 + price_change_percent)
        
        # Ensure price doesn't go negative or too extreme
        new_price = max(new_price, current_price * 0.95)  # Max 5% drop
        new_price = min(new_price, current_price * 1.05)  # Max 5% gain
        
        # Calculate change and change percent
        change = new_price - current_price
        change_percent = (change / current_price) * 100 if current_price > 0 else 0
        
        # Update tracking
        self.previous_prices[symbol] = self.current_prices[symbol]
        self.current_prices[symbol] = new_price
        
        return new_price, change, change_percent

    def get_market_data(self) -> List[Dict]:
        """Get current market data for all stocks"""
        market_data = []
        
        for symbol in self.stocks.keys():
            price, change, change_percent = self.simulate_price_movement(symbol)
            
            market_data.append({
                'symbol': symbol,
                'price': round(price, 2),
                'change': round(change, 2),
                'changePercent': round(change_percent, 2),
                'timestamp': datetime.now().isoformat()
            })
        
        return market_data

    def get_historical_data(self, symbol: str, days: int = 30) -> List[Dict]:
        """Generate historical price data for charting"""
        if symbol not in self.stocks:
            return []
        
        historical_data = []
        base_price = self.stocks[symbol]['base_price']
        current_price = base_price
        
        # Generate historical data going backwards
        for i in range(days, 0, -1):
            date = datetime.now() - timedelta(days=i)
            
            # Simulate historical price movement
            random_factor = random.gauss(0, 1)
            price_change = self.stocks[symbol]['volatility'] * random_factor
            current_price *= (1 + price_change)
            
            # Keep prices reasonable
            current_price = max(current_price, base_price * 0.7)
            current_price = min(current_price, base_price * 1.3)
            
            historical_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'price': round(current_price, 2),
                'volume': random.randint(1000000, 10000000)
            })
        
        return historical_data

    def simulate_market_indices(self) -> Dict:
        """Simulate major market indices"""
        # S&P 500 simulation
        sp500_base = 4200
        sp500_change = random.gauss(0.001, 0.015)  # Small daily change
        sp500_price = sp500_base * (1 + sp500_change)
        
        return {
            'SP500': {
                'value': round(sp500_price, 2),
                'change': round(sp500_price - sp500_base, 2),
                'changePercent': round(sp500_change * 100, 2)
            }
        }

def main():
    if len(sys.argv) < 2:
        print("Usage: python market-engine.py <command> [args]")
        sys.exit(1)
    
    command = sys.argv[1]
    engine = MarketEngine()
    
    if command == "get_prices":
        # Get current market prices
        market_data = engine.get_market_data()
        print(json.dumps(market_data))
    
    elif command == "get_historical":
        if len(sys.argv) < 3:
            print("Usage: python market-engine.py get_historical <symbol>")
            sys.exit(1)
        
        symbol = sys.argv[2].upper()
        days = int(sys.argv[3]) if len(sys.argv) > 3 else 30
        historical_data = engine.get_historical_data(symbol, days)
        print(json.dumps(historical_data))
    
    elif command == "get_indices":
        # Get market indices
        indices = engine.simulate_market_indices()
        print(json.dumps(indices))
    
    elif command == "simulate_trading_day":
        # Simulate a full trading day with updates every few seconds
        start_time = time.time()
        update_interval = 5  # seconds
        
        while time.time() - start_time < 3600:  # Run for 1 hour
            market_data = engine.get_market_data()
            indices = engine.simulate_market_indices()
            
            output = {
                'timestamp': datetime.now().isoformat(),
                'stocks': market_data,
                'indices': indices
            }
            
            print(json.dumps(output))
            sys.stdout.flush()
            time.sleep(update_interval)
    
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

if __name__ == "__main__":
    main()
