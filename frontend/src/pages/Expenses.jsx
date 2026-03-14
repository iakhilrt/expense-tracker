import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Edit2, Trash2, X, Search, ShieldAlert } from 'lucide-react';

const getTodayDate = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const localDate = new Date(today.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split('T')[0];
};

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    categoryId: '',
    expenseDate: getTodayDate(),
    notes: ''
  });
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      const [expRes, catRes] = await Promise.all([
        api.get('/api/expenses'),
        api.get('/api/categories')
      ]);
      setExpenses(expRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = { ...formData, amount: parseFloat(formData.amount) };
      if (editingExpense) {
        await api.put(`/api/expenses/${editingExpense.id}`, data);
      } else {
        await api.post('/api/expenses', data);
      }
      fetchData();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save expense');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this expense?')) {
      try {
        await api.delete(`/api/expenses/${id}`);
        fetchData();
      } catch (err) {
        console.error('Failed to delete expense', err);
      }
    }
  };

  const openModal = (expense = null) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        title: expense.title,
        amount: expense.amount,
        categoryId: expense.categoryId,
        expenseDate: expense.expenseDate,
        notes: expense.notes || ''
      });
    } else {
      setEditingExpense(null);
      setFormData({
        title: '',
        amount: '',
        categoryId: categories[0]?.id || '',
        expenseDate: getTodayDate(),
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
    setError('');
  };

  const filteredExpenses = expenses
    .filter(e =>
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {

      // 1️⃣ Sort by date (latest first)
      const dateDiff = new Date(b.expenseDate) - new Date(a.expenseDate);
      if (dateDiff !== 0) return dateDiff;

      // 2️⃣ If same date → lower amount first
      return a.amount - b.amount;
    });

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Expenses</h1>
          <p className="text-slate-500 text-sm sm:text-base">Track your daily spending</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-primary-200 text-sm lg:text-base"
        >
          <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
          Add Expense
        </button>
      </header>

      {/* Search */}
      <div className="flex gap-4 p-3 lg:p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 lg:pl-12 pr-4 py-2.5 lg:py-3 bg-slate-50 rounded-xl border border-transparent focus:bg-white focus:border-primary-500 outline-none transition-all text-sm lg:text-base"
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block bg-white rounded-2xl lg:rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 lg:px-8 py-4 lg:py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Expense</th>
              <th className="px-6 lg:px-8 py-4 lg:py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
              <th className="px-6 lg:px-8 py-4 lg:py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
              <th className="px-6 lg:px-8 py-4 lg:py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredExpenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 lg:px-8 py-4 lg:py-6">
                  <div className="font-bold text-slate-900 text-sm lg:text-base">{expense.title}</div>
                  <div className="text-xs lg:text-sm text-slate-400">{new Date(expense.expenseDate).toLocaleDateString('en-GB')}</div>
                </td>
                <td className="px-6 lg:px-8 py-4 lg:py-6">
                  <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-100 rounded-full w-fit">
                    <span className="text-sm">{expense.categoryIcon}</span>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{expense.categoryName}</span>
                  </div>
                </td>
                <td className="px-6 lg:px-8 py-4 lg:py-6 text-right font-bold text-slate-900 text-sm lg:text-base">
                  ₹{expense.amount.toLocaleString()}
                </td>
                <td className="px-6 lg:px-8 py-4 lg:py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openModal(expense)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(expense.id)} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="sm:hidden space-y-3">
        {filteredExpenses.map((expense) => (
          <div key={expense.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0 mr-3">
                <p className="font-bold text-slate-900 truncate">{expense.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{new Date(expense.expenseDate).toLocaleDateString()}</p>
              </div>
              <p className="font-bold text-slate-900 shrink-0">₹{expense.amount.toLocaleString()}</p>
            </div>
            <div className="flex justify-between items-center mt-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-full">
                <span className="text-sm">{expense.categoryIcon}</span>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{expense.categoryName}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openModal(expense)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(expense.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredExpenses.length === 0 && (
          <p className="text-center text-slate-400 italic text-sm py-8">No expenses found.</p>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5 lg:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{editingExpense ? 'Edit' : 'Add'} Expense</h2>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
              {error && (
                <div className="p-3 lg:p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-semibold">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm"
                  placeholder="e.g. Starbucks, Grocery"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.expenseDate}
                    onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                <select
                  required
                  value={formData.categoryId || ""}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all bg-white text-sm"
                >
                  <option value="" disabled hidden>
                    Select Category
                  </option>

                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 lg:gap-4 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-2xl transition-colors shadow-lg shadow-primary-200 text-sm"
                >
                  {editingExpense ? 'Update' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;