import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { queryKeys } from '../services/queryKeys';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const Categories = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', icon: '💰', color: '#0ea5e9' });

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const { data: categories = [], isLoading } = useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => api.get('/api/categories').then(r => r.data),
  });

  // ── Mutations ──────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data) => api.post('/api/categories', data),
    onSuccess: () => {
      // Invalidate categories so budget page gets new category too
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/api/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message ||
        'Category cannot be deleted because it is used in budgets or expenses.';
      alert(message.replace(/^409\s*CONFLICT\s*/i, ''));
    },
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(id);
    }
  };

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, icon: category.icon, color: category.color });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', icon: '💰', color: '#0ea5e9' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', icon: '💰', color: '#0ea5e9' });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isLoading) return <div className="p-4 text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-500 text-sm sm:text-base">Manage your expense categories</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-primary-200 text-sm lg:text-base"
        >
          <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
          Add Category
        </button>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {categories.map((category) => (
          <div key={category.id} className="p-4 lg:p-6 bg-white glass rounded-2xl lg:rounded-3xl group transition-all hover:scale-[1.02]">
            <div className="flex justify-between items-start mb-3 lg:mb-4">
              <div
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center text-xl lg:text-2xl"
                style={{ backgroundColor: `${category.color}15`, color: category.color }}
              >
                {category.icon}
              </div>
              <div className="flex gap-1 lg:gap-2">
                <button onClick={() => openModal(category)} className="p-1.5 lg:p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary-600">
                  <Edit2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  disabled={deleteMutation.isPending}
                  className="p-1.5 lg:p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                </button>
              </div>
            </div>
            <h3 className="text-sm lg:text-lg font-bold text-slate-900 truncate">{category.name}</h3>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 w-full sm:max-w-md">
            <div className="flex justify-between items-center mb-5 lg:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {editingCategory ? 'Edit' : 'Add'} Category
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm"
                  placeholder="e.g. Food, Transport"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Icon (Emoji)</label>
                  <input
                    type="text"
                    required
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all text-center text-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Color</label>
                  <input
                    type="color"
                    required
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-[50px] p-1 rounded-xl border border-slate-200 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl transition-colors text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving}
                  className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold rounded-2xl transition-colors shadow-lg shadow-primary-200 text-sm">
                  {isSaving ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;