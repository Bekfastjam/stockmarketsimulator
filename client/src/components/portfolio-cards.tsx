import { Card, CardContent } from "@/components/ui/card";
import { 
  Wallet, 
  TrendingUp, 
  BarChart3, 
  PieChart 
} from "lucide-react";
import { formatCurrency, formatPercent, getChangeColor } from "@/lib/utils";
import type { PortfolioSummary } from "@shared/schema";

interface PortfolioCardsProps {
  summary?: PortfolioSummary;
}

export default function PortfolioCards({ summary }: PortfolioCardsProps) {
  if (!summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Portfolio',
      value: formatCurrency(summary.totalValue),
      change: summary.totalPLPercent,
      icon: Wallet,
      iconBg: 'bg-blue-100 dark:bg-blue-900',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: "Day's P&L",
      value: formatCurrency(summary.dailyPL),
      change: summary.dailyPLPercent,
      icon: TrendingUp,
      iconBg: summary.dailyPL >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900',
      iconColor: summary.dailyPL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
    },
    {
      title: 'Total P&L',
      value: formatCurrency(summary.totalPL),
      change: summary.totalPLPercent,
      icon: BarChart3,
      iconBg: summary.totalPL >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900',
      iconColor: summary.totalPL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
    },
    {
      title: 'Open Positions',
      value: summary.openPositions.toString(),
      change: 0,
      icon: PieChart,
      iconBg: 'bg-purple-100 dark:bg-purple-900',
      iconColor: 'text-purple-600 dark:text-purple-400',
      subtitle: 'positions',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {card.value}
                  </p>
                </div>
                <div className={`${card.iconBg} p-3 rounded-full`}>
                  <Icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                {card.change !== 0 && (
                  <>
                    <span className={`font-medium ${getChangeColor(card.change)}`}>
                      {card.change >= 0 ? '+' : ''}{formatPercent(card.change)}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                      {index === 1 ? 'today' : index === 2 ? 'all time' : 'vs yesterday'}
                    </span>
                  </>
                )}
                {card.subtitle && (
                  <span className="text-gray-500 dark:text-gray-400">{card.subtitle}</span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
