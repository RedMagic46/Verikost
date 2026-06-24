'use client';

import React, { useState, useMemo } from 'react';
import { Kost, Room, Tenant, Invoice } from '@/app/types';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Calendar, 
  Wallet, 
  Check, 
  AlertTriangle, 
  Send, 
  MessageSquare,
  ArrowLeft,
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock
} from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

interface PaymentsTabProps {
  myKosts: Kost[];
  myRooms: Room[];
  myTenants: Tenant[];
  myInvoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<void>;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (invoiceId: string) => Promise<void>;
  bulkGenerateInvoices: (kostId: string, month: string, year: string, dueDate: string) => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function PaymentsTab({
  myKosts,
  myRooms,
  myTenants,
  myInvoices,
  addInvoice,
  updateInvoice,
  deleteInvoice,
  bulkGenerateInvoices,
  showToast
}: PaymentsTabProps) {

  const activeKosts = useMemo(() => myKosts.filter(k => !k.isDeleted), [myKosts]);

  // Selected Kost Filter
  const [selectedKostId, setSelectedKostId] = useState<string>(
    activeKosts.length > 0 ? activeKosts[0].id : ''
  );

  // States
  const [view, setView] = useState<'list' | 'add' | 'edit' | 'bulk'>('list');
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form Fields (Individual Invoice)
  const [tenantId, setTenantId] = useState('');
  const [periodMonth, setPeriodMonth] = useState(() => String(new Date().getMonth() + 1).padStart(2, '0'));
  const [periodYear, setPeriodYear] = useState(() => String(new Date().getFullYear()));
  const [amount, setAmount] = useState(1000000);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(10); // Default due date is 10th of this month
    return d.toISOString().split('T')[0];
  });
  const [paidDate, setPaidDate] = useState('');
  const [status, setStatus] = useState<Invoice['status']>('unpaid');
  const [paymentMethod, setPaymentMethod] = useState('Transfer Bank');
  const [notes, setNotes] = useState('');

  // Form Fields (Bulk Generation)
  const [bulkMonth, setBulkMonth] = useState(() => String(new Date().getMonth() + 1).padStart(2, '0'));
  const [bulkYear, setBulkYear] = useState(() => String(new Date().getFullYear()));
  const [bulkDueDate, setBulkDueDate] = useState(() => {
    const d = new Date();
    d.setDate(10);
    return d.toISOString().split('T')[0];
  });

  // Filtered lists
  const kostInvoices = useMemo(() => {
    return myInvoices.filter(inv => inv.kostId === selectedKostId);
  }, [myInvoices, selectedKostId]);

  const filteredInvoices = useMemo(() => {
    let result = kostInvoices;

    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(inv => inv.status === filterStatus);
    }

    // Apply search filter (tenant name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(inv => {
        const tenant = myTenants.find(t => t.id === inv.tenantId);
        return tenant ? tenant.name.toLowerCase().includes(q) : false;
      });
    }

    return result;
  }, [kostInvoices, filterStatus, searchQuery, myTenants]);

  const activeTenantsOfKost = useMemo(() => {
    return myTenants.filter(t => t.kostId === selectedKostId && t.status === 'active');
  }, [myTenants, selectedKostId]);

  const handleOpenAddForm = () => {
    if (activeTenantsOfKost.length === 0) {
      showToast('Tidak ada penyewa aktif untuk kost ini. Registrasi penyewa terlebih dahulu.', 'error');
      return;
    }
    setTenantId(activeTenantsOfKost[0].id);
    setPeriodMonth(String(new Date().getMonth() + 1).padStart(2, '0'));
    setPeriodYear(String(new Date().getFullYear()));
    
    // Autofill amount from room price
    const room = myRooms.find(r => r.id === activeTenantsOfKost[0].roomId);
    setAmount(room ? room.price : 1000000);
    
    setDueDate(() => {
      const d = new Date();
      d.setDate(10);
      return d.toISOString().split('T')[0];
    });
    setPaidDate('');
    setStatus('unpaid');
    setPaymentMethod('Transfer Bank');
    setNotes('');
    setView('add');
  };

  const handleTenantChange = (selectedId: string) => {
    setTenantId(selectedId);
    const tenant = myTenants.find(t => t.id === selectedId);
    if (tenant && tenant.roomId) {
      const room = myRooms.find(r => r.id === tenant.roomId);
      if (room) setAmount(room.price);
    }
  };

  const handleOpenEditForm = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setTenantId(invoice.tenantId);
    setPeriodMonth(invoice.periodMonth);
    setPeriodYear(invoice.periodYear);
    setAmount(invoice.amount);
    setDueDate(invoice.dueDate);
    setPaidDate(invoice.paidDate || '');
    setStatus(invoice.status);
    setPaymentMethod(invoice.paymentMethod || 'Transfer Bank');
    setNotes(invoice.notes || '');
    setView('edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
      showToast('Harap pilih penyewa.', 'error');
      return;
    }

    try {
      const tenant = myTenants.find(t => t.id === tenantId);
      const payload = {
        tenantId,
        roomId: tenant ? tenant.roomId : undefined,
        kostId: selectedKostId,
        periodMonth,
        periodYear,
        amount: Number(amount),
        dueDate,
        paidDate: status === 'paid' ? (paidDate || new Date().toISOString().split('T')[0]) : undefined,
        status,
        paymentMethod: status === 'paid' ? paymentMethod : undefined,
        notes: notes.trim() || undefined
      };

      if (view === 'add') {
        await addInvoice(payload);
      } else if (view === 'edit' && editingInvoice) {
        await updateInvoice(editingInvoice.id, payload);
      }

      setView('list');
      setEditingInvoice(null);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleBulkGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await bulkGenerateInvoices(selectedKostId, bulkMonth, bulkYear, bulkDueDate);
      setView('list');
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleMarkAsPaid = async (invoice: Invoice) => {
    try {
      await updateInvoice(invoice.id, {
        status: 'paid',
        paidDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Transfer Bank'
      });
      showToast('Tagihan berhasil ditandai sebagai Lunas.', 'success');
    } catch (err: any) {
      showToast('Gagal menandai lunas: ' + err.message, 'error');
    }
  };

  const handleDeleteInvoice = (id: string) => {
    setInvoiceToDelete(id);
  };

  const handleSendReminder = (invoice: Invoice) => {
    const tenant = myTenants.find(t => t.id === invoice.tenantId);
    if (!tenant) return;

    const formattedAmount = formatIDR(invoice.amount);
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const monthName = months[parseInt(invoice.periodMonth) - 1] || invoice.periodMonth;

    const message = `Halo ${tenant.name}, ini adalah pengingat dari pengelola VeriKost mengenai tagihan kos Anda untuk periode ${monthName} ${invoice.periodYear} sebesar ${formattedAmount}. Jatuh tempo pembayaran pada tanggal ${invoice.dueDate}. Mohon lakukan pembayaran ke rekening pengelola dan unggah buktinya. Terima kasih!`;
    
    // Generate WhatsApp link
    const waPhone = tenant.phone.replace(/^0/, '62');
    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;

    showToast(`Reminder berhasil dibuat! Mengalihkan ke WhatsApp...`, 'success');
    
    // Open in new window
    window.open(waUrl, '_blank');
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const getTenantName = (id: string) => {
    const tenant = myTenants.find(t => t.id === id);
    return tenant ? tenant.name : 'Penyewa Hilang';
  };

  const getTenantRoomNumber = (tenantId: string) => {
    const tenant = myTenants.find(t => t.id === tenantId);
    if (!tenant || !tenant.roomId) return 'Umum';
    const room = myRooms.find(r => r.id === tenant.roomId);
    return room ? `Kamar ${room.roomNumber}` : 'Umum';
  };

  const monthOptions = [
    { value: '01', label: 'Januari' },
    { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' },
    { value: '04', label: 'April' },
    { value: '05', label: 'Mei' },
    { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' },
    { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header and Kost Selector */}
      {view === 'list' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Pembayaran & Tagihan</h1>
              <p className="text-xs text-muted-foreground font-semibold">Pantau status pembayaran bulanan, generate tagihan otomatis, dan kirimkan reminder jatuh tempo.</p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {activeKosts.length > 0 && (
                <select
                  value={selectedKostId}
                  onChange={(e) => setSelectedKostId(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-border/80 text-xs rounded-xl p-2.5 focus:outline-none text-slate-800 dark:text-slate-200 font-extrabold shadow-sm min-w-[200px]"
                >
                  {activeKosts.map((kost) => (
                    <option key={kost.id} value={kost.id}>{kost.name}</option>
                  ))}
                </select>
              )}

              <button
                onClick={() => setView('bulk')}
                className="inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all hover:scale-102 cursor-pointer"
              >
                <Wallet className="h-4 w-4" />
                <span>Bulk Generate</span>
              </button>

              <button
                onClick={handleOpenAddForm}
                className="inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow shadow-primary/10 transition-all hover:scale-102 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Buat Tagihan</span>
              </button>
            </div>
          </div>

          {activeKosts.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-border rounded-3xl text-slate-400 font-semibold flex flex-col items-center justify-center">
              <Wallet className="h-12 w-12 text-slate-400 dark:text-slate-700 mb-3" />
              <p>Harap daftarkan properti kost terlebih dahulu untuk mengelola tagihan keuangan.</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Filters & Search */}
              <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-slate-900 border border-border/80 p-4 rounded-2xl shadow-sm">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama penyewa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-border/80 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none text-slate-800 dark:text-white placeholder-slate-400"
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-border/80 text-xs rounded-xl p-2.5 focus:outline-none text-slate-800 dark:text-slate-200 font-bold"
                  >
                    <option value="all">Semua Status</option>
                    <option value="paid">Lunas (Paid)</option>
                    <option value="unpaid">Belum Bayar (Unpaid)</option>
                    <option value="overdue">Terlambat (Overdue)</option>
                  </select>
                </div>
              </div>

              {/* Invoices List Table */}
              <div className="bg-white dark:bg-slate-900 border border-border/85 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 border-b border-border font-black uppercase tracking-wider text-[10px]">
                        <th className="p-4 pl-6">Penyewa</th>
                        <th className="p-4">Kamar</th>
                        <th className="p-4">Periode</th>
                        <th className="p-4">Tarif</th>
                        <th className="p-4">Jatuh Tempo</th>
                        <th className="p-4">Tanggal Bayar</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 pr-6 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredInvoices.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-12 text-center text-slate-400 font-semibold">
                            Tidak ada tagihan yang cocok dengan filter Anda.
                          </td>
                        </tr>
                      ) : (
                        filteredInvoices.map((inv) => {
                          const isOverdue = inv.status === 'overdue' || (inv.status === 'unpaid' && new Date(inv.dueDate) < new Date());

                          return (
                            <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors font-medium">
                              
                              {/* Tenant Name */}
                              <td className="p-4 pl-6 font-extrabold text-slate-800 dark:text-white">
                                {getTenantName(inv.tenantId)}
                              </td>

                              {/* Room number */}
                              <td className="p-4 text-slate-700 dark:text-slate-200 font-bold">
                                {getTenantRoomNumber(inv.tenantId)}
                              </td>

                              {/* Period */}
                              <td className="p-4 text-slate-600 dark:text-slate-400">
                                {monthOptions.find(m => m.value === inv.periodMonth)?.label || inv.periodMonth} {inv.periodYear}
                              </td>

                              {/* Amount */}
                              <td className="p-4 font-black text-slate-800 dark:text-white">
                                {formatIDR(inv.amount)}
                              </td>

                              {/* Due Date */}
                              <td className="p-4 text-slate-600 dark:text-slate-400">
                                {inv.dueDate}
                              </td>

                              {/* Paid Date */}
                              <td className="p-4 text-slate-600 dark:text-slate-400 font-bold">
                                {inv.paidDate ? (
                                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                    <Check className="h-3.5 w-3.5" />
                                    {inv.paidDate}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">Belum dibayar</span>
                                )}
                              </td>

                              {/* Status */}
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                  inv.status === 'paid'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-150 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                                    : isOverdue
                                    ? 'bg-rose-50 text-rose-700 border border-rose-150 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30 animate-pulse'
                                    : 'bg-amber-50 text-amber-700 border border-amber-150 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
                                }`}>
                                  {inv.status === 'paid' ? 'Lunas' : isOverdue ? 'Terlambat' : 'Belum Lunas'}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="p-4 pr-6 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  
                                  {/* Mark Paid button for unpaid */}
                                  {inv.status !== 'paid' && (
                                    <>
                                      <button
                                        onClick={() => handleMarkAsPaid(inv)}
                                        className="p-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-[10px] font-black border border-emerald-100 cursor-pointer flex items-center gap-0.5"
                                        title="Tandai Lunas"
                                      >
                                        Lunas
                                      </button>
                                      
                                      <button
                                        onClick={() => handleSendReminder(inv)}
                                        className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-border/80 text-slate-600 rounded-lg cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                                        title="Kirim Pengingat WhatsApp"
                                      >
                                        <Send className="h-3 w-3 text-emerald-500" />
                                        <span>Reminder</span>
                                      </button>
                                    </>
                                  )}

                                  <button
                                    onClick={() => handleOpenEditForm(inv)}
                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg cursor-pointer"
                                    title="Edit Tagihan"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteInvoice(inv.id)}
                                    className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 rounded-lg cursor-pointer"
                                    title="Hapus"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>

                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Individual Invoice Form View (Add / Edit) */}
      {(view === 'add' || view === 'edit') && (
        <div className="max-w-2xl bg-white dark:bg-slate-900 border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in slide-in-from-bottom-5 duration-200">
          
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <button
              onClick={() => {
                setView('list');
                setEditingInvoice(null);
              }}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </button>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Wallet className="h-5 w-5 text-primary" />
                {view === 'add' ? 'Buat Tagihan Sewa Baru' : 'Edit Tagihan Sewa'}
              </h2>
              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                {view === 'add' 
                  ? 'Buat tagihan sewa manual untuk penyewa kost terpilih.' 
                  : `Memperbarui tagihan sewa ID: ${editingInvoice?.id}`}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
            
            {/* Tenant Selection */}
            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300">Penyewa Kost*</label>
              {view === 'add' ? (
                <select
                  value={tenantId}
                  onChange={(e) => handleTenantChange(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-slate-200 font-bold"
                >
                  {activeTenantsOfKost.map(tenant => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name} ({getTenantRoomNumber(tenant.id)})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  disabled
                  value={getTenantName(tenantId)}
                  className="w-full bg-slate-100 dark:bg-slate-800/40 rounded-xl border border-border/80 p-3 text-slate-400 cursor-not-allowed"
                />
              )}
            </div>

            {/* Period Month & Year */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300">Bulan Periode*</label>
                <select
                  value={periodMonth}
                  onChange={(e) => setPeriodMonth(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-slate-200 font-bold"
                >
                  {monthOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300">Tahun Periode*</label>
                <input
                  type="number"
                  placeholder="e.g. 2026"
                  value={periodYear}
                  onChange={(e) => setPeriodYear(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Amount & Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300">Jumlah Tagihan (IDR)*</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>Tanggal Jatuh Tempo*</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Status & Payment Details */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/60">
              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300">Status Pembayaran*</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-slate-200 font-bold"
                >
                  <option value="unpaid">Belum Lunas (Unpaid)</option>
                  <option value="paid">Lunas (Paid)</option>
                  <option value="overdue">Terlambat (Overdue)</option>
                </select>
              </div>

              {status === 'paid' && (
                <div className="space-y-1.5">
                  <label className="text-slate-700 dark:text-slate-300">Metode Pembayaran</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-slate-200 font-bold"
                  >
                    <option value="Transfer Bank">Transfer Bank</option>
                    <option value="Tunai">Tunai</option>
                    <option value="E-Wallet">E-Wallet / QRIS</option>
                  </select>
                </div>
              )}
            </div>

            {status === 'paid' && (
              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>Tanggal Pembayaran</span>
                </label>
                <input
                  type="date"
                  value={paidDate}
                  onChange={(e) => setPaidDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
                />
              </div>
            )}

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300">Catatan Pembayaran (Opsional)</label>
              <textarea
                rows={2}
                placeholder="e.g. Sudah ditransfer ke rekening BCA, bukti terlampir, dll."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-700 dark:text-slate-200"
              />
            </div>

            {/* Form Actions */}
            <div className="pt-4 border-t border-border flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setView('list');
                  setEditingInvoice(null);
                }}
                className="py-2.5 px-4 rounded-xl border border-border text-slate-700 dark:text-slate-202 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl bg-primary text-white font-bold hover:bg-blue-600 transition-colors shadow-sm cursor-pointer"
              >
                Simpan Tagihan
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Bulk Generate Invoices Form View */}
      {view === 'bulk' && (
        <div className="max-w-md bg-white dark:bg-slate-900 border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in slide-in-from-bottom-5 duration-200">
          
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <button
              onClick={() => setView('list')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </button>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Wallet className="h-5 w-5 text-indigo-500" />
                Bulk Generate Tagihan
              </h2>
              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                Pembuatan invoice otomatis untuk seluruh penyewa aktif di periode tertentu.
              </p>
            </div>
          </div>

          <form onSubmit={handleBulkGenerate} className="space-y-4 text-xs font-semibold">
            
            <div className="space-y-3 p-3 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30">
              <span className="font-extrabold uppercase text-[9px] tracking-wider block">Bagaimana Cara Kerjanya?</span>
              <p className="leading-relaxed text-[11px] font-medium">
                Sistem akan secara otomatis menyisir seluruh penyewa berstatus <strong>Aktif (Active)</strong> pada properti kost ini. Tagihan bulanan baru akan dibuat berdasarkan tarif kamar sewa masing-masing penyewa untuk bulan dan tahun berjalan yang Anda pilih. Penyewa yang sudah memiliki tagihan pada periode tersebut akan otomatis dilewati untuk menghindari double billing.
              </p>
            </div>

            {/* Bulk Month & Year */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300">Bulan Periode*</label>
                <select
                  value={bulkMonth}
                  onChange={(e) => setBulkMonth(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-slate-200 font-bold"
                >
                  {monthOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300">Tahun Periode*</label>
                <input
                  type="number"
                  value={bulkYear}
                  onChange={(e) => setBulkYear(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Bulk Due Date */}
            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>Tanggal Jatuh Tempo*</span>
              </label>
              <input
                type="date"
                value={bulkDueDate}
                onChange={(e) => setBulkDueDate(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
              />
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-border flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setView('list')}
                className="py-2.5 px-4 rounded-xl border border-border text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
              >
                Generate Tagihan
              </button>
            </div>

          </form>
        </div>
      )}

      <ConfirmModal
        isOpen={!!invoiceToDelete}
        onClose={() => setInvoiceToDelete(null)}
        onConfirm={async () => {
          if (invoiceToDelete) {
            try {
              await deleteInvoice(invoiceToDelete);
              showToast('Tagihan berhasil dihapus.', 'success');
            } catch (err) {
              const msg = err instanceof Error ? err.message : 'Unknown error';
              showToast('Gagal menghapus tagihan: ' + msg, 'error');
            }
          }
        }}
        title="Hapus Tagihan?"
        description="Apakah Anda yakin ingin menghapus tagihan ini secara permanen dari sistem?"
        confirmText="Ya, Hapus"
        variant="danger"
      />
    </div>
  );
}
