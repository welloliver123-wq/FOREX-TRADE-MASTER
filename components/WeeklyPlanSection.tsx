
import React, { useState, useMemo } from 'react';
import { Trade, WeeklyPlan } from '../types';
import { getStartOfWeek, formatCurrency, generateId } from '../utils';

interface WeeklyPlanSectionProps {
  trades: Trade[];
  plans: WeeklyPlan[];
  onSavePlan: (plan: WeeklyPlan) => void;
}

const WeeklyPlanSection: React.FC<WeeklyPlanSectionProps> = ({ trades, plans, onSavePlan }) => {
  // FIX: getStartOfWeek already returns a YYYY-MM-DD string, so .toISOString() is not applicable.
  const currentWeekStart = getStartOfWeek(new Date());
  
  const activePlan = useMemo(() => {
    return plans.find(p => p.weekStart.split('T')[0] === currentWeekStart) || {
      id: generateId(),
      weekStart: currentWeekStart,
      goalUSD: 0,
      goalPoints: 0,
      scheduledDays: [],
      maxTradesPerDay: 3,
      strategy: ''
    };
  }, [plans, currentWeekStart]);

  const [editPlan, setEditPlan] = useState<WeeklyPlan>(activePlan);
  const [isEditing, setIsEditing] = useState(false);

  // Stats for the current week
  const weekStats = useMemo(() => {
    const weekTrades = trades.filter(t => {
      // FIX: getStartOfWeek already returns a YYYY-MM-DD string, so .toISOString() is not applicable.
      const tradeWeekStart = getStartOfWeek(new Date(t.date));
      return tradeWeekStart === currentWeekStart;
    });

    const totalUSD = weekTrades.reduce((acc, t) => acc + t.profitUSD, 0);
    const totalPoints = weekTrades.reduce((acc, t) => acc + t.points, 0);
    
    // Days left logic (assuming 5 trading days: Mon-Fri)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0-Sun to 6-Sat
    const daysLeft = Math.max(0, 5 - (dayOfWeek === 0 ? 5 : dayOfWeek)); 

    const progressPct = activePlan.goalUSD > 0 ? (totalUSD / activePlan.goalUSD) * 100 : 0;
    const remainingToGoal = activePlan.goalUSD - totalUSD;
    const dailyNeeded = daysLeft > 0 ? remainingToGoal / daysLeft : 0;

    return {
      totalUSD,
      totalPoints,
      progressPct,
      remainingToGoal,
      dailyNeeded,
      daysLeft,
      count: weekTrades.length
    };
  }, [trades, currentWeekStart, activePlan.goalUSD]);

  const handleSave = () => {
    onSavePlan(editPlan);
    setIsEditing(false);
  };

  const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
        <h3 className="font-bold">Planejamento Semanal</h3>
        <button 
          onClick={() => {
            setEditPlan(activePlan);
            setIsEditing(!isEditing);
          }}
          className="text-xs text-blue-500 hover:text-blue-400 font-bold uppercase tracking-wider"
        >
          {isEditing ? 'Cancelar' : 'Editar Meta'}
        </button>
      </div>

      <div className="p-5 space-y-6">
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase font-bold">Meta USD</label>
                <input 
                  type="number"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-sm"
                  value={editPlan.goalUSD}
                  onChange={e => setEditPlan({...editPlan, goalUSD: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase font-bold">Meta Pontos</label>
                <input 
                  type="number"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-sm"
                  value={editPlan.goalPoints}
                  onChange={e => setEditPlan({...editPlan, goalPoints: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 uppercase font-bold">Dias para Operar</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(day => (
                  <button
                    key={day}
                    onClick={() => {
                      const current = editPlan.scheduledDays;
                      const next = current.includes(day) ? current.filter(d => d !== day) : [...current, day];
                      setEditPlan({...editPlan, scheduledDays: next});
                    }}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition-colors ${editPlan.scheduledDays.includes(day) ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 uppercase font-bold">Estratégias / Notas</label>
              <textarea 
                className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-sm h-20 resize-none"
                value={editPlan.strategy}
                onChange={e => setEditPlan({...editPlan, strategy: e.target.value})}
              />
            </div>

            <button 
              onClick={handleSave}
              className="w-full bg-blue-600 py-2 rounded font-bold text-sm"
            >
              Salvar Plano
            </button>
          </div>
        ) : (
          <>
            {/* Visual Goals */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block uppercase">Meta Semanal</span>
                <span className="text-lg font-bold">{formatCurrency(activePlan.goalUSD)}</span>
              </div>
              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block uppercase">Realizado</span>
                <span className={`text-lg font-bold ${weekStats.totalUSD >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(weekStats.totalUSD)}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase">
                <span className="text-zinc-400">Progresso da Meta</span>
                <span className={weekStats.progressPct >= 100 ? 'text-green-500' : 'text-blue-500'}>
                  {weekStats.progressPct.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${weekStats.progressPct >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min(100, weekStats.progressPct)}%` }}
                />
              </div>
              <p className="text-[10px] text-zinc-500 text-center italic">
                {weekStats.progressPct >= 100 ? 'Meta batida! Excelente trabalho.' : 
                 (weekStats.totalUSD < 0 ? 'Semana difícil. Mantenha o foco.' : 'Em busca da meta semanal.')}
              </p>
            </div>

            {/* Daily stats */}
            <div className="pt-4 border-t border-zinc-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Dias de pregão restantes</span>
                <span className="text-xs font-bold">{weekStats.daysLeft}d</span>
              </div>
              {weekStats.daysLeft > 0 && weekStats.remainingToGoal > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400">Média necessária p/ dia</span>
                  <span className="text-xs font-bold text-orange-400">{formatCurrency(weekStats.dailyNeeded)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Pontos Capturados</span>
                <span className="text-xs font-bold text-zinc-300">{weekStats.totalPoints} pts</span>
              </div>
            </div>

            {/* Strategy Box */}
            {activePlan.strategy && (
              <div className="bg-zinc-800/40 p-3 rounded border border-zinc-700/50">
                <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Estratégias / Foco</p>
                <p className="text-xs text-zinc-300 whitespace-pre-wrap">{activePlan.strategy}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WeeklyPlanSection;
