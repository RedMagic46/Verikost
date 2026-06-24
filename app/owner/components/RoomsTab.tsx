'use client';

import React, { useState, useMemo } from 'react';
import { Kost, Room, Tenant } from '@/app/types';
import { 
  Plus, 
  Edit, 
  Trash2, 
  SlidersHorizontal, 
  X, 
  Check, 
  Layers, 
  User, 
  AlertCircle,
  TrendingUp,
  Wrench,
  Bookmark,
  DoorOpen
} from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

interface RoomsTabProps {
  myKosts: Kost[];
  myRooms: Room[];
  myTenants: Tenant[];
  addRoom: (room: Omit<Room, 'id'>) => Promise<void>;
  updateRoom: (id: string, room: Partial<Room>) => Promise<void>;
  deleteRoom: (roomId: string) => Promise<void>;
  bulkUpdateRoomStatus: (roomIds: string[], status: Room['status']) => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function RoomsTab({
  myKosts,
  myRooms,
  myTenants,
  addRoom,
  updateRoom,
  deleteRoom,
  bulkUpdateRoomStatus,
  showToast
}: RoomsTabProps) {

  const activeKosts = useMemo(() => myKosts.filter(k => !k.isDeleted), [myKosts]);
  
  // Selected Kost Filter
  const [selectedKostId, setSelectedKostId] = useState<string>(
    activeKosts.length > 0 ? activeKosts[0].id : ''
  );

  // States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  // Form Fields
  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState('1');
  const [type, setType] = useState('Standard');
  const [price, setPrice] = useState(1000000);
  const [status, setStatus] = useState<Room['status']>('available');
  const [notes, setNotes] = useState('');

  // Bulk Update State
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<Room['status']>('available');
  const [isBulkMode, setIsBulkMode] = useState(false);

  // Filtered Rooms
  const kostRooms = useMemo(() => {
    return myRooms.filter(r => r.kostId === selectedKostId);
  }, [myRooms, selectedKostId]);

  // Find Tenant for a Room
  const getRoomTenant = (roomId: string) => {
    return myTenants.find(t => t.roomId === roomId && t.status === 'active');
  };

  const handleOpenAddModal = () => {
    if (!selectedKostId) {
      showToast('Harap pilih properti kost terlebih dahulu.', 'error');
      return;
    }
    const targetKost = activeKosts.find(k => k.id === selectedKostId);
    setRoomNumber('');
    setFloor('1');
    setType('Standard');
    setPrice(targetKost ? targetKost.price : 1000000);
    setStatus('available');
    setNotes('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (room: Room) => {
    setCurrentRoom(room);
    setRoomNumber(room.roomNumber);
    setFloor(room.floor);
    setType(room.type);
    setPrice(room.price);
    setStatus(room.status);
    setNotes(room.notes || '');
    setIsEditModalOpen(true);
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim()) return;

    try {
      await addRoom({
        kostId: selectedKostId,
        roomNumber: roomNumber.trim(),
        floor,
        type,
        price: Number(price),
        status,
        notes: notes.trim() || undefined
      });
      setIsAddModalOpen(false);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleEditRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRoom || !roomNumber.trim()) return;

    try {
      await updateRoom(currentRoom.id, {
        roomNumber: roomNumber.trim(),
        floor,
        type,
        price: Number(price),
        status,
        notes: notes.trim() || undefined
      });
      setIsEditModalOpen(false);
      setCurrentRoom(null);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDeleteRoom = (id: string) => {
    setRoomToDelete(id);
  };

  const handleToggleRoomSelection = (roomId: string) => {
    setSelectedRoomIds(prev => 
      prev.includes(roomId) ? prev.filter(id => id !== roomId) : [...prev, roomId]
    );
  };

  const handleSelectAllRooms = () => {
    if (selectedRoomIds.length === kostRooms.length) {
      setSelectedRoomIds([]);
    } else {
      setSelectedRoomIds(kostRooms.map(r => r.id));
    }
  };

  const handleBulkUpdateStatus = async () => {
    if (selectedRoomIds.length === 0) {
      showToast('Harap pilih minimal satu kamar.', 'error');
      return;
    }
    try {
      await bulkUpdateRoomStatus(selectedRoomIds, bulkStatus);
      setSelectedRoomIds([]);
      setIsBulkMode(false);
    } catch (err: any) {
      console.error(err);
    }
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  // Color mappings for room status
  const statusConfig = {
    available: { bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-450', dot: 'bg-emerald-500', label: 'Kosong' },
    occupied: { bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-900/40', text: 'text-blue-700 dark:text-blue-450', dot: 'bg-blue-500', label: 'Ditempati' },
    booked: { bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-200 dark:border-amber-900/40', text: 'text-amber-700 dark:text-amber-450', dot: 'bg-amber-500', label: 'Dibooking' },
    maintenance: { bg: 'bg-rose-50 dark:bg-rose-950/20', border: 'border-rose-200 dark:border-rose-900/40', text: 'text-rose-700 dark:text-rose-450', dot: 'bg-rose-500', label: 'Perbaikan' }
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Kost Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Manajemen Kamar</h1>
          <p className="text-xs text-muted-foreground font-semibold">Kelola kamar kos secara granular, atur tarif per tipe kamar, dan pantau status harian.</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {activeKosts.length > 0 && (
            <select
              value={selectedKostId}
              onChange={(e) => {
                setSelectedKostId(e.target.value);
                setSelectedRoomIds([]);
                setIsBulkMode(false);
              }}
              className="bg-white dark:bg-slate-900 border border-border/80 text-xs rounded-xl p-2.5 focus:outline-none text-slate-800 dark:text-slate-200 font-extrabold shadow-sm min-w-[200px]"
            >
              {activeKosts.map((kost) => (
                <option key={kost.id} value={kost.id}>{kost.name}</option>
              ))}
            </select>
          )}

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow shadow-primary/10 transition-all hover:scale-102 cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Kamar</span>
          </button>
        </div>
      </div>

      {activeKosts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-border rounded-3xl text-slate-400 font-semibold flex flex-col items-center justify-center">
          <Layers className="h-12 w-12 text-slate-350 dark:text-slate-700 mb-3" />
          <p>Anda belum memiliki properti kost aktif. Harap daftarkan properti terlebih dahulu di tab 'Properti Saya'.</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Bulk Update Controls */}
          {kostRooms.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-border p-4 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsBulkMode(!isBulkMode);
                    setSelectedRoomIds([]);
                  }}
                  className={`px-3 py-2 border rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isBulkMode 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900/50' 
                      : 'bg-slate-50 border-border/80 text-slate-650 hover:bg-slate-100'
                  }`}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>{isBulkMode ? 'Batalkan Bulk Update' : 'Bulk Update Status'}</span>
                </button>

                {isBulkMode && (
                  <button
                    onClick={handleSelectAllRooms}
                    className="text-[10px] text-primary hover:underline font-bold"
                  >
                    {selectedRoomIds.length === kostRooms.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                  </button>
                )}
              </div>

              {isBulkMode && (
                <div className="flex items-center gap-2">
                  <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value as any)}
                    className="bg-slate-50 dark:bg-slate-800 border border-border/80 text-xs rounded-xl p-2.5 focus:outline-none text-slate-800 dark:text-slate-200 font-bold"
                  >
                    <option value="available">Tersedia (Kosong)</option>
                    <option value="occupied">Ditempati</option>
                    <option value="booked">Dibooking</option>
                    <option value="maintenance">Dalam Perbaikan</option>
                  </select>

                  <button
                    onClick={handleBulkUpdateStatus}
                    className="px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-sm hover:scale-102 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Terapkan ({selectedRoomIds.length})</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Rooms Visual Grid */}
          {kostRooms.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-border rounded-3xl text-sm text-slate-450 font-semibold flex flex-col items-center justify-center">
              <Layers className="h-10 w-10 text-slate-350 dark:text-slate-700 mb-3" />
              <p>Belum ada kamar terdaftar untuk kost ini.</p>
              <button
                onClick={handleOpenAddModal}
                className="mt-4 text-xs font-black bg-primary text-white py-2 px-5 rounded-xl shadow-md hover:scale-102 transition-all cursor-pointer"
              >
                Tambah Kamar Pertama
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {kostRooms.map((room) => {
                const config = statusConfig[room.status];
                const tenant = getRoomTenant(room.id);
                const isSelected = selectedRoomIds.includes(room.id);

                return (
                  <div
                    key={room.id}
                    onClick={() => isBulkMode && handleToggleRoomSelection(room.id)}
                    className={`border p-4 rounded-2xl flex flex-col justify-between h-40 shadow-xs relative transition-all group ${
                      isBulkMode 
                        ? isSelected 
                          ? 'ring-2 ring-indigo-500 border-indigo-400 bg-indigo-50/20 dark:bg-indigo-950/20' 
                          : 'opacity-70 scale-98 cursor-pointer' 
                        : 'bg-white dark:bg-slate-900 border-border/80 hover:border-slate-300 dark:hover:border-slate-800'
                    }`}
                  >
                    
                    {/* Bulk checkbox overlay */}
                    {isBulkMode && (
                      <div className="absolute top-2.5 right-2.5 h-4.5 w-4.5 rounded border border-border bg-white dark:bg-slate-850 flex items-center justify-center">
                        {isSelected && <span className="h-2.5 w-2.5 rounded bg-indigo-500"></span>}
                      </div>
                    )}

                    {/* Room Header: Number & Floor */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-base font-black text-slate-800 dark:text-white leading-none">
                          {room.roomNumber}
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase mt-1.5 block">
                          Lantai {room.floor}
                        </span>
                      </div>

                      {/* Status indicator pill */}
                      {!isBulkMode && (
                        <div className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase flex items-center gap-1 ${config.bg} ${config.border} ${config.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`}></span>
                          <span>{config.label}</span>
                        </div>
                      )}
                    </div>

                    {/* Room Content: Price & Type */}
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">
                        {room.type}
                      </span>
                      <div className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                        {formatIDR(room.price)}
                      </div>

                      {/* Active tenant summary */}
                      {room.status === 'occupied' && tenant ? (
                        <div className="mt-2 text-[9px] text-primary font-bold flex items-center gap-1 truncate bg-blue-50 dark:bg-blue-950/30 p-1 px-1.5 rounded-lg border border-blue-100/50 dark:border-blue-900/30">
                          <User className="h-3 w-3 shrink-0" />
                          <span className="truncate">{tenant.name}</span>
                        </div>
                      ) : (
                        <div className="h-6"></div>
                      )}
                    </div>

                    {/* Hover tools bar */}
                    {!isBulkMode && (
                      <div className="absolute inset-x-0 bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs py-2 px-3 flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl border-t border-border/40">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenEditModal(room); }}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                          title="Edit Kamar"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteRoom(room.id); }}
                          className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Kamar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* Add / Edit Room Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-border shadow-2xl w-full max-w-md p-6 space-y-5 animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center pb-3 border-b border-border/60">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {isAddModalOpen ? 'Tambah Kamar Baru' : 'Edit Detail Kamar'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                  setCurrentRoom(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={isAddModalOpen ? handleAddRoom : handleEditRoom} className="space-y-4 text-xs font-semibold">
              
              {/* Room Number & Floor */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-700 dark:text-slate-300">Nomor/Nama Kamar*</label>
                  <input
                    type="text"
                    placeholder="Contoh: A-01, 102, dll."
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-slate-700 dark:text-slate-300">Lantai*</label>
                  <input
                    type="text"
                    placeholder="1, 2, atau 3"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Price & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-700 dark:text-slate-300">Tarif Sewa Bulanan (IDR)*</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-slate-700 dark:text-slate-300">Tipe Kamar*</label>
                  <input
                    type="text"
                    placeholder="e.g. Standard, Deluxe, VIP"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300">Status Awal Kamar*</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-slate-200 font-bold"
                >
                  <option value="available">Kosong (Tersedia)</option>
                  <option value="occupied">Ditempati</option>
                  <option value="booked">Dibooking</option>
                  <option value="maintenance">Perbaikan (Maintenance)</option>
                </select>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300">Catatan Tambahan (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Ada AC bocor, jendela menghadap barat, dll."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-700 dark:text-slate-200"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                    setCurrentRoom(null);
                  }}
                  className="py-2.5 px-4 rounded-xl border border-border text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-primary text-white font-bold hover:bg-blue-600 transition-colors shadow-sm cursor-pointer"
                >
                  Simpan Kamar
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!roomToDelete}
        onClose={() => setRoomToDelete(null)}
        onConfirm={async () => {
          if (roomToDelete) {
            try {
              await deleteRoom(roomToDelete);
              showToast('Kamar berhasil dihapus.', 'success');
            } catch (err) {
              const msg = err instanceof Error ? err.message : 'Unknown error';
              showToast('Gagal menghapus kamar: ' + msg, 'error');
            }
          }
        }}
        title="Hapus Kamar?"
        description="Apakah Anda yakin ingin menghapus kamar ini secara permanen? Seluruh alokasi penyewa pada kamar ini akan dilepas."
        confirmText="Ya, Hapus Kamar"
        variant="danger"
      />
    </div>
  );
}
