'use client';

import React, { useMemo } from 'react';
import { Kost, Room, Tenant, Invoice, Inquiry } from '@/app/types';
import { 
  Building2, 
  BedDouble, 
  Users, 
  Eye, 
  Mail, 
  Wallet, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';

interface OverviewTabProps {
  myKosts: Kost[];
  myRooms: Room[];
  myTenants: Tenant[];
  myInvoices: Invoice[];
  myInquiries: Inquiry[];
  setActiveTab: (tab: any) => void;
}

export default function OverviewTab({
  myKosts,
  myRooms,
  myTenants,
  myInvoices,
  myInquiries,
  setActiveTab
}: OverviewTabProps) {

  // KPI Calculations
  const totalProperties = myKosts.length;
  const totalRooms = myRooms.length;
  
  const occupiedRooms = myRooms.filter(r => r.status === 'occupied').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  
  const activeTenants = myTenants.filter(t => t.status === 'active').length;
  const totalViews = myKosts.reduce((sum, k) => sum + (k.views || 0), 0);
  
  const pendingInquiries = myInquiries.filter(i => i.status === 'pending').length;

  // Revenue Calculations
  const currentMonthStr = String(new Date().getMonth() + 1).padStart(2, '0');
  const currentYearStr = String(new Date().getFullYear());

  const currentMonthRevenue = useMemo(() => {
    return myInvoices
      .filter(inv => inv.status === 'paid' && inv.periodMonth === currentMonthStr && inv.periodYear === currentYearStr)
      .reduce((sum, inv) => sum + inv.amount, 0);
  }, [myInvoices, currentMonthStr, currentYearStr]);

  const estimatedMonthlyRevenue = useMemo(() => {
    // Sum of all invoices (paid & unpaid) for the current month
    return myInvoices
      .filter(inv => inv.periodMonth === currentMonthStr && inv.periodYear === currentYearStr)
      .reduce((sum, inv) => sum + inv.amount, 0);
  }, [myInvoices, currentMonthStr, currentYearStr]);

  const overdueInvoicesCount = useMemo(() => {
    return myInvoices.filter(inv => inv.status === 'overdue' || (inv.status === 'unpaid' && new Date(inv.dueDate) < new Date())).length;
  }, [myInvoices]);

  const unpaidInvoicesCount = useMemo(() => {
    return myInvoices.filter(inv => inv.status === 'unpaid' || inv.status === 'overdue').length;
  }, [myInvoices]);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  // SVG Chart: Views vs Inquiries (last 6 months / periods)
  // We mock a realistic 6-period data points, computed or simulated from real data
  const chartPeriods = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'];
  const chartViewsData = [120, 150, 180, 220, 290, totalViews > 0 ? Math.min(totalViews, 500) : 340];
  const chartLeadsData = [12, 18, 22, 30, 42, myInquiries.length > 0 ? myInquiries.length * 5 : 48];

  const maxChartValue = Math.max(...chartViewsData, ...chartLeadsData, 100);

  // SVG parameters
  const width = 500;
  const height = 150;
  const padding = 25;

  const pointsViews = chartViewsData.map((val, index) => {
    const x = padding + (index * (width - padding * 2)) / (chartViewsData.length - 1);
    const y = height - padding - (val * (height - padding * 2)) / maxChartValue;
    return `${x},${y}`;
  }).join(' ');

  const pointsLeads = chartLeadsData.map((val, index) => {
    const x = padding + (index * (width - padding * 2)) / (chartLeadsData.length - 1);
    const y = height - padding - (val * (height - padding * 2)) / maxChartValue;
    return `${x},${y}`;
  }).join(' ');

  // CSS Ring Chart for room status distribution
  const roomStatusCount = useMemo(() => {
    const available = myRooms.filter(r => r.status === 'available').length;
    const occupied = myRooms.filter(r => r.status === 'occupied').length;
    const booked = myRooms.filter(r => r.status === 'booked').length;
    const maintenance = myRooms.filter(r => r.status === 'maintenance').length;
    return { available, occupied, booked, maintenance };
  }, [myRooms]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Overview & Analisis Performa</h1>
          <p className="text-xs text-muted-foreground font-semibold">Pantau occupancy rate, tagihan, dan interaksi calon penyewa kost secara realtime.</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Profile Views */}
        <div className="bg-white dark:bg-slate-900 border border-border p-5 rounded-3xl shadow-sm flex flex-col justify-between h-36 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-blue-50 dark:bg-slate-800 rounded-xl text-primary shrink-0">
              <Eye className="h-5.5 w-5.5" />
            </div>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">
              +12%
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">
              {totalViews.toLocaleString('id-ID')}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">Views Properti</p>
          </div>
        </div>

        {/* Occupancy Rate */}
        <div 
          onClick={() => setActiveTab('rooms')}
          className="bg-white dark:bg-slate-900 border border-border p-5 rounded-3xl shadow-sm flex flex-col justify-between h-36 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-emerald-50 dark:bg-slate-800 rounded-xl text-emerald-500 shrink-0">
              <BedDouble className="h-5.5 w-5.5" />
            </div>
            <span className="text-[9px] font-extrabold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {occupiedRooms}/{totalRooms} Kamar
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">
              {occupancyRate}%
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1">
              Occupancy Rate <ArrowUpRight className="h-3 w-3 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </p>
          </div>
        </div>

        {/* Pending Inquiries */}
        <div 
          onClick={() => setActiveTab('inquiries')}
          className="bg-white dark:bg-slate-900 border border-border p-5 rounded-3xl shadow-sm flex flex-col justify-between h-36 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-indigo-50 dark:bg-slate-800 rounded-xl text-indigo-500 shrink-0">
              <Mail className="h-5.5 w-5.5" />
            </div>
            {pendingInquiries > 0 ? (
              <span className="text-[10px] font-black text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-full border border-rose-100 dark:border-rose-900/30 animate-pulse">
                Butuh Tindakan
              </span>
            ) : (
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                Selesai
              </span>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">
              {pendingInquiries}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1">
              Inquiry Pending <ArrowUpRight className="h-3 w-3 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </p>
          </div>
        </div>

        {/* Paid Revenue */}
        <div 
          onClick={() => setActiveTab('payments')}
          className="bg-gradient-to-br from-primary to-blue-700 p-5 rounded-3xl shadow-lg flex flex-col justify-between h-36 text-white cursor-pointer relative overflow-hidden group"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-white/10 rounded-xl text-white shrink-0">
              <Wallet className="h-5.5 w-5.5" />
            </div>
            {overdueInvoicesCount > 0 && (
              <span className="text-[8px] font-black bg-rose-500/80 text-white px-2 py-0.5 rounded-full border border-rose-400/30 animate-bounce">
                {overdueInvoicesCount} Tertunggak
              </span>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-black leading-none">
              {formatIDR(currentMonthRevenue)}
            </h3>
            <p className="text-[10px] opacity-85 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1">
              Pendapatan Lunas Bulan Ini <ArrowUpRight className="h-3 w-3 text-white/70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </p>
          </div>
          <TrendingUp className="h-24 w-24 absolute -bottom-4 -right-4 opacity-10 pointer-events-none" />
        </div>

      </div>

      {/* Main Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Chart Views vs Inquiries (2/3 Column) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-border p-6 rounded-3xl shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-border/40">
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Views vs Inquiry</h3>
              <p className="text-[10px] text-muted-foreground font-semibold">Statistik konversi kunjungan menjadi calon penyewa (30 hari terakhir)</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-primary rounded-full"></span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Profile Views</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Leads (Inquiries)</span>
              </div>
            </div>
          </div>

          {/* SVG Custom Line Chart */}
          <div className="w-full">
            <svg 
              viewBox={`0 0 ${width} ${height}`} 
              className="w-full h-48 sm:h-56 overflow-visible text-slate-300 dark:text-slate-700"
            >
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = padding + ratio * (height - padding * 2);
                const value = Math.round(maxChartValue * (1 - ratio));
                return (
                  <g key={idx} className="opacity-40">
                    <line 
                      x1={padding} 
                      y1={y} 
                      x2={width - padding} 
                      y2={y} 
                      stroke="currentColor" 
                      strokeWidth="1" 
                      strokeDasharray="4 4" 
                    />
                    <text 
                      x={padding - 5} 
                      y={y + 3} 
                      textAnchor="end" 
                      className="fill-slate-400 text-[8px] font-bold"
                    >
                      {value}
                    </text>
                  </g>
                );
              })}

              {/* X Axis labels */}
              {chartPeriods.map((period, idx) => {
                const x = padding + (idx * (width - padding * 2)) / (chartPeriods.length - 1);
                return (
                  <text
                    key={idx}
                    x={x}
                    y={height - 5}
                    textAnchor="middle"
                    className="fill-slate-400 text-[8px] font-black uppercase"
                  >
                    {period}
                  </text>
                );
              })}

              {/* Views Line */}
              <polyline
                fill="none"
                stroke="#0284c7" /* primary blue */
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsViews}
                className="drop-shadow-[0_4px_6px_rgba(2,132,199,0.25)]"
              />

              {/* Leads Line */}
              <polyline
                fill="none"
                stroke="#f59e0b" /* amber */
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsLeads}
                className="drop-shadow-[0_4px_6px_rgba(245,158,11,0.25)]"
              />

              {/* Views Dots */}
              {chartViewsData.map((val, index) => {
                const x = padding + (index * (width - padding * 2)) / (chartViewsData.length - 1);
                const y = height - padding - (val * (height - padding * 2)) / maxChartValue;
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="4"
                    className="fill-white stroke-sky-600 stroke-2 hover:scale-125 transition-transform cursor-pointer"
                  >
                    <title>{`Views: ${val}`}</title>
                  </circle>
                );
              })}

              {/* Leads Dots */}
              {chartLeadsData.map((val, index) => {
                const x = padding + (index * (width - padding * 2)) / (chartLeadsData.length - 1);
                const y = height - padding - (val * (height - padding * 2)) / maxChartValue;
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="4"
                    className="fill-white stroke-amber-500 stroke-2 hover:scale-125 transition-transform cursor-pointer"
                  >
                    <title>{`Leads: ${val}`}</title>
                  </circle>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Room Status Distribution (1/3 Column) */}
        <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-6">
          <div className="border-b border-border/40 pb-4">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Alokasi Kamar</h3>
            <p className="text-[10px] text-muted-foreground font-semibold">Distribusi status kamar di seluruh properti kost</p>
          </div>

          {totalRooms === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <AlertTriangle className="h-8 w-8 text-amber-500/70 mb-2 animate-bounce" />
              <p className="text-xs font-bold">Kamar Belum Terdaftar</p>
              <button 
                onClick={() => setActiveTab('rooms')}
                className="mt-3 text-[10px] font-black bg-primary text-white py-1.5 px-4 rounded-xl shadow-md hover:scale-102 transition-transform cursor-pointer"
              >
                Tambah Kamar Pertama
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-around">
              {/* Doughnut Chart Ring representation */}
              <div className="flex justify-center items-center relative py-2">
                <svg className="w-36 h-36 transform -rotate-90 overflow-visible">
                  {(() => {
                    const total = totalRooms;
                    const r = 45;
                    const c = 2 * Math.PI * r;
                    
                    let accumulatedPercent = 0;
                    
                    return ['occupied', 'available', 'booked', 'maintenance'].map((status, idx) => {
                      const count = roomStatusCount[status as keyof typeof roomStatusCount] || 0;
                      if (count === 0) return null;
                      
                      const percent = count / total;
                      const strokeDasharray = `${percent * c} ${c}`;
                      const strokeDashoffset = -accumulatedPercent * c;
                      
                      accumulatedPercent += percent;

                      const colors = {
                        occupied: '#3b82f6', // blue
                        available: '#10b981', // green
                        booked: '#f59e0b', // amber
                        maintenance: '#ef4444' // red
                      };

                      return (
                        <circle
                          key={idx}
                          cx="72"
                          cy="72"
                          r={r}
                          fill="transparent"
                          stroke={colors[status as keyof typeof colors]}
                          strokeWidth="15"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="hover:stroke-[18] transition-all cursor-pointer"
                        />
                      );
                    });
                  })()}
                  <circle cx="72" cy="72" r="34" className="fill-white dark:fill-slate-900" />
                </svg>
                <div className="absolute flex flex-col justify-center items-center text-center">
                  <span className="text-2xl font-black text-slate-800 dark:text-white leading-none">{totalRooms}</span>
                  <span className="text-[8px] text-slate-400 font-extrabold uppercase mt-1">Kamar Total</span>
                </div>
              </div>

              {/* Status Labels Grid */}
              <div className="grid grid-cols-2 gap-3 mt-4 text-[10px] font-bold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
                  <span className="text-slate-600 dark:text-slate-400">Kosong ({roomStatusCount.available})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-blue-500"></span>
                  <span className="text-slate-600 dark:text-slate-400">Ditempati ({roomStatusCount.occupied})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
                  <span className="text-slate-600 dark:text-slate-400">Booking ({roomStatusCount.booked})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500"></span>
                  <span className="text-slate-600 dark:text-slate-400">Perbaikan ({roomStatusCount.maintenance})</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Overview Reports/Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/40 p-6 rounded-3xl border border-border/80">
        <div className="space-y-2.5">
          <h4 className="font-extrabold text-xs text-primary uppercase tracking-wider">Ringkasan Keuangan Bulan Ini</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-border/60">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Tagihan Terbayar</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                {formatIDR(currentMonthRevenue)}
              </span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-border/60">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Estimasi Total Pendapatan</span>
              <span className="text-lg font-black text-slate-800 dark:text-white mt-1 block">
                {formatIDR(estimatedMonthlyRevenue)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center space-y-3 pt-4 md:pt-0 md:pl-6 md:border-l border-border/80">
          <h4 className="font-extrabold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">Aktivitas Hari Ini</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-2 font-medium">
                <Users className="h-4 w-4 text-blue-500" />
                Penyewa Aktif di Kost Anda:
              </span>
              <span className="font-black text-slate-800 dark:text-white">{activeTenants} Mahasiswa</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-2 font-medium">
                <Clock className="h-4 w-4 text-amber-500" />
                Tagihan Belum Dibayar:
              </span>
              <span className="font-black text-slate-800 dark:text-white">{unpaidInvoicesCount} Invoice</span>
            </div>
            {overdueInvoicesCount > 0 && (
              <div className="flex items-center gap-2 text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/20 px-3 py-1.5 rounded-xl border border-rose-100 dark:border-rose-900/30">
                <AlertTriangle className="h-4.5 w-4.5 text-rose-500 shrink-0" />
                <span>Ada {overdueInvoicesCount} tagihan penyewa yang sudah melewati tanggal jatuh tempo!</span>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
