
import React, { useState, useMemo } from 'react';
import { Account, Trade, AppConfig } from '../types';
import { formatCurrency } from '../utils';

interface AccountsTabProps {
  accounts: Account[];
  trades: Trade[];
  config: AppConfig;
  onAdd: (a: Omit<Account, 'id'>) => void;
  onUpdate: (a: Account) => void;
  onDelete: (id: string) => void;
}

const AccountsTab: React.FC<AccountsTabProps> = ({ accounts, trades, config, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const globalStats = useMemo(() => {
    let gross = 0;
    let net = 0;
    trades.forEach(t => {
      const acc = accounts.find(a => a.id === t.accountId);
      const split = acc ? acc.splitPercent / 100 : 0;
      gross += t.profitUSD;
      net += t.profitUSD > 0 ? t.profitUSD * (1 - split) : t.profitUSD;
    });
    return { gross, net, netBrl: net * config.usdToBrlRate, activeCount: accounts.filter(a => a.status === 'Ativa').length };
  }, [trades, accounts, config.usdToBrlRate]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Contas & Mesas Prop</h2>
          <p className="text-zinc-500 text-sm">Gerencie seu portfólio de capital</p>
        </div>
        <button 
          onClick={() => { setEditingAccount(null); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nova Conta
        </button>
      </header>

      {/* Consolidation Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatItem label="Contas Ativas" value={globalStats.activeCount.toString()} isString />
        <StatItem label="Lucro Bruto Geral" value={formatCurrency(globalStats.gross)} isString />
        <StatItem label="Lucro Líquido Geral" value={formatCurrency(globalStats.net)} isString color="text-blue-500" />
        <StatItem label="Líquido em BRL" value={formatCurrency(globalStats.netBrl, 'BRL')} isString color="text-green-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {accounts.map(acc => {
          const accTrades = trades.filter(t => t.accountId === acc.id);
          const gross = accTrades.reduce((a, b) => a + b.profitUSD, 0);
          const net = gross > 0 ? gross * (1 - acc.splitPercent / 100) : gross;
          const winRate = accTrades.length > 0 ? (accTrades.filter(t => t.profitUSD > 0).length / accTrades.length) * 100 : 0;

          return (
            <div key={acc.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col hover:border-zinc-700 transition-all shadow-lg group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-lg">{acc.name}</h4>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{acc.propFirm}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${acc.status === 'Ativa' ? 'bg-green-500/10 text-green-500' : 'bg-zinc-800 text-zinc-500'}`}>
                  {acc.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 my-4 py-4 border-y border-zinc-800/50">
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase">Tamanho</p>
                  <p className="font-bold text-zinc-200">{formatCurrency(acc.size)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase">Taxa Prop</p>
                  <p className="font-bold text-orange-400">{acc.splitPercent}%</p>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Líquido</span>
                  <span className={`font-bold ${net >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(net)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Win Rate</span>
                  <span className="font-bold">{winRate.toFixed(1)}%</span>
                </div>
              </div>

              <div className="mt-auto flex gap-2">
                <button 
                  onClick={() => { setEditingAccount(acc); setIsModalOpen(true); }}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-2 rounded-lg text-xs font-bold transition-colors"
                >
                  Editar
                </button>
                <button 
                  onClick={() => onDelete(acc.id)}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <AccountModal 
          onClose={() => setIsModalOpen(false)}
          account={editingAccount}
          onSave={(acc) => {
            if (editingAccount) onUpdate({ ...acc, id: editingAccount.id } as Account);
            else onAdd(acc as Omit<Account, 'id'>);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

const StatItem = ({ label, value, color, isString }: { label: string, value: string, color?: string, isString?: boolean }) => (
  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-xl font-bold ${color || 'text-white'}`}>{value}</p>
  </div>
);

const AccountModal = ({ onClose, account, onSave }: { onClose: () => void, account: Account | null, onSave: (a: any) => void }) => {
  const [data, setData] = useState(account || {
    name: '',
    propFirm: '',
    size: 10000,
    splitPercent: 20,
    startDate: new Date().toISOString().split('T')[0],
    status: 'Ativa' as 'Ativa' | 'Inativa',
    notes: ''
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{account ? 'Editar Conta' : 'Nova Conta'}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSave(data); }}>
           <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Apelido Conta</label>
              <input type="text" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm" value={data.name} onChange={e => setData({...data, name: e.target.value})} required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Prop Firm</label>
              <input type="text" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm" value={data.propFirm} onChange={e => setData({...data, propFirm: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Tamanho (USD)</label>
              <input type="number" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm" value={data.size} onChange={e => setData({...data, size: parseFloat(e.target.value) || 0})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Taxa Mesa (%)</label>
              <input type="number" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm" value={data.splitPercent} onChange={e => setData({...data, splitPercent: parseFloat(e.target.value) || 0})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Data Início</label>
              <input type="date" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm" value={data.startDate} onChange={e => setData({...data, startDate: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Status</label>
              <select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm" value={data.status} onChange={e => setData({...data, status: e.target.value as any})}>
                <option value="Ativa">Ativa</option>
                <option value="Inativa">Inativa</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold mt-4 transition-colors">
            {account ? 'Salvar Alterações' : 'Cadastrar Conta'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccountsTab;
