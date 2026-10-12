import React, { useState } from 'react';
import { statutoryProvisions } from '../data/statutoryData';
import { BookOpen, Search, Filter, Bookmark, ShieldCheck, Scale } from 'lucide-react';

export const StatutoryLibrary: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'wblract' | 'wblrmanual'>('all');
  const [chapterFilter, setChapterFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = statutoryProvisions.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchCh = chapterFilter === 'all' || p.chapter === chapterFilter;
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      p.section.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.textEn.toLowerCase().includes(q) ||
      p.textBn.includes(q);
    return matchCat && matchCh && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" />
            <span>Statutory Reference Library (ভূমি আইন ও বিধিমালা)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            West Bengal Land Reforms Act, 1955 & WBLR Manual, 1991 bilingual citations.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => {
              setActiveCategory('all');
              setChapterFilter('all');
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All Laws
          </button>
          <button
            onClick={() => {
              setActiveCategory('wblract');
              setChapterFilter('all');
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeCategory === 'wblract'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            WBLR Act 1955
          </button>
          <button
            onClick={() => {
              setActiveCategory('wblrmanual');
              setChapterFilter('all');
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeCategory === 'wblrmanual'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            WBLR Manual 1991
          </button>
        </div>
      </div>

      {/* Chapter & Search Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setChapterFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              chapterFilter === 'all'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            All Chapters
          </button>
          <button
            onClick={() => setChapterFilter('preliminary')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              chapterFilter === 'preliminary'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Definitions (Sec 2)
          </button>
          <button
            onClick={() => setChapterFilter('ror')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              chapterFilter === 'ror'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            ROR & Mutation (Sec 50)
          </button>
          <button
            onClick={() => setChapterFilter('appeal')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              chapterFilter === 'appeal'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Appeals (Sec 54)
          </button>
        </div>

        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search sections, bargadar, appeal..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Provisions List */}
      <div className="space-y-4">
        {filtered.map(p => (
          <div
            key={p.id}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-2">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  {p.chapterTitle}
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                  {p.section}: {p.title}
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {p.category === 'wblract' ? 'WBLR Act 1955' : 'WBLR Manual 1991'}
              </span>
            </div>

            {/* Bilingual Text */}
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 text-slate-800 dark:text-slate-200 leading-relaxed font-serif">
                <span className="font-sans font-bold text-blue-600 text-[10px] block mb-1">
                  ENGLISH STATUTORY PROVISION:
                </span>
                {p.textEn}
              </div>

              <div className="p-3 rounded-lg bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 text-slate-800 dark:text-slate-200 leading-relaxed">
                <span className="font-bold text-amber-700 dark:text-amber-400 text-[10px] block mb-1">
                  বাংলা আইনগত বিধান:
                </span>
                {p.textBn}
              </div>
            </div>

            {/* Key highlights & litigation relevance */}
            {p.keyPoints && (
              <div className="pt-2 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <div className="font-bold text-[11px] uppercase tracking-wider text-slate-500">
                  Practical Litigation Points:
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  {p.keyPoints.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span><strong>Relevance:</strong> {p.relevance}</span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 text-xs">
            No statutory provisions found matching your query.
          </div>
        )}
      </div>
    </div>
  );
};
