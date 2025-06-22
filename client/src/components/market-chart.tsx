import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from 'react';

export default function MarketChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { data: historicalData } = useQuery({
    queryKey: ['/api/stocks/AAPL/historical', { days: 30 }],
    queryFn: () => fetch('/api/stocks/AAPL/historical?days=30').then(res => res.json()),
  });

  useEffect(() => {
    if (!historicalData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Prepare data
    const prices = historicalData.map((d: any) => d.price);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice;

    // Chart dimensions
    const padding = 40;
    const chartWidth = rect.width - 2 * padding;
    const chartHeight = rect.height - 2 * padding;

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(rect.width - padding, y);
      ctx.stroke();
    }

    // Vertical grid lines
    for (let i = 0; i <= 6; i++) {
      const x = padding + (chartWidth / 6) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, rect.height - padding);
      ctx.stroke();
    }

    // Draw price line
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.beginPath();

    prices.forEach((price: number, index: number) => {
      const x = padding + (chartWidth / (prices.length - 1)) * index;
      const y = padding + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Fill area under curve
    ctx.fillStyle = 'rgba(37, 99, 235, 0.1)';
    ctx.lineTo(rect.width - padding, rect.height - padding);
    ctx.lineTo(padding, rect.height - padding);
    ctx.closePath();
    ctx.fill();

  }, [historicalData]);

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Market Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <canvas
          ref={canvasRef}
          className="w-full h-64"
          style={{ display: 'block' }}
        />
      </CardContent>
    </Card>
  );
}
