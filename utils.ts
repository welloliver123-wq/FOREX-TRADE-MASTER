
export const formatCurrency = (value: number, currency: string = 'USD') => {
  return new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : 'en-US', {
    style: 'currency',
    currency: currency,
  }).format(value);
};

export const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

export const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  const start = new Date(d.setDate(diff));
  return start.toISOString().split('T')[0];
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const getWeekHistory = (count: number = 4) => {
  const weeks = [];
  let current = new Date();
  for (let i = 0; i < count; i++) {
    const start = getStartOfWeek(current);
    weeks.push(start);
    current.setDate(current.getDate() - 7);
  }
  return weeks;
};
