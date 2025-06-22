import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { tradeOrderSchema, type TradeOrder } from "@shared/schema";
import { useState } from "react";

export default function QuickTrade() {
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TradeOrder>({
    resolver: zodResolver(tradeOrderSchema),
    defaultValues: {
      symbol: '',
      type: 'BUY',
      shares: 1,
      orderType: 'MARKET',
    },
  });

  const tradeMutation = useMutation({
    mutationFn: async (data: TradeOrder) => {
      const response = await apiRequest('POST', '/api/trade', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Trade Executed",
        description: "Your trade has been successfully executed.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio/summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Trade Failed",
        description: error.message || "Failed to execute trade",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TradeOrder) => {
    tradeMutation.mutate({ ...data, type: tradeType });
  };

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Quick Trade
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Symbol</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., AAPL" 
                      {...field}
                      value={field.value.toUpperCase()}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <Label>Action</Label>
              <div className="flex space-x-2 mt-2">
                <Button
                  type="button"
                  variant={tradeType === 'BUY' ? 'default' : 'outline'}
                  className={`flex-1 ${tradeType === 'BUY' ? 'bg-success hover:bg-green-600' : ''}`}
                  onClick={() => setTradeType('BUY')}
                >
                  BUY
                </Button>
                <Button
                  type="button"
                  variant={tradeType === 'SELL' ? 'default' : 'outline'}
                  className={`flex-1 ${tradeType === 'SELL' ? 'bg-danger hover:bg-red-600' : ''}`}
                  onClick={() => setTradeType('SELL')}
                >
                  SELL
                </Button>
              </div>
            </div>

            <FormField
              control={form.control}
              name="shares"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="orderType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select order type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MARKET">Market Order</SelectItem>
                      <SelectItem value="LIMIT">Limit Order</SelectItem>
                      <SelectItem value="STOP">Stop Loss</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-blue-700"
              disabled={tradeMutation.isPending}
            >
              {tradeMutation.isPending ? 'Placing Order...' : 'Place Order'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
