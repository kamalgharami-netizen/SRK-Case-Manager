import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import {
  ShieldAlert,
  UserPlus,
  Trash2,
  Clock,
  Shield,
  Activity,
  CheckCircle2
} from 'lucide-react';

export const TeamRoles: React.FC = () => {
  const { activeCompany, activeUser, addUser, deleteUser, showToast } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('Junior Advocate');
  const [password, setPassword] = useState('');

  const users = activeCompany?.users || [];
  const activityLog = activeCompany?.activityLog || [];

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name is required', 'error');
      return;
    }
    if (!email.trim()) {
      showToast('Email is required', 'error');
      return;
    }
    if (password.length < 3) {
      showToast('Password must be at least 3 characters', 'error');
      return;
    }

    const ok = addUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role,
      password,
      isMain: false
    });

    if (ok) {
      setModalOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
    }
  };

  const roleColors: Record<Role, string> = {
    Admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
    'Junior Advocate': 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
    Clerk: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300',
    Accountant: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-blue-600" />
            <span>Chamber Team & Audit Trail (টিম ও অডিট লগ)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage associate advocates, muhuris, clerks, and monitor audit history.
          </p>
        </div>

        {activeUser?.role === 'Admin' && (
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> + Add Member
          </button>
        )}
      </div>

      {/* Team Members List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-2">
          Chamber Members ({users.length})
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {users.map(u => (
            <div
              key={u.id}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {u.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <span>{u.name}</span>
                    {u.isMain && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                        Lead
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {u.email} {u.phone ? `· ${u.phone}` : ''}
                  </div>
                  <div className="mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${roleColors[u.role]}`}>
                      {u.role}
                    </span>
                  </div>
                </div>
              </div>

              {!u.isMain && activeUser?.role === 'Admin' && (
                <button
                  onClick={() => {
                    if (confirm(`Remove ${u.name} from chamber?`)) {
                      deleteUser(u.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                  title="Remove User"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Activity Audit Log */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-blue-600" />
            <span>Audit Trail & Activity Log ({activityLog.length} events)</span>
          </span>
          <span className="text-[11px] text-slate-400">Chronological Chamber Actions</span>
        </div>

        {activityLog.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {activityLog.map(act => (
              <div key={act.id} className="py-2.5 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-slate-900 dark:text-slate-100 font-medium">
                    {act.text}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {act.userName}
                    </span>
                    <span>({act.role})</span>
                  </div>
                </div>
                <div className="font-mono text-[10px] text-slate-400 whitespace-nowrap flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(act.time).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-4 text-center">No activity recorded yet.</p>
        )}
      </div>

      {/* Modal: Add User */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                + Add Chamber Team Member
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Adv. Subhash Mondal"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="subhash@chamber.in"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98741 XXXXX"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Role in Chamber
                  </label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as Role)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="Junior Advocate">Junior Advocate</option>
                    <option value="Clerk">Clerk (মুহুরী)</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Admin">Admin Advocate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Login Password *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 3 characters"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-700 hover:bg-blue-800 text-white"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
