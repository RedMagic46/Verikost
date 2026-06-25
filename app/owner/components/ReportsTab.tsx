'use client';

import React, { useState, useMemo } from 'react';
import { Kost, Room, Tenant, Invoice } from '@/app/types';
import { 
  FileText, 
  Download, 
  BedDouble, 
  Wallet, 
  AlertTriangle,
  Building,
  Calendar,
  CheckCircle2
} from 'lucide-react';

interface ReportsTabProps {
  myKosts: Kost[];
  myRooms: Room[];
  myTenants: Tenant[];
  myInvoices: Invoice[];
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function ReportsTab({
  myKosts,
  myRooms,
  myTenants,
  myInvoices,
  showToast
}: ReportsTabProps) {

  const activeKosts = useMemo(() => myKosts.filter(k => !k.isDeleted), [myKosts]);

  // Selected Kost Filter
  const [selectedKostId, setSelectedKostId] = useState<string>(
    activeKosts.length > 0 ? activeKosts[0].id : ''
  );

  const [selectedYear, setSelectedYear] = useState<string>(
    () => String(new Date().getFullYear())
  );

  // Filtered data for computation
  const kostRooms = useMemo(() => myRooms.filter(r => r.kostId === selectedKostId), [myRooms, selectedKostId]);
  const kostTenants = useMemo(() => myTenants.filter(t => t.kostId === selectedKostId), [myTenants, selectedKostId]);
  const kostInvoices = useMemo(() => myInvoices.filter(inv => inv.kostId === selectedKostId), [myInvoices, selectedKostId]);

  // Summaries
  const occupancySummary = useMemo(() => {
    const total = kostRooms.length;
    const occupied = kostRooms.filter(r => r.status === 'occupied').length;
    const available = kostRooms.filter(r => r.status === 'available').length;
    const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;
    return { total, occupied, available, rate };
  }, [kostRooms]);

  const revenueSummary = useMemo(() => {
    const yearInvoices = kostInvoices.filter(inv => inv.periodYear === selectedYear);
    const paid = yearInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
    const unpaid = yearInvoices.filter(inv => inv.status === 'unpaid' || inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0);
    return { paid, unpaid, total: paid + unpaid };
  }, [kostInvoices, selectedYear]);

  const arrearsCount = useMemo(() => {
    return kostInvoices.filter(inv => inv.status === 'overdue' || (inv.status === 'unpaid' && new Date(inv.dueDate) < new Date())).length;
  }, [kostInvoices]);

  // CSV Exporter helper
  const exportToCSV = (filename: string, headers: string[], rows: any[][]) => {
    try {
      // Create CSV content
      const csvRows = [
        headers.join(','), // Headers row
        ...rows.map(row => 
          row.map(val => {
            const strVal = val === null || val === undefined ? '' : String(val);
            // Escape double quotes
            return `"${strVal.replace(/"/g, '""')}"`;
          }).join(',')
        )
      ];

      const csvContent = '\uFEFF' + csvRows.join('\n'); // Add BOM for Excel UTF-8 support
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast(`Ekspor CSV "${filename}" berhasil diunduh.`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Gagal melakukan ekspor laporan.', 'error');
    }
  };

  // 1. Export Occupancy CSV
  const handleExportOccupancy = () => {
    if (kostRooms.length === 0) {
      showToast('Tidak ada data kamar untuk diekspor.', 'error');
      return;
    }

    const headers = ['Nomor Kamar', 'Lantai', 'Tipe Kamar', 'Harga Sewa Bulanan', 'Status Kamar', 'Nama Penyewa Aktif', 'Tanggal Check In'];
    
    const rows = kostRooms.map(room => {
      const tenant = kostTenants.find(t => t.roomId === room.id && t.status === 'active');
      return [
        room.roomNumber,
        room.floor,
        room.type,
        room.price,
        room.status === 'available' ? 'Kosong' : room.status === 'occupied' ? 'Ditempati' : room.status === 'booked' ? 'Dibooking' : 'Perbaikan',
        tenant ? tenant.name : '-',
        tenant ? tenant.checkIn : '-'
      ];
    });

    const targetKost = activeKosts.find(k => k.id === selectedKostId);
    const kostSlug = targetKost ? targetKost.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'kost';
    exportToCSV(`laporan-okupansi-${kostSlug}-${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  // 2. Export Revenue CSV
  const handleExportRevenue = () => {
    const yearInvoices = kostInvoices.filter(inv => inv.periodYear === selectedYear);
    if (yearInvoices.length === 0) {
      showToast(`Tidak ada data transaksi keuangan di tahun ${selectedYear}.`, 'error');
      return;
    }

    const headers = ['ID Tagihan', 'Nama Penyewa', 'Kamar', 'Bulan Periode', 'Tahun Periode', 'Jumlah Tagihan', 'Status Pembayaran', 'Tanggal Jatuh Tempo', 'Tanggal Lunas', 'Metode Pembayaran', 'Catatan'];

    const rows = yearInvoices.map(inv => {
      const tenant = kostTenants.find(t => t.id === inv.tenantId);
      const room = roomOfInvoice(inv.tenantId);
      return [
        inv.id,
        tenant ? tenant.name : 'Penyewa Hilang',
        room ? room.roomNumber : '-',
        inv.periodMonth,
        inv.periodYear,
        inv.amount,
        inv.status === 'paid' ? 'Lunas' : inv.status === 'overdue' ? 'Terlambat' : 'Belum Lunas',
        inv.dueDate,
        inv.paidDate || '-',
        inv.paymentMethod || '-',
        inv.notes || '-'
      ];
    });

    const targetKost = activeKosts.find(k => k.id === selectedKostId);
    const kostSlug = targetKost ? targetKost.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'kost';
    exportToCSV(`laporan-keuangan-${kostSlug}-${selectedYear}.csv`, headers, rows);
  };

  // 3. Export Arrears/Tunggakan CSV
  const handleExportArrears = () => {
    const overdueInvoices = kostInvoices.filter(inv => 
      inv.status === 'overdue' || (inv.status === 'unpaid' && new Date(inv.dueDate) < new Date())
    );

    if (overdueInvoices.length === 0) {
      showToast('Luar biasa! Tidak ada tunggakan pembayaran sewa aktif saat ini.', 'success');
      return;
    }

    const headers = ['Nama Penyewa', 'No HP/WA', 'Email', 'Kamar', 'Bulan Periode', 'Tahun Periode', 'Jumlah Tunggakan', 'Tanggal Jatuh Tempo', 'Hari Keterlambatan'];

    const rows = overdueInvoices.map(inv => {
      const tenant = kostTenants.find(t => t.id === inv.tenantId);
      const room = roomOfInvoice(inv.tenantId);
      
      // Calculate delay days
      const due = new Date(inv.dueDate);
      const today = new Date();
      const delayMs = today.getTime() - due.getTime();
      const delayDays = delayMs > 0 ? Math.floor(delayMs / (1000 * 60 * 60 * 24)) : 0;

      return [
        tenant ? tenant.name : 'Penyewa Hilang',
        tenant ? tenant.phone : '-',
        tenant ? tenant.email : '-',
        room ? room.roomNumber : '-',
        inv.periodMonth,
        inv.periodYear,
        inv.amount,
        inv.dueDate,
        `${delayDays} hari`
      ];
    });

    const targetKost = activeKosts.find(k => k.id === selectedKostId);
    const kostSlug = targetKost ? targetKost.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'kost';
    exportToCSV(`laporan-tunggakan-${kostSlug}-${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  const roomOfInvoice = (tenantId: string) => {
    const tenant = kostTenants.find(t => t.id === tenantId);
    if (!tenant) return null;
    return kostRooms.find(r => r.id === tenant.roomId);
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Kost Selector */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Laporan Keuangan & Okupansi</h1>
          <p className="text-xs text-muted-foreground font-semibold">Unduh laporan rekapitulasi okupansi kamar, arus pendapatan kas, dan tunggakan tagihan dalam format tabel CSV.</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
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
        </div>
      </div>

       {activeKosts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-border rounded-3xl text-slate-400 font-semibold flex flex-col items-center justify-center">
          <FileText className="h-12 w-12 text-slate-400 dark:text-slate-700 mb-3" />
          <p>Harap daftarkan properti kost terlebih dahulu untuk memuat ekspor laporan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200">
          
          {/* Card 1: Occupancy Report */}
          <div className="bg-white dark:bg-slate-900 border border-border/80 p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 dark:bg-slate-800 rounded-2xl text-emerald-500 w-12 h-12 flex items-center justify-center">
                <BedDouble className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Laporan Okupansi Kamar</h3>
                <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">Status hunian kamar kos saat ini, nama mahasiswa penyewa aktif, lantai, dan tipe kamar.</p>
              </div>
            </div>

            <div className="space-y-4 pt-3 border-t border-border/40 text-xs font-semibold">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Total Kamar:</span>
                <span className="font-black text-slate-800 dark:text-white">{occupancySummary.total} Kamar</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Tingkat Okupansi:</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">{occupancySummary.rate}%</span>
              </div>
              
              <button
                onClick={handleExportOccupancy}
                className="w-full py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-border text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all hover:scale-102 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Unduh CSV Okupansi</span>
              </button>
            </div>
          </div>

          {/* Card 2: Financial/Revenue Report */}
          <div className="bg-white dark:bg-slate-900 border border-border/80 p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 dark:bg-slate-800 rounded-2xl text-primary w-12 h-12 flex items-center justify-center">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Laporan Pendapatan</h3>
                <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">Riwayat transaksi bulanan lunas, metode pembayaran, serta perbandingan estimasi pendapatan.</p>
              </div>
            </div>

            <div className="space-y-4 pt-3 border-t border-border/40 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pilih Tahun Laporan</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border/80 text-xs rounded-xl p-2 focus:outline-none text-slate-800 dark:text-slate-200 font-bold"
                >
                  <option value="2026">Tahun 2026</option>
                  <option value="2025">Tahun 2025</option>
                  <option value="2024">Tahun 2024</option>
                </select>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Uang Lunas Masuk:</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">{formatIDR(revenueSummary.paid)}</span>
              </div>

              <button
                onClick={handleExportRevenue}
                className="w-full py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-border text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all hover:scale-102 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Unduh CSV Keuangan</span>
              </button>
            </div>
          </div>

          {/* Card 3: Arrears/Tunggakan Report */}
          <div className="bg-white dark:bg-slate-900 border border-border/80 p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="p-3 bg-rose-50 dark:bg-rose-800 rounded-2xl text-rose-500 w-12 h-12 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Laporan Daftar Tunggakan</h3>
                <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">Daftar penyewa yang terlambat bayar dari tenggat jatuh tempo, beserta no. kontak HP/WA untuk penagihan.</p>
              </div>
            </div>

            <div className="space-y-4 pt-3 border-t border-border/40 text-xs font-semibold">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Tagihan Tertunggak:</span>
                <span className="font-black text-rose-600 dark:text-rose-400">{arrearsCount} Tagihan</span>
              </div>
              
              <div className="h-7"></div> {/* Spacer to match sizes */}

              <button
                onClick={handleExportArrears}
                className="w-full py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-border text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all hover:scale-102 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Unduh CSV Tunggakan</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
