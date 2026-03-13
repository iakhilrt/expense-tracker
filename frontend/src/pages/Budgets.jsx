import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Shield, ShieldAlert, ChevronDown } from 'lucide-react';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const YEARS = [2024, 2025, 2026];

const CustomSelect = ({ options, value, onChange, displayValue }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-primary-400 transition-colors min-w-[120px]"
      >
        <span>{displayValue}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden min-w-full">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-primary-50 hover:text-primary-700 ${
                value === opt.value ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Budgets = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [budget, setBudget] = useState({
    totalAmount: 0,
    governmentModeEnabled: false,
    categoryAllocations: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const catRes = await api.get('/api/categories');
        const allCategories = catRes.data;

        try {
          const budgetRes = await api.get('/api/budgets/current', {
            params: { month: selectedMonth, year: selectedYear }
          });
          const existingBudget = budgetRes.data;

          // Merge: keep existing allocations, add any new categories with 0
          const existingMap = new Map(
            existingBudget.categoryAllocations.map(a => [a.categoryId, a.allocatedAmount])
          );
          const mergedAllocations = allCategories.map(c => ({
            categoryId: c.id,
            categoryName: c.name,
            allocatedAmount: existingMap.get(c.id) ?? 0
          }));

          setBudget({ ...existingBudget, categoryAllocations: mergedAllocations });
        } catch (err) {
          // No budget yet — initialize all categories with 0
          setBudget({
            totalAmount: 0,
            governmentModeEnabled: false,
            categoryAllocations: allCategories.map(c => ({
              categoryId: c.id,
              categoryName: c.name,
              allocatedAmount: 0
            }))
          });
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedMonth, selectedYear]);

  const handleAllocationChange = (categoryId, amount) => {
    setBudget(prev => ({
      ...prev,
      categoryAllocations: prev.categoryAllocations.map(a =>
        a.categoryId === categoryId ? { ...a, allocatedAmount: parseFloat(amount) || 0 } : a
      )
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const response = await api.post('/api/budgets', {
        ...budget,
        month: selectedMonth,
        year: selectedYear
      });
      setBudget(response.data);
      setMessage('Budget saved successfully!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to save budget');
    } finally {
      setSaving(false);
    }
  };

  const totalAllocated = budget.categoryAllocations.reduce((sum, a) => sum + a.allocatedAmount, 0);

  const monthOptions = MONTHS.map((m, i) => ({ value: i + 1, label: m }));
  const yearOptions = YEARS.map(y => ({ value: y, label: String(y) }));

  if (loading) return <div className="p-4 text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Budget Setup</h1>
          <p className="text-slate-500 text-sm sm:text-base">Plan your spending for the month</p>
        </div>
        <div className="flex gap-3">
          <CustomSelect
            options={monthOptions}
            value={selectedMonth}
            onChange={setSelectedMonth}
            displayValue={MONTHS[selectedMonth - 1]}
          />
          <CustomSelect
            options={yearOptions}
            value={selectedYear}
            onChange={setSelectedYear}
            displayValue={String(selectedYear)}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 lg:p-8 rounded-2xl lg:rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-lg lg:text-xl font-bold text-slate-900 mb-5 lg:mb-6">Category Allocations</h2>
            {budget.categoryAllocations.length === 0 ? (
              <p className="text-slate-400 italic text-sm">No categories yet. Go to Categories to create some first.</p>
            ) : (
              <div className="space-y-3">
                {budget.categoryAllocations.map((allocation) => (
                  <div key={allocation.categoryId} className="flex items-center gap-3 p-3 lg:p-4 hover:bg-slate-50 rounded-2xl transition-colors">
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-slate-700 text-sm lg:text-base truncate block">
                        {allocation.categoryName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-slate-400 text-sm">₹</span>
                      <input
                        type="number"
                        value={allocation.allocatedAmount}
                        onChange={(e) => handleAllocationChange(allocation.categoryId, e.target.value)}
                        className="w-28 sm:w-32 px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all text-right text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white p-6 lg:p-8 rounded-2xl lg:rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-lg lg:text-xl font-bold text-slate-900 mb-5 lg:mb-6">Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm lg:text-base">
                <span className="text-slate-500">Total Allocated</span>
                <span className="font-bold text-slate-900">₹{totalAllocated.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm lg:text-base">
                <span className="text-slate-500">Budget Limit</span>
                <input
                  type="number"
                  value={budget.totalAmount === 0 ? '' : budget.totalAmount}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  onChange={(e) => setBudget({ ...budget, totalAmount: parseFloat(e.target.value) || 0 })}
                  className="w-28 px-2 py-1 bg-slate-50 rounded-lg text-right font-bold text-slate-900 outline-none border border-transparent focus:border-primary-300 transition-all text-sm lg:text-base"
                />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div
                  className={`flex items-center gap-3 p-4 rounded-2xl transition-all cursor-pointer ${
                    budget.governmentModeEnabled
                      ? 'bg-red-50 border border-red-100'
                      : 'bg-slate-50 border border-slate-100'
                  }`}
                  onClick={() => setBudget({ ...budget, governmentModeEnabled: !budget.governmentModeEnabled })}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${budget.governmentModeEnabled ? 'bg-red-500' : 'bg-slate-400'}`}>
                    {budget.governmentModeEnabled
                      ? <ShieldAlert className="w-4 h-4 text-white" />
                      : <Shield className="w-4 h-4 text-white" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${budget.governmentModeEnabled ? 'text-red-700' : 'text-slate-700'}`}>
                      Government Mode
                    </p>
                    <p className="text-xs text-slate-500">
                      {budget.governmentModeEnabled ? 'Enforcement Active' : 'Off'}
                    </p>
                  </div>
                  <div className={`w-10 h-6 rounded-full relative transition-colors shrink-0 ${budget.governmentModeEnabled ? 'bg-red-500' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${budget.governmentModeEnabled ? 'left-5' : 'left-1'}`} />
                  </div>
                </div>
              </div>

              {message && (
                <p className={`text-sm text-center font-medium ${message.includes('success') ? 'text-emerald-600' : 'text-red-500'}`}>
                  {message}
                </p>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 lg:py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-lg shadow-primary-200 text-sm lg:text-base"
              >
                {saving ? 'Saving...' : 'Set Monthly Budget'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Budgets;