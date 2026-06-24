'use client';

import React, { useState, useMemo } from 'react';
import { Kost, Room } from '@/app/types';
import VerificationBadge from '@/components/VerificationBadge';
import CustomSelect from '@/components/CustomSelect';
import { 
  Building2, 
  MapPin, 
  Edit, 
  Trash2, 
  Copy, 
  Plus, 
  Eye, 
  X, 
  Compass, 
  Upload, 
  AlertTriangle, 
  Video, 
  ArrowLeft,
  Search,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabase';
import { useApp } from '@/app/context/AppContext';
import CheckoutModal from '@/components/CheckoutModal';

interface PropertiesTabProps {
  myKosts: Kost[];
  addKost: (kost: Omit<Kost, 'id' | 'rating' | 'views' | 'ownerId' | 'ownerName' | 'ownerPhone'>) => Promise<void>;
  deleteKost: (id: string) => Promise<void>;
  updateKostAvailability: (id: string, availability: Kost['roomAvailability']) => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  isSubscriptionActive?: boolean;
}

export default function PropertiesTab({
  myKosts,
  addKost,
  deleteKost,
  updateKostAvailability,
  showToast,
  isSubscriptionActive
}: PropertiesTabProps) {

  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [editingKost, setEditingKost] = useState<Kost | null>(null);

  const { createOwnerPayment, executeMockOwnerPayment, platformSettings, currentUser } = useApp();
  const [promoteKost, setPromoteKost] = useState<Kost | null>(null);
  const [promoteDays, setPromoteDays] = useState(7);
  const promoteAmount = promoteDays * (platformSettings.ownerPromotionRate || 5000);
  const [promotePaymentId, setPromotePaymentId] = useState<string | null>(null);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [isPromoteCheckoutOpen, setIsPromoteCheckoutOpen] = useState(false);

  const handleOpenPromoteModal = (kost: Kost) => {
    if (isSubscriptionActive === false) {
      showToast('Gagal: Akun langganan pemilik Anda telah habis. Harap aktifkan langganan terlebih dahulu.', 'error');
      return;
    }
    setPromoteKost(kost);
    setPromoteDays(7);
    setPromotePaymentId(null);
    setIsPromoteModalOpen(true);
  };

  const handleRequestPromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoteKost) return;
    if (promoteDays <= 0) {
      showToast('Masukkan jumlah hari yang valid.', 'error');
      return;
    }
    const paymentId = await createOwnerPayment('promotion', promoteAmount, promoteDays, promoteKost.id);
    if (paymentId) {
      setPromotePaymentId(paymentId);
      setIsPromoteModalOpen(false);
      setIsPromoteCheckoutOpen(true);
    }
  };

  const handlePromoteSuccess = async (paymentId: string, method: string) => {
    await executeMockOwnerPayment(paymentId, method);
    setIsPromoteCheckoutOpen(false);
    setPromoteKost(null);
    setPromotePaymentId(null);
  };

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterAvailability, setFilterAvailability] = useState<string>('all');

  // Form Fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState(1200000);
  const [genderCategory, setGenderCategory] = useState<'male' | 'female' | 'mixed'>('female');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Lowokwaru');
  const [distUB, setDistUB] = useState(1.0);
  const [distUM, setDistUM] = useState(1.5);
  const [distUMM, setDistUMM] = useState(3.0);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [securityInfo, setSecurityInfo] = useState('CCTV 24 Jam aktif, gerbang utama kartu RFID, jam malam 22.00.');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [videoTour, setVideoTour] = useState('');
  const [roomAvailability, setRoomAvailability] = useState<'available' | 'limited' | 'full'>('available');
  const [facilities, setFacilities] = useState<string[]>(['WiFi', 'Kamar Mandi Dalam', 'Kasur Springbed', 'Meja Belajar']);
  const [bookingDpAmount, setBookingDpAmount] = useState(0);

  // UI States
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadImageError, setUploadImageError] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [kostToDelete, setKostToDelete] = useState<string | null>(null);

  // Load draft from localStorage when entering 'add' view or when currentUser is loaded
  React.useEffect(() => {
    if (view === 'add' && currentUser?.id) {
      const savedDraft = localStorage.getItem(`vk_kost_draft_${currentUser.id}`);
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          if (draft.name !== undefined) setName(draft.name);
          if (draft.price !== undefined) setPrice(draft.price);
          if (draft.genderCategory !== undefined) setGenderCategory(draft.genderCategory);
          if (draft.address !== undefined) setAddress(draft.address);
          if (draft.district !== undefined) setDistrict(draft.district);
          if (draft.distUB !== undefined) setDistUB(draft.distUB);
          if (draft.distUM !== undefined) setDistUM(draft.distUM);
          if (draft.distUMM !== undefined) setDistUMM(draft.distUMM);
          if (draft.latitude !== undefined) setLatitude(draft.latitude);
          if (draft.longitude !== undefined) setLongitude(draft.longitude);
          if (draft.securityInfo !== undefined) setSecurityInfo(draft.securityInfo);
          if (draft.description !== undefined) setDescription(draft.description);
          if (draft.images !== undefined) setImages(draft.images);
          if (draft.videoTour !== undefined) setVideoTour(draft.videoTour);
          if (draft.roomAvailability !== undefined) setRoomAvailability(draft.roomAvailability);
          if (draft.facilities !== undefined) setFacilities(draft.facilities);
          if (draft.bookingDpAmount !== undefined) setBookingDpAmount(draft.bookingDpAmount);
        } catch (e) {
          console.error("Gagal memuat draf kost:", e);
        }
      }
    }
  }, [view, currentUser?.id]);

  // Save draft to localStorage on form input changes when view is 'add'
  React.useEffect(() => {
    if (view === 'add' && currentUser?.id) {
      const draft = {
        name,
        price,
        genderCategory,
        address,
        district,
        distUB,
        distUM,
        distUMM,
        latitude,
        longitude,
        securityInfo,
        description,
        images,
        videoTour,
        roomAvailability,
        facilities,
        bookingDpAmount
      };
      localStorage.setItem(`vk_kost_draft_${currentUser.id}`, JSON.stringify(draft));
    }
  }, [
    view,
    currentUser?.id,
    name,
    price,
    genderCategory,
    address,
    district,
    distUB,
    distUM,
    distUMM,
    latitude,
    longitude,
    securityInfo,
    description,
    images,
    videoTour,
    roomAvailability,
    facilities,
    bookingDpAmount
  ]);

  const activeKosts = useMemo(() => {
    return myKosts.filter(k => !k.isDeleted);
  }, [myKosts]);

  const filteredKosts = useMemo(() => {
    let result = activeKosts;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(k => k.name.toLowerCase().includes(q) || k.address.toLowerCase().includes(q));
    }

    if (filterGender !== 'all') {
      result = result.filter(k => k.genderCategory === filterGender);
    }

    if (filterAvailability !== 'all') {
      result = result.filter(k => k.roomAvailability === filterAvailability);
    }

    return result;
  }, [activeKosts, searchQuery, filterGender, filterAvailability]);

  const availableFacilitiesList = [
    'AC', 'WiFi', 'Kamar Mandi Dalam', 'Water Heater', 'TV Smart', 
    'Kulkas Kecil', 'Kasur Springbed', 'Lemari Pakaian', 'Meja Belajar', 
    'Parkir Motor', 'Parkir Mobil', 'Dapur Bersama', 'CCTV', 'Security 24 Jam'
  ];

  const handleFacilityToggle = (fac: string) => {
    setFacilities((prev) =>
      prev.includes(fac) ? prev.filter((f) => f !== fac) : [...prev, fac]
    );
  };

  const handleOpenAddForm = () => {
    if (isSubscriptionActive === false) {
      showToast('Gagal: Akun langganan pemilik Anda telah habis. Harap aktifkan langganan terlebih dahulu.', 'error');
      return;
    }
    setName('');
    setPrice(1200000);
    setGenderCategory('female');
    setAddress('');
    setDistrict('Lowokwaru');
    setDistUB(1.0);
    setDistUM(1.5);
    setDistUMM(3.0);
    setLatitude('');
    setLongitude('');
    setSecurityInfo('CCTV 24 Jam aktif, gerbang utama kartu RFID, jam malam 22.00.');
    setDescription('');
    setImages(['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80']);
    setVideoTour('https://www.w3schools.com/html/mov_bbb.mp4');
    setRoomAvailability('available');
    setFacilities(['WiFi', 'Kamar Mandi Dalam', 'Kasur Springbed', 'Meja Belajar']);
    setBookingDpAmount(0);
    setView('add');
  };

  const handleOpenEditForm = (kost: Kost) => {
    setEditingKost(kost);
    setName(kost.name);
    setPrice(kost.price);
    setGenderCategory(kost.genderCategory);
    setAddress(kost.address);
    setDistrict(kost.district);
    setDistUB(kost.distanceToUB);
    setDistUM(kost.distanceToUM);
    setDistUMM(kost.distanceToUMM);
    setLatitude(kost.latitude?.toString() || '');
    setLongitude(kost.longitude?.toString() || '');
    setSecurityInfo(kost.securityInfo);
    setDescription(kost.description);
    setImages(kost.images);
    setVideoTour(kost.videoTour || '');
    setRoomAvailability(kost.roomAvailability);
    setFacilities(kost.facilities);
    setBookingDpAmount(kost.bookingDpAmount || 0);
    setView('edit');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    setUploadImageError(null);

    const filesArray = Array.from(files);
    const oversizedFile = filesArray.find(f => f.size > 2 * 1024 * 1024);
    if (oversizedFile) {
      setUploadImageError(`File "${oversizedFile.name}" terlalu besar. Maksimal 2MB per gambar.`);
      setIsUploadingImage(false);
      return;
    }

    const nonImageFile = filesArray.find(f => !f.type.startsWith('image/'));
    if (nonImageFile) {
      setUploadImageError(`File "${nonImageFile.name}" bukan gambar. Harap pilih gambar.`);
      setIsUploadingImage(false);
      return;
    }

    for (const file of filesArray) {
      const useBase64Fallback = () => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64Url = event.target?.result as string;
            if (base64Url) resolve(base64Url);
            else reject(new Error('Gagal membaca file gambar.'));
          };
          reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
          reader.readAsDataURL(file);
        });
      };

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `kost-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        
        const { data, error: uploadErr } = await supabase.storage
          .from('kost-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (!uploadErr && data) {
          const { data: { publicUrl } } = supabase.storage
            .from('kost-images')
            .getPublicUrl(data.path);
          
          setImages((prev) => [...prev, publicUrl]);
        } else {
          console.warn('Storage upload failed, using Base64 fallback:', uploadErr);
          const base64Url = await useBase64Fallback();
          setImages((prev) => [...prev, base64Url]);
        }
      } catch (err) {
        console.error('Upload exception, using Base64 fallback:', err);
        try {
          const base64Url = await useBase64Fallback();
          setImages((prev) => [...prev, base64Url]);
        } catch (fallbackErr: any) {
          setUploadImageError(fallbackErr.message || 'Gagal mengupload gambar.');
        }
      }
    }
    setIsUploadingImage(false);
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    if (!imageUrlInput.startsWith('http://') && !imageUrlInput.startsWith('https://') && !imageUrlInput.startsWith('data:')) {
      setUploadImageError('URL gambar harus dimulai dengan http:// atau https://');
      return;
    }
    setImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
    setUploadImageError(null);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || images.length === 0) {
      showToast('Mohon lengkapi semua data wajib dan upload minimal 1 foto.', 'error');
      return;
    }

    try {
      const payload = {
        name,
        address,
        district,
        description,
        price: Number(price),
        facilities,
        images,
        videoTour: videoTour || undefined,
        verifiedStatus: editingKost ? editingKost.verifiedStatus : 'none' as const,
        roomAvailability,
        genderCategory,
        distanceToUB: Number(distUB),
        distanceToUM: Number(distUM),
        distanceToUMM: Number(distUMM),
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        securityInfo,
        bookingDpAmount: Number(bookingDpAmount)
      };

      if (view === 'add') {
        await addKost(payload);
        showToast('Kost baru berhasil didaftarkan.', 'success');
        if (currentUser?.id) {
          localStorage.removeItem(`vk_kost_draft_${currentUser.id}`);
        }
      } else if (view === 'edit' && editingKost) {
        const { error } = await supabase
          .from('kosts')
          .update(payload)
          .eq('id', editingKost.id);

        if (error) throw error;
        
        // Update local state in myKosts ref
        editingKost.name = name;
        editingKost.price = Number(price);
        editingKost.genderCategory = genderCategory;
        editingKost.address = address;
        editingKost.district = district;
        editingKost.distanceToUB = Number(distUB);
        editingKost.distanceToUM = Number(distUM);
        editingKost.distanceToUMM = Number(distUMM);
        editingKost.latitude = latitude ? Number(latitude) : undefined;
        editingKost.longitude = longitude ? Number(longitude) : undefined;
        editingKost.securityInfo = securityInfo;
        editingKost.description = description;
        editingKost.images = images;
        editingKost.videoTour = videoTour || undefined;
        editingKost.roomAvailability = roomAvailability;
        editingKost.facilities = facilities;
        editingKost.bookingDpAmount = Number(bookingDpAmount);

        showToast('Detail properti berhasil diperbarui.', 'success');
      }

      setView('list');
      setEditingKost(null);
    } catch (err: any) {
      console.error(err);
      showToast('Gagal memproses data properti: ' + err.message, 'error');
    }
  };

  const handleDuplicate = async (kost: Kost) => {
    try {
      const payload = {
        name: `Copy of ${kost.name}`,
        address: kost.address,
        district: kost.district,
        description: kost.description,
        price: kost.price,
        facilities: kost.facilities,
        images: kost.images,
        videoTour: kost.videoTour,
        verifiedStatus: 'none' as const,
        roomAvailability: kost.roomAvailability,
        genderCategory: kost.genderCategory,
        distanceToUB: kost.distanceToUB,
        distanceToUM: kost.distanceToUM,
        distanceToUMM: kost.distanceToUMM,
        latitude: kost.latitude,
        longitude: kost.longitude,
        securityInfo: kost.securityInfo,
        bookingDpAmount: kost.bookingDpAmount || 0
      };

      await addKost(payload);
      showToast('Listing kost berhasil diduplikasi.', 'success');
    } catch (err: any) {
      showToast('Gagal menduplikasi kost: ' + err.message, 'error');
    }
  };

  const handleOpenDeleteConfirm = (id: string) => {
    setKostToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!kostToDelete) return;
    try {
      await deleteKost(kostToDelete);
      setIsDeleteConfirmOpen(false);
      setKostToDelete(null);
    } catch (err: any) {
      showToast('Gagal menghapus kost: ' + err.message, 'error');
    }
  };

  const genderCategoryOptions = [
    { value: 'male', label: 'Putra' },
    { value: 'female', label: 'Putri' },
    { value: 'mixed', label: 'Campur' }
  ];

  return (
    <div className="space-y-6">
      
      {/* List View */}
      {view === 'list' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Properti Saya</h1>
              <p className="text-xs text-muted-foreground font-semibold">Lihat, tambahkan, edit, atau hapus listing properti kost Anda.</p>
            </div>
            
            <button
              onClick={handleOpenAddForm}
              className="inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow shadow-primary/10 transition-all hover:scale-102 cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Kost Baru</span>
            </button>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-slate-900 border border-border/80 p-4 rounded-2xl shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama properti atau alamat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-border/80 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none text-slate-800 dark:text-white placeholder-slate-400"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-border/80 text-xs rounded-xl p-2 focus:outline-none text-slate-850 dark:text-slate-200 font-bold"
              >
                <option value="all">Semua Tipe Gender</option>
                <option value="male">Putra</option>
                <option value="female">Putri</option>
                <option value="mixed">Campur</option>
              </select>

              <select
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-border/80 text-xs rounded-xl p-2 focus:outline-none text-slate-850 dark:text-slate-200 font-bold"
              >
                <option value="all">Semua Ketersediaan</option>
                <option value="available">Tersedia</option>
                <option value="limited">Terbatas</option>
                <option value="full">Penuh</option>
              </select>
            </div>
          </div>

          {/* Kost Cards Grid */}
          {filteredKosts.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-border rounded-3xl text-sm text-slate-450 font-semibold flex flex-col items-center justify-center">
              <Building2 className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
              <p>Belum ada properti kost yang cocok dengan filter atau pencarian Anda.</p>
              {activeKosts.length === 0 && (
                <button
                  onClick={handleOpenAddForm}
                  className="mt-4 text-xs font-black bg-primary text-white py-2 px-5 rounded-xl shadow-md hover:scale-102 transition-all cursor-pointer"
                >
                  Daftarkan Kost Pertama
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredKosts.map((kost) => (
                <div 
                  key={kost.id} 
                  className="bg-white dark:bg-slate-900 border border-border p-4 rounded-3xl flex flex-col justify-between shadow-sm hover:shadow-md hover:border-primary/30 transition-all group relative overflow-hidden animate-in fade-in"
                >
                  <div>
                    {/* Kost Image Cover */}
                    <div className="w-full h-40 rounded-2xl overflow-hidden relative shrink-0">
                      <img 
                        src={kost.images[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'} 
                        alt={kost.name} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-103 duration-300" 
                      />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-primary/95 text-white rounded-md text-[9px] font-black uppercase tracking-wider shadow-sm">
                          {kost.genderCategory === 'male' ? 'PUTRA' : kost.genderCategory === 'female' ? 'PUTRI' : 'CAMPUR'}
                        </span>
                        <VerificationBadge status={kost.verifiedStatus} />
                      </div>
                    </div>

                    {/* Kost Info */}
                    <div className="mt-3.5 space-y-1.5">
                      <h3 className="text-sm font-extrabold text-slate-800 dark:text-white leading-tight group-hover:text-primary transition-colors">
                        <Link href={`/kost/${kost.id}`}>{kost.name}</Link>
                      </h3>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{kost.address}</span>
                      </p>
                      <p className="text-xs font-black text-primary">
                        {formatIDR(kost.price)}
                        <span className="text-[10px] text-slate-400 font-bold"> / bulan</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3.5 border-t border-border/45 flex items-center justify-between">
                    {/* Availability Indicators */}
                    <div className="flex rounded-lg border border-border/80 bg-slate-50 dark:bg-slate-800 p-0.5 scale-90 origin-left">
                      {(['available', 'limited', 'full'] as const).map((status) => (
                        <button
                          key={status}
                          onClick={() => updateKostAvailability(kost.id, status)}
                          className={`text-[9px] font-bold rounded py-1 px-2.5 transition-colors cursor-pointer ${
                            kost.roomAvailability === status
                              ? status === 'available'
                                ? 'bg-emerald-500 text-white shadow-sm'
                                : status === 'limited'
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'bg-rose-500 text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          {status === 'available' ? 'Tersedia' : status === 'limited' ? 'Terbatas' : 'Penuh'}
                        </button>
                      ))}
                    </div>

                    {/* Quick Tools */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditForm(kost)}
                        className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-border/60 rounded-xl text-slate-650 dark:text-slate-350 transition-colors cursor-pointer"
                        title="Edit Kost"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenPromoteModal(kost)}
                        className={`p-2 border rounded-xl transition-colors cursor-pointer ${
                          kost.promotionExpiresAt && new Date(kost.promotionExpiresAt) > new Date()
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/30'
                            : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-border/60 text-slate-650 dark:text-slate-350'
                        }`}
                        title={
                          kost.promotionExpiresAt && new Date(kost.promotionExpiresAt) > new Date()
                            ? `Iklan Aktif sampai ${new Date(kost.promotionExpiresAt).toLocaleDateString('id-ID')}`
                            : 'Promosikan Kost ini'
                        }
                      >
                        <TrendingUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(kost)}
                        className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-border/60 rounded-xl text-slate-650 dark:text-slate-350 transition-colors cursor-pointer"
                        title="Duplikat Listing"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteConfirm(kost.id)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-xl text-rose-600 dark:text-rose-450 transition-colors cursor-pointer"
                        title="Arsipkan Kost (Soft Delete)"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Form View (Add / Edit) */}
      {(view === 'add' || view === 'edit') && (
        <div className="max-w-4xl bg-white dark:bg-slate-900 border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in slide-in-from-bottom-5 duration-200">
          
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <button
              onClick={() => {
                if (view === 'add' && currentUser?.id) {
                  localStorage.removeItem(`vk_kost_draft_${currentUser.id}`);
                }
                setView('list');
                setEditingKost(null);
              }}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </button>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Building2 className="h-5 w-5 text-primary" />
                {view === 'add' ? 'Pendaftaran Kost Baru' : 'Edit Detail Properti Kost'}
              </h2>
              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                {view === 'add' 
                  ? 'Klaim listing kost baru Anda untuk survei lapangan.' 
                  : `Memperbarui data properti: ${editingKost?.name}`}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-xs font-semibold">
            
            {/* Row 1: Nama, Harga, Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-slate-700 dark:text-slate-300">Nama Boarding House (Kost)*</label>
                <input
                  type="text"
                  placeholder="Contoh: Kost Lowokwaru Mandiri Putra"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white placeholder-slate-400"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-slate-700 dark:text-slate-300">Tarif Sewa Bulanan (IDR)*</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-slate-700 dark:text-slate-300">Kategori Gender*</label>
                  <CustomSelect
                    options={genderCategoryOptions}
                    value={genderCategory}
                    onChange={(val) => setGenderCategory(val as any)}
                    className="w-full text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Alamat & Distrik */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 border-t border-border/60">
              <div className="sm:col-span-2 space-y-2">
                <label className="text-slate-700 dark:text-slate-300">Alamat Lengkap Kosan*</label>
                <input
                  type="text"
                  placeholder="Nama jalan, nomor RT/RW, gang, kelurahan..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white placeholder-slate-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-slate-700 dark:text-slate-300">Kawasan Distrik*</label>
                <input
                  type="text"
                  placeholder="Contoh: Lowokwaru / Suhat"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white placeholder-slate-400"
                  required
                />
              </div>
            </div>

            {/* Row 3: Kampus Distances */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 border-t border-border/60">
              <div className="space-y-2">
                <label className="text-slate-705 dark:text-slate-300 flex items-center gap-1.5">
                  <Compass className="h-4 w-4 text-slate-400" />
                  <span>Jarak ke UB (km)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={distUB}
                  onChange={(e) => setDistUB(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-slate-705 dark:text-slate-300 flex items-center gap-1.5">
                  <Compass className="h-4 w-4 text-slate-400" />
                  <span>Jarak ke UM (km)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={distUM}
                  onChange={(e) => setDistUM(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-705 dark:text-slate-300 flex items-center gap-1.5">
                  <Compass className="h-4 w-4 text-slate-400" />
                  <span>Jarak ke UMM (km)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={distUMM}
                  onChange={(e) => setDistUMM(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Row 4: Coordinates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-border/60">
              <div className="space-y-2">
                <label className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span>Koordinat Latitude (Lintang)</span>
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="Contoh: -7.9495"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white placeholder-slate-400"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span>Koordinat Longitude (Bujur)</span>
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="Contoh: 112.6155"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white placeholder-slate-400"
                />
              </div>
            </div>

            {/* Security Info & Description */}
            <div className="space-y-4 pt-2 border-t border-border/60">
              <div className="space-y-2">
                <label className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-slate-400" />
                  <span>Spesifikasi Aturan & Keamanan*</span>
                </label>
                <textarea
                  rows={2}
                  value={securityInfo}
                  onChange={(e) => setSecurityInfo(e.target.value)}
                  placeholder="CCTV, penjagaan malam, aturan jam tamu..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-700 dark:text-slate-205 placeholder-slate-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-700 dark:text-slate-300">Deskripsi Panjang Hunian*</label>
                <textarea
                  rows={4}
                  placeholder="Jelaskan kenyamanan kos, ventilasi sirkulasi, ketersediaan kasur..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-700 dark:text-slate-205 placeholder-slate-400"
                  required
                />
              </div>
            </div>

            {/* Images Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border/60">
              <div className="md:col-span-2 space-y-4">
                <label className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-slate-400" />
                  <span>Galeri Foto Kost (Minimal 1 Foto)*</span>
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-border dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-6 text-center hover:border-primary/50 transition-colors relative">
                    <Upload className="h-8 w-8 text-slate-400 mb-2 animate-pulse" />
                    <p className="text-slate-700 dark:text-slate-300 text-xs font-bold">Pilih berkas gambar</p>
                    <p className="text-[9px] text-muted-foreground mt-1">PNG, JPG, JPEG (Maks. 2MB)</p>
                    
                    <label className="mt-4 px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-xl text-[10px] font-bold shadow-sm transition-colors cursor-pointer">
                      Pilih Gambar
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        onChange={handleImageUpload} 
                        className="hidden" 
                      />
                    </label>
                    
                    {isUploadingImage && (
                      <div className="absolute inset-0 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center rounded-2xl">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mb-2" />
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Mengupload...</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-border flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-500 dark:text-slate-450 block">Atau input link URL gambar:</span>
                      <input
                        type="url"
                        placeholder="https://example.com/gambar-kost.jpg"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-700 dark:text-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="mt-3 w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      Tambahkan Link
                    </button>
                  </div>
                </div>

                {uploadImageError && (
                  <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>{uploadImageError}</span>
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <label className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <span>Foto Terpilih ({images.length})</span>
                </label>
                
                <div className="border border-border dark:border-slate-800 rounded-2xl p-4 bg-slate-50/20 dark:bg-slate-900/10 h-44 overflow-y-auto scrollbar-thin">
                  {images.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-450 py-4">
                      <Building2 className="h-8 w-8 opacity-45 mb-2" />
                      <span className="text-xs">Belum ada foto.</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {images.map((url, idx) => (
                        <div key={idx} className="relative group aspect-video rounded-lg overflow-hidden border border-border bg-white dark:bg-slate-950">
                          <img src={url} alt={`Kost ${idx + 1}`} className="w-full h-full object-cover" />
                          {idx === 0 && (
                            <div className="absolute top-1 left-1 bg-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm uppercase">
                              Cover
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-md transition-colors"
                              title="Hapus"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Video & Availability */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border/60">
              <div className="space-y-2">
                <label className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Video className="h-4 w-4 text-slate-400" />
                  <span>Link Video Tur Kamar (URL)</span>
                </label>
                <input
                  type="url"
                  value={videoTour}
                  onChange={(e) => setVideoTour(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-700 dark:text-slate-300">Status Ketersediaan Awal*</label>
                <select
                  value={roomAvailability}
                  onChange={(e) => setRoomAvailability(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-slate-200 font-bold"
                >
                  <option value="available">Tersedia (Banyak kamar kosong)</option>
                  <option value="limited">Terbatas (Hanya sisa sedikit)</option>
                  <option value="full">Penuh (Kamar penuh)</option>
                </select>
              </div>
            </div>

            {/* Booking DP Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border/60">
              <div className="space-y-2">
                <label className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-slate-400" />
                  <span>Nominal DP Booking Online (IDR)</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 500000 (Isi 0 jika tidak memerlukan DP)"
                  value={bookingDpAmount}
                  onChange={(e) => setBookingDpAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
                />
                <span className="text-[10px] text-muted-foreground block font-medium">Nominal Down Payment yang harus dibayarkan penyewa untuk mengamankan booking kamar secara online.</span>
              </div>
            </div>

            {/* Facilities Checkboxes */}
            <div className="space-y-3 pt-4 border-t border-border/60">
              <span className="text-slate-700 dark:text-slate-300">Fasilitas Properti*</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {availableFacilitiesList.map((fac) => {
                  const isChecked = facilities.includes(fac);
                  return (
                    <label key={fac} className="flex items-center gap-2 cursor-pointer text-xs text-slate-650 dark:text-slate-400 select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleFacilityToggle(fac)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-2"
                      />
                      <span className={isChecked ? 'text-slate-900 dark:text-slate-100 font-black' : ''}>
                        {fac}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-6 border-t border-border/60 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (view === 'add' && currentUser?.id) {
                    localStorage.removeItem(`vk_kost_draft_${currentUser.id}`);
                  }
                  setView('list');
                  setEditingKost(null);
                }}
                className="rounded-xl border border-border py-3 px-6 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-xl bg-primary hover:bg-blue-600 text-white py-3 px-8 text-xs font-bold shadow-md shadow-primary/20 transition-transform active:scale-98 cursor-pointer"
              >
                {view === 'add' ? 'Daftarkan Kost & Ajukan Survei' : 'Simpan Perubahan'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-border shadow-2xl w-full max-w-md p-6 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="h-14 w-14 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="h-7 w-7" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">Arsipkan Properti Kost?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Apakah Anda yakin ingin mengarsipkan kost ini? Listing properti tidak akan terlihat oleh calon mahasiswa tetapi data kamar, penyewa, dan riwayat tagihan tetap tersimpan aman.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setKostToDelete(null);
                }}
                className="flex-1 py-3 border border-border rounded-xl text-xs font-bold text-slate-700 dark:text-slate-250 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-rose-500/20 transition-colors cursor-pointer"
              >
                Ya, Arsipkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promote Kost Modal */}
      {isPromoteModalOpen && promoteKost && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-border shadow-2xl w-full max-w-md overflow-hidden flex flex-col p-6 animate-in zoom-in-95 duration-200 gap-5 text-xs font-semibold">
            <div className="flex justify-between items-center pb-3 border-b border-border/60">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                Promosikan Properti Kost
              </h3>
              <button
                type="button"
                onClick={() => setIsPromoteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-1">
              <p className="text-slate-800 dark:text-slate-100 font-extrabold text-sm">{promoteKost.name}</p>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Promosi ini akan menempatkan kosan Anda di bagian teratas daftar pencarian secara organik tanpa badge iklan khusus.</p>
            </div>

            <form onSubmit={handleRequestPromote} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-350">Durasi Promosi (Hari)</label>
                <input
                  type="number"
                  min={1}
                  value={promoteDays}
                  onChange={(e) => {
                    const days = Math.max(1, Number(e.target.value));
                    setPromoteDays(days);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-850 dark:text-white font-extrabold"
                  required
                />
              </div>

              <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-4.5 rounded-2xl border border-border">
                <span className="text-slate-400 font-bold uppercase text-[9px] block">Rincian Pembayaran Iklan</span>
                <div className="flex justify-between items-center text-xs font-bold mt-1">
                  <span className="text-slate-650 dark:text-slate-350">Tarif Promosi</span>
                  <span className="text-slate-850 dark:text-white">Rp {(platformSettings.ownerPromotionRate || 5000).toLocaleString('id-ID')} / hari</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold mt-2 pt-2 border-t border-border/40">
                  <span className="text-slate-700 dark:text-slate-200">Total Pembayaran ({promoteDays} Hari)</span>
                  <span className="text-primary text-sm font-black">Rp {promoteAmount.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPromoteModalOpen(false)}
                  className="flex-1 py-3 border border-border rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary hover:brightness-110 text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 cursor-pointer"
                >
                  Bayar Promosi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Promosi Checkout Modal */}
      {isPromoteCheckoutOpen && promotePaymentId && (
        <CheckoutModal
          isOpen={isPromoteCheckoutOpen}
          onClose={() => setIsPromoteCheckoutOpen(false)}
          amount={promoteAmount}
          paymentId={promotePaymentId}
          title="Simulasi Pembayaran Promosi"
          subtitle={`Promosi ${promoteKost?.name} selama ${promoteDays} hari`}
          buttonText="Simulasikan Sukses Promosi"
          onSuccess={handlePromoteSuccess}
        />
      )}

    </div>
  );
}

function formatIDR(num: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(num);
}
