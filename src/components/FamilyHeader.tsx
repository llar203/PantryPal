import React from 'react';
import { motion } from 'motion/react';
import { FamilyProfile, SavingStats } from '../types';
import { TrendingUp, Users, DollarSign, Award, Percent, RefreshCw } from 'lucide-react';

interface FamilyHeaderProps {
  stats: SavingStats;
  profiles: FamilyProfile[];
  activeId: string;
  onProfileSelect: (id: string) => void;
  onAddNewMember: (name: string, avatar: string, color: string) => void;
  onResetData: () => void;
  isResetting: boolean;
}

export default function FamilyHeader({
  stats,
  profiles,
  activeId,
  onProfileSelect,
  onAddNewMember,
  onResetData,
  isResetting
}: FamilyHeaderProps) {
  const [showMemberModal, setShowMemberModal] = React.useState(false);
  const [newMemberName, setNewMemberName] = React.useState('');
  const [newMemberAvatar, setNewMemberAvatar] = React.useState('🥑');
  const [newMemberColor, setNewMemberColor] = React.useState('from-emerald-500 to-teal-500');

  const activeProfile = profiles.find(p => p.id === activeId) || profiles[0];

  const avatars = ['🥑', '👩‍🍳', '👨‍💻', '👶', '🍕', '🍯', '🥯', '🥗', '🥦', '🐱', '🤖'];
  const colors = [
    { value: 'from-emerald-500 to-teal-500', name: 'Emerald' },
    { value: 'from-pink-500 to-rose-500', name: 'Rose' },
    { value: 'from-amber-400 to-orange-500', name: 'Orange' },
    { value: 'from-indigo-500 to-purple-500', name: 'Violet' },
    { value: 'from-cyan-400 to-blue-500', name: 'Azure' }
  ];

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    onAddNewMember(newMemberName.trim(), newMemberAvatar, newMemberColor);
    setNewMemberName('');
    setShowMemberModal(false);
  };

  return (
    <div id="family-header-container" className="relative bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
      {/* Upper Section with Title and Family Profile Picker */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 text-xs font-semibold tracking-wider text-emerald-700 bg-emerald-50 rounded-full uppercase">
              Smart Household State
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-sans">
            PantryPal
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Rescuing ingredients, avoiding waste, and crafting home meals securely.
          </p>
        </div>

        {/* Profile Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
            {profiles.map(p => {
              const isActive = p.id === activeId;
              return (
                <button
                  key={p.id}
                  id={`profile-btn-${p.id}`}
                  onClick={() => onProfileSelect(p.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900 ring-offset-2'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <span className="text-base">{p.avatar}</span>
                  <span className="max-w-[120px] truncate">{p.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          <button
            id="add-family-member-btn"
            onClick={() => setShowMemberModal(true)}
            className="flex items-center justify-center w-8 h-8 rounded-full border border-dashed border-slate-300 text-slate-600 hover:text-slate-950 hover:border-slate-500 transition-colors"
            title="Invite family member"
          >
            +
          </button>

          <button
            id="reset-pantry-btn"
            onClick={onResetData}
            disabled={isResetting}
            title="Reset simulation data to default"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            Reset Data
          </button>
        </div>
      </div>

      {/* Shared Kitchen Financial Savings Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        
        {/* Total Money Saved */}
        <div id="stat-card-money-saved" className="bg-gradient-to-br from-emerald-50/60 to-emerald-100/30 p-5 rounded-2xl border border-emerald-500/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-800/80 uppercase tracking-wider">Estimated Savings</span>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl md:text-3xl font-extrabold text-emerald-900 font-sans">
              ${stats.moneySaved.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-700 mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Rescued food consumption value</span>
          </div>
        </div>

        {/* Efficiency Rating */}
        <div id="stat-card-efficiency" className="bg-gradient-to-br from-indigo-50/60 to-indigo-100/30 p-5 rounded-2xl border border-indigo-500/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-indigo-800/80 uppercase tracking-wider">Waste Optimization</span>
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl md:text-3xl font-extrabold text-indigo-900 font-sans">
              {stats.wasteReductionRate}%
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-indigo-700 mt-2">
            <Award className="w-3.5 h-3.5" />
            <span>Target: 95% efficiency</span>
          </div>
        </div>

        {/* Food Saved Counter */}
        <div id="stat-card-items-saved" className="bg-gradient-to-br from-teal-50/60 to-teal-100/30 p-5 rounded-2xl border border-teal-500/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-teal-800/80 uppercase tracking-wider">Rescued Items</span>
            <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600">
              <span className="text-sm font-bold">Res</span>
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl md:text-3xl font-extrabold text-teal-900 font-sans">
              {stats.itemsSavedCount}
            </span>
            <span className="text-xs text-teal-700/80">items</span>
          </div>
          <p className="text-xs text-teal-700 mt-2 font-medium">
            Responded to expiry alerts safely
          </p>
        </div>

        {/* Food Lost Counter */}
        <div id="stat-card-items-lost" className="bg-gradient-to-br from-rose-50/60 to-rose-100/30 p-5 rounded-2xl border border-rose-500/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-rose-800/80 uppercase tracking-wider">Wasted Capital</span>
            <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600">
              <span className="text-xs text-rose-700">⚠️</span>
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl md:text-3xl font-extrabold text-rose-950 font-sans">
              ${stats.moneyWasted.toFixed(2)}
            </span>
            <span className="text-xs text-rose-700">({stats.itemsWastedCount} items)</span>
          </div>
          <p className="text-xs text-rose-700 mt-2 font-medium">
            Unused food expired and discarded
          </p>
        </div>

      </div>

      {/* Household goal indicator */}
      <div className="mt-5 bg-slate-50 border border-slate-100/70 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 text-white rounded-xl text-base">
            ✨
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800"> family Zero-Waste Milestone </h4>
            <p className="text-xs text-slate-500">Save $200.00 this month by using recipes before expiration</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-48">
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (stats.moneySaved / 200) * 100)}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
            {Math.round((stats.moneySaved / 200) * 100)}% Complete
          </span>
        </div>
      </div>

      {/* Add Member Dialog */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-2">Create Household Profile</h3>
            <p className="text-xs text-slate-500 mb-4">Adding a member lets you share and synchronize inventories together.</p>

            <form onSubmit={handleCreateMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Leo Larocca"
                  value={newMemberName}
                  onChange={e => setNewMemberName(e.target.value)}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select Avatar</label>
                <div className="flex flex-wrap gap-2 p-2 bg-slate-50 border border-slate-200/50 rounded-xl max-h-[110px] overflow-y-auto">
                  {avatars.map(av => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setNewMemberAvatar(av)}
                      className={`w-9 h-9 flex items-center justify-center rounded-xl text-lg transition-all ${
                        newMemberAvatar === av ? 'bg-slate-950 scale-110 shadow-sm' : 'hover:bg-slate-200'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Accent Theme</label>
                <div className="flex gap-2">
                  {colors.map(col => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => setNewMemberColor(col.value)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-full text-white bg-gradient-to-r ${col.value} ${
                        newMemberColor === col.value ? 'ring-2 ring-slate-900 ring-offset-1' : 'opacity-80'
                      }`}
                    >
                      {col.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-slate-950 hover:bg-slate-900 rounded-xl shadow-sm"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
