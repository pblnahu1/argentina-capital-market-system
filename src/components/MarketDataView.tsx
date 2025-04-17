import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { MarketData } from '../types/market';

export function MarketDataView() {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    fetchMarketData();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('market_data_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'market_data',
        },
        (payload) => {
          setMarketData((current) =>
            current.map((item) =>
              item.symbol === payload.new.symbol
                ? {
                    ...payload.new,
                    lastUpdate: payload.new.last_update,
                  }
                : item
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchMarketData() {
    try {
      setError(null);
      setLoading(true);

      const { data, error: supabaseError } = await supabase
        .from('market_data')
        .select('*')
        .order('symbol');

      if (supabaseError) {
        throw supabaseError;
      }

      if (!data) {
        throw new Error('No data received from the server');
      }

      setMarketData(
        data.map((item) => ({
          symbol: item.symbol,
          price: item.price,
          change: item.change,
          volume: item.volume,
          lastUpdate: item.last_update,
        }))
      );
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch market data');
    } finally {
      setLoading(false);
    }
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
        <button
          onClick={() => fetchMarketData()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Market Data</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Symbol</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Price</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Change %</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Volume</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Last Update</th>
            </tr>
          </thead>
          <tbody>
            {marketData.map((data) => (
              <tr key={data.symbol} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{data.symbol}</td>
                <td className="px-6 py-4">${data.price.toFixed(2)}</td>
                <td className="px-6 py-4 flex items-center">
                  {data.change >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={data.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {data.change}%
                  </span>
                </td>
                <td className="px-6 py-4">{data.volume.toLocaleString()}</td>
                <td className="px-6 py-4">
                  {new Date(data.lastUpdate).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}