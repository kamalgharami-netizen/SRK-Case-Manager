import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { AccountTransaction, OfficeAccount } from '../types';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Plus, Wallet, Building2, Trash2 } from 'lucide-react';

const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);
const today = () => new Date().toISOString().slice(0, 10);

export const CashBankRegister: React.FC = () => {
  const { activeCompany, addOfficeAccount, addAccountTransaction, transferBetweenAccounts, deleteAccountTransaction, showToast, language } = useApp();
  const accounts = activeCompany?.officeAccounts || [];
  const transactions = activeCompany?.accountTransactions || [];
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<OfficeAccount['type']>('Cash');
  const [openingBalance, setOpeningBalance] = useState('0');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [entryAccount, setEntryAccount] = useState('');
  const [entryKind, setEntryKind] = useState<'deposit' | 'withdrawal'>('deposit');
  const [entryAmount, setEntryAmount] = useState('');
  const [entryDate, setEntryDate] = useState(today());
  const [entryDescription, setEntryDescription] = useState('');
  const [entryReference, setEntryReference] = useState('');
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDate, setTransferDate] = useState(today());
  const [transferDescription, setTransferDescription] = useState('');
  const [transferReference, setTransferReference] = useState('');

  const balances = useMemo(() => {
    const result: Record<string, number> = {};
    accounts.forEach(account => { result[account.id] = Number(account.openingBalance) || 0; });
    transactions.forEach(item => {
      if (result[item.accountId] === undefined) return;
      result[item.accountId] += item.kind === 'deposit' || item.kind === 'transfer-in' ? item.amount : -item.amount;
    });
    return result;
  }, [accounts, transactions]);

  const totalBalance = accounts.reduce((sum, account) => sum + (balances[account.id] || 0), 0);
  const visibleTransactions = transactions.filter(item => selectedAccount === 'all' || item.accountId === selectedAccount);
  const accountLabel = (id: string) => accounts.find(a => a.id === id)?.name || 'Unknown account';

  const submitAccount = (event: React.FormEvent) => {
    event.preventDefault();
    addOfficeAccount({ name: accountName, type: accountType, openingBalance: Number(openingBalance), bankName: bankName || undefined, accountNumber: accountNumber || undefined });
    setAccountName(''); setOpeningBalance('0'); setBankName(''); setAccountNumber(''); setShowAccountForm(false);
  };

  const submitEntry = (event: React.FormEvent) => {
    event.preventDefault();
    addAccountTransaction({ accountId: entryAccount, date: entryDate, kind: entryKind, amount: Number(entryAmount), description: entryDescription, reference: entryReference || undefined });
    setEntryAmount(''); setEntryDescription(''); setEntryReference(''); setShowEntryForm(false);
  };

  const submitTransfer = (event: React.FormEvent) => {
    event.preventDefault();
    transferBetweenAccounts(fromAccount, toAccount, transferDate, Number(transferAmount), transferDescription, transferReference || undefined);
    setTransferAmount(''); setTransferDescription(''); setTransferReference(''); setShowTransferForm(false);
  };

  const kindLabel = (kind: AccountTransaction['kind']) => ({
    deposit: language === 'bn' ? 'জমা' : 'Deposit',
    withdrawal: language === 'bn' ? 'উত্তোলন' : 'Withdrawal',
    'transfer-in': language === 'bn' ? 'ট্রান্সফার প্রাপ্তি' : 'Transfer in',
    'transfer-out': language === 'bn' ? 'ট্রান্সফার প্রেরণ' : 'Transfer out'
  }[kind]);

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 space-y-5 bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">{language === 'bn' ? 'নগদ ও ব্যাংক হিসাব' : 'Cash & Bank Register'}</h1>
          <p className="text-xs text-slate-500 mt-1">{language === 'bn' ? 'অ্যাকাউন্ট ব্যালেন্স, জমা, উত্তোলন ও অভ্যন্তরীণ ট্রান্সফার' : 'Manage account balances, deposits, withdrawals and internal transfers'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { if (!accounts.length) { showToast(language === 'bn' ? 'আগে একটি অ্যাকাউন্ট তৈরি করুন' : 'Create an account first', 'warning'); return; } setEntryAccount(accounts[0].id); setShowEntryForm(true); }} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center gap-2"><Plus size={15}/> {language === 'bn' ? 'লেনদেন' : 'New Entry'}</button>
          <button onClick={() => { if (accounts.length < 2) { showToast(language === 'bn' ? 'ট্রান্সফারের জন্য অন্তত দুটি অ্যাকাউন্ট তৈরি করুন' : 'Create at least two accounts to transfer', 'warning'); return; } setFromAccount(accounts[0].id); setToAccount(accounts[1].id); setShowTransferForm(true); }} className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-2"><ArrowLeftRight size={15}/> {language === 'bn' ? 'ট্রান্সফার' : 'Transfer'}</button>
          <button onClick={() => setShowAccountForm(true)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center gap-2"><Plus size={15}/> {language === 'bn' ? 'অ্যাকাউন্ট যোগ' : 'Add Account'}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        <div className="rounded-xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"><div className="text-xs text-slate-500">{language === 'bn' ? 'সর্বমোট ব্যালেন্স' : 'Total Balance'}</div><div className="text-2xl font-extrabold mt-2 text-slate-900 dark:text-white">{money(totalBalance)}</div></div>
        <div className="rounded-xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"><div className="text-xs text-slate-500">{language === 'bn' ? 'মোট অ্যাকাউন্ট' : 'Total Accounts'}</div><div className="text-2xl font-extrabold mt-2 text-slate-900 dark:text-white">{accounts.length}</div></div>
        <div className="rounded-xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"><div className="text-xs text-slate-500">{language === 'bn' ? 'মোট লেনদেন' : 'Transactions'}</div><div className="text-2xl font-extrabold mt-2 text-slate-900 dark:text-white">{transactions.length}</div></div>
      </div>

      {showAccountForm && <form onSubmit={submitAccount} className="rounded-xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <h2 className="font-bold text-sm">{language === 'bn' ? 'নতুন অ্যাকাউন্ট' : 'Create Account'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input required value={accountName} onChange={e=>setAccountName(e.target.value)} placeholder="Account name" className="p-2 rounded-lg border bg-transparent text-sm"/>
          <select value={accountType} onChange={e=>setAccountType(e.target.value as OfficeAccount['type'])} className="p-2 rounded-lg border bg-transparent text-sm"><option>Cash</option><option>Bank</option><option>UPI</option><option>Other</option></select>
          <input required type="number" min="0" step="0.01" value={openingBalance} onChange={e=>setOpeningBalance(e.target.value)} placeholder="Opening balance" className="p-2 rounded-lg border bg-transparent text-sm"/>
          {accountType === 'Bank' && <><input value={bankName} onChange={e=>setBankName(e.target.value)} placeholder="Bank name (optional)" className="p-2 rounded-lg border bg-transparent text-sm"/><input value={accountNumber} onChange={e=>setAccountNumber(e.target.value)} placeholder="Account number (optional)" className="p-2 rounded-lg border bg-transparent text-sm"/></>}
        </div>
        <div className="flex gap-2"><button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold">Save Account</button><button type="button" onClick={()=>setShowAccountForm(false)} className="px-4 py-2 rounded-lg border text-xs">Cancel</button></div>
      </form>}

      {showEntryForm && <form onSubmit={submitEntry} className="rounded-xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <h2 className="font-bold text-sm">{language === 'bn' ? 'জমা / উত্তোলন' : 'Deposit / Withdrawal'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <select value={entryAccount} onChange={e=>setEntryAccount(e.target.value)} className="p-2 rounded-lg border bg-transparent text-sm">{accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select>
          <select value={entryKind} onChange={e=>setEntryKind(e.target.value as 'deposit'|'withdrawal')} className="p-2 rounded-lg border bg-transparent text-sm"><option value="deposit">Deposit / জমা</option><option value="withdrawal">Withdrawal / উত্তোলন</option></select>
          <input required type="date" value={entryDate} onChange={e=>setEntryDate(e.target.value)} className="p-2 rounded-lg border bg-transparent text-sm"/>
          <input required type="number" min="0.01" step="0.01" value={entryAmount} onChange={e=>setEntryAmount(e.target.value)} placeholder="Amount" className="p-2 rounded-lg border bg-transparent text-sm"/>
          <input required value={entryDescription} onChange={e=>setEntryDescription(e.target.value)} placeholder="Description" className="p-2 rounded-lg border bg-transparent text-sm"/>
          <input value={entryReference} onChange={e=>setEntryReference(e.target.value)} placeholder="Reference (optional)" className="p-2 rounded-lg border bg-transparent text-sm"/>
        </div>
        <div className="flex gap-2"><button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold">Save Entry</button><button type="button" onClick={()=>setShowEntryForm(false)} className="px-4 py-2 rounded-lg border text-xs">Cancel</button></div>
      </form>}

      {showTransferForm && <form onSubmit={submitTransfer} className="rounded-xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <h2 className="font-bold text-sm">{language === 'bn' ? 'অ্যাকাউন্টের মধ্যে টাকা স্থানান্তর' : 'Transfer Between Accounts'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <select value={fromAccount} onChange={e=>setFromAccount(e.target.value)} className="p-2 rounded-lg border bg-transparent text-sm">{accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select>
          <select value={toAccount} onChange={e=>setToAccount(e.target.value)} className="p-2 rounded-lg border bg-transparent text-sm">{accounts.filter(a=>a.id!==fromAccount).map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select>
          <input required type="date" value={transferDate} onChange={e=>setTransferDate(e.target.value)} className="p-2 rounded-lg border bg-transparent text-sm"/>
          <input required type="number" min="0.01" step="0.01" value={transferAmount} onChange={e=>setTransferAmount(e.target.value)} placeholder="Amount" className="p-2 rounded-lg border bg-transparent text-sm"/>
          <input required value={transferDescription} onChange={e=>setTransferDescription(e.target.value)} placeholder="Description" className="p-2 rounded-lg border bg-transparent text-sm"/>
          <input value={transferReference} onChange={e=>setTransferReference(e.target.value)} placeholder="Reference (optional)" className="p-2 rounded-lg border bg-transparent text-sm"/>
        </div>
        <div className="flex gap-2"><button className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold">Record Transfer</button><button type="button" onClick={()=>setShowTransferForm(false)} className="px-4 py-2 rounded-lg border text-xs">Cancel</button></div>
      </form>}

      <section className="space-y-3">
        <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100">{language === 'bn' ? 'অ্যাকাউন্টসমূহ' : 'Accounts'}</h2>
        {accounts.length === 0 ? <div className="p-8 text-center rounded-xl border border-dashed text-sm text-slate-500"><Wallet className="mx-auto mb-2" size={28}/>No accounts yet. Add a Cash or Bank account to begin.</div> : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">{accounts.map(account=><div key={account.id} className="rounded-xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"><div className="flex justify-between items-start"><div className="flex items-center gap-2"><div className="p-2 rounded-lg bg-blue-50 text-blue-700"><Building2 size={18}/></div><div><div className="font-bold text-sm">{account.name}</div><div className="text-[11px] text-slate-500">{account.type}{account.bankName ? ' • '+account.bankName : ''}</div></div></div><span className="text-[10px] px-2 py-1 rounded bg-slate-100 text-slate-600">{account.type}</span></div><div className="text-xl font-extrabold mt-4">{money(balances[account.id] || 0)}</div><div className="text-[10px] text-slate-500 mt-1">Opening: {money(account.openingBalance)}</div>{account.accountNumber && <div className="text-[10px] text-slate-500 mt-1">A/C: {account.accountNumber}</div>}</div>)}</div>}
      </section>

      <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800"><h2 className="font-bold text-sm">{language === 'bn' ? 'লেনদেনের ইতিহাস' : 'Transaction History'}</h2><select value={selectedAccount} onChange={e=>setSelectedAccount(e.target.value)} className="p-2 rounded-lg border bg-transparent text-xs"><option value="all">All accounts</option>{accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
        {visibleTransactions.length === 0 ? <div className="p-8 text-center text-sm text-slate-500">No transactions recorded.</div> : <div className="overflow-x-auto"><table className="w-full text-xs"><thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500"><tr><th className="p-3 text-left">Date</th><th className="p-3 text-left">Account</th><th className="p-3 text-left">Type</th><th className="p-3 text-left">Description</th><th className="p-3 text-right">Amount</th><th className="p-3 text-right">Action</th></tr></thead><tbody>{visibleTransactions.map(item=><tr key={item.id} className="border-t border-slate-100 dark:border-slate-800"><td className="p-3 whitespace-nowrap">{item.date}</td><td className="p-3">{accountLabel(item.accountId)}</td><td className="p-3"><span className="inline-flex items-center gap-1">{item.kind==='deposit'||item.kind==='transfer-in'?<ArrowDownLeft size={13} className="text-emerald-600"/>:<ArrowUpRight size={13} className="text-rose-600"/>}{kindLabel(item.kind)}</span></td><td className="p-3">{item.description}{item.reference ? <div className="text-[10px] text-slate-500">Ref: {item.reference}</div> : null}</td><td className="p-3 text-right font-bold whitespace-nowrap">{money(item.amount)}</td><td className="p-3 text-right"><button onClick={()=>deleteAccountTransaction(item.id)} title="Delete transaction" className="p-1.5 rounded hover:bg-rose-50 text-rose-600"><Trash2 size={14}/></button></td></tr>)}</tbody></table></div>}
      </section>
      <p className="text-[10px] text-slate-500">{language === 'bn' ? 'এই মডিউলটি কেবল নগদ/ব্যাংক লেনদেনের রেকর্ড রাখে। এখানে কোনো Sales Invoice, Purchase Bill বা Billing তৈরি হয় না।' : 'This module records cash and bank movements only. It does not create sales invoices, purchase bills or billing documents.'}</p>
    </div>
  );
};
