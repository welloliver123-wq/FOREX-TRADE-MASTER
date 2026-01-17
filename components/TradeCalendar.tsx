
import React, { useState } from 'react';
import { Trade } from '../types';
import { getDaysInMonth, getFirstDayOfMonth, formatCurrency } from '../utils';

interface TradeCalendarProps {
  trades: Trade[];
}

const TradeCalendar: React.FC<TradeCalendarProps> = ({ trades }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(currentDate);

  // Group trades by day
  const tradesByDay: Record<number, number> = {};
  trades.forEach(t => {
    const d = new Date(t.date);
    if (d.getMonth() === month && d.getFullYear() === year) {
      const day = d.getDate();
      tradesByDay[day] = (tradesByDay[day] || 0) + t.profitUSD;
    }
  });

  const renderDays = () => {
    const days = [];
    // Padding for empty start
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-16 md:h-24 bg-zinc-950/20"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const result = tradesByDay[day];
      const hasTrades = result !== undefined;
      const isPositive = result > 0;
      const isNegative = result < 0;

      days.push(
        <div 
          key={day} 
          className={`h-16 md:h-24 border border-zinc-800/50 p-1 md:p-2 flex flex-col transition-colors group relative
            ${hasTrades ? (isPositive ? 'bg-green-500/10' : (isNegative ? 'bg-red-500/10' : 'bg-zinc-800/20')) : 'bg-zinc-900/40 hover:bg-zinc-800/60'}
          `}
        >
          <span className="text-xs text-zinc-500 group-hover:text-zinc-300">{day}</span>
          {hasTrades && (
            <div className={`mt-auto text-[10px] md:text-sm font-bold truncate text-center ${isPositive ? 'text-green-500' : (isNegative ? 'text-red-500' : 'text-zinc-400')}`}>
              {formatCurrency(result)}
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  // Calculate weekly totals
  const weekRows = [];
  const allDayElements = renderDays();
  for (let i = 0; i < allDayElements.length; i += 7) {
    const weekDays = allDayElements.slice(i, i + 7);
    
    // Calculate week sum
    let weekSum = 0;
    let hasTradeInWeek = false;
    for (let j = 0; j < 7; j++) {
      const dayIdx = i + j - firstDayOfMonth + 1;
      if (dayIdx >= 1 && dayIdx <= daysInMonth && tradesByDay[dayIdx] !== undefined) {
        weekSum += tradesByDay[dayIdx];
        hasTradeInWeek = true;
      }
    }

    weekRows.push(
      <div key={`week-${i}`} className="grid grid-cols-8 gap-px">
        <div className="grid grid-cols-7 col-span-7 gap-px">
          {weekDays}
          {weekDays.length < 7 && Array.from({ length: 7 - weekDays.length }).map((_, idx) => (
            <div key={`pad-${idx}`} className="h-16 md:h-24 bg-zinc-950/20"></div>
          ))}
        </div>
        <div className="h-16 md:h-24 bg-zinc-950 flex flex-col items-center justify-center border-l border-zinc-800">
          <span className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Total</span>
          <span className={`text-[10px] md:text-xs font-bold ${weekSum > 0 ? 'text-green-500' : (weekSum < 0 ? 'text-red-500' : 'text-zinc-400')}`}>
            {hasTradeInWeek ? formatCurrency(weekSum) : '-'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <h3 className="font-bold text-lg capitalize">{monthName} {year}</h3>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-8 gap-px bg-zinc-800 text-[10px] md:text-xs font-bold uppercase text-zinc-500 text-center py-2">
        <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
        <div className="border-l border-zinc-700">Semana</div>
      </div>

      <div className="bg-zinc-800 flex flex-col gap-px">
        {weekRows}
      </div>
    </div>
  );
};

export default TradeCalendar;
