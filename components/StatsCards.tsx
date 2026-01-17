
import React from 'react';
import { formatCurrency } from '../utils';

interface StatsCardsProps {
  totals: {
    grossProfit: number;
    propTax: number;
    netProfit: number;
    netProfitBrl: number;
  };
  rate: number;
  setRate: (rate: number) => void;
}

const StatsCards: React.FC<StatsCardsProps> = ({ totals, rate, setRate }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Gross Profit */}
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
        <p className="text-sm font-medium text-zinc-400 mb-1">Lucro Bruto (Mês)</p>
        <p className={`text-2xl font-bold ${totals.grossProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {formatCurrency(totals.grossProfit)}
        </p>
      </div>

      {/* Prop Firm Tax */}
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
        <p className="text-sm font-medium text-zinc-400 mb-1">Taxa Prop Firm (25%)</p>
        <p className="text-2xl font-bold text-orange-400">
          -{formatCurrency(totals.propTax)}
        </p>
      </div>

      {/* Net Profit USD */}
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
        <p className="text-sm font-medium text-zinc-400 mb-1">Lucro Líquido (USD)</p>
        <p className={`text-2xl font-bold ${totals.netProfit >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
          {formatCurrency(totals.netProfit)}
        </p>
      </div>

      {/* Net Profit BRL */}
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl relative group">
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium text-zinc-400 mb-1">Em Reais (BRL)</p>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-zinc-500">Cotação:</span>
            <input 
              type="number"
              step="0.01"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
              className="bg-transparent border-none p-0 text-[10px] text-zinc-400 w-8 focus:ring-0 text-right font-bold hover:text-white"
            />
          </div>
        </div>
        <p className={`text-2xl font-bold ${totals.netProfitBrl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {formatCurrency(totals.netProfitBrl, 'BRL')}
        </p>
      </div>
    </div>
  );
};

export default StatsCards;
