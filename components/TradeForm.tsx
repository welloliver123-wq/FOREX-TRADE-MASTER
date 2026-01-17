
import React, { useState } from 'react';
import { TradeType, Trade } from '../types';

interface TradeFormProps {
  onSubmit: (trade: Omit<Trade, 'id' | 'profitUSD'>) => void;
}

const TradeForm: React.FC<TradeFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 16),
    asset: 'XAUUSD',
    type: TradeType.BUY,
    points: 0,
    valuePerPoint: 1,
    lots: 0.10,
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset or close is handled by parent
  };

  const calculatedProfit = (formData.points * formData.valuePerPoint).toFixed(2);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-400 uppercase">Data e Hora</label>
          <input 
            type="datetime-local"
            required
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            value={formData.date}
            onChange={e => setFormData({...formData, date: e.target.value})}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-400 uppercase">Ativo</label>
          <input 
            type="text"
            required
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            value={formData.asset}
            onChange={e => setFormData({...formData, asset: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-400 uppercase">Tipo</label>
          <select 
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            value={formData.type}
            onChange={e => setFormData({...formData, type: e.target.value as TradeType})}
          >
            <option value={TradeType.BUY}>Compra</option>
            <option value={TradeType.SELL}>Venda</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-400 uppercase">Lotes</label>
          <input 
            type="number"
            step="0.01"
            required
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            value={formData.lots}
            onChange={e => setFormData({...formData, lots: parseFloat(e.target.value) || 0})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-400 uppercase">Pontos</label>
          <input 
            type="number"
            required
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            placeholder="Ex: 500"
            value={formData.points}
            onChange={e => setFormData({...formData, points: parseFloat(e.target.value) || 0})}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-400 uppercase">$/Ponto</label>
          <input 
            type="number"
            step="0.01"
            required
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            value={formData.valuePerPoint}
            onChange={e => setFormData({...formData, valuePerPoint: parseFloat(e.target.value) || 0})}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-zinc-400 uppercase">Observações</label>
        <textarea 
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 h-20 resize-none"
          value={formData.notes}
          onChange={e => setFormData({...formData, notes: e.target.value})}
        />
      </div>

      <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800 flex justify-between items-center">
        <span className="text-zinc-400 font-medium">Resultado Estimado:</span>
        <span className={`text-xl font-bold ${parseFloat(calculatedProfit) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          ${calculatedProfit}
        </span>
      </div>

      <button 
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold text-white transition-colors"
      >
        Confirmar Trade
      </button>
    </form>
  );
};

export default TradeForm;
