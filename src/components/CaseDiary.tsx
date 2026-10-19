import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DiaryEntry } from '../types';
import {
  BookMarked,
  Plus,
  Trash2,
  Calendar,
  Clock,
  FileCheck
} from 'lucide-react';

export const CaseDiary: React.FC = () => {
  const { activeCompany, addDiaryEntry, deleteDiaryEntry, showToast } = useApp();

  const cases = activeCompany?.cases || [];
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    cases[0]?.id || ''
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [entryType, setEntryType] = useState<DiaryEntry['type']>('Hearing');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const currentCase = cases.find(c => c.id === selectedCaseId);
  const diaryEntries = (activeCompany?.diaryData?.[selectedCaseId] || []).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId) {
      showToast('Select a case first', 'error');
      return;
    }
    if (!title.trim()) {
      showToast('Entry title is required', 'error');
      return;
    }

    addDiaryEntry({
      caseId: selectedCaseId,
      date: entryDate,
      type: entryType,
      title: title.trim(),
      body: body.trim(),
      nextDate: nextDate || undefined
    });

    setModalOpen(false);
    setTitle('');
    setBody('');
    setNextDate('');
  };

  const getEntryBadgeColor = (type: DiaryEntry['type']) => {
    switch (type) {
      case 'Hearing':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300';
      case 'Order Passed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300';
      case 'Filing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300';
      case 'Notice Received':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-sky-600" />
            <span>Case Diary (মামলার কার্যবিবরণী ডায়েরি)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Chronological hearing diary, order records, and case progression notes.
          </p>
        </div>

        {selectedCaseId && (
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> + Add Diary Entry
          </button>
        )}
      </div>

      {/* Case Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400 shrink-0">
            Select Case File:
          </label>
          <select
            value={selectedCaseId}
            onChange={e => setSelectedCaseId(e.target.value)}
            className="w-full max-w-md px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
          >
            {cases.length === 0 ? (
              <option value="">No cases registered yet</option>
            ) : (
              cases.map(c => (
                <option key={c.id} value={c.id}>
                  {c.caseNo} — {c.party} ({c.type.toUpperCase()})
                </option>
              ))
            )}
          </select>
        </div>

        {currentCase && (
          <div className="text-xs text-slate-500 font-mono shrink-0">
            Next Hearing: <strong className="text-blue-600">{currentCase.nextDate || 'None set'}</strong>
          </div>
        )}
      </div>

      {/* Diary Timeline */}
      {selectedCaseId ? (
        diaryEntries.length > 0 ? (
          <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 dark:border-slate-800 space-y-6 my-4">
            {diaryEntries.map(entry => (
              <div key={entry.id} className="relative group">
                {/* Timeline node icon */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                  {entry.type[0]}
                </div>

                {/* Entry card */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-2 group-hover:border-blue-400 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getEntryBadgeColor(entry.type)}`}>
                          {entry.type}
                        </span>
                        <span className="font-mono text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {entry.date}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                        {entry.title}
                      </h3>
                    </div>

                    {confirmDeleteId === entry.id ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/70 px-2 py-0.5 rounded border border-rose-300 dark:border-rose-800">
                        <span>Delete?</span>
                        <button
                          type="button"
                          onClick={() => {
                            deleteDiaryEntry(selectedCaseId, entry.id);
                            setConfirmDeleteId(null);
                          }}
                          className="underline hover:text-rose-800 font-extrabold cursor-pointer"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          No
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(entry.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {entry.body}
                  </p>

                  {entry.nextDate && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-semibold font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      Next Hearing Date Fixed: {entry.nextDate}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 text-xs">
            No diary entries recorded for {currentCase?.caseNo || 'this case'}. Click "+ Add Diary Entry" to log
            hearings, orders, or filing updates.
          </div>
        )
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 text-xs">
          Please select or register a case to view its diary.
        </div>
      )}

      {/* Modal: Add Diary Entry */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                + Add Diary Progression Entry
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={entryDate}
                    onChange={e => setEntryDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Entry Category
                  </label>
                  <select
                    value={entryType}
                    onChange={e => setEntryType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="Hearing">Hearing (শুনানি)</option>
                    <option value="Order Passed">Order Passed (আদেশ প্রদান)</option>
                    <option value="Filing">Filing (আবেদন দাখিল)</option>
                    <option value="Notice Received">Notice Received (নোটিশ জারি)</option>
                    <option value="Consultation">Consultation (পরামর্শ)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Title / Subject *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Lower Court Record Called / Stay Extended"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Order Details / Daily Remarks
                </label>
                <textarea
                  rows={3}
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="Record summary of arguments, witness deposition, or officer directives..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Next Hearing Date Fixed
                </label>
                <input
                  type="date"
                  value={nextDate}
                  onChange={e => setNextDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
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
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
