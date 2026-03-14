export const queryKeys = {
  categories: ['categories'],
  expenses: ['expenses'],
  budget: (month, year) => ['budget', month, year],
  dashboard: (month, year) => ['dashboard', month, year],
}