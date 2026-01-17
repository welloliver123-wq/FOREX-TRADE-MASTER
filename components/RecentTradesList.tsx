
import React from 'react';
import { Trade, TradeType } from '../types';
import { formatCurrency } from '../utils';

interface RecentTradesListProps {
  trades: Trade[];
  onDelete: (id: string) => void;
}

const RecentTradesList: React.FC<RecentTradesListProps> = ({ trades, onDelete }) => {
  const recentTrades = trades.slice(0, 20);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
        <h3 className="font-bold">Histórico Recente (20)</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-zinc-950 text-zinc-500 text-[10px] uppercase font-bold">
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Ativo</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3 text-right">Lotes</th>
              <th className="px-4 py-3 text-right">Pontos</th>
              <th className="px-4 py-3 text-right">Resultado</th>
              <th className="px-4 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {recentTrades.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-zinc-500">
                  Nenhum trade registrado.
                </td>
              </tr>
            ) : (
              recentTrades.map(trade => (
                <tr key={trade.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3 text-zinc-400">
                    {new Date(trade.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 font-bold">{trade.asset}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${trade.type === TradeType.BUY ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                      {trade.type === TradeType.BUY ? 'COMPRA' : 'VENDA'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-400">{trade.lots}</td>
                  <td className="px-4 py-3 text-right font-medium">{trade.points}</td>
                  <td className={`px-4 py-3 text-right font-bold ${trade.profitUSD >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(trade.profitUSD)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={() => onDelete(trade.id)}
                      className="text-zinc-600 hover:text-red-500 transition-colors p-1"
                      title="Excluir"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTradesList;
