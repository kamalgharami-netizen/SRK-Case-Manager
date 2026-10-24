import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Party } from '../types';
import { safePrintHtml, safeOpenWhatsApp } from '../utils/printDoc';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Trash2,
  Share2,
  Printer
} from 'lucide-react';

export const PartyRegistry: React.FC = () => {
  const { activeCompany, addParty, deleteParty, showToast } = useApp();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [modalOpen, setModalOpen] = useState(false);

  // New party form
  const [name, setName] = useState('');
  const [type, setType] = useState<Party['type']>('Client');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const parties = activeCompany?.parties || [];

  const filtered = parties.filter(p => {
    const matchType = typeFilter === 'All' || p.type === typeFilter;
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.address.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name is required', 'error');
      return;
    }
    addParty({
      name: name.trim(),
      type,
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      notes: notes.trim()
    });
    setModalOpen(false);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNotes('');
  };

  const printDirectory = () => {
    safePrintHtml(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Party Directory</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; color: #111; line-height: 1.5; }
            h2 { margin: 0 0 6px 0; color: #1E3A8A; text-align: center; }
            hr { border: none; border-top: 1.5px solid #1E3A8A; margin: 12px 0 16px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 13px; }
            th, td { border: 1px solid #777; padding: 8px 10px; text-align: left; }
            th { background: #E2E8F0; font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>${activeCompany?.name || 'Legal Chamber'}</h2>
          <div style="text-align: center; font-size: 12px; color: #555;">CHAMBER CLIENT & PARTY DIRECTORY (মক্কেল ও পক্ষ তালিকা)</div>
          <hr />
          <table>
            <thead>
              <tr>
                <th>Party Name</th>
                <th>Category</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              ${filtered
                .map(
                  p => `<tr>
                <td><strong>${p.name}</strong></td>
                <td>${p.type}</td>
                <td>${p.phone || '—'}</td>
                <td>${p.email || '—'}</td>
                <td>${p.address || '—'}</td>
              </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
  };

  const launchWhatsApp = (p: Party) => {
    if (!p.phone) {
      showToast('No phone number recorded for party', 'error');
      return;
    }
    safeOpenWhatsApp(
      p.phone,
      `Hello ${p.name}, greeting from ${activeCompany?.name || 'Legal Chamber'}. Please contact our chamber regarding your pending land matter.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>Party Registry (মক্কেল ও প্রতিপক্ষ রেজিস্ট্রি)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Directory of clients, opposite parties, advocate colleagues, and revenue vendors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={printDirectory}
            className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print Directory
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> + Add Party
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {['All', 'Client', 'Opposite Party', 'Advocate', 'Vendor'].map(cat => (
            <button
              key={cat}
              onClick={() => setTypeFilter(cat)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                typeFilter === cat
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value.toUpperCase())}
            placeholder="Search party by name, phone..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 uppercase focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Cards Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => {
            const badgeColor = {
              Client: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
              'Opposite Party': 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300',
              Advocate: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
              Vendor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
            }[p.type];

            return (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:border-blue-500 transition-colors flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {p.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {p.name}
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${badgeColor}`}>
                          {p.type}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`Remove ${p.name} from party registry?`)) {
                          deleteParty(p.id);
                        }
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Delete Party"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {p.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono">{p.phone}</span>
                      </div>
                    )}
                    {p.email && (
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{p.email}</span>
                      </div>
                    )}
                    {p.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-tight">{p.address}</span>
                      </div>
                    )}
                  </div>

                  {p.notes && (
                    <div className="mt-2 text-[11px] text-slate-500 italic bg-slate-50 dark:bg-slate-800/50 p-2 rounded">
                      {p.notes}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  {p.phone && (
                    <button
                      onClick={() => launchWhatsApp(p)}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 flex items-center gap-1 cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" /> WhatsApp Message
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 text-xs">
          No parties found matching your search.
        </div>
      )}

      {/* Modal: Add Party */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                + NEW PARTY REGISTRY ENTRY FORM
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value.toUpperCase())}
                  placeholder="e.g. Debashis Chatterjee"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Category
                </label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="Client">Client (মক্কেল)</option>
                  <option value="Opposite Party">Opposite Party (প্রতিপক্ষ)</option>
                  <option value="Advocate">Advocate Colleague (আইনজীবী)</option>
                  <option value="Vendor">Vendor / Registry Clerk (মুহুরী)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98301 XXXXX"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email@domain.com"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Residential / Office Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value.toUpperCase())}
                  placeholder="Street, City, PIN"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Remarks / Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Associated with Dag / Case"
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
                  Save Party
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
