import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface InstructionFormProps {
  onInstructionCreated?: () => void;
}

export default function InstructionForm({ onInstructionCreated }: InstructionFormProps) {
  const [symbol, setSymbol] = useState('');
  const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('You must be logged in to create instructions');
      }

      const { error: insertError } = await supabase
        .from('instructions')
        .insert([
          {
            symbol: symbol.toUpperCase(),
            type,
            quantity: parseInt(quantity),
            price: parseFloat(price),
            user_id: user.id, // Include the user_id from the authenticated session
            status: 'PENDING' // Use the default status
          }
        ]);

      if (insertError) throw insertError;

      // Clear form
      setSymbol('');
      setQuantity('');
      setPrice('');
      setType('BUY');

      // Notify parent component
      if (onInstructionCreated) {
        onInstructionCreated();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create instruction');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">New Trading Instruction</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'BUY' | 'SELL')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="BUY">Buy</option>
            <option value="SELL">Sell</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0.01"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Create Instruction
        </button>
      </form>
    </div>
  );
}

export { InstructionForm }