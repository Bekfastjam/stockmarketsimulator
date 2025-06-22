import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { PortfolioSummary } from "@shared/schema";

interface HeaderProps {
  portfolioSummary?: PortfolioSummary;
  user?: { id: number; username: string; cashBalance: string };
}

export default function Header({ portfolioSummary, user }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">StockSim Pro</h1>
            <Badge variant="secondary" className="ml-3 bg-blue-100 text-blue-800 hover:bg-blue-100">
              DEMO
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Portfolio Value</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {portfolioSummary ? formatCurrency(portfolioSummary.totalValue) : '$0.00'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Cash Balance</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {user ? formatCurrency(parseFloat(user.cashBalance)) : '$0.00'}
              </p>
            </div>
            <Button className="bg-primary text-white hover:bg-blue-700">
              <User className="mr-2 h-4 w-4" />
              Account
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
