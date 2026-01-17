
import React, { useState, useMemo } from 'react';
import { Trade, Account, AppConfig, TradeType } from '../types';
import { formatCurrency, getDaysInMonth, getFirstDayOfMonth } from '../utils';

interface DashboardTabProps {
  trades: Trade[];
  accounts: Account[];
  selectedAccountId: string;
  config: AppConfig;
  onAddTrade: (t: Omit<Trade, 'id' | 'profitUSD'>) => void;
  onDeleteTrade: (id: string) => void;
}

const DashboardTab: React.FC<DashboardTabProps> = ({ trades, accounts, selectedAccountId, config, onAddTrade, onDeleteTrade }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const monthTrades = useMemo(() => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    return trades.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });
  }, [trades, currentDate]);

  // Totals calculation
  const stats = useMemo(() => {
    let grossProfit = monthTrades.reduce((acc, t) => acc + t.profitUSD, 0);
    
    // If "All accounts", we need to calculate net per trade based on its specific account split
    let netProfit = 0;
    monthTrades.forEach(t => {
      const acc = accounts.find(a => a.id === t.accountId);
      const split = acc ? acc.splitPercent / 100 : 0;
      const profit = t.profitUSD;
      netProfit += profit > 0 ? profit * (1 - split) : profit;
    });

    const taxTotal = grossProfit - netProfit;

    return {
      grossProfit,
      taxTotal,
      netProfit,
      netBrl: netProfit * config.usdToBrlRate
    };
  }, [monthTrades, accounts, config.usdToBrlRate]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Geral</h2>
          <p className="text-zinc-500 text-sm">Visão consolidada da performance mensal</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Adicionar Trade
        </button>
      </header>

      {/* Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Lucro Bruto (Mês)" value={stats.grossProfit} />
        <StatCard label="Taxas Prop Firm" value={-stats.taxTotal} color="text-orange-400" />
        <StatCard label="Lucro Líquido (USD)" value={stats.netProfit} color="text-blue-500" />
        <StatCard label="Lucro Líquido (BRL)" value={stats.netBrl} currency="BRL" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <Calendar trades={monthTrades} date={currentDate} setDate={setCurrentDate} />
          <RecentTrades trades={trades} accounts={accounts} onDelete={onDeleteTrade} />
        </div>
        <div className="space-y-8">
           <AccountQuickSummary trades={monthTrades} accounts={accounts} />
        </div>
      </div>

      {isModalOpen && (
        <TradeModal 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={(t) => { onAddTrade(t); setIsModalOpen(false); }} 
          accounts={accounts}
          initialAccountId={selectedAccountId === 'all' ? (accounts[0]?.id || '') : selectedAccountId}
        />
      )}
    </div>
  );
};

const StatCard = ({ label, value, color, currency = 'USD' }: { label: string, value: number, color?: string, currency?: string }) => (
  <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl shadow-sm">
    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{label}</p>
    <p className={`text-2xl font-bold ${color || (value >= 0 ? 'text-green-500' : 'text-red-500')}`}>
      {formatCurrency(value, currency)}
    </p>
  </div>
);

const Calendar = ({ trades, date, setDate }: { trades: Trade[], date: Date, setDate: (d: Date) => void }) => {
  const m = date.getMonth();
  const y = date.getFullYear();
  const daysInMonth = getDaysInMonth(y, m);
  const firstDay = getFirstDayOfMonth(y, m);
  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date);

  const tradesByDay = useMemo(() => {
    const map: Record<number, number> = {};
    trades.forEach(t => {
      const d = new Date(t.date).getDate();
      map[d] = (map[d] || 0) + t.profitUSD;
    });
    return map;
  }, [trades]);

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(<div key={`pad-${i}`} className="h-20 md:h-28 bg-zinc-950/20" />);
  for (let d = 1; d <= daysInMonth; d++) {
    const val = tradesByDay[d];
    days.push(
      <div key={d} className={`h-20 md:h-28 border border-zinc-800/40 p-2 flex flex-col justify-between transition-colors hover:bg-zinc-800/30
        ${val !== undefined ? (val > 0 ? 'bg-green-500/5' : (val < 0 ? 'bg-red-500/5' : 'bg-zinc-800/20')) : 'bg-zinc-900/60'}`}>
        <span className="text-[10px] font-bold text-zinc-500">{d}</span>
        {val !== undefined && (
          <span className={`text-[10px] md:text-sm font-bold text-center ${val > 0 ? 'text-green-500' : (val < 0 ? 'text-red-500' : 'text-zinc-400')}`}>
            {formatCurrency(val)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <h3 className="font-bold capitalize">{monthName} {y}</h3>
        <div className="flex gap-1">
          <button onClick={() => setDate(new Date(y, m - 1, 1))} className="p-1 hover:bg-zinc-800 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={() => setDate(new Date(y, m + 1, 1))} className="p-1 hover:bg-zinc-800 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-[10px] font-bold text-zinc-500 uppercase border-b border-zinc-800 bg-zinc-950/50">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(day => <div key={day} className="py-2 text-center">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-px bg-zinc-800">
        {days}
      </div>
    </div>
  );
};

const RecentTrades = ({ trades, accounts, onDelete }: { trades: Trade[], accounts: Account[], onDelete: (id: string) => void }) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
    <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
      <h3 className="font-bold">Trades Recentes</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-xs text-left">
        <thead className="bg-zinc-950 text-zinc-500 uppercase font-bold">
          <tr>
            <th className="px-4 py-3">Data</th>
            <th className="px-4 py-3">Conta</th>
            <th className="px-4 py-3 text-center">Tipo</th>
            <th className="px-4 py-3">Ativo</th>
            <th className="px-4 py-3 text-right">Pts</th>
            <th className="px-4 py-3 text-right">Resultado</th>
            <th className="px-4 py-3 text-center">Ação</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {trades.slice(0, 10).map(t => {
            const acc = accounts.find(a => a.id === t.accountId);
            return (
              <tr key={t.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3 text-zinc-400">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                <td className="px-4 py-3 font-medium truncate max-w-[100px]">{acc?.name || 'Desconhecida'}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${t.type === TradeType.BUY ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                    {t.type === TradeType.BUY ? 'B' : 'S'}
                  </span>
                </td>
                <td className="px-4 py-3 font-bold">{t.asset}</td>
                <td className="px-4 py-3 text-right text-zinc-400">{t.points}</td>
                <td className={`px-4 py-3 text-right font-bold ${t.profitUSD >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(t.profitUSD)}
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => onDelete(t.id)} className="text-zinc-600 hover:text-red-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

const AccountQuickSummary = ({ trades, accounts }: { trades: Trade[], accounts: Account[] }) => {
  const perAccount = useMemo(() => {
    const res: Record<string, number> = {};
    trades.forEach(t => {
      res[t.accountId] = (res[t.accountId] || 0) + t.profitUSD;
    });
    return Object.entries(res).map(([id, profit]) => ({
      id,
      profit,
      name: accounts.find(a => a.id === id)?.name || 'Conta'
    })).sort((a, b) => b.profit - a.profit);
  }, [trades, accounts]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <h3 className="font-bold mb-4 text-sm uppercase tracking-widest text-zinc-500">Resultado por Mesa</h3>
      <div className="space-y-4">
        {perAccount.length === 0 && <p className="text-zinc-600 text-xs italic">Sem dados este mês.</p>}
        {perAccount.map(acc => (
          <div key={acc.id} className="flex justify-between items-center group">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-zinc-200">{acc.name}</span>
            </div>
            <span className={`text-sm font-bold ${acc.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(acc.profit)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const TradeModal = ({ onClose, onSubmit, accounts, initialAccountId }: { onClose: () => void, onSubmit: (t: any) => void, accounts: Account[], initialAccountId: string }) => {
  const [data, setData] = useState({
    accountId: initialAccountId,
    date: new Date().toISOString().slice(0, 16),
    asset: 'XAUUSD',
    type: TradeType.BUY,
    points: 0,
    valuePerPoint: 1,
    lots: 0.1,
    notes: ''
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 animate-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Novo Trade</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSubmit(data); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Conta</label>
              <select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm" value={data.accountId} onChange={e => setData({...data, accountId: e.target.value})}>
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Data/Hora</label>
              <input type="datetime-local" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm" value={data.date} onChange={e => setData({...data, date: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Ativo</label>
              <input type="text" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm" value={data.asset} onChange={e => setData({...data, asset: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Tipo</label>
              <select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm" value={data.type} onChange={e => setData({...data, type: e.target.value as TradeType})}>
                <option value={TradeType.BUY}>Compra</option>
                <option value={TradeType.SELL}>Venda</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Pontos</label>
              <input type="number" step="0.1" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm" value={data.points} onChange={e => setData({...data, points: parseFloat(e.target.value) || 0})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">$/Ponto</label>
              <input type="number" step="0.01" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm" value={data.valuePerPoint} onChange={e => setData({...data, valuePerPoint: parseFloat(e.target.value) || 0})} />
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold mt-4 transition-colors">
            Registrar Trade (${(data.points * data.valuePerPoint).toFixed(2)})
          </button>
        </form>
      </div>
    </div>
  );
};

export default DashboardTab;
