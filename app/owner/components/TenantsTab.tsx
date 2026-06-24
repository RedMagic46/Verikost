'use client';

import React, { useState, useMemo } from 'react';
import { Kost, Room, Tenant } from '@/app/types';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  Upload, 
  Calendar,
  AlertTriangle,
  DoorOpen,
  ArrowLeft,
  Building,
  Eye,
  CheckCircle2,
  Users
} from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import ConfirmModal from '@/components/ConfirmModal';

interface TenantsTabProps {
  myKosts: Kost[];
  myRooms: Room[];
  myTenants: Tenant[];
  addTenant: (tenant: Omit<Tenant, 'id'>) => Promise<void>;
  updateTenant: (id: string, tenant: Partial<Tenant>) => Promise<void>;
  deleteTenant: (tenantId: string) => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function TenantsTab({
  myKosts,
  myRooms,
  myTenants,
  addTenant,
  updateTenant,
  deleteTenant,
  showToast
}: TenantsTabProps) {

  const activeKosts = useMemo(() => myKosts.filter(k => !k.isDeleted), [myKosts]);

  // Selected Kost Filter
  const [selectedKostId, setSelectedKostId] = useState<string>(
    activeKosts.length > 0 ? activeKosts[0].id : ''
  );

  // States
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [tenantToDelete, setTenantToDelete] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [nik, setNik] = useState('');
  const [university, setUniversity] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [roomId, setRoomId] = useState('');
  const [checkIn, setCheckIn] = useState(() => new Date().toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState('');
  const [status, setStatus] = useState<Tenant['status']>('active');
  const [ktpUrl, setKtpUrl] = useState('');
  const [contractUrl, setContractUrl] = useState('');

  // Upload UI States
  const [isUploadingKtp, setIsUploadingKtp] = useState(false);
  const [isUploadingContract, setIsUploadingContract] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Filtered lists
  const kostTenants = useMemo(() => {
    return myTenants.filter(t => t.kostId === selectedKostId);
  }, [myTenants, selectedKostId]);

  const availableRooms = useMemo(() => {
    // Rooms that are available, booked, OR currently assigned to the tenant we are editing
    return myRooms.filter(r => 
      r.kostId === selectedKostId && 
      (r.status === 'available' || r.status === 'booked' || (editingTenant && r.id === editingTenant.roomId))
    );
  }, [myRooms, selectedKostId, editingTenant]);

  const handleOpenAddForm = () => {
    if (!selectedKostId) {
      showToast('Harap pilih properti kost terlebih dahulu.', 'error');
      return;
    }
    setName('');
    setNik('');
    setUniversity('');
    setPhone('');
    setEmail('');
    setRoomId(availableRooms.length > 0 ? availableRooms[0].id : '');
    setCheckIn(new Date().toISOString().split('T')[0]);
    setCheckOut('');
    setStatus('active');
    setKtpUrl('');
    setContractUrl('');
    setUploadError(null);
    setView('add');
  };

  const handleOpenEditForm = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setName(tenant.name);
    setNik(tenant.nik);
    setUniversity(tenant.university || '');
    setPhone(tenant.phone);
    setEmail(tenant.email);
    setRoomId(tenant.roomId || '');
    setCheckIn(tenant.checkIn);
    setCheckOut(tenant.checkOut || '');
    setStatus(tenant.status);
    setKtpUrl(tenant.ktpUrl || '');
    setContractUrl(tenant.contractUrl || '');
    setUploadError(null);
    setView('edit');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'ktp' | 'contract') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Ukuran file terlalu besar. Maksimal 2MB.');
      return;
    }

    if (type === 'ktp') {
      setIsUploadingKtp(true);
    } else {
      setIsUploadingContract(true);
    }
    setUploadError(null);

