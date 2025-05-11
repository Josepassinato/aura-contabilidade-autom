
/**
 * Get the last day of the month
 */
export const getLastDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 0).getDate();
};

/**
 * Get the day of the week for the first day of a month (0 = Sunday, 1 = Monday, etc.)
 */
export const getFirstDayOfWeek = (year: number, month: number) => {
  return new Date(year, month - 1, 1).getDay();
};

/**
 * Generate calendar days array including empty cells for alignment
 */
export const generateCalendarDays = (year: number, month: number) => {
  // Calculate the last day of the month
  const lastDay = getLastDayOfMonth(year, month);
  
  // Calculate the day of the week of the first day of the month
  const firstDayOfWeek = getFirstDayOfWeek(year, month);

  // Create array with all days of the month
  const days = Array.from({ length: lastDay }, (_, i) => i + 1);
  
  // Fill with empty days at the beginning for alignment with the day of the week
  const emptyDays = Array.from({ length: firstDayOfWeek }, (_, i) => null);
  
  // Combine empty days and days of the month
  return [...emptyDays, ...days];
};

/**
 * Get month name from month number
 */
export const getMonthName = (year: number, month: number) => {
  return new Date(year, month - 1, 1).toLocaleDateString('pt-BR', { month: 'long' });
};
