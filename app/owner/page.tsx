'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/app/context/AppContext';
import { Kost, Inquiry, CAMPUSES, User } from '@/app/types';
import { supabase } from '@/app/lib/supabase';
import AvailabilityIndicator from '@/components/AvailabilityIndicator';
import VerificationBadge from '@/components/VerificationBadge';
import ProtectedRoute from '@/components/ProtectedRoute';
import CustomSelect from '@/components/CustomSelect';
import { 
  Briefcase, 
  ShieldCheck, 
  Mail, 
  Phone, 
  PlusCircle, 
  Building2, 
  TrendingUp, 
  HelpCircle, 
  FileText, 
  Check, 
  X, 
  CheckCircle2, 
  ChevronRight, 
  SlidersHorizontal, 
  Image, 
  Edit,
  Video, 
  Compass, 
  MapPin, 
  Users,
  AlertTriangle,
  Clock,
  Eye,
  BedDouble,
  Wallet,
  Plus,
  MessageSquare,
  Sun,
  Moon,
  LogOut,
  Upload
} from 'lucide-react';
import Link from 'next/link';

export default function OwnerDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['OWNER']}>
      <OwnerDashboardContent />
    </ProtectedRoute>
  );
}

function OwnerDashboardContent() {
  const { 
    currentUser, 
    kosts, 
    inquiries, 
    updateKostAvailability, 
    updateInquiryStatus, 
    addKost,
    ownerVerifications,
    kostVerifications,
    logout,
    showToast,
    updateProfile
  } = useApp();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'add-listing'>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('vk_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('vk_theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('vk_theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const myVerification = useMemo(() => {
    if (!currentUser) return null;
    return ownerVerifications.find((ov) => ov.ownerId === currentUser.id);
  }, [ownerVerifications, currentUser]);

  const isApprovedOwner = myVerification?.status === 'approved';

  const ownerKosts = useMemo(() => {
    if (!currentUser) return [];
    return kosts.filter((k) => k.ownerId === currentUser.id);
  }, [kosts, currentUser]);

  const analytics = useMemo(() => {
    const totalListings = ownerKosts.length;
    const totalViews = ownerKosts.reduce((sum, k) => sum + k.views, 0);
    
    const occupiedCount = ownerKosts.filter((k) => k.roomAvailability !== 'available').length;
    const occupancyRate = totalListings > 0 ? Math.round((occupiedCount / totalListings) * 100) : 0;

    return { totalListings, totalViews, occupancyRate };
  }, [ownerKosts]);

  const estimatedRevenue = useMemo(() => {
    const totalRevenue = ownerKosts.reduce((sum, k) => {
      let multiplier = 0;
      if (k.roomAvailability === 'full') multiplier = 1.0;
      else if (k.roomAvailability === 'limited') multiplier = 0.75;
      else multiplier = 0.4;
      return sum + (k.price * multiplier * 10); 
    }, 0);
    
    if (totalRevenue >= 1000000) {
      return `Rp ${(totalRevenue / 1000000).toFixed(1)} Jt`;
    }
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalRevenue);
  }, [ownerKosts]);

  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newDistrict, setNewDistrict] = useState('Lowokwaru');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState(1200000);
  const [newGender, setNewGender] = useState<'male' | 'female' | 'mixed'>('female');
  const [newRoomAvailability, setNewRoomAvailability] = useState<'available' | 'limited' | 'full'>('available');
  
  const [distUB, setDistUB] = useState(1.0);
  const [distUM, setDistUM] = useState(1.5);
  const [distUMM, setDistUMM] = useState(3.0);
  const [newLatitude, setNewLatitude] = useState('');
  const [newLongitude, setNewLongitude] = useState('');
  const [newSecurity, setNewSecurity] = useState('Keamanan CCTV 24 Jam aktif, gerbang utama satu pintu, kunci mandiri untuk setiap penghuni.');
  
  const [newFacilities, setNewFacilities] = useState<string[]>(['WiFi', 'Kamar Mandi Dalam', 'Kasur Springbed', 'Meja Belajar']);
  const [newImages, setNewImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'
  ]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('https://www.w3schools.com/html/mov_bbb.mp4');

  const [formSuccess, setFormSuccess] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadImageError, setUploadImageError] = useState<string | null>(null);

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
      setUploadImageError(`File "${nonImageFile.name}" bukan gambar. Harap pilih file gambar.`);
      setIsUploadingImage(false);
      return;
    }

    for (const file of filesArray) {
      const useBase64Fallback = () => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64Url = event.target?.result as string;
            if (base64Url) {
              resolve(base64Url);
            } else {
              reject(new Error('Gagal membaca file gambar.'));
            }
          };
          reader.onerror = () => {
            reject(new Error('Gagal membaca file gambar.'));
          };
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
          
          setNewImages((prev) => [...prev, publicUrl]);
        } else {
          console.warn('Storage upload failed, using Base64 fallback:', uploadErr);
          const base64Url = await useBase64Fallback();
          setNewImages((prev) => [...prev, base64Url]);
        }
      } catch (err) {
        console.error('Upload exception, using Base64 fallback:', err);
        try {
          const base64Url = await useBase64Fallback();
          setNewImages((prev) => [...prev, base64Url]);
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
    setNewImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
    setUploadImageError(null);
  };

  const handleRemoveImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileKostName, setProfileKostName] = useState('');
  const [profileKostAddress, setProfileKostAddress] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);
  const [uploadProfileImageError, setUploadProfileImageError] = useState<string | null>(null);

  const defaultAvatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Anya&eyebrows=defaultNatural&mouth=smile',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi&eyebrows=default&mouth=smile',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie&eyebrows=defaultNatural&mouth=smile',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Dinda&eyebrows=default&mouth=smile',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Endang&eyebrows=default&mouth=smile',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&eyebrows=default&mouth=smile'
  ];

  const handleOpenEditProfile = () => {
    if (!currentUser) return;
    setProfileName(currentUser.fullName);
    setProfilePhone(currentUser.phone || '');
    setProfilePassword('');
    setProfileKostName(currentUser.kostName || '');
    setProfileKostAddress(currentUser.kostAddress || '');
    setProfileImage(currentUser.profileImage);
    setUploadProfileImageError(null);
    setIsEditProfileOpen(true);
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setUploadProfileImageError('Ukuran file terlalu besar. Maksimal 2MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setUploadProfileImageError('Tipe file tidak didukung. Harap pilih gambar.');
      return;
    }

    setIsUploadingProfileImage(true);
    setUploadProfileImageError(null);

    const useBase64Fallback = () => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        if (base64Url) {
          setProfileImage(base64Url);
        }
      };
      reader.onerror = () => {
        setUploadProfileImageError('Gagal membaca file gambar.');
      };
      reader.readAsDataURL(file);
    };

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `owner-${currentUser?.id}-${Date.now()}.${fileExt}`;
      
      const { data, error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (!uploadErr && data) {
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(data.path);
        
        setProfileImage(publicUrl);
      } else {
        console.warn('Storage upload failed, using Base64 fallback:', uploadErr);
        useBase64Fallback();
      }
    } catch (err) {
      console.error('Upload exception, using Base64 fallback:', err);
      useBase64Fallback();
    } finally {
      setIsUploadingProfileImage(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;

    try {
      const updates: Partial<User> = {
        fullName: profileName.trim(),
        name: profileName.trim(),
        phone: profilePhone.trim(),
        kostName: profileKostName.trim(),
        kostAddress: profileKostAddress.trim(),
        profileImage: profileImage
      };

      if (profilePassword.trim()) {
        if (profilePassword.trim().length < 6) {
          showToast('Kata sandi baru minimal 6 karakter.', 'error');
          return;
        }
        updates.passwordHash = profilePassword.trim();
      }

      await updateProfile(updates);
      showToast('Profil Anda berhasil diperbarui.', 'success');
      setIsEditProfileOpen(false);
    } catch (err: any) {
      showToast(`Gagal memperbarui profil: ${err.message || err}`, 'error');
    }
  };


  const availableFacilitiesList = [
    'AC', 'WiFi', 'Kamar Mandi Dalam', 'Water Heater', 'TV Smart', 
    'Kulkas Kecil', 'Kasur Springbed', 'Lemari Pakaian', 'Meja Belajar', 
    'Parkir Motor', 'Parkir Mobil', 'Dapur Bersama', 'CCTV', 'Security 24 Jam'
  ];

  const handleFacilityToggle = (fac: string) => {
    setNewFacilities((prev) =>
      prev.includes(fac) ? prev.filter((f) => f !== fac) : [...prev, fac]
    );
  };

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newAddress.trim()) return;

    addKost({
      name: newName,
      address: newAddress,
      district: newDistrict,
      description: newDescription,
      price: newPrice,
      facilities: newFacilities,
      images: newImages.length > 0 ? newImages : ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'],
      videoTour: newVideoUrl || undefined,
      verifiedStatus: 'none', 
      roomAvailability: newRoomAvailability,
      genderCategory: newGender,
      distanceToUB: distUB,
      distanceToUM: distUM,
      distanceToUMM: distUMM,
      latitude: newLatitude ? Number(newLatitude) : undefined,
      longitude: newLongitude ? Number(newLongitude) : undefined,
      securityInfo: newSecurity
    });

    setNewName('');
    setNewAddress('');
    setNewDescription('');
    setNewPrice(1200000);
    setNewLatitude('');
    setNewLongitude('');
    setNewImages([
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'
    ]);
    setImageUrlInput('');
    setNewVideoUrl('https://www.w3schools.com/html/mov_bbb.mp4');
    setNewFacilities(['WiFi', 'Kamar Mandi Dalam', 'Kasur Springbed', 'Meja Belajar']);
    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setActiveTab('dashboard');
    }, 2000);
  };

  if (!currentUser) return null;

  const genderCategoryOptions = [
    { value: 'male', label: 'Putra' },
    { value: 'female', label: 'Putri' },
    { value: 'mixed', label: 'Campur' }
  ];

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-200 flex flex-col">
      
      
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-md transition-colors duration-200">
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          
          
          <div className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="VeriKost Logo" 
              className="h-9 w-9 object-contain" 
            />
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              VeriKost<span className="brand-gradient-text">Malang</span>
              <span className="ml-2.5 text-[9px] font-black bg-primary/10 border border-primary/20 text-primary py-0.5 px-2 rounded-full uppercase tracking-wider">
                Mitra Owner
              </span>
            </span>
          </div>

          
          <div className="flex items-center gap-4">
            
            
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
            </button>

            
            <div className="pl-2 border-l border-border flex items-center gap-3">
              <img
                src={currentUser.profileImage}
                alt={currentUser.fullName}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/20"
              />
              <div className="hidden sm:block text-left text-xs shrink-0 font-medium">
                <div className="flex items-center gap-1.5">
                  <p className="font-extrabold text-slate-800 dark:text-white leading-tight">
                    {currentUser.fullName}
                  </p>
                  <button
                    onClick={handleOpenEditProfile}
                    className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    title="Edit Profil Saya"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-[9px] text-muted-foreground font-bold mt-0.5 uppercase tracking-wider">
                  Pemilik Properti
                </p>
              </div>
              
              
              <button
                onClick={logout}
                className="ml-2 py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all hover:scale-102 flex items-center justify-center gap-1 cursor-pointer"
                title="Log Out dari Akun"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Keluar</span>
              </button>
            </div>

          </div>

        </div>
      </header>

      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-8 flex-grow">
        
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/50 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Selamat datang kembali, {currentUser.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-semibold">
              Berikut adalah metrik performa properti kost Anda di Malang hari ini.
            </p>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            {isApprovedOwner ? (
              <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full border border-emerald-200/50 dark:border-emerald-900/30 text-xs font-bold shadow-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Akun Terverifikasi</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-full border border-amber-200/50 dark:border-amber-900/30 text-xs font-bold animate-pulse">
                <Clock className="h-4 w-4 text-amber-500" />
                <span>Menunggu Verifikasi</span>
              </div>
            )}
          </div>
        </div>

        
        {!isApprovedOwner ? (
          <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl p-8 sm:p-10 shadow-sm text-center max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
            
            <div className="h-16 w-16 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow">
              <Clock className="h-8 w-8 animate-spin-slow" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Pengajuan Verifikasi Akun Owner</h2>
              
              {myVerification?.status === 'rejected' ? (
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 rounded-xl p-3 text-xs text-rose-600 dark:text-rose-400 font-semibold mt-2">
                  <span>Maaf, pengajuan dokumen legalitas dan bukti kepemilikan Anda ditolak oleh admin. Periksa kembali keabsahan sertifikat dan kelayakan properti Anda.</span>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
                  Halo <strong>{currentUser.fullName}</strong>. Akun pemilik kost Anda saat ini sedang dalam evaluasi kelayakan administrasi oleh Admin VeriKost Malang. Surveyor kami akan menjadwalkan survei ke lokasi kost fisik Anda dalam waktu 2x24 jam.
                </p>
              )}

            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-border/80 text-left space-y-3.5 text-xs">
              <span className="font-extrabold uppercase text-[10px] text-primary tracking-wider block">Alur Peninjauan Surveyor:</span>
              <ul className="space-y-3 text-slate-600 dark:text-slate-300 font-medium">
                <li className="flex gap-2.5 items-start">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Registrasi Awal & Klaim Properti ({currentUser.kostName || 'Kost Baru'}) — <strong>SELESAI</strong></span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <div className="h-4.5 w-4.5 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0 mt-0.5"></div>
                  <span>Pemeriksaan Sertifikat Hak Milik (SHM) & Izin Operasional oleh Admin — <strong>DALAM ANTRIAN</strong></span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <Clock className="h-4.5 w-4.5 text-slate-300 shrink-0 mt-0.5" />
                  <span>Kunjungan lapangan surveyor fisik, pengukuran luas kamar, dan perekaman video tur resmi.</span>
                </li>
              </ul>
            </div>

            <p className="text-[10px] text-muted-foreground">
              Terima kasih atas kesabaran Anda. Kami mengutamakan kepercayaan calon mahasiswa dan orang tua di Malang.
            </p>

          </div>
        ) : (
          
          <div className="space-y-8 animate-in fade-in duration-300">
            
            
            <div className="flex justify-between items-center border-b border-border/60">
              <div className="flex gap-4 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`py-3 px-1 text-sm font-semibold border-b-2 transition-all shrink-0 cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'border-primary text-primary font-bold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Dashboard Overview
                </button>
                <Link
                  href="/chat"
                  className="py-3 px-1 text-sm font-semibold border-b-2 border-transparent text-muted-foreground hover:text-foreground flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4 text-slate-400" />
                  <span>Direct Chat Hub</span>
                </Link>
              </div>

              <button
                onClick={() => setActiveTab('add-listing')}
                className="hidden sm:inline-flex items-center gap-1.5 bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow shadow-primary/10 transition-all hover:scale-102 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Kost Baru</span>
              </button>
            </div>

            
            <div className="space-y-8">
              
              
              {activeTab === 'dashboard' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    
                    <div className="bg-white dark:bg-slate-900 border border-border p-5 rounded-3xl shadow-sm flex flex-col justify-between h-36 hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="flex justify-between items-start">
                        <div className="p-2.5 bg-blue-50 dark:bg-slate-800 rounded-xl text-primary shrink-0"><Eye className="h-5.5 w-5.5" /></div>
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">+12%</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">{analytics.totalViews.toLocaleString('id-ID')}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">Profile Views</p>
                      </div>
                    </div>

                    <Link href="/chat" className="bg-white dark:bg-slate-900 border border-border p-5 rounded-3xl shadow-sm flex flex-col justify-between h-36 hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div className="p-2.5 bg-indigo-50 dark:bg-slate-800 rounded-xl text-indigo-500 shrink-0"><MessageSquare className="h-5.5 w-5.5" /></div>
                        <span className="text-[10px] font-black text-primary bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/30 flex items-center gap-1">Live <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span></span>
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-800 dark:text-white leading-tight flex items-center gap-1">
                          Direct Chat Hub <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-0.5 transition-transform" />
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">Tanya Jawab Realtime</p>
                      </div>
                    </Link>

                    <div className="bg-white dark:bg-slate-900 border border-border p-5 rounded-3xl shadow-sm flex flex-col justify-between h-36 hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="flex justify-between items-start">
                        <div className="p-2.5 bg-emerald-50 dark:bg-slate-800 rounded-xl text-emerald-500 shrink-0"><BedDouble className="h-5.5 w-5.5" /></div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">{analytics.occupancyRate}%</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">Occupancy Rate</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-primary to-blue-700 p-5 rounded-3xl shadow-lg flex flex-col justify-between h-36 text-white relative overflow-hidden group">
                      <div className="flex justify-between items-start">
                        <div className="p-2.5 bg-white/10 rounded-xl text-white shrink-0"><Wallet className="h-5.5 w-5.5" /></div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-black leading-none">{estimatedRevenue}</h3>
                        <p className="text-[10px] opacity-80 font-bold uppercase tracking-wider mt-1.5">Estimated Revenue</p>
                      </div>
                      <TrendingUp className="h-24 w-24 absolute -bottom-4 -right-4 opacity-10 pointer-events-none" />
                    </div>

                  </div>

                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    
                    <div className="lg:col-span-2 space-y-8">
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h2 className="text-base font-extrabold text-slate-800 dark:text-white tracking-tight">Manage Listings</h2>
                        </div>

                        <div className="space-y-4">
                          {ownerKosts.slice(0, 3).map((kost) => {
                            const totalRooms = 15; 
                            const occupiedCount = kost.roomAvailability === 'full' ? totalRooms : kost.roomAvailability === 'limited' ? Math.round(totalRooms * 0.8) : Math.round(totalRooms * 0.4);
                            const availableCount = totalRooms - occupiedCount;
                            
                            return (
                              <div key={kost.id} className="bg-white dark:bg-slate-900 border border-border p-4 rounded-3xl flex flex-col sm:flex-row gap-5 shadow-sm hover:border-primary/30 transition-all group">
                                <div className="w-full sm:w-48 h-32 rounded-2xl overflow-hidden relative shrink-0">
                                  <img src={kost.images[0]} alt={kost.name} className="w-full h-full object-cover transition-transform group-hover:scale-102 duration-300" />
                                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-primary/95 text-white rounded-md text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                    <ShieldCheck className="h-3 w-3" /> VERIFIED
                                  </div>
                                </div>
                                
                                <div className="flex-grow flex flex-col justify-between py-1">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className={`inline-block rounded-md px-2 py-0.5 text-[8px] font-black uppercase border tracking-wider bg-blue-50 text-blue-700 border-blue-100 dark:bg-slate-800 dark:text-blue-400 dark:border-blue-900/30`}>
                                        {kost.genderCategory === 'male' ? 'Khusus Putra' : kost.genderCategory === 'female' ? 'Khusus Putri' : 'Campur'}
                                      </span>
                                      <VerificationBadge status={kost.verifiedStatus} />
                                    </div>
                                    <h3 className="text-base font-extrabold text-slate-800 dark:text-white mt-1.5 leading-tight group-hover:text-primary transition-colors">
                                      <Link href={`/kost/${kost.id}`}>{kost.name}</Link>
                                    </h3>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                      <span>{kost.address}</span>
                                    </p>
                                  </div>
                                  
                                  <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-border/40">
                                    <div className="flex flex-col">
                                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">Rooms Available</span>
                                      <div className="flex items-center gap-1.5 mt-1">
                                        <span className={`font-black text-base leading-none ${availableCount === 0 ? 'text-rose-500' : 'text-slate-800 dark:text-white'}`}>{availableCount}</span>
                                        <span className="text-[10px] text-muted-foreground">/ {totalRooms} total</span>
                                        {availableCount === 0 && (
                                          <span className="text-[8px] font-bold bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded border border-rose-100 dark:border-rose-900/30">Full</span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="h-8 w-px bg-border/85"></div>
                                    
                                    <div className="flex flex-wrap items-center gap-2">
                                      <Link href={`/kost/${kost.id}`} className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-200 transition-colors">
                                        Detail Properti
                                      </Link>
                                      
                                      
                                      <div className="flex rounded-lg border border-border bg-slate-50 dark:bg-slate-800 p-0.5">
                                        <button
                                          onClick={() => updateKostAvailability(kost.id, 'available')}
                                          className={`text-[9px] font-bold rounded py-1.5 px-2.5 transition-colors cursor-pointer ${
                                            kost.roomAvailability === 'available'
                                              ? 'bg-emerald-500 text-white shadow-sm'
                                              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                          }`}
                                        >
                                          Tersedia
                                        </button>
                                        <button
                                          onClick={() => updateKostAvailability(kost.id, 'limited')}
                                          className={`text-[9px] font-bold rounded py-1.5 px-2.5 transition-colors cursor-pointer ${
                                            kost.roomAvailability === 'limited'
                                              ? 'bg-amber-500 text-white shadow-sm'
                                              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                          }`}
                                        >
                                          Terbatas
                                        </button>
                                        <button
                                          onClick={() => updateKostAvailability(kost.id, 'full')}
                                          className={`text-[9px] font-bold rounded py-1.5 px-2.5 transition-colors cursor-pointer ${
                                            kost.roomAvailability === 'full'
                                              ? 'bg-rose-500 text-white shadow-sm'
                                              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                          }`}
                                        >
                                          Penuh
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          
                          {ownerKosts.length === 0 && (
                            <div className="p-8 text-center bg-white dark:bg-slate-900 border border-border rounded-3xl text-sm text-slate-400 font-semibold">
                              Anda belum mendaftarkan properti kos.
                            </div>
                          )}
                        </div>
                      </div>

                      
                      <div className="bg-white dark:bg-slate-900 border border-border p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
                        <div className="flex justify-between items-center pb-3 border-b border-border/40">
                          <div>
                            <h4 className="font-extrabold text-slate-800 dark:text-white text-base">Views vs Inquiries</h4>
                            <p className="text-[10px] text-muted-foreground font-semibold">Performa Properti 30 Hari Terakhir</p>
                          </div>
                          <div className="flex gap-4">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 bg-primary rounded-full"></span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase">Views</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase">Leads</span>
                            </div>
                          </div>
                        </div>

                        
                        <div className="h-48 w-full relative flex items-end justify-between px-2 pb-2 border-b border-l border-border/80 bg-[linear-gradient(to_bottom,rgba(14,165,233,0.01)_0%,transparent_100%)]">
                          <div className="absolute -left-2.5 h-full flex flex-col justify-between text-[8px] text-muted-foreground/60 py-2 select-none pointer-events-none">
                            <span>150</span><span>100</span><span>50</span><span>0</span>
                          </div>
                          
                          <div className="w-6 sm:w-8 bg-primary/20 hover:bg-primary/30 h-[40%] rounded-t-lg transition-all cursor-pointer relative group" title="Hari 1-5">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">60 v</div>
                          </div>
                          <div className="w-6 sm:w-8 bg-primary/25 hover:bg-primary/35 h-[60%] rounded-t-lg transition-all cursor-pointer relative group" title="Hari 6-10">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">90 v</div>
                          </div>
                          <div className="w-6 sm:w-8 bg-primary/30 hover:bg-primary/40 h-[50%] rounded-t-lg transition-all cursor-pointer relative group" title="Hari 11-15">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">75 v</div>
                          </div>
                          <div className="w-6 sm:w-8 bg-primary/35 hover:bg-primary/45 h-[70%] rounded-t-lg transition-all cursor-pointer relative group" title="Hari 16-20">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">105 v</div>
                          </div>
                          <div className="w-6 sm:w-8 bg-primary/40 hover:bg-primary/50 h-[80%] rounded-t-lg transition-all cursor-pointer relative group" title="Hari 21-25">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">120 v</div>
                          </div>
                          <div className="w-6 sm:w-8 bg-primary hover:bg-primary/95 h-[95%] rounded-t-lg transition-all cursor-pointer shadow shadow-primary/25 relative group" title="Hari 26-30">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">142 v</div>
                          </div>
                        </div>
                      </div>

                    </div>

                    
                    <div className="space-y-8">
                      
                      <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-3xl shadow-sm space-y-6 relative overflow-hidden">
                        <div className="flex items-center justify-between z-10 relative">
                          <h2 className="text-base font-extrabold text-slate-800 dark:text-white tracking-tight">Direct Chat Hub</h2>
                          <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                            Active <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed z-10 relative font-semibold">
                          Kini Anda dapat langsung berkomunikasi dengan calon penyewa secara real-time dan terenkripsi menggunakan fitur **Direct Chat** terintegrasi.
                        </p>

                        <div className="bg-slate-50 dark:bg-slate-800/40 border border-border p-4 rounded-2xl space-y-3 z-10 relative">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-slate-800 rounded-xl text-primary shrink-0"><ShieldCheck className="h-4 w-4" /></div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-800 dark:text-white">Interaksi Lebih Cepat & Aman</h4>
                              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">Tanpa perlu aplikasi pihak ketiga. Identitas calon penyewa terverifikasi secara otomatis oleh sistem.</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-indigo-50 dark:bg-slate-800 rounded-xl text-indigo-500 shrink-0"><MessageSquare className="h-4 w-4" /></div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-800 dark:text-white">Riwayat Percakapan Utuh</h4>
                              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">Riwayat seputar pertanyaan fasilitas, survey lokasi, dan nego harga tersimpan rapi secara persisten.</p>
                            </div>
                          </div>
                        </div>

                        <Link 
                          href="/chat" 
                          className="w-full py-3 bg-gradient-to-tr from-primary to-blue-600 hover:brightness-110 text-white rounded-2xl text-xs font-extrabold shadow shadow-primary/20 transition-all hover:scale-102 flex items-center justify-center gap-1.5 cursor-pointer z-10 relative"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>Buka Direct Chat Hub</span>
                        </Link>
                      </div>

                      
                      <div className="bg-gradient-to-br from-primary to-blue-700 p-6 rounded-3xl text-white relative overflow-hidden shadow-lg group">
                        <div className="relative z-10 space-y-4">
                          <div>
                            <span className="text-[9px] font-black bg-white/10 px-2 py-0.5 rounded-full border border-white/20 uppercase tracking-wider">Tips Sukses Mitra</span>
                            <h3 className="text-lg font-black leading-snug mt-2">Promosikan Kost Anda</h3>
                          </div>
                          <p className="text-xs opacity-90 leading-relaxed">
                            Kost dengan pembaruan status kamar dan kelengkapan foto sirkulasi udara mendapatkan **40% lebih banyak pertanyaan** dari mahasiswa UB, UM, & UMM.
                          </p>
                          <button onClick={() => showToast('Fitur panduan premium sedang disiapkan oleh surveyor VeriKost!', 'info')} className="bg-white hover:bg-slate-100 text-primary px-4 py-2.5 rounded-xl font-extrabold text-xs shadow-sm transition-transform active:scale-98">
                            Pelajari Selengkapnya
                          </button>
                        </div>
                        <TrendingUp className="h-28 w-28 absolute -bottom-4 -right-4 opacity-10 pointer-events-none group-hover:scale-105 transition-transform duration-300" />
                      </div>

                    </div>

                  </div>

                </div>
              )}



              
              {activeTab === 'add-listing' && (
                <div className="max-w-4xl bg-white dark:bg-slate-900 border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
                  
                  <div className="border-b border-border pb-4">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Building2 className="h-5.5 w-5.5 text-primary" />
                      Formulir Pendaftaran Kost Baru
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Lengkapi data berikut untuk mengirim klaim hunian baru. Kosan baru Anda akan didaftarkan sebagai <strong>None Verified</strong> dan otomatis masuk antrean tinjauan fisik oleh surveyor admin kami untuk mendapatkan lencana terverifikasi.
                    </p>
                  </div>

                  {formSuccess ? (
                    <div className="p-8 text-center bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-3xl border border-emerald-200/60 font-bold space-y-2 animate-pulse">
                      <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                      <p className="text-base">Klaim Hunian Kos Berhasil Didaftarkan!</p>
                      <p className="text-xs font-medium text-slate-400">Menyinkronkan data verifikasi lapangan...</p>
                    </div>
                  ) : (
                    <form onSubmit={handleCreateListing} className="space-y-6 text-sm">
                      
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nama Boarding House (Kost)*</label>
                          <input
                            type="text"
                            placeholder="Contoh: Kost Lowokwaru Mandiri Putra"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white placeholder-slate-400"
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tarif Sewa Bulanan (IDR)*</label>
                            <input
                              type="number"
                              value={newPrice}
                              onChange={(e) => setNewPrice(Number(e.target.value))}
                              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Kategori Gender*</label>
                            <CustomSelect
                              options={genderCategoryOptions}
                              value={newGender}
                              onChange={(val) => setNewGender(val as any)}
                              icon={<Users className="h-4 w-4" />}
                              className="w-full text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="sm:col-span-2 space-y-2">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Alamat Lengkap Kosan*</label>
                          <input
                            type="text"
                            placeholder="Nama jalan, nomor RT/RW, gang, kelurahan..."
                            value={newAddress}
                            onChange={(e) => setNewAddress(e.target.value)}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white placeholder-slate-400"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Kawasan Distrik*</label>
                          <input
                            type="text"
                            placeholder="Contoh: Lowokwaru / Suhat"
                            value={newDistrict}
                            onChange={(e) => setNewDistrict(e.target.value)}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white placeholder-slate-400"
                            required
                          />
                        </div>
                      </div>

                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 border-t border-border/80">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <Compass className="h-4 w-4 text-slate-400" />
                            <span>Jarak ke UB (km)</span>
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={distUB}
                            onChange={(e) => setDistUB(Number(e.target.value))}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <Compass className="h-4 w-4 text-slate-400" />
                            <span>Jarak ke UM (km)</span>
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={distUM}
                            onChange={(e) => setDistUM(Number(e.target.value))}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <Compass className="h-4 w-4 text-slate-400" />
                            <span>Jarak ke UMM (km)</span>
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={distUMM}
                            onChange={(e) => setDistUMM(Number(e.target.value))}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
                          />
                        </div>
                      </div>

                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-border/80">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            <span>Koordinat Latitude (Garis Lintang)</span>
                          </label>
                          <input
                            type="number"
                            step="any"
                            placeholder="Contoh: -7.9495"
                            value={newLatitude}
                            onChange={(e) => setNewLatitude(e.target.value)}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white placeholder-slate-400"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            <span>Koordinat Longitude (Garis Bujur)</span>
                          </label>
                          <input
                            type="number"
                            step="any"
                            placeholder="Contoh: 112.6155"
                            value={newLongitude}
                            onChange={(e) => setNewLongitude(e.target.value)}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white placeholder-slate-400"
                          />
                        </div>
                      </div>

                      
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <ShieldCheck className="h-4 w-4 text-slate-400" />
                          <span>Spesifikasi Aturan & Keamanan*</span>
                        </label>
                        <textarea
                          rows={2}
                          value={newSecurity}
                          onChange={(e) => setNewSecurity(e.target.value)}
                          placeholder="CCTV, penjagaan malam, aturan jam tamu..."
                          className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-700 dark:text-slate-200 placeholder-slate-400"
                          required
                        />
                      </div>

                      
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Deskripsi Panjang Hunian*</label>
                        <textarea
                          rows={4}
                          placeholder="Jelaskan kenyamanan kos, ventilasi sirkulasi, ketersediaan kasur..."
                          value={newDescription}
                          onChange={(e) => setNewDescription(e.target.value)}
                          className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-700 dark:text-slate-200 placeholder-slate-400"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-border/80">
                        
                        <div className="md:col-span-2 space-y-4">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <Image className="h-4 w-4 text-slate-400" />
                            <span>Galeri Foto Kost (Minimal 1 Foto)*</span>
                          </label>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-border dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-6 text-center hover:border-primary/50 transition-colors relative">
                              <Upload className="h-8 w-8 text-slate-400 mb-2 animate-pulse" />
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Pilih berkas gambar dari perangkat</p>
                              <p className="text-[9px] text-muted-foreground mt-1">PNG, JPG, JPEG, WebP (Maksimal 2MB per gambar)</p>
                              
                              <label className="mt-4 px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-primary/10 transition-colors cursor-pointer text-center">
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
                                <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center rounded-2xl">
                                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mb-2" />
                                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Mengupload berkas...</span>
                                </div>
                              )}
                            </div>

                            
                            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-border flex flex-col justify-between">
                              <div className="space-y-2">
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">Atau tambahkan dari link URL gambar:</span>
                                <input
                                  type="url"
                                  placeholder="https://example.com/gambar-kost.jpg"
                                  value={imageUrlInput}
                                  onChange={(e) => setImageUrlInput(e.target.value)}
                                  className="w-full text-[10px] bg-white dark:bg-slate-900 border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-700 dark:text-white"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={handleAddImageUrl}
                                className="mt-3 w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                              >
                                Tambahkan Link Gambar
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
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <Image className="h-4 w-4 text-slate-400" />
                            <span>Foto Terpilih ({newImages.length})</span>
                          </label>
                          
                          <div className="border border-border dark:border-slate-800 rounded-2xl p-4 bg-slate-50/20 dark:bg-slate-900/10 h-44 overflow-y-auto scrollbar-thin">
                            {newImages.length === 0 ? (
                              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 py-4">
                                <Image className="h-8 w-8 opacity-45 mb-2" />
                                <span className="text-xs font-semibold">Belum ada foto.</span>
                                <span className="text-[10px] opacity-80 mt-0.5">Harap upload minimal 1 foto.</span>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-2">
                                {newImages.map((url, idx) => (
                                  <div key={idx} className="relative group aspect-video rounded-lg overflow-hidden border border-border bg-white dark:bg-slate-950">
                                    <img src={url} alt={`Kost ${idx + 1}`} className="w-full h-full object-cover" />
                                    
                                    
                                    {idx === 0 && (
                                      <div className="absolute top-1 left-1 bg-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider">
                                        Cover
                                      </div>
                                    )}
                                    
                                    
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveImage(idx)}
                                        className="p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-md transition-colors"
                                        title="Hapus Gambar"
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

                      <div className="space-y-2 pt-2 border-t border-border/80">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <Video className="h-4 w-4 text-slate-400" />
                          <span>Link Video Tur Kamar (URL)</span>
                        </label>
                        <input
                          type="url"
                          value={newVideoUrl}
                          onChange={(e) => setNewVideoUrl(e.target.value)}
                          className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
                        />
                      </div>

                      <div className="space-y-3 pt-2 border-t border-border/80">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Fasilitas Tersedia*</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                          {availableFacilitiesList.map((fac) => {
                            const isChecked = newFacilities.includes(fac);
                            return (
                              <label key={fac} className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400 select-none">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleFacilityToggle(fac)}
                                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-2"
                                />
                                <span className={isChecked ? 'text-slate-900 dark:text-slate-100 font-bold' : ''}>
                                  {fac}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-border flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setActiveTab('dashboard')}
                          className="rounded-xl border border-border py-3 px-6 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="rounded-xl bg-primary hover:bg-blue-600 text-white py-3 px-8 text-xs font-bold shadow-md shadow-primary/20 transition-transform active:scale-98 cursor-pointer"
                        >
                          Daftarkan Kost & Ajukan Survei Lapangan
                        </button>
                      </div>

                    </form>
                  )}

                </div>
              )}

            </div>

          </div>
        )}

      </div>
      
      
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-border shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200 scrollbar-none">
            
            <div className="flex justify-between items-center pb-4 border-b border-border/80">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">Edit Profil Saya</h3>
                <p className="text-xs text-muted-foreground mt-1">Perbarui foto profil, info kontak, dan properti utama Anda.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6 text-xs font-semibold">
              
              
              <div className="space-y-3">
                <span className="text-slate-700 dark:text-slate-300 font-bold block">Foto Profil Anda</span>
                <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-border">
                  <div className="h-16 w-16 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-border relative flex items-center justify-center">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-muted-foreground font-semibold">No Image</span>
                    )}
                    {isUploadingProfileImage && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 bg-primary hover:bg-blue-600 text-white rounded-lg text-[10px] font-bold shadow-sm transition-colors cursor-pointer text-center">
                        Pilih dari Perangkat
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleProfileImageUpload} 
                          className="hidden" 
                        />
                      </label>
                      <span className="text-[9px] text-muted-foreground">Maksimal 2MB (PNG, JPG)</span>
                    </div>
                    {uploadProfileImageError && (
                      <p className="text-[9px] font-bold text-rose-500 mt-1">{uploadProfileImageError}</p>
                    )}
                  </div>
                </div>

                
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Atau Pilih Karakter Ilustrasi:</span>
                  <div className="grid grid-cols-6 gap-2">
                    {defaultAvatars.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setProfileImage(url)}
                        className={`aspect-square rounded-xl overflow-hidden border-2 bg-slate-50 dark:bg-slate-950 p-1 hover:scale-105 transition-all cursor-pointer ${
                          profileImage === url ? 'border-primary' : 'border-border/60 hover:border-slate-400'
                        }`}
                      >
                        <img src={url} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1.5">
                  <label className="text-slate-700 dark:text-slate-300">Nama Lengkap*</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl border border-border p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400">Alamat Email (Permanen)</label>
                  <input
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="w-full bg-slate-100 dark:bg-slate-800/40 rounded-xl border border-border/60 p-3 text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 dark:text-slate-300">Nomor Telepon/WA*</label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl border border-border p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 dark:text-slate-300">Ubah Kata Sandi (Kosongkan jika tidak ingin diubah)</label>
                  <input
                    type="password"
                    placeholder="Masukkan kata sandi baru (min. 6 karakter)..."
                    value={profilePassword}
                    onChange={(e) => setProfilePassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl border border-border p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-805 dark:text-white placeholder-slate-400"
                  />
                </div>

                
                <div className="space-y-1.5">
                  <label className="text-slate-700 dark:text-slate-300">Nama Kost Utama</label>
                  <input
                    type="text"
                    placeholder="Contoh: Kost Lowokwaru Mandiri"
                    value={profileKostName}
                    onChange={(e) => setProfileKostName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl border border-border p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 dark:text-slate-300">Alamat Kost</label>
                  <input
                    type="text"
                    placeholder="Contoh: Jl. Soekarno Hatta No 5"
                    value={profileKostAddress}
                    onChange={(e) => setProfileKostAddress(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl border border-border p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
                  />
                </div>

              </div>

              
              <div className="flex justify-end gap-3 pt-4 border-t border-border/80">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="py-3 px-5 rounded-xl border border-border text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-3 px-6 rounded-xl bg-primary hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-primary/20 transition-transform active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="h-4.5 w-4.5" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