    const useBase64Fallback = () => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64Url = event.target?.result as string;
          if (base64Url) resolve(base64Url);
          else reject(new Error('Gagal membaca dokumen.'));
        };
        reader.onerror = () => reject(new Error('Gagal membaca dokumen.'));
        reader.readAsDataURL(file);
      });
    };

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `tenant-${type}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      
      const { data, error: uploadErr } = await supabase.storage
        .from('tenant-docs')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (!uploadErr && data) {
        const { data: { publicUrl } } = supabase.storage
          .from('tenant-docs')
          .getPublicUrl(data.path);
        
        if (type === 'ktp') setKtpUrl(publicUrl);
        else setContractUrl(publicUrl);
      } else {
        console.warn('Storage upload failed, using Base64 fallback:', uploadErr);
        const base64Url = await useBase64Fallback();
        if (type === 'ktp') setKtpUrl(base64Url);
        else setContractUrl(base64Url);
      }
    } catch (err: any) {
      console.error('Upload exception, using Base64 fallback:', err);
      try {
        const base64Url = await useBase64Fallback();
        if (type === 'ktp') setKtpUrl(base64Url);
        else setContractUrl(base64Url);
      } catch (fallbackErr: any) {
        setUploadError(fallbackErr.message || 'Gagal mengupload berkas.');
      }
    } finally {
      if (type === 'ktp') {
        setIsUploadingKtp(false);
      } else {
        setIsUploadingContract(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !nik.trim() || !phone.trim() || !email.trim()) {
      showToast('Harap isi semua kolom wajib.', 'error');
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        nik: nik.trim(),
        university: university.trim() || undefined,
        phone: phone.trim(),
        email: email.trim(),
        kostId: selectedKostId,
        roomId: roomId || undefined,
        checkIn,
        checkOut: checkOut || undefined,
        status,
        ktpUrl: ktpUrl || undefined,
        contractUrl: contractUrl || undefined
      };

      if (view === 'add') {
        await addTenant(payload);
      } else if (view === 'edit' && editingTenant) {
        await updateTenant(editingTenant.id, payload);
      }

      setView('list');
      setEditingTenant(null);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDeleteTenant = (id: string) => {
    setTenantToDelete(id);
  };

  const getRoomNumber = (roomId?: string) => {
    if (!roomId) return 'Belum diatur';
    const room = myRooms.find(r => r.id === roomId);
    return room ? `Kamar ${room.roomNumber}` : 'Kamar Hilang';
  };

  const handleViewDocument = (url?: string) => {
    if (!url) return;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Kost Selector */}
      {view === 'list' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Penyewa & Kontrak</h1>
              <p className="text-xs text-muted-foreground font-semibold">Kelola data mahasiswa penyewa aktif, riwayat masuk-keluar, serta dokumen KTP & Kontrak.</p>
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

              <button
                onClick={handleOpenAddForm}
                className="inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow shadow-primary/10 transition-all hover:scale-102 cursor-pointer shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Registrasi Penyewa</span>
              </button>
            </div>
          </div>

          {activeKosts.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-border rounded-3xl text-slate-400 font-semibold flex flex-col items-center justify-center">
              <Users className="h-12 w-12 text-slate-400 dark:text-slate-700 mb-3" />
              <p>Harap daftarkan properti kost terlebih dahulu untuk mengelola data penyewa.</p>
            </div>
          ) : (
            /* Tenant Table / List representation */
            <div className="bg-white dark:bg-slate-900 border border-border/85 rounded-3xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 border-b border-border font-black uppercase tracking-wider text-[10px]">
                      <th className="p-4 pl-6">Penyewa</th>
                      <th className="p-4">Identitas (NIK)</th>
                      <th className="p-4">Alokasi Kamar</th>
                      <th className="p-4">Kontak</th>
                      <th className="p-4">Mulai Sewa (Check In)</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Dokumen</th>
                      <th className="p-4 pr-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {kostTenants.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-slate-400 font-semibold">
                          Belum ada penyewa terdaftar untuk kost ini. Klik "Registrasi Penyewa" untuk menambahkan.
                        </td>
                      </tr>
                    ) : (
                      kostTenants.map((tenant) => (
                        <tr key={tenant.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors font-medium">
                          
                          {/* Tenant Name & Uni */}
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                {tenant.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-extrabold text-slate-800 dark:text-white block">{tenant.name}</span>
                                <span className="text-[10px] text-muted-foreground block">{tenant.university || 'Umum'}</span>
                              </div>
                            </div>
                          </td>

                          {/* NIK */}
                          <td className="p-4 text-slate-600 dark:text-slate-400">{tenant.nik}</td>

                          {/* Room allocation */}
                          <td className="p-4 font-bold text-slate-700 dark:text-slate-200">
                            {getRoomNumber(tenant.roomId)}
                          </td>

                          {/* Contact */}
                          <td className="p-4 space-y-0.5">
                            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                              <Phone className="h-3 w-3 shrink-0 text-slate-400" />
                              {tenant.phone}
                            </span>
                            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                              <Mail className="h-3 w-3 shrink-0 text-slate-400" />
                              {tenant.email}
                            </span>
                          </td>

                          {/* Check-in date */}
                          <td className="p-4 text-slate-600 dark:text-slate-400">
                            {tenant.checkIn}
                          </td>

                          {/* Status */}
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              tenant.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                                : tenant.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
                                : 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                            }`}>
                              {tenant.status === 'active' ? 'Aktif' : tenant.status === 'pending' ? 'Booking' : 'Keluar'}
                            </span>
                          </td>

                          {/* Documents */}
                          <td className="p-4">
                            <div className="flex gap-1.5">
                              {tenant.ktpUrl ? (
                                <button
                                  onClick={() => handleViewDocument(tenant.ktpUrl)}
                                  className="text-[9px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded border border-border/80 cursor-pointer flex items-center gap-0.5"
                                  title="Lihat KTP"
                                >
                                  KTP
                                </button>
                              ) : (
                                <span className="text-[9px] text-slate-400 italic">No KTP</span>
                              )}
                              {tenant.contractUrl ? (
                                <button
                                  onClick={() => handleViewDocument(tenant.contractUrl)}
                                  className="text-[9px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded border border-border/80 cursor-pointer flex items-center gap-0.5"
                                  title="Lihat Kontrak"
                                >
                                  Kontrak
                                </button>
                              ) : (
                                <span className="text-[9px] text-slate-400 italic">No Kontrak</span>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="p-4 pr-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditForm(tenant)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg cursor-pointer"
                                title="Edit Penyewa"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTenant(tenant.id)}
                                className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 rounded-lg cursor-pointer"
                                title="Hapus Data"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form View (Add / Edit) */}
      {(view === 'add' || view === 'edit') && (
        <div className="max-w-3xl bg-white dark:bg-slate-900 border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in slide-in-from-bottom-5 duration-200">
          
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <button
              onClick={() => {
                setView('list');
                setEditingTenant(null);
              }}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </button>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Users className="h-5 w-5 text-primary" />
                {view === 'add' ? 'Registrasi Penyewa Baru' : 'Edit Data Penyewa'}
              </h2>
              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                {view === 'add' 
                  ? 'Catat identitas penyewa aktif dan sambungkan ke kamar kost.' 
                  : `Memperbarui profil penyewa: ${editingTenant?.name}`}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-xs font-semibold">
            
            {/* Section 1: Data Profil */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-primary uppercase tracking-wider">Informasi Pribadi</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-700 dark:text-slate-300">Nama Lengkap Penyewa*</label>
                  <input
                    type="text"
                    placeholder="Contoh: Alya Sabrina"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 dark:text-slate-300">Nomor Induk Kependudukan (NIK/KTP)*</label>
                  <input
                    type="text"
                    placeholder="Contoh: 3507123456780001"
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 dark:text-slate-300">Universitas / Tempat Bekerja</label>
                  <input
                    type="text"
                    placeholder="Contoh: Universitas Brawijaya (UB)"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-slate-700 dark:text-slate-300">No. Handphone/WA*</label>
                    <input
                      type="text"
                      placeholder="e.g. 081234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-700 dark:text-slate-300">Email*</label>
                    <input
                      type="email"
                      placeholder="e.g. alya@student.ub.ac.id"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Sewa & Kamar */}
            <div className="space-y-4 pt-4 border-t border-border/60">
              <h3 className="text-xs font-black text-primary uppercase tracking-wider">Alokasi & Masa Sewa</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-700 dark:text-slate-300">Pilih Kamar Kost*</label>
                  {availableRooms.length === 0 ? (
                    <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-bold border border-rose-100 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>Tidak ada kamar kosong tersedia. Buat kamar baru dahulu.</span>
                    </div>
                  ) : (
                    <select
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-slate-200 font-bold"
                    >
                      {availableRooms.map(room => (
                        <option key={room.id} value={room.id}>
                          Kamar {room.roomNumber} - Floor {room.floor} ({room.type})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>Tanggal Masuk (Check In)*</span>
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>Tanggal Keluar (Opsional)</span>
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300">Status Penyewa*</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-slate-200 font-bold"
                >
                  <option value="active">Aktif (Penyewa menempati kamar saat ini)</option>
                  <option value="pending">Booking (Membayar DP, belum masuk)</option>
                  <option value="moved_out">Keluar (Masa sewa selesai / kamar kosong)</option>
                </select>
              </div>
            </div>

            {/* Section 3: Unggah Dokumen KTP & Kontrak */}
            <div className="space-y-4 pt-4 border-t border-border/60">
              <h3 className="text-xs font-black text-primary uppercase tracking-wider">Dokumen Kelengkapan</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Upload KTP */}
                <div className="bg-slate-50 dark:bg-slate-800/40 border border-border/80 p-4 rounded-2xl space-y-3 relative">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">Unggah Foto KTP</span>
                  
                  <div className="flex items-center gap-3">
                    <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-border text-slate-700 dark:text-slate-250 rounded-xl cursor-pointer inline-flex items-center gap-1.5">
                      <Upload className="h-3.5 w-3.5 text-slate-400" />
                      <span>{ktpUrl ? 'Ganti KTP' : 'Pilih Gambar KTP'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'ktp')}
                        className="hidden"
                      />
                    </label>
                    
                    {ktpUrl && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Terunggah
                      </span>
                    )}
                  </div>

                  {ktpUrl && (
                    <div className="mt-2 text-[10px]">
                      <button
                        type="button"
                        onClick={() => handleViewDocument(ktpUrl)}
                        className="text-primary hover:underline flex items-center gap-1 font-bold"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Pratinjau KTP</span>
                      </button>
                    </div>
                  )}

                  {isUploadingKtp && (
                    <div className="absolute inset-0 bg-white/85 dark:bg-slate-950/85 flex items-center justify-center rounded-2xl">
                      <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  )}
                </div>

                {/* Upload Kontrak */}
                <div className="bg-slate-50 dark:bg-slate-800/40 border border-border/80 p-4 rounded-2xl space-y-3 relative">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">Unggah Dokumen Kontrak Sewa</span>
                  
                  <div className="flex items-center gap-3">
                    <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-border text-slate-700 dark:text-slate-250 rounded-xl cursor-pointer inline-flex items-center gap-1.5">
                      <Upload className="h-3.5 w-3.5 text-slate-400" />
                      <span>{contractUrl ? 'Ganti Dokumen' : 'Pilih Kontrak'}</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileUpload(e, 'contract')}
                        className="hidden"
                      />
                    </label>
                    
                    {contractUrl && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Terunggah
                      </span>
                    )}
                  </div>

                  {contractUrl && (
                    <div className="mt-2 text-[10px]">
                      <button
                        type="button"
                        onClick={() => handleViewDocument(contractUrl)}
                        className="text-primary hover:underline flex items-center gap-1 font-bold"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Pratinjau Kontrak</span>
                      </button>
                    </div>
                  )}

                  {isUploadingContract && (
                    <div className="absolute inset-0 bg-white/85 dark:bg-slate-950/85 flex items-center justify-center rounded-2xl">
                      <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  )}
                </div>

              </div>

              {uploadError && (
                <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>{uploadError}</span>
                </p>
              )}
            </div>

            {/* Form Action Buttons */}
            <div className="pt-6 border-t border-border/60 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setView('list');
                  setEditingTenant(null);
                }}
                className="rounded-xl border border-border py-3 px-6 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-xl bg-primary hover:bg-blue-600 text-white py-3 px-8 text-xs font-bold shadow-md shadow-primary/20 transition-transform active:scale-98 cursor-pointer"
              >
                {view === 'add' ? 'Registrasi Penyewa' : 'Simpan Perubahan'}
              </button>
            </div>

          </form>
        </div>
      )}

      <ConfirmModal
        isOpen={!!tenantToDelete}
        onClose={() => setTenantToDelete(null)}
        onConfirm={async () => {
          if (tenantToDelete) {
            try {
              await deleteTenant(tenantToDelete);
              showToast('Data penyewa berhasil dihapus.', 'success');
            } catch (err) {
              const msg = err instanceof Error ? err.message : 'Unknown error';
              showToast('Gagal menghapus data penyewa: ' + msg, 'error');
            }
          }
        }}
        title="Hapus Data Penyewa?"
        description="Apakah Anda yakin ingin menghapus data penyewa ini secara permanen? Status kamar yang dihuni akan disesuaikan kembali menjadi kosong."
        confirmText="Ya, Hapus Data"
        variant="danger"
      />
    </div>
  );
}
