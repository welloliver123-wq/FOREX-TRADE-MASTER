
import React, { useState, useMemo } from 'react';
import { Trade, WeeklyPlan, Account } from '../types';
import { getStartOfWeek, formatCurrency, getWeekHistory } from '../utils';

interface PlanningTabProps {
  trades: Trade[];
  plans: WeeklyPlan[];
  accounts: Account[];
  selectedAccountId: string;
  onSavePlan: (p: Omit<WeeklyPlan, 'id'>) => void;
}

const PlanningTab: React.FC<PlanningTabProps> = ({ trades, plans, accounts, selectedAccountId, onSavePlan }) => {
  const currentWeekStart = getStartOfWeek(new Date());
  const historyWeeks = useMemo(() => getWeekHistory(4), []);
  
  const [activePlanAccountId, setActivePlanAccountId] = useState(
    selectedAccountId === 'all' ? (accounts[0]?.id || '') : selectedAccountId
  );

  const plan = useMemo(() => 
    plans.find(p => p.accountId === activePlanAccountId && p.weekStart === currentWeekStart) || {
      accountId: activePlanAccountId,
      weekStart: currentWeekStart,
      goalUSD: 0,
      goalPoints: 0,
      scheduledDays: [],
      maxTradesPerDay: 3,
      strategy: '',
      startTime: '09:00',
      endTime: '17:00'
    }
  , [plans, activePlanAccountId, currentWeekStart]);

  const [editPlan, setEditPlan] = useState(plan);

  // Stats for the active week plan
  const weekStats = useMemo(() => {
    const weekTrades = trades.filter(t => 
      t.accountId === activePlanAccountId && 
      getStartOfWeek(new Date(t.date)) === currentWeekStart
    );
    const totalUSD = weekTrades.reduce((acc, t) => acc + t.profitUSD, 0);
    const totalPoints = weekTrades.reduce((acc, t) => acc + t.points, 0);
    const progress = plan.goalUSD > 0 ? (totalUSD / plan.goalUSD) * 100 : 0;
    
    return { totalUSD, totalPoints, progress, count: weekTrades.length };
  }, [trades, activePlanAccountId, currentWeekStart, plan.goalUSD]);

  const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Planejamento Semanal</h2>
          <p className="text-zinc-500 text-sm">Defina e acompanhe suas metas</p>
        </div>
        <select 
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm"
          value={activePlanAccountId}
          onChange={(e) => {
            setActivePlanAccountId(e.target.value);
            const p = plans.find(pl => pl.accountId === e.target.value && pl.weekStart === currentWeekStart);
            if(p) setEditPlan(p);
          }}
        >
          {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
        </select>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Progress Section */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              Acompanhamento da Meta
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Meta USD</p>
                <p className="text-xl font-bold">{formatCurrency(plan.goalUSD)}</p>
              </div>
              <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Alcançado</p>
                <p className={`text-xl font-bold ${weekStats.totalUSD >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(weekStats.totalUSD)}
                </p>
              </div>
            </div>

            <div className="space-y-3">
               <div className="flex justify-between items-center text-xs">
                 <span className="text-zinc-500">Progresso</span>
                 <span className="font-bold">{weekStats.progress.toFixed(1)}%</span>
               </div>
               <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                 <div 
                   className={`h-full transition-all duration-700 ${weekStats.progress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                   style={{ width: `${Math.min(100, weekStats.progress)}%` }}
                 />
               </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex justify-between text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500">Trades Realizados</span>
                <span className="font-bold">{weekStats.count}</span>
              </div>
              <div className="flex flex-col gap-1 text-right">
                <span className="text-zinc-500">Status</span>
                <span className={`font-bold ${weekStats.totalUSD >= plan.goalUSD ? 'text-green-500' : 'text-orange-400'}`}>
                  {weekStats.totalUSD >= plan.goalUSD ? 'Meta Atingida' : 'Em Progresso'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="font-bold mb-4">Histórico de Metas</h3>
            <div className="space-y-3">
              {historyWeeks.map(weekStart => {
                const wPlan = plans.find(p => p.accountId === activePlanAccountId && p.weekStart === weekStart);
                const weekTrades = trades.filter(t => t.accountId === activePlanAccountId && getStartOfWeek(new Date(t.date)) === weekStart);
                const actual = weekTrades.reduce((acc, t) => acc + t.profitUSD, 0);
                const achieved = wPlan && wPlan.goalUSD > 0 ? (actual / wPlan.goalUSD) * 100 : 0;

                return (
                  <div key={weekStart} className="flex items-center justify-between p-3 bg-zinc-950/30 rounded-lg border border-zinc-800/50">
                    <div>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase">Semana {new Date(weekStart).toLocaleDateString('pt-BR')}</p>
                      <p className="text-xs text-zinc-300">Meta: {wPlan ? formatCurrency(wPlan.goalUSD) : '-'}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${achieved >= 100 ? 'text-green-500' : 'text-zinc-500'}`}>
                        {achieved.toFixed(0)}%
                      </p>
                      <p className="text-[10px]">{achieved >= 100 ? '✓ Atingida' : '✗ Falhou'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Setup Section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <h3 className="font-bold text-lg mb-6">Configurar Nova Meta</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Meta USD</label>
                <input type="number" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm" value={editPlan.goalUSD} onChange={e => setEditPlan({...editPlan, goalUSD: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Meta Pontos</label>
                <input type="number" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm" value={editPlan.goalPoints} onChange={e => setEditPlan({...editPlan, goalPoints: parseFloat(e.target.value) || 0})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Dias Planejados</label>
              <div className="flex gap-2">
                {DAYS.map(d => (
                  <button 
                    key={d} 
                    onClick={() => {
                      const days = editPlan.scheduledDays.includes(d) ? editPlan.scheduledDays.filter(day => day !== d) : [...editPlan.scheduledDays, d];
                      setEditPlan({...editPlan, scheduledDays: days});
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${editPlan.scheduledDays.includes(d) ? 'bg-blue-600' : 'bg-zinc-800 text-zinc-500 hover:text-white'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Início Operação</label>
                <input type="time" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm" value={editPlan.startTime} onChange={e => setEditPlan({...editPlan, startTime: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Fim Operação</label>
                <input type="time" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm" value={editPlan.endTime} onChange={e => setEditPlan({...editPlan, endTime: e.target.value})} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Estratégias / Foco</label>
              <textarea className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm h-32 resize-none" value={editPlan.strategy} onChange={e => setEditPlan({...editPlan, strategy: e.target.value})} placeholder="Anote as confluências e gatilhos da semana..." />
            </div>

            <button 
              onClick={() => onSavePlan(editPlan)}
              className="w-full bg-zinc-100 hover:bg-white text-black py-3 rounded-xl font-bold transition-all shadow-lg"
            >
              Salvar Planejamento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanningTab;
