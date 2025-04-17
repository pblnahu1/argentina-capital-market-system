export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  volume: number;
  lastUpdate: string;
}

export interface MarketInstruction {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED';
  timestamp: string;
  userId: string;
}

export interface NewInstruction {
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
}

export interface Database {
  public: {
    Tables: {
      market_data: {
        Row: {
          symbol: string;
          price: number;
          change: number;
          volume: number;
          last_update: string;
        };
        Insert: {
          symbol: string;
          price: number;
          change: number;
          volume: number;
          last_update?: string;
        };
        Update: {
          symbol?: string;
          price?: number;
          change?: number;
          volume?: number;
          last_update?: string;
        };
      };
      instructions: {
        Row: {
          id: string;
          symbol: string;
          type: 'BUY' | 'SELL';
          quantity: number;
          price: number;
          status: 'PENDING' | 'EXECUTED' | 'CANCELLED';
          timestamp: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          symbol: string;
          type: 'BUY' | 'SELL';
          quantity: number;
          price: number;
          status?: 'PENDING' | 'EXECUTED' | 'CANCELLED';
          timestamp?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          symbol?: string;
          type?: 'BUY' | 'SELL';
          quantity?: number;
          price?: number;
          status?: 'PENDING' | 'EXECUTED' | 'CANCELLED';
          timestamp?: string;
          user_id?: string;
        };
      };
    };
  };
}