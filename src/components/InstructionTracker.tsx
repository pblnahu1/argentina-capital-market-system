import { useEffect, useState } from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { MarketInstruction } from '../types/market';

export function InstructionTracker() {
  const [instructions, setInstructions] = useState<MarketInstruction[]>([]);

  useEffect(() => {
    // Initial fetch
    fetchInstructions();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('instruction_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'instructions',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setInstructions((current) => [
              {
                id: payload.new.id,
                symbol: payload.new.symbol,
                type: payload.new.type,
                quantity: payload.new.quantity,
                price: payload.new.price,
                status: payload.new.status,
                timestamp: payload.new.timestamp,
                userId: payload.new.user_id,
              },
              ...current,
            ]);
          } else if (payload.eventType === 'UPDATE') {
            setInstructions((current) =>
              current.map((item) =>
                item.id === payload.new.id
                  ? {
                      ...item,
                      status: payload.new.status,
                    }
                  : item
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchInstructions() {
    const { data, error } = await supabase
      .from('instructions')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching instructions:', error);
      return;
    }

    setInstructions(
      data.map((item) => ({
        id: item.id,
        symbol: item.symbol,
        type: item.type,
        quantity: item.quantity,
        price: item.price,
        status: item.status,
        timestamp: item.timestamp,
        userId: item.user_id,
      }))
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'EXECUTED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Instruction Tracker</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Symbol</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Quantity</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Price</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {instructions.map((instruction) => (
              <tr key={instruction.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{instruction.id}</td>
                <td className="px-6 py-4 font-medium">{instruction.symbol}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      instruction.type === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {instruction.type}
                  </span>
                </td>
                <td className="px-6 py-4">{instruction.quantity}</td>
                <td className="px-6 py-4">${instruction.price.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {getStatusIcon(instruction.status)}
                    <span className="ml-2">{instruction.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {new Date(instruction.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}