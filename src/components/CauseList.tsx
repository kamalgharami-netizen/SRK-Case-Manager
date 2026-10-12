import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CauseItem } from '../types';
import {
  Calendar,
  Plus,
  Printer,
  Trash2,
  Edit2,
  Share2,
  CheckCircle2,
  Clock,
  Search,
  Filter
} from 'lucide-react';

export const CauseList: React.FC = () => {
  const { activeCompany, addCauseItem, updateCauseItem, deleteCauseItem, showToast } = useApp();

  const [dateFilter, setDateFilter] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [showAllDates, setShowAllDates] = useState(false);
  const [search, setSearch] = useState('');

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CauseItem | null>(null);

  const [time, setTime] = useState('10:30 AM');
  const [caseNo, setCaseNo] = useState('');
  const [forum, setForum] = useState('BL&LRO');
  const [party, setParty] = useState('');
  const [status, setStatus] = useState<'READY' | 'PENDING' | 'ADJOURNED' | 'DISPOSED'>('READY');
  const [hearingDate, setHearingDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [benchRoom, setBenchRoom] = useState('Courtroom 1');

  const causeList = activeCompany?.causeList || [];

  const filteredList = causeList.filter(item => {
    const matchDate = showAllDates || item.date === dateFilter;
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      item.caseNo.toLowerCase().includes(q) ||
      item.party.toLowerCase().includes(q) ||
      item.forum.toLowerCase().includes(q);
    return matchDate && matchSearch;
  });

  const openAddModal = () => {
    setEditingItem(null);
    setTime('10:30 AM');
    setCaseNo('');
    setForum('BL&LRO');
    setParty('');
    setStatus('READY');
    setHearingDate(dateFilter);
    setBenchRoom('Courtroom 1');
    setModalOpen(true);
  };

  const openEditModal = (item: CauseItem) => {
    setEditingItem(item);
    setTime(item.time);
    setCaseNo(item.caseNo);
    setForum(item.forum);
    setParty(item.party);
    setStatus(item.status);
    setHearingDate(item.date);
    setBenchRoom(item.benchRoom || '');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseNo.trim()) {
      showToast('Case number is required', 'error');
      return;
    }
    if (!party.trim()) {
      showToast('Party name is required', 'error');
      return;
    }

    if (editingItem) {
      updateCauseItem(editingItem.id, {
        time,
        caseNo: caseNo.trim(),
        forum,
        party: party.trim(),
        status,
        date: hearingDate,
        benchRoom
      });
    } else {
      addCauseItem({
        time,
        caseNo: caseNo.trim(),
        forum,
        party: party.trim(),
        status,
        date: hearingDate,
        benchRoom
      });
    }
    setModalOpen(false);
  };

  const toggleStatus = (item: CauseItem) => {
    const nextStatus: Record<CauseItem['status'], CauseItem['status']> = {
      READY: 'PENDING',
      PENDING: 'ADJOURNED',
      ADJOURNED: 'DISPOSED',
      DISPOSED: 'READY'
    };
    updateCauseItem(item.id, { status: nextStatus[item.status] });
  };

  const printCauseList = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Daily Cause List - ${dateFilter}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; color: #111; line-height: 1.4; }
            h2, h3 { margin: 0 0 6px 0; color: #1E3A8A; }
            hr { border: none; border-top: 1.5px solid #1E3A8A; margin: 12px 0 18px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 13px; }
            th, td { border: 1px solid #777; padding: 8px 10px; text-align: left; }
            th { background: #E2E8F0; font-weight: bold; }
          </style>
        </head>
        <body>
          <div style="text-align: center;">
            <h2>${activeCompany?.name || 'SRK Legal Chamber'}</h2>
            <div>${activeCompany?.address || ''}, ${activeCompany?.city || ''}</div>
            <div style="font-size: 12px; color: #555;">Bar Council Reg: ${activeCompany?.barCouncil || ''}</div>
          </div>
          <hr />
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px;">
            <span>DAILY CAUSE LIST / দৈনিক কার্যতালিকা</span>
            <span>Date: ${new Date(dateFilter).toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 80px;">Time</th>
                <th style="width: 140px;">Case No</th>
                <th>Forum & Bench</th>
                <th>Parties / Litigants</th>
                <th style="width: 90px;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${
                filteredList.length > 0
                  ? filteredList
                      .map(
                        item => `<tr>
                    <td><strong>${item.time}</strong></td>
                    <td style="font-family: monospace;">${item.caseNo}</td>
                    <td>${item.forum} ${item.benchRoom ? `(${item.benchRoom})` : ''}</td>
                    <td>${item.party}</td>
                    <td>${item.status}</td>
                  </tr>`
                      )
                      .join('')
                  : '<tr><td colspan="5" style="text-align:center;">No hearings listed for this date.</td></tr>'
              }
            </tbody>
          </table>
          <div style="margin-top: 30px; text-align: right; font-size: 11px;">
            Prepared by SRK Case Manager · Chamber Copy
          </div>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.print();
  };

  const sendWhatsAppHearingAlert = (item: CauseItem) => {
    const textMsg = encodeURIComponent(
      `Hearing Alert: Your matter ${item.caseNo} (${item.party}) is listed today at ${item.time} before ${item.forum} ${
        item.benchRoom ? `(${item.benchRoom})` : ''
      }. Status: ${item.status}. - ${activeCompany?.name}`
    );
    window.open(`https://wa.me/?text=${textMsg}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Daily Cause List (দৈনিক কার্যতালিকা)
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track hearing schedule across BL&LRO, SDL&LRO, DL&LRO, and WBLRTT.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={printCauseList}
            className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print Cause List
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> + Add Hearing
          </button>
        </div>
      </div>

      {/* Date Filter & Search Strip */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <label className="font-bold text-slate-600 dark:text-slate-400 uppercase text-[11px]">
            Date:
          </label>
          <input
            type="date"
            value={dateFilter}
            onChange={e => {
              setDateFilter(e.target.value);
              setShowAllDates(false);
            }}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
          />
          <button
            onClick={() => {
              setDateFilter(new Date().toISOString().slice(0, 10));
              setShowAllDates(false);
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              !showAllDates && dateFilter === new Date().toISOString().slice(0, 10)
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setShowAllDates(!showAllDates)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              showAllDates
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Show All Dates ({causeList.length})
          </button>
        </div>

        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search cause list..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Cause List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Case No</th>
                  <th className="py-3 px-4">Forum & Room</th>
                  <th className="py-3 px-4">Parties</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredList.map(item => {
                  const statusStyles = {
                    READY: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
                    PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
                    ADJOURNED: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300',
                    DISPOSED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
                  }[item.status];

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {item.time}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-700 dark:text-blue-400 whitespace-nowrap">
                        {item.caseNo}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {item.forum}
                        </div>
                        {item.benchRoom && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {item.benchRoom}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {item.party}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {item.date}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleStatus(item)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-transform active:scale-95 ${statusStyles}`}
                          title="Click to toggle status (Ready -> Pending -> Adjourned -> Disposed)"
                        >
                          {item.status}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => sendWhatsAppHearingAlert(item)}
                            className="p-1 rounded text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors"
                            title="WhatsApp Hearing Notice"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1 rounded text-slate-600 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950 transition-colors"
                            title="Edit Hearing"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove ${item.caseNo} from cause list?`)) {
                                deleteCauseItem(item.id);
                              }
                            }}
                            className="p-1 rounded text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                            title="Delete Hearing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No hearings listed {showAllDates ? 'in chamber' : `for ${dateFilter}`}
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Schedule hearings for today to print cause list and send automated client WhatsApp reminders.
            </p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add First Hearing
            </button>
          </div>
        )}
      </div>

      {/* Modal: Add / Edit Hearing */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                {editingItem ? 'Edit Hearing Schedule' : '+ Schedule Hearing'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Hearing Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    placeholder="10:30 AM"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Hearing Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={hearingDate}
                    onChange={e => setHearingDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Case Number *
                </label>
                <input
                  type="text"
                  required
                  value={caseNo}
                  onChange={e => setCaseNo(e.target.value)}
                  placeholder="e.g. MUT/2026/0418 or OA 482/2026"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Forum / Courtroom *
                </label>
                <input
                  type="text"
                  required
                  value={forum}
                  onChange={e => setForum(e.target.value)}
                  placeholder="BL&LRO Rajarhat / DL&LRO Alipore"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Parties Involved *
                </label>
                <input
                  type="text"
                  required
                  value={party}
                  onChange={e => setParty(e.target.value)}
                  placeholder="e.g. Debashis Chatterjee vs State"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Room / Chamber
                  </label>
                  <input
                    type="text"
                    value={benchRoom}
                    onChange={e => setBenchRoom(e.target.value)}
                    placeholder="Room 104 / Court 2"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="READY">READY</option>
                    <option value="PENDING">PENDING</option>
                    <option value="ADJOURNED">ADJOURNED</option>
                    <option value="DISPOSED">DISPOSED</option>
                  </select>
                </div>
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
                  Save Hearing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
