
# stock_market_simulator.py

import random

# Initial data
stocks = {'AAPL': 150, 'GOOG': 2800, 'TSLA': 700}
portfolio = {name: 0 for name in stocks}
balance = 10000

def show_status():
    print("\nYour portfolio:")
    for stock, qty in portfolio.items():
        print(f"{stock}: {qty} shares (Price: ${stocks[stock]})")
    print(f"Cash balance: ${balance}\n")

def update_prices():
    for stock in stocks:
        change = random.randint(-10, 10)
        stocks[stock] = max(1, stocks[stock] + change)

while True:
    show_status()
    print("Available actions: buy, sell, quit")
    action = input("What would you like to do? ").strip().lower()
    if action == 'quit':
        print("Thanks for playing!")
        break
    if action not in ['buy', 'sell']:
        print("Invalid action.")
        continue

    stock = input("Enter stock symbol: ").strip().upper()
    if stock not in stocks:
        print("Stock not found.")
        continue

    qty = int(input("How many shares? "))
    if action == 'buy':
        cost = stocks[stock] * qty
        if cost > balance:
            print("Not enough cash.")
            continue
        portfolio[stock] += qty
        balance -= cost
        print(f"Bought {qty} shares of {stock}.")
    elif action == 'sell':
        if qty > portfolio[stock]:
            print("Not enough shares.")
            continue
        portfolio[stock] -= qty
        balance += stocks[stock] * qty
        print(f"Sold {qty} shares of {stock}.")

    update_prices()
