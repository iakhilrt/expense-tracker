import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Wallet, Receipt, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const now = new Date();
        const response = await api.get('/dashboard/summary', {
          params: { month: now.getMonth() + 1, year: now.getFullYear() }
        });
        setData(response.data);
      } catch (err) {
        console.error('Failed to fetch summary', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!data) return (
    <div className="p-4 text-slate-500">
      No budget set for this month. Go to Budgets to set one.
    </div>
  );

  const lineData = Object.entries(data.dailyTrend).map(([date, amount]) => ({
    date: date.split('-').slice(1).join('/'),
    amount
  }));

  return (
    <div className="space-y-6 lg:space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm sm:text-base">
          Overview of your finances for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <div className="p-5 lg:p-6 bg-white glass rounded-2xl lg:rounded-3xl">
          <div className="flex items-center gap-3 lg:gap-4 mb-3 lg:mb-4">
            <div className="p-2.5 lg:p-3 bg-primary-100 rounded-xl lg:rounded-2xl">
              <Wallet className="w-5 h-5 lg:w-6 lg:h-6 text-primary-600" />
            </div>
            <span className="font-semibold text-slate-500 text-sm lg:text-base">Total Budget</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-slate-900">₹{data.totalBudget.toLocaleString()}</p>
        </div>

        <div className="p-5 lg:p-6 bg-white glass rounded-2xl lg:rounded-3xl">
          <div className="flex items-center gap-3 lg:gap-4 mb-3 lg:mb-4">
            <div className="p-2.5 lg:p-3 bg-red-100 rounded-xl lg:rounded-2xl">
              <Receipt className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
            </div>
            <span className="font-semibold text-slate-500 text-sm lg:text-base">Total Spent</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-slate-900">₹{data.totalSpent.toLocaleString()}</p>
        </div>

        <div className="p-5 lg:p-6 bg-white glass rounded-2xl lg:rounded-3xl">
          <div className="flex items-center gap-3 lg:gap-4 mb-3 lg:mb-4">
            <div className="p-2.5 lg:p-3 bg-emerald-100 rounded-xl lg:rounded-2xl">
              <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-600" />
            </div>
            <span className="font-semibold text-slate-500 text-sm lg:text-base">Remaining</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-emerald-600">₹{data.remainingBalance.toLocaleString()}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Category Breakdown */}
        <div className="bg-white p-6 lg:p-8 rounded-2xl lg:rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-lg lg:text-xl font-bold text-slate-900 mb-5 lg:mb-6">Category Spending</h2>
          {data.categoryBreakdown.length === 0 ? (
            <p className="text-slate-400 italic text-sm">No category data yet. Add expenses to see breakdown.</p>
          ) : (
            <div className="space-y-5">
              {data.categoryBreakdown.map((cat) => (
                <div key={cat.categoryName}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-slate-700">{cat.categoryName}</span>
                    <span className="text-xs sm:text-sm font-medium text-slate-500">
                      ₹{cat.spent.toLocaleString()} / ₹{cat.allocated.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${cat.percentage > 90 ? 'bg-red-500' : 'bg-primary-500'}`}
                      style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daily Trend */}
        <div className="bg-white p-6 lg:p-8 rounded-2xl lg:rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-lg lg:text-xl font-bold text-slate-900 mb-5 lg:mb-6">Daily Spending</h2>
          {lineData.length === 0 ? (
            <p className="text-slate-400 italic text-sm">No expenses recorded yet this month.</p>
          ) : (
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#0ea5e9"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#0ea5e9' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;