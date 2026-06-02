'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/app/context/AppContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import CustomSelect from '@/components/CustomSelect';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  MessageSquare, 
  TrendingUp, 
  Check, 
  X, 
  Trash2, 
  Award, 
  SlidersHorizontal,
  Mail,
  Phone,
  Key,
  ChevronRight,
  TrendingDown,
  LayoutDashboard,
  LogOut,
  Edit,
  Search,
  Upload,
  Calendar,
  Sun,
  Moon
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User } from '@/app/types';
import { supabase } from '@/app/lib/supabase';

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}

interface CustomDatePickerProps {
  value: string;
  onChange: (val: string) => void;
  label: string;
  iconColor: string;
}

function CustomDatePicker({ value, onChange, label, iconColor }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dateRef = React.useRef<HTMLDivElement>(null);
  
  const selectedDate = useMemo(() => {
    const d = new Date(value + 'T00:00:00');
    return isNaN(d.getTime()) ? new Date() : d;
  }, [value]);

  const [currentYear, setCurrentYear] = useState(() => selectedDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => selectedDate.getMonth());

  useEffect(() => {
    if (!isOpen) {
      setCurrentYear(selectedDate.getFullYear());
      setCurrentMonth(selectedDate.getMonth());
    }
  }, [selectedDate, isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const daysInMonth = useMemo(() => {
    const date = new Date(currentYear, currentMonth, 1);
    const days = [];
    
    const firstDayIndex = date.getDay();
    const prevMonthLastDate = new Date(currentYear, currentMonth, 0).getDate();
    const currentMonthLastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDate - i,
        month: currentMonth === 0 ? 11 : currentMonth - 1,
        year: currentMonth === 0 ? currentYear - 1 : currentYear,
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= currentMonthLastDate; i++) {
      days.push({
        day: i,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true,
      });
    }

    const totalSlots = 42;
    const nextMonthDaysToAdd = totalSlots - days.length;
    for (let i = 1; i <= nextMonthDaysToAdd; i++) {
      days.push({
        day: i,
        month: currentMonth === 11 ? 0 : currentMonth + 1,
        year: currentMonth === 11 ? currentYear + 1 : currentYear,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleSelectDay = (dayObj: { day: number; month: number; year: number }) => {
    const formattedMonth = String(dayObj.month + 1).padStart(2, '0');
    const formattedDay = String(dayObj.day).padStart(2, '0');
    const dateStr = `${dayObj.year}-${formattedMonth}-${formattedDay}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const isToday = (day: number, month: number, year: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  const isSelected = (day: number, month: number, year: number) => {
    return selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
  };

  const formattedDisplay = useMemo(() => {
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const month = monthNames[selectedDate.getMonth()];
    const year = selectedDate.getFullYear();
    return `${day} ${month} ${year}`;
  }, [selectedDate]);

  return (
    <div className="relative" ref={dateRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100/50 dark:hover:bg-slate-800/60 px-3.5 py-2.5 rounded-2xl border border-border/80 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm cursor-pointer min-w-[170px] text-left"
      >
        <Calendar className={`h-4 w-4 shrink-0 ${iconColor}`} />
        <div className="flex flex-col">
          <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">{label}</span>
          <span className="text-[11px] font-black text-slate-700 dark:text-slate-200 leading-none">{formattedDisplay}</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-72 bg-white dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-3xl shadow-2xl p-4 z-[999] animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex justify-between items-center mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 px-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer font-bold"
            >
              &larr;
            </button>
            <span className="text-xs font-black text-slate-800 dark:text-white">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 px-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer font-bold"
            >
              &rarr;
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d, idx) => (
              <span key={idx} className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {daysInMonth.map((dayObj, idx) => {
              const selected = isSelected(dayObj.day, dayObj.month, dayObj.year);
              const today = isToday(dayObj.day, dayObj.month, dayObj.year);
              
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDay(dayObj)}
                  className={`text-[10px] font-bold py-1.5 rounded-xl transition-all cursor-pointer ${
                    !dayObj.isCurrentMonth
                      ? 'text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      : selected
                      ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                      : today
                      ? 'bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20 dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {dayObj.day}
                </button>
              );
            })}
          </div>

          <div className="border-t border-border/60 mt-3 pt-2 flex justify-between items-center">
            <button
              type="button"
              onClick={() => {
                const todayStr = new Date().toISOString().split('T')[0];
                onChange(todayStr);
                setIsOpen(false);
              }}
              className="text-[9px] font-extrabold uppercase text-primary hover:underline cursor-pointer"
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[9px] font-extrabold uppercase text-slate-400 hover:underline cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminDashboardContent() {
  const router = useRouter();
  const { 
    users, 
    kosts, 
    reviews, 
    ownerVerifications, 
    kostVerifications,
    approveOwner,
    approveKost,
    moderateReview,
    updateUserRole,
    deleteUser,
    resetUserPassword,
    deleteKost,
    logout,
    adminUpdateProfile,
    currentUser,
    showToast,
    updateProfile
  } = useApp();

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<User['role']>('STUDENT');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editUniversity, setEditUniversity] = useState('');
  const [editFaculty, setEditFaculty] = useState('');
  const [editMajor, setEditMajor] = useState('');
  const [editOccupation, setEditOccupation] = useState('');
  const [editKostName, setEditKostName] = useState('');
  const [editKostAddress, setEditKostAddress] = useState('');
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);

  
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
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
      const fileName = `admin-${currentUser?.id}-${Date.now()}.${fileExt}`;
      
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

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setEditFullName(user.fullName || user.name || '');
    setEditPhone(user.phone || '');
    setEditRole(user.role || 'STUDENT');
    setEditNewPassword('');
    setEditUniversity(user.university || '');
    setEditFaculty(user.faculty || '');
    setEditMajor(user.major || '');
    setEditOccupation(user.occupation || '');
    setEditKostName(user.kostName || '');
    setEditKostAddress(user.kostAddress || '');
  };

  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsUpdatingUser(true);
    try {
      const profileUpdates: Partial<User> = {
        fullName: editFullName,
        name: editFullName,
        phone: editPhone,
        role: editRole,
        university: editRole === 'STUDENT' ? editUniversity : undefined,
        faculty: editRole === 'STUDENT' ? editFaculty : undefined,
        major: editRole === 'STUDENT' ? editMajor : undefined,
        occupation: editRole === 'PARENT' ? editOccupation : undefined,
        kostName: editRole === 'OWNER' ? editKostName : undefined,
        kostAddress: editRole === 'OWNER' ? editKostAddress : undefined
      };

      await adminUpdateProfile(editingUser.id, profileUpdates);

      if (editNewPassword.trim()) {
        if (editNewPassword.trim().length < 6) {
          showToast('Kata sandi baru minimal harus 6 karakter.', 'error');
          setIsUpdatingUser(false);
          return;
        }
        await resetUserPassword(editingUser.id, editNewPassword.trim());
      }

      showToast('Data pengguna berhasil diperbarui.', 'success');
      setEditingUser(null);
    } catch (err: any) {
      showToast(`Gagal memperbarui data pengguna: ${err.message || err}`, 'error');
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const [activeTab, setActiveTab] = useState<'analytics' | 'owners-queue' | 'kosts-queue' | 'users' | 'kosts-list' | 'reviews'>('analytics');
  const [reviewFilter, setReviewFilter] = useState<'pending' | 'all'>('pending');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
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

  
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  
  const chartData = useMemo(() => {
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T23:59:59');
    
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return Array(8).fill({ label: '', userCount: 0, kostCount: 0, userHeight: 0, kostHeight: 0 });
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const stepMs = diffTime / 8;

    const intervals = Array.from({ length: 8 }, (_, i) => {
      const iStart = new Date(start.getTime() + i * stepMs);
      const iEnd = new Date(start.getTime() + (i + 1) * stepMs);
      return {
        start: iStart,
        end: iEnd,
        label: `${iStart.getDate()}/${iStart.getMonth() + 1}`,
      };
    });

    const isWithin = (dateVal: string | Date, rangeStart: Date, rangeEnd: Date) => {
      const d = new Date(dateVal);
      return d >= rangeStart && d <= rangeEnd;
    };

    const data = intervals.map((interval) => {
      const newUserCount = users.filter((u) => {
        return u.createdAt && isWithin(u.createdAt, interval.start, interval.end);
      }).length;

      const newKostCount = kosts.filter((k) => {
        const dateVal = (k as any).createdAt || (k as any).submittedAt;
        return dateVal && isWithin(dateVal, interval.start, interval.end);
      }).length;

      return {
        label: interval.label,
        userCount: newUserCount,
        kostCount: newKostCount,
      };
    });

    const maxVal = Math.max(...data.map(d => Math.max(d.userCount, d.kostCount)), 1);

    return data.map((d) => ({
      ...d,
      userHeight: Math.min(100, Math.max(5, (d.userCount / maxVal) * 100)),
      kostHeight: Math.min(100, Math.max(5, (d.kostCount / maxVal) * 100)),
    }));
  }, [startDate, endDate, users, kosts]);

  const [searchOwners, setSearchOwners] = useState('');
  const [searchKostsQueue, setSearchKostsQueue] = useState('');
  const [searchKostsList, setSearchKostsList] = useState('');
  const [searchUsers, setSearchUsers] = useState('');
  const [searchReviews, setSearchReviews] = useState('');

  const pendingOwners = useMemo(() => {
    return ownerVerifications.filter((ov) => ov.status === 'pending');
  }, [ownerVerifications]);

  const filteredOwnersQueue = useMemo(() => {
    if (!searchOwners.trim()) return pendingOwners;
    const query = searchOwners.toLowerCase().trim();
    return pendingOwners.filter((ov) => {
      const ownerUser = users.find((u) => u.id === ov.ownerId);
      if (!ownerUser) return false;
      return (
        (ownerUser.fullName || ownerUser.name || '').toLowerCase().includes(query) ||
        (ownerUser.email || '').toLowerCase().includes(query) ||
        (ownerUser.phone || '').toLowerCase().includes(query) ||
        (ownerUser.kostName || '').toLowerCase().includes(query) ||
        (ownerUser.kostAddress || '').toLowerCase().includes(query) ||
        ov.id.toLowerCase().includes(query)
      );
    });
  }, [pendingOwners, searchOwners, users]);

  const pendingKosts = useMemo(() => {
    return kostVerifications.filter((kv) => kv.status === 'pending');
  }, [kostVerifications]);

  const filteredKostsQueue = useMemo(() => {
    if (!searchKostsQueue.trim()) return pendingKosts;
    const query = searchKostsQueue.toLowerCase().trim();
    return pendingKosts.filter((kv) => {
      const kost = kosts.find((k) => k.id === kv.kostId);
      if (!kost) return false;
      return (
        kost.name.toLowerCase().includes(query) ||
        kost.address.toLowerCase().includes(query) ||
        kost.ownerName.toLowerCase().includes(query) ||
        kv.id.toLowerCase().includes(query)
      );
    });
  }, [pendingKosts, searchKostsQueue, kosts]);

  const filteredKostsList = useMemo(() => {
    if (!searchKostsList.trim()) return kosts;
    const query = searchKostsList.toLowerCase().trim();
    return kosts.filter((kost) => {
      return (
        kost.name.toLowerCase().includes(query) ||
        kost.address.toLowerCase().includes(query) ||
        kost.ownerName.toLowerCase().includes(query) ||
        (kost.genderCategory === 'male' ? 'putra' : kost.genderCategory === 'female' ? 'putri' : 'campur').includes(query) ||
        (kost.verifiedStatus || '').toLowerCase().includes(query) ||
        kost.id.toLowerCase().includes(query)
      );
    });
  }, [kosts, searchKostsList]);

  const filteredUsersList = useMemo(() => {
    if (!searchUsers.trim()) return users;
    const query = searchUsers.toLowerCase().trim();
    return users.filter((u) => {
      return (
        (u.fullName || u.name || '').toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.phone.toLowerCase().includes(query) ||
        u.id.toLowerCase().includes(query) ||
        u.role.toLowerCase().includes(query)
      );
    });
  }, [users, searchUsers]);

  const filteredReviewsList = useMemo(() => {
    let baseReviews = reviews;
    if (reviewFilter === 'pending') {
      baseReviews = reviews.filter((r) => r.status === 'pending');
    }
    if (!searchReviews.trim()) return baseReviews;
    const query = searchReviews.toLowerCase().trim();
    return baseReviews.filter((rev) => {
      const targetKost = kosts.find((k) => k.id === rev.kostId);
      return (
        rev.userName.toLowerCase().includes(query) ||
        rev.comment.toLowerCase().includes(query) ||
        (targetKost?.name || '').toLowerCase().includes(query) ||
        rev.id.toLowerCase().includes(query)
      );
    });
  }, [reviews, searchReviews, kosts, reviewFilter]);

  const roleOptions = [
    { value: 'STUDENT', label: 'Mahasiswa' },
    { value: 'PARENT', label: 'Orang Tua' },
    { value: 'OWNER', label: 'Pemilik' },
    { value: 'ADMIN', label: 'Admin' }
  ];

  const totalUsers = users.length;
  const totalKosts = kosts.length;
  const verifiedKostsCount = kosts.filter((k) => k.verifiedStatus !== 'none').length;
  const pendingOwnerVerifs = ownerVerifications.filter((ov) => ov.status === 'pending').length;
  const pendingKostVerifs = kostVerifications.filter((kv) => kv.status === 'pending').length;
  const pendingReviewsCount = reviews.filter((r) => r.status === 'pending').length;
  const totalReviews = reviews.length;
  const totalPendingVerifications = pendingOwnerVerifs + pendingKostVerifs + pendingReviewsCount;

  const sidebarLinks: { id: string; name: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'analytics', name: 'Overview & Chart', icon: <LayoutDashboard className="h-4.5 w-4.5" /> },
    { 
      id: 'owners-queue', 
      name: 'Verifikasi Owner', 
      icon: <ShieldCheck className="h-4.5 w-4.5" />, 
      badge: pendingOwnerVerifs 
    },
    { 
      id: 'kosts-queue', 
      name: 'Verifikasi Kost', 
      icon: <Building2 className="h-4.5 w-4.5" />, 
      badge: pendingKostVerifs 
    },
    { id: 'kosts-list', name: 'Inventori Properti', icon: <SlidersHorizontal className="h-4.5 w-4.5" /> },
    { id: 'users', name: 'Manajemen Pengguna', icon: <Users className="h-4.5 w-4.5" /> },
    { 
      id: 'reviews', 
      name: 'Moderasi Ulasan', 
      icon: <MessageSquare className="h-4.5 w-4.5" />,
      badge: pendingReviewsCount
    }
  ];

  return (
    <div className="flex-1 flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      
      
      <aside className="w-72 bg-white dark:bg-slate-900 border-r border-border/80 hidden md:flex flex-col fixed top-0 bottom-0 z-30 transition-colors">
        <div className="p-6 border-b border-border/60">
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-border/60 relative group">
            {currentUser && (
              <>
                <img
                  src={currentUser.profileImage}
                  alt={currentUser.fullName}
                  className="h-10 w-10 rounded-full object-cover border border-border shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-black text-slate-800 dark:text-white leading-tight truncate">
                      {currentUser.fullName}
                    </p>
                    <button
                      onClick={handleOpenEditProfile}
                      className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-505 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
                      title="Edit Profil Saya"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-[9px] text-primary font-bold uppercase tracking-wider mt-1">Super Admin</p>
                </div>
              </>
            )}
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id as any)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/10'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {link.icon}
                  <span>{link.name}</span>
                </div>
                {link.badge && link.badge > 0 ? (
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${
                    isActive ? 'bg-white text-primary' : 'bg-rose-500 text-white'
                  }`}>
                    {link.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/60 space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full py-2.5 px-4 rounded-xl border border-border text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all hover:scale-102 flex items-center justify-center gap-2 cursor-pointer"
            title="Ganti Tema Tampilan"
          >
            {isDarkMode ? (
              <>
                <Sun className="h-4 w-4 text-amber-400" />
                <span>Mode Terang</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-slate-500" />
                <span>Mode Gelap</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all hover:scale-102 flex items-center justify-center gap-2 cursor-pointer"
            title="Keluar dari Akun Admin"
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar Sistem</span>
          </button>
          
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">
            VeriKost Malang v1.1.0
          </div>
        </div>
      </aside>

      
      <main className="flex-1 md:ml-72 p-6 sm:p-10 space-y-10 max-w-7xl w-full">
        
        
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Platform Control Center</h2>
            <p className="text-xs text-muted-foreground mt-1">Real-time performance metrics and administrative workflows.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2.5 bg-white dark:bg-slate-900 border border-border p-1 px-3.5 py-2 rounded-full shadow-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">System Secure</span>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-white dark:bg-slate-900 border border-border hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors shadow-sm cursor-pointer shrink-0"
              title="Ganti Tema Tampilan"
            >
              {isDarkMode ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
          </div>
        </header>

        
        <section className="space-y-6">
          
          
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                
                <div className="bg-white dark:bg-slate-900 border border-border p-5 rounded-3xl shadow-sm flex flex-col justify-between h-36 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-blue-50 dark:bg-slate-800 rounded-xl text-primary"><Building2 className="h-5 w-5" /></div>
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">Target 100%</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Terverifikasi Lapangan</p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-1.5">{verifiedKostsCount} <span className="text-xs font-medium text-slate-400">dari {totalKosts}</span></h3>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-border p-5 rounded-3xl shadow-sm flex flex-col justify-between h-36 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-amber-50 dark:bg-slate-800 rounded-xl text-amber-500"><ShieldCheck className="h-5 w-5" /></div>
                    {totalPendingVerifications > 0 ? (
                      <span className="text-[9px] font-black text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-900/30 animate-pulse">Perlu Tindakan</span>
                    ) : (
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">Bersih</span>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Antrean Verifikasi</p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-1.5">{totalPendingVerifications} <span className="text-xs font-medium text-slate-400">pengajuan</span></h3>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-border p-5 rounded-3xl shadow-sm flex flex-col justify-between h-36 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-primary/10 dark:bg-slate-800 rounded-xl text-primary"><Users className="h-5 w-5" /></div>
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">+14% ↑</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Pengguna Aktif</p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-1.5">{totalUsers} <span className="text-xs font-medium text-slate-400">akun</span></h3>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-border p-5 rounded-3xl shadow-sm flex flex-col justify-between h-36 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-emerald-50 dark:bg-slate-800 rounded-xl text-emerald-500"><MessageSquare className="h-5 w-5" /></div>
                    <span className="text-[9px] font-black text-primary bg-blue-50 dark:bg-slate-950/20 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/30">Semua Aktif</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Moderasi Ulasan</p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-1.5">{totalReviews} <span className="text-xs font-medium text-slate-400">ulasan</span></h3>
                  </div>
                </div>

              </div>

              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-border p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-3 border-b border-border/40">
                  <div>
                    <h4 className="font-extrabold text-slate-800 dark:text-white text-base">Platform Activity & Traffic</h4>
                    <div className="flex gap-4 mt-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-primary rounded-full"></span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">User Baru</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Kost Baru</span>
                      </div>
                    </div>
                  </div>
                  
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <CustomDatePicker 
                      value={startDate}
                      onChange={setStartDate}
                      label="Dari Tanggal"
                      iconColor="text-primary"
                    />
                    <CustomDatePicker 
                      value={endDate}
                      onChange={setEndDate}
                      label="Sampai Tanggal"
                      iconColor="text-emerald-500"
                    />
                  </div>
                </div>
                
                
                <div className="h-64 w-full relative flex items-end justify-between px-4 pb-2 border-b border-l border-border/80 bg-[linear-gradient(to_bottom,rgba(14,165,233,0.02)_0%,transparent_100%)]">
                  {chartData.map((d, index) => (
                    <div key={index} className="flex flex-col items-center flex-1 h-full justify-end group relative">
                      
                      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center bg-slate-800 dark:bg-slate-900 border border-slate-700 dark:border-slate-800 text-white text-[10px] p-2.5 rounded-xl shadow-xl z-10 pointer-events-none min-w-[130px] transition-all">
                        <p className="font-extrabold text-center border-b border-slate-700 dark:border-slate-800 pb-1 mb-1 text-[11px]">{d.label}</p>
                        <p className="flex items-center gap-1.5 text-slate-200"><span className="w-2 h-2 bg-primary rounded-full shrink-0"></span> User Baru: <strong>{d.userCount}</strong></p>
                        <p className="flex items-center gap-1.5 text-slate-200"><span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0"></span> Kost Baru: <strong>{d.kostCount}</strong></p>
                      </div>
                      
                      
                      <div className="flex items-end gap-1 sm:gap-1.5 h-[90%] w-full justify-center pb-1">
                        <div 
                          style={{ height: `${d.userHeight}%` }} 
                          className="w-2.5 sm:w-3.5 bg-primary/80 hover:bg-primary rounded-t transition-all cursor-pointer shadow-sm shadow-primary/10"
                        ></div>
                        <div 
                          style={{ height: `${d.kostHeight}%` }} 
                          className="w-2.5 sm:w-3.5 bg-emerald-500 hover:bg-emerald-600 rounded-t transition-all cursor-pointer shadow-sm shadow-emerald-500/10"
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between text-[10px] font-extrabold text-slate-400 tracking-wider uppercase px-2">
                  {chartData.map((d, index) => (
                    <span key={index} className="flex-1 text-center truncate">{d.label}</span>
                  ))}
                </div>
              </div>

              
              <div className="bg-white dark:bg-slate-900 border border-border p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col justify-between">
                <div className="space-y-4">
                  <h4 className="font-extrabold text-slate-800 dark:text-white text-base pb-3 border-b border-border/40">Notifikasi Sistem</h4>
                  <div className="space-y-5 overflow-y-auto max-h-[250px] scrollbar-none pr-1">
                    
                    <div className="flex gap-3 text-xs leading-normal">
                      <div className="h-8 w-8 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-900/30">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">Owner Pendaftaran Baru</p>
                        <p className="text-slate-400 mt-0.5">Antrean verifikasi Mitra Owner bertambah.</p>
                      </div>
                    </div>

                    <div className="flex gap-3 text-xs leading-normal">
                      <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/30">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">Klaim Properti Masuk</p>
                        <p className="text-slate-400 mt-0.5">Kost baru didaftarkan dan menunggu tinjauan.</p>
                      </div>
                    </div>

                    <div className="flex gap-3 text-xs leading-normal">
                      <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-slate-800 text-primary flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/30">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">Ulasan Masuk</p>
                        <p className="text-slate-400 mt-0.5">Ulasan baru mahasiswa masuk dalam sistem.</p>
                      </div>
                    </div>

                  </div>
                </div>

                <button 
                  onClick={() => setActiveTab('owners-queue')}
                  className="w-full py-3 mt-6 text-primary text-xs font-extrabold hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition-colors border border-dashed border-border/80 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Buka Antrean Verifikasi →</span>
                </button>
              </div>
            </div>
          </div>
          )}

          
          {activeTab === 'owners-queue' && (
            <div className="space-y-6">
              {pendingOwners.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 border border-border rounded-3xl text-sm text-slate-400 font-semibold shadow-sm">
                  Tidak ada pengajuan verifikasi owner baru dalam antrean.
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-border/80 shadow-sm">
                    <div className="relative max-w-md w-full">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                        <Search className="h-4.5 w-4.5" />
                      </div>
                      <input
                        type="text"
                        placeholder="Cari owner berdasarkan nama, email, telepon, kost..."
                        value={searchOwners}
                        onChange={(e) => setSearchOwners(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-border/80 pl-10 pr-10 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-white transition-all shadow-inner animate-in fade-in"
                      />
                      {searchOwners && (
                        <button
                          onClick={() => setSearchOwners('')}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-border/60">
                      Total Antrean: {pendingOwners.length}
                    </span>
                  </div>

                  {filteredOwnersQueue.length === 0 ? (
                    <div className="p-12 text-center bg-white dark:bg-slate-900 border border-border rounded-3xl shadow-sm space-y-3 animate-in fade-in duration-200">
                      <div className="mx-auto h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                        <Search className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-800 dark:text-white text-sm">Pencarian Tidak Ditemukan</h4>
                        <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
                          Tidak ada data yang cocok dengan kata kunci <span className="font-bold text-slate-600 dark:text-slate-300">"{searchOwners}"</span>. Silakan coba kata kunci lain.
                        </p>
                      </div>
                      <button
                        onClick={() => setSearchOwners('')}
                        className="mt-2 py-2 px-4 rounded-xl border border-border text-slate-700 dark:text-slate-200 text-[11px] font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm hover:scale-102"
                      >
                        Bersihkan Pencarian
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {filteredOwnersQueue.map((ov) => {
                        const ownerUser = users.find((u) => u.id === ov.ownerId);
                        if (!ownerUser) return null;

                        return (
                          <div key={ov.id} className="bg-white dark:bg-slate-900 border border-border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in fade-in duration-200">
                            <div className="flex gap-4">
                              <img
                                src={ownerUser.profileImage}
                                alt={ownerUser.fullName}
                                className="h-14 w-14 rounded-full object-cover border border-border shrink-0"
                              />
                              <div className="space-y-1 text-xs">
                                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                                  {ownerUser.fullName}
                                </h3>
                                <p className="text-slate-400 font-medium">{ownerUser.email} • {ownerUser.phone}</p>
                                <div className="flex flex-wrap gap-x-4 pt-1 text-slate-500 font-semibold">
                                  <span>Kost: {ownerUser.kostName || 'N/A'}</span>
                                  <span>Alamat: {ownerUser.kostAddress || 'N/A'}</span>
                                </div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase pt-0.5">Diajukan: {ov.submittedAt}</p>
                              </div>
                            </div>

                            
                            <div className="flex gap-3 shrink-0 w-full md:w-auto border-t md:border-t-0 border-border pt-4 md:pt-0 justify-end">
                              <button
                                onClick={() => approveOwner(ov.id, 'rejected')}
                                className="rounded-xl border border-rose-200 text-rose-600 bg-rose-50/50 hover:bg-rose-50 text-xs font-bold py-2.5 px-4 transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <X className="h-4 w-4" />
                                <span>Tolak</span>
                              </button>
                              <button
                                onClick={() => approveOwner(ov.id, 'approved')}
                                className="rounded-xl bg-primary hover:brightness-110 text-white text-xs font-bold py-2.5 px-4 shadow transition-transform active:scale-98 flex items-center gap-1.5 cursor-pointer"
                              >
                                <Check className="h-4 w-4" />
                                <span>Setujui Owner</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

            </div>
          )}

          
          {activeTab === 'kosts-queue' && (
            <div className="space-y-6">
              {pendingKosts.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 border border-border rounded-3xl text-sm text-slate-400 font-semibold shadow-sm">
                  Tidak ada pengajuan verifikasi lapangan kost baru dalam antrean.
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-border/80 shadow-sm">
                    <div className="relative max-w-md w-full">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                        <Search className="h-4.5 w-4.5" />
                      </div>
                      <input
                        type="text"
                        placeholder="Cari kost berdasarkan nama, alamat, owner..."
                        value={searchKostsQueue}
                        onChange={(e) => setSearchKostsQueue(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-border/80 pl-10 pr-10 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-white transition-all shadow-inner animate-in fade-in"
                      />
                      {searchKostsQueue && (
                        <button
                          onClick={() => setSearchKostsQueue('')}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-border/60">
                      Total Antrean: {pendingKosts.length}
                    </span>
                  </div>

                  {filteredKostsQueue.length === 0 ? (
                    <div className="p-12 text-center bg-white dark:bg-slate-900 border border-border rounded-3xl shadow-sm space-y-3 animate-in fade-in duration-200">
                      <div className="mx-auto h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                        <Search className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-800 dark:text-white text-sm">Pencarian Tidak Ditemukan</h4>
                        <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
                          Tidak ada data yang cocok dengan kata kunci <span className="font-bold text-slate-600 dark:text-slate-300">"{searchKostsQueue}"</span>. Silakan coba kata kunci lain.
                        </p>
                      </div>
                      <button
                        onClick={() => setSearchKostsQueue('')}
                        className="mt-2 py-2 px-4 rounded-xl border border-border text-slate-700 dark:text-slate-200 text-[11px] font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm hover:scale-102"
                      >
                        Bersihkan Pencarian
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {filteredKostsQueue.map((kv) => {
                        const kost = kosts.find((k) => k.id === kv.kostId);
                        if (!kost) return null;

                        return (
                          <div key={kv.id} className="bg-white dark:bg-slate-900 border border-border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in fade-in duration-200">
                            <div className="flex gap-4">
                              <img
                                src={kost.images[0]}
                                alt={kost.name}
                                className="h-16 w-24 rounded-lg object-cover border border-border shrink-0"
                              />
                              <div className="space-y-1 text-xs">
                                <span className="inline-flex items-center rounded bg-blue-50 dark:bg-slate-800 text-primary dark:text-blue-400 py-0.5 px-1.5 text-[9px] font-black uppercase tracking-wider">
                                  {kost.genderCategory === 'male' ? 'Putra' : kost.genderCategory === 'female' ? 'Putri' : 'Campur'}
                                </span>
                                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                                  {kost.name}
                                </h3>
                                <p className="text-slate-400 font-medium">{kost.address}</p>
                                <div className="flex flex-wrap gap-x-4 text-slate-500 font-semibold">
                                  <span>Owner: {kost.ownerName}</span>
                                  <span>Harga: Rp {kost.price.toLocaleString('id-ID')}/bln</span>
                                </div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase pt-0.5">Diajukan: {kv.submittedAt}</p>
                              </div>
                            </div>

                            
                            <div className="flex flex-wrap gap-2.5 shrink-0 w-full md:w-auto border-t md:border-t-0 border-border pt-4 md:pt-0 justify-end items-center">
                              <button
                                onClick={() => approveKost(kv.id, 'rejected')}
                                className="rounded-xl border border-rose-200 text-rose-600 bg-rose-50/50 hover:bg-rose-50 text-xs font-bold py-2.5 px-3.5 transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <X className="h-4 w-4" />
                                <span>Tolak</span>
                              </button>
                              <button
                                onClick={() => approveKost(kv.id, 'approved', 'verified')}
                                className="rounded-xl border border-blue-200 text-primary bg-blue-50/30 hover:bg-blue-50/55 text-xs font-bold py-2.5 px-4 shadow-sm flex items-center gap-1 cursor-pointer"
                              >
                                <Award className="h-4 w-4" />
                                <span>Terverifikasi Lapangan</span>
                              </button>
                              <button
                                onClick={() => approveKost(kv.id, 'approved', 'highly-trusted')}
                                className="rounded-xl bg-primary hover:brightness-110 text-white text-xs font-bold py-2.5 px-4 shadow transition-transform active:scale-98 flex items-center gap-1 cursor-pointer"
                              >
                                <ShieldCheck className="h-4 w-4" />
                                <span>Highly Trusted Kost</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

            </div>
          )}

          
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-border/80 shadow-sm">
                <div className="relative max-w-md w-full">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Search className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari pengguna berdasarkan nama, email, nomor telepon, atau peran..."
                    value={searchUsers}
                    onChange={(e) => setSearchUsers(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-border/80 pl-10 pr-10 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-white transition-all shadow-inner animate-in fade-in"
                  />
                  {searchUsers && (
                    <button
                      onClick={() => setSearchUsers('')}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-border/60">
                  Total Pengguna: {users.length}
                </span>
              </div>

              {filteredUsersList.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 border border-border rounded-3xl shadow-sm space-y-3 animate-in fade-in duration-200">
                  <div className="mx-auto h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                    <Search className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-800 dark:text-white text-sm">Pencarian Tidak Ditemukan</h4>
                    <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
                      Tidak ada data yang cocok dengan kata kunci <span className="font-bold text-slate-600 dark:text-slate-300">"{searchUsers}"</span>. Silakan coba kata kunci lain.
                    </p>
                  </div>
                  <button
                    onClick={() => setSearchUsers('')}
                    className="mt-2 py-2 px-4 rounded-xl border border-border text-slate-700 dark:text-slate-200 text-[11px] font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm hover:scale-102"
                  >
                    Bersihkan Pencarian
                  </button>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-border text-slate-400 font-extrabold uppercase tracking-wider">
                          <th className="px-6 py-4">Profil</th>
                          <th className="px-6 py-4">Kontak</th>
                          <th className="px-6 py-4">Peran Utama</th>
                          <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {filteredUsersList.map((u) => {
                          const roleColors = {
                            STUDENT: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-slate-800 dark:text-blue-400 dark:border-blue-900/30',
                            PARENT: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-slate-800 dark:text-indigo-400 dark:border-indigo-900/30',
                            OWNER: 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-slate-800 dark:text-purple-400 dark:border-purple-900/30',
                            ADMIN: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-slate-800 dark:text-rose-400 dark:border-rose-900/30'
                          };
                          return (
                            <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                              <td className="px-6 py-4 flex items-center gap-3">
                                <img src={u.profileImage} alt={u.fullName} className="h-9 w-9 rounded-full object-cover border border-border" />
                                <div>
                                  <p className="font-extrabold text-slate-800 dark:text-white leading-tight">{u.fullName}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">ID: {u.id}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-semibold space-y-1">
                                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-slate-400" /> {u.email}</span>
                                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-slate-400" /> {u.phone}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-block rounded px-2 py-0.5 text-[9px] font-black border uppercase tracking-wider ${roleColors[u.role] || 'bg-slate-50 text-slate-500 border-border'}`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-3.5">
                                  
                                  <CustomSelect
                                    options={roleOptions}
                                    value={u.role}
                                    onChange={(val) => updateUserRole(u.id, val as any)}
                                    className="w-28 text-left"
                                    variant="minimal"
                                    disabled={!!(currentUser && u.id === currentUser.id)}
                                  />

                                  
                                  <button
                                    onClick={() => handleOpenEditModal(u)}
                                    className="text-blue-500 hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors cursor-pointer"
                                    title="Edit Data Pengguna"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>

                                  {u.role !== 'ADMIN' && (
                                    <button
                                      onClick={async () => {
                                        if (confirm(`Apakah Anda yakin ingin menghapus akun ${u.fullName}?`)) {
                                          await deleteUser(u.id);
                                        }
                                      }}
                                      className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                                      title="Hapus Pengguna"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 border border-border rounded-3xl text-sm text-slate-400 font-semibold shadow-sm">
                  Tidak ada ulasan terdaftar untuk dimoderasi.
                </div>
              ) : (
                <>
                  
                  <div className="flex gap-4 border-b border-border/60 pb-3 max-w-3xl">
                    <button
                      onClick={() => setReviewFilter('pending')}
                      className={`pb-2 text-xs font-extrabold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                        reviewFilter === 'pending'
                          ? 'border-primary text-primary font-bold'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span>Menunggu Moderasi</span>
                      {pendingReviewsCount > 0 && (
                        <span className="bg-rose-500 text-white rounded-full text-[9px] px-1.5 py-0.5 font-black leading-none flex items-center justify-center">
                          {pendingReviewsCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setReviewFilter('all')}
                      className={`pb-2 text-xs font-extrabold border-b-2 transition-all cursor-pointer ${
                        reviewFilter === 'all'
                          ? 'border-primary text-primary font-bold'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Semua Ulasan
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-border/80 shadow-sm max-w-3xl">
                    <div className="relative max-w-md w-full">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                        <Search className="h-4.5 w-4.5" />
                      </div>
                      <input
                        type="text"
                        placeholder="Cari ulasan berdasarkan pengirim, isi ulasan, kost..."
                        value={searchReviews}
                        onChange={(e) => setSearchReviews(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-border/80 pl-10 pr-10 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-white transition-all shadow-inner animate-in fade-in"
                      />
                      {searchReviews && (
                        <button
                          onClick={() => setSearchReviews('')}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-border/60">
                      Total Ulasan: {reviews.length}
                    </span>
                  </div>

                  {filteredReviewsList.length === 0 ? (
                    <div className="p-12 text-center bg-white dark:bg-slate-900 border border-border rounded-3xl shadow-sm space-y-3 animate-in fade-in duration-200 max-w-3xl">
                      <div className="mx-auto h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                        <Search className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-800 dark:text-white text-sm">Pencarian Tidak Ditemukan</h4>
                        <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
                          Tidak ada ulasan {reviewFilter === 'pending' ? 'menunggu moderasi' : ''} yang cocok dengan kata kunci <span className="font-bold text-slate-600 dark:text-slate-300">"{searchReviews}"</span>.
                        </p>
                      </div>
                      <button
                        onClick={() => setSearchReviews('')}
                        className="mt-2 py-2 px-4 rounded-xl border border-border text-slate-700 dark:text-slate-200 text-[11px] font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm hover:scale-102"
                      >
                        Bersihkan Pencarian
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6 max-w-3xl">
                      {filteredReviewsList.map((rev) => {
                        const targetKost = kosts.find((k) => k.id === rev.kostId);
                        return (
                          <div key={rev.id} className="bg-white dark:bg-slate-900 border border-border rounded-3xl p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
                            
                            <div className="flex justify-between items-start border-b border-border/60 pb-3 gap-3 text-xs">
                              <div>
                                <span className="text-slate-400 block font-semibold text-[9px] uppercase tracking-wider leading-none">Target Kos</span>
                                <span className="font-extrabold text-slate-900 dark:text-white leading-tight block mt-1">
                                  {targetKost ? targetKost.name : 'Unknown Kost'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`inline-block rounded-lg px-2 py-0.5 text-[9px] font-black border uppercase tracking-wider ${rev.verifiedTenant ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-slate-800 dark:text-emerald-400 dark:border-emerald-900/30' : 'bg-slate-50 text-slate-500 border-border'}`}>
                                  {rev.verifiedTenant ? 'Verified Tenant' : 'Non-verified'}
                                </span>
                                {rev.status && (
                                  <span className={`inline-block rounded-lg px-2 py-0.5 text-[9px] font-black border uppercase tracking-wider ${
                                    rev.status === 'approved'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                                      : rev.status === 'rejected'
                                      ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
                                      : 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
                                  }`}>
                                    {rev.status === 'approved' ? 'Disetujui' : rev.status === 'rejected' ? 'Ditolak' : 'Menunggu Moderasi'}
                                  </span>
                                )}
                              </div>
                            </div>

                            
                            <div className="flex gap-4">
                              <img
                                src={rev.userAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default&eyebrows=defaultNatural&mouth=smile'}
                                alt={rev.userName}
                                className="h-10 w-10 rounded-full object-cover shrink-0 border border-border"
                              />
                              <div className="space-y-1.5 text-xs">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-extrabold text-slate-800 dark:text-white">{rev.userName}</h4>
                                  <div className="flex text-amber-400">
                                    {[...Array(rev.rating)].map((_, i) => (
                                      <span key={i} className="text-xs">★</span>
                                    ))}
                                  </div>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 italic">"{rev.comment}"</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase">{rev.date}</p>
                              </div>
                            </div>

                            
                            <div className="flex gap-3 justify-end pt-2 border-t border-border/40">
                              {rev.status === 'pending' ? (
                                <>
                                  <button
                                    onClick={async () => {
                                      await moderateReview(rev.id, 'delete');
                                      showToast('Ulasan ditolak dan dihapus.', 'info');
                                    }}
                                    className="rounded-xl border border-rose-200 text-rose-600 bg-rose-50/50 hover:bg-rose-50 text-xs font-bold py-2 px-4 shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <X className="h-4 w-4" />
                                    <span>Tolak & Hapus</span>
                                  </button>
                                  <button
                                    onClick={async () => {
                                      await moderateReview(rev.id, 'approve');
                                      showToast('Ulasan berhasil disetujui dan diterbitkan secara publik.', 'success');
                                    }}
                                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-4 shadow transition-transform hover:scale-102 flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Check className="h-4 w-4" />
                                    <span>Setujui & Terbitkan</span>
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={async () => {
                                    if (confirm('Apakah Anda yakin ingin menghapus ulasan ini?')) {
                                      await moderateReview(rev.id, 'delete');
                                      showToast('Ulasan berhasil dihapus.', 'success');
                                    }
                                  }}
                                  className="rounded-xl border border-rose-200 text-rose-600 bg-rose-50/50 hover:bg-rose-50 text-xs font-bold py-2.5 px-4 shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span>Hapus Ulasan</span>
                                </button>
                              )}
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          
          {activeTab === 'kosts-list' && (
            <div className="space-y-6">
              {kosts.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 border border-border rounded-3xl text-sm text-slate-400 font-semibold shadow-sm animate-in fade-in">
                  Tidak ada kost terdaftar dalam sistem.
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-border/80 shadow-sm">
                    <div className="relative max-w-md w-full">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                        <Search className="h-4.5 w-4.5" />
                      </div>
                      <input
                        type="text"
                        placeholder="Cari kost berdasarkan nama, alamat, owner, kategori..."
                        value={searchKostsList}
                        onChange={(e) => setSearchKostsList(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-border/80 pl-10 pr-10 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-white transition-all shadow-inner animate-in fade-in"
                      />
                      {searchKostsList && (
                        <button
                          onClick={() => setSearchKostsList('')}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-border/60">
                      Total Listing: {kosts.length}
                    </span>
                  </div>

                  {filteredKostsList.length === 0 ? (
                    <div className="p-12 text-center bg-white dark:bg-slate-900 border border-border rounded-3xl shadow-sm space-y-3 animate-in fade-in duration-200">
                      <div className="mx-auto h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                        <Search className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-800 dark:text-white text-sm">Pencarian Tidak Ditemukan</h4>
                        <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
                          Tidak ada data yang cocok dengan kata kunci <span className="font-bold text-slate-600 dark:text-slate-300">"{searchKostsList}"</span>. Silakan coba kata kunci lain.
                        </p>
                      </div>
                      <button
                        onClick={() => setSearchKostsList('')}
                        className="mt-2 py-2 px-4 rounded-xl border border-border text-slate-700 dark:text-slate-200 text-[11px] font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm hover:scale-102"
                      >
                        Bersihkan Pencarian
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredKostsList.map((kost) => {
                        return (
                          <div key={kost.id} className="bg-white dark:bg-slate-900 border border-border rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between animate-in fade-in duration-200">
                            <div className="p-5 space-y-4">
                              <div className="flex gap-4">
                                <img
                                  src={kost.images[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=300&q=80'}
                                  alt={kost.name}
                                  className="h-16 w-24 rounded-lg object-cover border border-border shrink-0"
                                />
                                <div className="space-y-1 text-xs">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="inline-flex items-center rounded bg-blue-50 dark:bg-slate-800 text-primary dark:text-blue-400 py-0.5 px-1.5 text-[9px] font-black uppercase tracking-wider">
                                      {kost.genderCategory === 'male' ? 'Putra' : kost.genderCategory === 'female' ? 'Putri' : 'Campur'}
                                    </span>
                                    {kost.verifiedStatus === 'verified' && (
                                      <span className="inline-flex items-center gap-0.5 rounded bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 py-0.5 px-1.5 text-[9px] font-bold border border-emerald-200/50">
                                        ★ Terverifikasi Lapangan
                                      </span>
                                    )}
                                    {kost.verifiedStatus === 'highly-trusted' && (
                                      <span className="inline-flex items-center gap-0.5 rounded bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 py-0.5 px-1.5 text-[9px] font-bold border border-blue-200/50">
                                        🛡️ Highly Trusted
                                      </span>
                                    )}
                                  </div>
                                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                                    {kost.name}
                                  </h3>
                                  <p className="text-slate-400 font-medium">{kost.address}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border/40 pt-3 text-[11px] text-slate-500 font-semibold">
                                <div>
                                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Harga Sewa</span>
                                  <span className="text-slate-700 dark:text-slate-200 font-black">Rp {kost.price.toLocaleString('id-ID')}/bln</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Pemilik Kost</span>
                                  <span className="text-slate-700 dark:text-slate-200 truncate block">{kost.ownerName}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Status Kamar</span>
                                  <span className={`font-bold capitalize ${kost.roomAvailability === 'available' ? 'text-emerald-500' : kost.roomAvailability === 'limited' ? 'text-amber-500' : 'text-rose-500'}`}>
                                    {kost.roomAvailability === 'available' ? 'Tersedia' : kost.roomAvailability === 'limited' ? 'Terbatas' : 'Penuh'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Jarak Ke Kampus UB</span>
                                  <span className="text-slate-700 dark:text-slate-200">{kost.distanceToUB} km</span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/40 px-5 py-3 border-t border-border/50 flex justify-between items-center">
                              <Link
                                href={`/kost/${kost.id}`}
                                className="text-[11px] font-bold text-primary hover:underline"
                                target="_blank"
                              >
                                Lihat Halaman Kost →
                              </Link>
                              
                              <button
                                onClick={async () => {
                                  if (confirm(`Apakah Anda yakin ingin menghapus listing kost "${kost.name}" dari sistem?`)) {
                                    await deleteKost(kost.id);
                                    showToast(`Kost "${kost.name}" berhasil dihapus.`, 'success');
                                  }
                                }}
                                className="rounded-lg border border-rose-100 hover:border-rose-200 text-rose-500 hover:text-rose-600 bg-rose-50/20 hover:bg-rose-50/50 text-[10px] font-bold py-1.5 px-3 transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Hapus Listing</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

            </div>
          )}

        </section>

      </main>

      
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-border shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200 scrollbar-none">
            
            
            <div className="flex justify-between items-center pb-4 border-b border-border/80">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">Edit Data Pengguna</h3>
                <p className="text-xs text-muted-foreground mt-1">Ubah info lengkap atau reset sandi untuk ID: {editingUser.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            
            <form onSubmit={handleSaveUserEdit} className="space-y-4 text-xs font-semibold">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                
                <div className="space-y-1.5">
                  <label className="text-slate-700 dark:text-slate-300">Nama Lengkap*</label>
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    required
                    disabled={isUpdatingUser}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl border border-border p-3 focus:outline-none focus:border-primary text-slate-800 dark:text-white"
                  />
                </div>

                
                <div className="space-y-1.5">
                  <label className="text-slate-400">Alamat Email (Permanen)</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    disabled
                    className="w-full bg-slate-100 dark:bg-slate-800/40 rounded-xl border border-border/60 p-3 text-slate-400 cursor-not-allowed"
                  />
                </div>

                
                <div className="space-y-1.5">
                  <label className="text-slate-700 dark:text-slate-300">Nomor Telepon/WA*</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    required
                    disabled={isUpdatingUser}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl border border-border p-3 focus:outline-none focus:border-primary text-slate-800 dark:text-white"
                  />
                </div>

                
                <div className="space-y-1.5">
                  <label className="text-slate-700 dark:text-slate-300">Peran Utama*</label>
                  <div className="relative">
                    <CustomSelect
                      options={roleOptions}
                      value={editRole}
                      onChange={(val) => setEditRole(val as any)}
                      disabled={!!(currentUser && editingUser.id === currentUser.id)}
                      className="w-full text-left font-bold"
                    />
                  </div>
                  {currentUser && editingUser.id === currentUser.id && (
                    <p className="text-[10px] text-amber-500 font-bold mt-1">Anda tidak dapat mengubah peran akun Anda sendiri.</p>
                  )}
                </div>

                
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-amber-500 font-extrabold flex items-center gap-1">
                    <Key className="h-4 w-4 shrink-0" />
                    Reset Kata Sandi (Kosongkan jika tidak ingin diubah)
                  </label>
                  <input
                    type="password"
                    placeholder="Masukkan kata sandi baru (min. 6 karakter)..."
                    value={editNewPassword}
                    onChange={(e) => setEditNewPassword(e.target.value)}
                    disabled={isUpdatingUser}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl border border-border p-3 focus:outline-none focus:border-primary text-slate-800 dark:text-white"
                  />
                </div>

              </div>

              
              {editRole === 'STUDENT' && (
                <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <span className="font-black uppercase tracking-wider text-[10px] text-blue-600 dark:text-blue-400 block">Detil Kemahasiswaan</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    <div className="space-y-1">
                      <label className="text-slate-600 dark:text-slate-300">Universitas</label>
                      <input
                        type="text"
                        placeholder="Contoh: UB / UM"
                        value={editUniversity}
                        onChange={(e) => setEditUniversity(e.target.value)}
                        disabled={isUpdatingUser}
                        className="w-full bg-white dark:bg-slate-800 rounded-xl border border-border p-2 focus:outline-none focus:border-primary text-slate-800 dark:text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-600 dark:text-slate-300">Fakultas</label>
                      <input
                        type="text"
                        placeholder="Contoh: FIA"
                        value={editFaculty}
                        onChange={(e) => setEditFaculty(e.target.value)}
                        disabled={isUpdatingUser}
                        className="w-full bg-white dark:bg-slate-800 rounded-xl border border-border p-2 focus:outline-none focus:border-primary text-slate-800 dark:text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-600 dark:text-slate-300">Jurusan</label>
                      <input
                        type="text"
                        placeholder="Contoh: Bisnis"
                        value={editMajor}
                        onChange={(e) => setEditMajor(e.target.value)}
                        disabled={isUpdatingUser}
                        className="w-full bg-white dark:bg-slate-800 rounded-xl border border-border p-2 focus:outline-none focus:border-primary text-slate-800 dark:text-white text-xs"
                      />
                    </div>

                  </div>
                </div>
              )}

              {editRole === 'PARENT' && (
                <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <span className="font-black uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400 block">Detil Orang Tua</span>
                  <div className="space-y-1">
                    <label className="text-slate-600 dark:text-slate-300">Pekerjaan Utama</label>
                    <input
                      type="text"
                      placeholder="Contoh: PNS / Wiraswasta"
                      value={editOccupation}
                      onChange={(e) => setEditOccupation(e.target.value)}
                      disabled={isUpdatingUser}
                      className="w-full bg-white dark:bg-slate-800 rounded-xl border border-border p-2.5 focus:outline-none focus:border-primary text-slate-800 dark:text-white text-xs"
                    />
                  </div>
                </div>
              )}

              {editRole === 'OWNER' && (
                <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 rounded-2xl space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <span className="font-black uppercase tracking-wider text-[10px] text-purple-600 dark:text-purple-400 block">Informasi Kepemilikan Kost</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    <div className="space-y-1">
                      <label className="text-slate-600 dark:text-slate-300">Nama Kost Utama</label>
                      <input
                        type="text"
                        placeholder="Contoh: Kost Lowokwaru"
                        value={editKostName}
                        onChange={(e) => setEditKostName(e.target.value)}
                        disabled={isUpdatingUser}
                        className="w-full bg-white dark:bg-slate-800 rounded-xl border border-border p-2 focus:outline-none focus:border-primary text-slate-800 dark:text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-600 dark:text-slate-300">Alamat Kost</label>
                      <input
                        type="text"
                        placeholder="Contoh: Jl. Sukarno Hatta No 5"
                        value={editKostAddress}
                        onChange={(e) => setEditKostAddress(e.target.value)}
                        disabled={isUpdatingUser}
                        className="w-full bg-white dark:bg-slate-800 rounded-xl border border-border p-2 focus:outline-none focus:border-primary text-slate-800 dark:text-white text-xs"
                      />
                    </div>

                  </div>
                </div>
              )}

              
              <div className="flex justify-end gap-3 pt-4 border-t border-border/80">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  disabled={isUpdatingUser}
                  className="py-3 px-5 rounded-xl border border-border text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingUser}
                  className="py-3 px-6 rounded-xl bg-primary hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-primary/20 transition-transform active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingUser ? (
                    <>
                      <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4.5 w-4.5" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-border shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200 scrollbar-none">
            
            <div className="flex justify-between items-center pb-4 border-b border-border/80">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">Edit Profil Saya (Admin)</h3>
                <p className="text-xs text-muted-foreground mt-1">Perbarui foto profil, info kontak, dan sandi keamanan admin Anda.</p>
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
                    value={currentUser?.email || ''}
                    disabled
                    className="w-full bg-slate-100 dark:bg-slate-800/40 rounded-xl border border-border/60 p-3 text-slate-455 cursor-not-allowed"
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
