import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VaultFile } from '../types';
import {
  Archive,
  Upload,
  Search,
  FileText,
  FileCode,
  Image,
  Trash2,
  Download,
  Eye,
  Filter
} from 'lucide-react';

export const DocumentVault: React.FC = () => {
  const { activeCompany, addVaultFile, deleteVaultFile, showToast } = useApp();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const files = activeCompany?.vaultFiles || [];

  const pdfCount = files.filter(f => f.type === 'pdf').length;
  const docCount = files.filter(f => f.type === 'doc').length;
  const imgCount = files.filter(f => f.type === 'img').length;

  const categories = ['All', 'Registered Deeds', 'Court Orders', 'Khatian Copies', 'Certificates', 'Pleadings & Petitions', 'Draft Templates'];

  const filtered = files.filter(f => {
    const matchCat = categoryFilter === 'All' || f.category === categoryFilter;
    const q = search.toLowerCase().trim();
    const matchSearch = !q || f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files;
    if (!uploaded) return;

    Array.from(uploaded).forEach(f => {
      const ext = f.name.split('.').pop()?.toLowerCase();
      let fType: 'pdf' | 'doc' | 'img' | 'other' = 'other';
      if (ext === 'pdf') fType = 'pdf';
      else if (['doc', 'docx'].includes(ext || '')) fType = 'doc';
      else if (['jpg', 'jpeg', 'png'].includes(ext || '')) fType = 'img';

      const sizeStr =
        f.size < 1024 * 1024
          ? (f.size / 1024).toFixed(1) + ' KB'
          : (f.size / (1024 * 1024)).toFixed(2) + ' MB';

      addVaultFile({
        name: f.name,
        size: sizeStr,
        type: fType,
        date: new Date().toISOString().slice(0, 10),
        category: categoryFilter !== 'All' ? categoryFilter : 'Registered Deeds',
        aiLearned: true
      });
    });
  };

  const getFileIcon = (type: VaultFile['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-600" />;
      case 'doc':
        return <FileCode className="w-5 h-5 text-blue-600" />;
      case 'img':
        return <Image className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Archive className="w-5 h-5 text-indigo-600" />
            <span>Document Vault (দলিল ও ফাইল ভল্ট)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Centralized chamber repository for registered deeds, certified orders, and khatians.
          </p>
        </div>

        <label className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors cursor-pointer shrink-0">
          <Upload className="w-4 h-4" /> Upload Documents
          <input
            type="file"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
        </label>
      </div>

      {/* Stats KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Total Files</div>
          <div className="text-xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
            {files.length}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold text-slate-500 uppercase">PDF Files</div>
          <div className="text-xl font-extrabold font-mono text-rose-600 dark:text-rose-400 mt-0.5">
            {pdfCount}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Word Docs</div>
          <div className="text-xl font-extrabold font-mono text-blue-600 dark:text-blue-400 mt-0.5">
            {docCount}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Images & Scans</div>
          <div className="text-xl font-extrabold font-mono text-purple-600 dark:text-purple-400 mt-0.5">
            {imgCount}
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                categoryFilter === cat
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
            onChange={e => setSearch(e.target.value)}
            placeholder="Search vault documents..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Files Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(f => (
            <div
              key={f.id}
              className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500 transition-colors flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                  {getFileIcon(f.type)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate" title={f.name}>
                    {f.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {f.category} · {f.size}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    Uploaded: {f.date}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => showToast(`Opening preview for ${f.name}`, 'info')}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${f.name}" from Vault?`)) {
                      deleteVaultFile(f.id);
                    }
                  }}
                  className="text-slate-400 hover:text-rose-600 p-1"
                  title="Delete File"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 text-xs">
          No files found in Vault matching your filter. Click "Upload Documents" to add files.
        </div>
      )}
    </div>
  );
};
