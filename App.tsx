
import React, { useState, useEffect, useMemo } from 'react';
import { Account, Trade, WeeklyPlan, AppState, TabType, TradeType, AppConfig } from './types';
import { generateId, getStartOfWeek, formatCurrency } from './utils';
import DashboardTab from './components/DashboardTab';
import PlanningTab from './components/PlanningTab';
import AccountsTab from './components/AccountsTab';
import SettingsTab from './components/SettingsTab';

const STORAGE_KEY = 'forex_master_v2_data';

const DEFAULT_CONFIG: AppConfig = {
  usdToBrlRate: 5.50,
  dateFormat: 'DD/MM/YYYY',
  notifications: {
    goalReached: true,
    lossStreak: 3,
    maxTradesExceeded: true,
  }
};

const App: React.FC = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan[]>([]);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');

  // --- PERSISTENCE ---
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: AppState = JSON.parse(saved);
        setAccounts(parsed.accounts || []);
        setTrades(parsed.trades || []);
        setWeeklyPlans(parsed.weeklyPlans || []);
        setConfig(parsed.config || DEFAULT_CONFIG);
      }
    } catch (e) {
      console.error("Error loading data", e);
    }
  }, []);

  useEffect(() => {
    const state: AppState = { accounts, trades, weeklyPlans, config };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [accounts, trades, weeklyPlans, config]);

  // --- ACTIONS ---
  const addAccount = (acc: Omit<Account, 'id'>) => setAccounts([...accounts, { ...acc, id: generateId() }]);
  const updateAccount = (acc: Account) => setAccounts(accounts.map(a => a.id === acc.id ? acc : a));
  const deleteAccount = (id: string) => {
    if (confirm("Tem certeza? Isso apagará todos os trades desta conta.")) {
      setAccounts(accounts.filter(a => a.id !== id));
      setTrades(trades.filter(t => t.accountId !== id));
      setWeeklyPlans(weeklyPlans.filter(p => p.accountId !== id));
      if (selectedAccountId === id) setSelectedAccountId('all');
    }
  };

  const addTrade = (t: Omit<Trade, 'id' | 'profitUSD'>) => {
    const profitUSD = t.points * t.valuePerPoint;
    setTrades([{ ...t, id: generateId(), profitUSD }, ...trades]);
  };
  const deleteTrade = (id: string) => setTrades(trades.filter(t => t.id !== id));

  const saveWeeklyPlan = (plan: Omit<WeeklyPlan, 'id'>) => {
    const existing = weeklyPlans.find(p => p.accountId === plan.accountId && p.weekStart === plan.weekStart);
    if (existing) {
      setWeeklyPlans(weeklyPlans.map(p => p.id === existing.id ? { ...plan, id: existing.id } : p));
    } else {
      setWeeklyPlans([{ ...plan, id: generateId() }, ...weeklyPlans]);
    }
  };

  // --- FILTERED DATA ---
  const filteredTrades = useMemo(() => 
    selectedAccountId === 'all' ? trades : trades.filter(t => t.accountId === selectedAccountId)
  , [trades, selectedAccountId]);

  const activeAccount = useMemo(() => 
    accounts.find(a => a.id === selectedAccountId)
  , [accounts, selectedAccountId]);

  // --- NAVIGATION COMPONENT ---
  const NavItem = ({ id, label, icon }: { id: TabType, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex flex-col md:flex-row items-center gap-2 px-4 py-3 text-sm font-semibold transition-all border-b-2 md:border-b-0 md:border-l-2
        ${activeTab === id 
          ? 'border-blue-500 text-blue-500 bg-blue-500/5' 
          : 'border-transparent text-zinc-500 hover:text-white hover:bg-zinc-800/50'}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-64 bg-zinc-950 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-row md:flex-col shrink-0 z-20 sticky top-0 md:h-screen overflow-x-auto">
        <div className="hidden md:flex p-6 border-b border-zinc-800">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
            Trade Master
          </h1>
        </div>
        
        <div className="flex flex-row md:flex-col flex-1">
          <NavItem id="dashboard" label="Dashboard" icon={<IconDashboard />} />
          <NavItem id="planning" label="Planejamento" icon={<IconPlanning />} />
          <NavItem id="accounts" label="Contas/Mesas" icon={<IconAccounts />} />
          <NavItem id="settings" label="Configurações" icon={<IconSettings />} />
        </div>

        <div className="hidden md:block p-4 mt-auto border-t border-zinc-800">
          <div className="text-[10px] text-zinc-500 uppercase font-bold mb-2">Conta Ativa</div>
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 text-xs py-2 px-3 rounded focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todas as Contas</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name} ({formatCurrency(acc.size)})</option>
            ))}
          </select>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto p-4 md:p-8">
        {/* Global Account Selector for Mobile */}
        <div className="md:hidden mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Trade Master</h2>
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 text-xs py-2 px-3 rounded"
          >
            <option value="all">Todas</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        </div>

        {activeTab === 'dashboard' && (
          <DashboardTab 
            trades={filteredTrades} 
            accounts={accounts} 
            selectedAccountId={selectedAccountId}
            config={config}
            onAddTrade={addTrade}
            onDeleteTrade={deleteTrade}
          />
        )}
        
        {activeTab === 'planning' && (
          <PlanningTab 
            trades={trades} 
            plans={weeklyPlans} 
            accounts={accounts}
            selectedAccountId={selectedAccountId}
            onSavePlan={saveWeeklyPlan}
          />
        )}

        {activeTab === 'accounts' && (
          <AccountsTab 
            accounts={accounts} 
            trades={trades}
            config={config}
            onAdd={addAccount}
            onUpdate={updateAccount}
            onDelete={deleteAccount}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab 
            config={config} 
            onUpdateConfig={setConfig} 
            onResetData={() => {
              if (confirm("Resetar tudo?")) {
                setAccounts([]);
                setTrades([]);
                setWeeklyPlans([]);
                setConfig(DEFAULT_CONFIG);
              }
            }}
            allData={{ accounts, trades, weeklyPlans, config }}
            onImportData={(data) => {
               setAccounts(data.accounts);
               setTrades(data.trades);
               setWeeklyPlans(data.weeklyPlans);
               setConfig(data.config);
            }}
          />
        )}
      </main>
    </div>
  );
};

// --- SVG ICONS ---
const IconDashboard = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" /></svg>
);
const IconPlanning = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
);
const IconAccounts = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
);
const IconSettings = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);

export default App;
