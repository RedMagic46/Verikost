'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Kost, 
  Review, 
  Inquiry, 
  User, 
  OwnerVerification, 
  KostVerification
} from '../types';

interface AppContextType {
  kosts: Kost[];
  reviews: Review[];
  inquiries: Inquiry[];
  favorites: string[];
  compareList: string[];
  recentlyViewed: string[];
  currentUser: User | null;
  authLoading: boolean;
  users: User[];
  ownerVerifications: OwnerVerification[];
  kostVerifications: KostVerification[];
  switchRole: (role: string) => void;
  toggleFavorite: (id: string) => void;
  toggleCompare: (id: string) => void;
  addToRecentlyViewed: (id: string) => void;
  addReview: (kostId: string, userName: string, rating: number, comment: string) => Promise<void>;
  addKost: (kost: Omit<Kost, 'id' | 'rating' | 'views' | 'ownerId' | 'ownerName' | 'ownerPhone'>) => Promise<void>;
  updateKostAvailability: (id: string, availability: 'available' | 'limited' | 'full') => Promise<void>;
  addInquiry: (kostId: string, message: string) => Promise<void>;
  updateInquiryStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>;
  
  login: (email: string, password: string) => Promise<{ success: boolean; role?: User['role']; error?: string }>;
  register: (user: Omit<User, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<User>) => Promise<void>;
  adminUpdateProfile: (userId: string, profile: Partial<User>) => Promise<void>;
  
  submitOwnerVerification: (ownerId: string) => Promise<void>;
  submitKostVerification: (kostId: string) => Promise<void>;
  approveOwner: (verificationId: string, status: 'approved' | 'rejected') => Promise<void>;
  approveKost: (verificationId: string, status: 'approved' | 'rejected', badge?: 'verified' | 'highly-trusted') => Promise<void>;
  moderateReview: (reviewId: string, action: 'approve' | 'delete') => Promise<void>;
  updateUserRole: (userId: string, role: User['role']) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  resetUserPassword: (userId: string, newPasswordPlain: string) => Promise<void>;
  deleteKost: (kostId: string) => Promise<void>;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [kosts, setKosts] = useState<Kost[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [ownerVerifications, setOwnerVerifications] = useState<OwnerVerification[]>([]);
  const [kostVerifications, setKostVerifications] = useState<KostVerification[]>([]);
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchSupabaseData = async () => {
    try {
      const { data: dbKosts } = await supabase
        .from('kosts')
        .select('*')
        .order('createdAt', { ascending: false });
        
      const { data: dbReviews } = await supabase
        .from('reviews')
        .select('*')
        .order('date', { ascending: false });

      const { data: dbInquiries } = await supabase
        .from('inquiries')
        .select('*')
        .order('date', { ascending: false });

      const { data: dbOwnerVerifs } = await supabase
        .from('owner_verifications')
        .select('*')
        .order('submittedAt', { ascending: false });

      const { data: dbKostVerifs } = await supabase
        .from('kost_verifications')
        .select('*')
        .order('submittedAt', { ascending: false });

      const { data: dbProfiles } = await supabase
        .from('profiles')
        .select('*');

      if (dbKosts) setKosts(dbKosts);
      if (dbReviews) setReviews(dbReviews);
      if (dbInquiries) setInquiries(dbInquiries);
      if (dbOwnerVerifs) setOwnerVerifications(dbOwnerVerifs);
      if (dbKostVerifs) setKostVerifications(dbKostVerifs);
      if (dbProfiles) setUsers(dbProfiles);
    } catch (err) {
      console.error('Error fetching Supabase data:', err);
    }
  };

  useEffect(() => {
    fetchSupabaseData();
  }, []);

  const loadUserStorage = (userId: string) => {
    if (typeof window !== 'undefined') {
      const savedCompare = localStorage.getItem(`vk_compare_${userId}`);
      const savedHistory = localStorage.getItem(`vk_history_${userId}`);
      
      setCompareList(savedCompare ? JSON.parse(savedCompare) : []);
      setRecentlyViewed(savedHistory ? JSON.parse(savedHistory) : []);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
        loadUserStorage(session.user.id);
      } else {
        setCurrentUser(null);
        setAuthLoading(false);
        loadUserStorage('guest');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
        loadUserStorage(session.user.id);
      } else {
        setCurrentUser(null);
        setFavorites([]);
        setCompareList([]);
        setRecentlyViewed([]);
        setAuthLoading(false);
        loadUserStorage('guest');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      setAuthLoading(true);
      const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
      
      if (profile) {
        let finalProfile = profile;
        if (profile.email === 'admin@verikost.com' && profile.role !== 'ADMIN') {
          const { error } = await supabase
            .from('profiles')
            .update({ role: 'ADMIN' })
            .eq('id', userId);
          if (!error) {
            finalProfile = { ...profile, role: 'ADMIN' };
          }
        } else if (
          (profile.email === 'endang@verikost.com' || 
           profile.email === 'gunawan@verikost.com' || 
           profile.email === 'rudi@verikost.com') && 
          profile.role !== 'OWNER'
        ) {
          const { error } = await supabase
            .from('profiles')
            .update({ role: 'OWNER' })
            .eq('id', userId);
          if (!error) {
            finalProfile = { ...profile, role: 'OWNER' };
          }
        }

        setCurrentUser(finalProfile);
        
        const { data: favs } = await supabase
          .from('favorites')
          .select('kostId')
          .eq('userId', userId);
        if (favs) {
          setFavorites(favs.map(f => f.kostId));
        }
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const saveToStorage = (key: string, data: any, userId?: string) => {
    if (typeof window !== 'undefined') {
      const storageKey = userId ? `${key}_${userId}` : key;
      localStorage.setItem(storageKey, JSON.stringify(data));
    }
  };

  const switchRole = async (role: string) => {
    if (!currentUser) return;
    const targetRole = role.toUpperCase() as User['role'];
    const { error } = await supabase
      .from('profiles')
      .update({ role: targetRole })
      .eq('id', currentUser.id);

    if (!error) {
      setCurrentUser(prev => prev ? { ...prev, role: targetRole } : null);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, role: targetRole } : u));
    }
  };

  const login = async (email: string, passwordHash: string): Promise<{ success: boolean; role?: User['role']; error?: string }> => {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password: passwordHash
    });

    if (error) {
      return { success: false, error: error.message };
    }

    let role: User['role'] | undefined = undefined;
    if (authData?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      if (profile) {
        role = profile.role;
        if (profile.email === 'admin@verikost.com') {
          role = 'ADMIN';
        } else if (
          profile.email === 'endang@verikost.com' || 
          profile.email === 'gunawan@verikost.com' || 
          profile.email === 'rudi@verikost.com'
        ) {
          role = 'OWNER';
        }
      }
    }

    await fetchSupabaseData();
    return { success: true, role };
  };

  const register = async (newUserFields: Omit<User, 'id' | 'createdAt'>): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await supabase.auth.signUp({
      email: newUserFields.email,
      password: newUserFields.passwordHash,
      options: {
        data: {
          fullName: newUserFields.fullName,
          phone: newUserFields.phone,
          role: newUserFields.role,
          profileImage: newUserFields.profileImage,
          university: newUserFields.university,
          faculty: newUserFields.faculty,
          major: newUserFields.major,
          occupation: newUserFields.occupation,
          kostName: newUserFields.kostName,
          kostAddress: newUserFields.kostAddress
        }
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          fullName: newUserFields.fullName,
          name: newUserFields.fullName,
          email: newUserFields.email,
          phone: newUserFields.phone,
          role: newUserFields.role,
          profileImage: newUserFields.profileImage,
          avatar: newUserFields.profileImage,
          university: newUserFields.university,
          faculty: newUserFields.faculty,
          major: newUserFields.major,
          occupation: newUserFields.occupation,
          kostName: newUserFields.kostName,
          kostAddress: newUserFields.kostAddress
        });

      if (profileError) {
        console.error('Database profile registration error:', profileError);
      }

      if (newUserFields.role === 'OWNER') {
        await submitOwnerVerification(data.user.id);
      }

      await fetchSupabaseData();
    }

    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setFavorites([]);
    setCompareList([]);
    setRecentlyViewed([]);
  };

  const updateProfile = async (profile: Partial<User>) => {
    if (!currentUser) return;
    const updatePayload = {
      ...profile,
      ...(profile.fullName ? { name: profile.fullName } : {}),
      ...(profile.profileImage ? { avatar: profile.profileImage } : {})
    };

    const { error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', currentUser.id);

    if (!error) {
      const mergedProfile = {
        ...profile,
        ...(profile.profileImage ? { avatar: profile.profileImage } : {})
      };
      setCurrentUser(prev => prev ? { ...prev, ...mergedProfile } : null);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...mergedProfile } : u));
    }
  };

  const adminUpdateProfile = async (userId: string, profile: Partial<User>) => {
    const updatePayload = {
      ...profile,
      ...(profile.fullName ? { name: profile.fullName } : {}),
      ...(profile.profileImage ? { avatar: profile.profileImage } : {})
    };

    const { error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId);

    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...profile } : u));
      if (currentUser && currentUser.id === userId) {
        setCurrentUser(prev => prev ? { ...prev, ...profile } : null);
      }
    }
  };

  const submitOwnerVerification = async (ownerId: string) => {
    const { data, error } = await supabase
      .from('owner_verifications')
      .insert({ ownerId, status: 'pending' })
      .select()
      .single();

    if (!error && data) {
      setOwnerVerifications(prev => [...prev, data]);
    }
  };

  const submitKostVerification = async (kostId: string) => {
    const { data, error } = await supabase
      .from('kost_verifications')
      .insert({ kostId, status: 'pending' })
      .select()
      .single();

    if (!error && data) {
      setKostVerifications(prev => [...prev, data]);
    }
  };

  const approveOwner = async (verificationId: string, status: 'approved' | 'rejected') => {
    const approvedAt = status === 'approved' ? new Date().toISOString().split('T')[0] : undefined;
    const { error } = await supabase
      .from('owner_verifications')
      .update({ status, approvedAt })
      .eq('id', verificationId);

    if (!error) {
      setOwnerVerifications(prev => 
        prev.map(ov => ov.id === verificationId ? { ...ov, status, approvedAt } : ov)
      );
    }
  };

  const approveKost = async (
    verificationId: string,
    status: 'approved' | 'rejected',
    badge: 'verified' | 'highly-trusted' = 'verified'
  ) => {
    const approvedAt = status === 'approved' ? new Date().toISOString().split('T')[0] : undefined;
    const targetVerif = kostVerifications.find(kv => kv.id === verificationId);
    if (!targetVerif) return;

    const { error } = await supabase
      .from('kost_verifications')
      .update({ status, approvedAt })
      .eq('id', verificationId);

    if (!error) {
      setKostVerifications(prev => 
        prev.map(kv => kv.id === verificationId ? { ...kv, status, approvedAt } : kv)
      );

      if (status === 'approved') {
        await supabase
          .from('kosts')
          .update({ verifiedStatus: badge })
          .eq('id', targetVerif.kostId);

        setKosts(prev => 
          prev.map(k => k.id === targetVerif.kostId ? { ...k, verifiedStatus: badge } : k)
        );
      }
    }
  };

  const moderateReview = async (reviewId: string, action: 'approve' | 'delete') => {
    if (action === 'delete') {
      const targetReview = reviews.find(r => r.id === reviewId);

      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (!error) {
        setReviews(prev => prev.filter(r => r.id !== reviewId));

        if (targetReview && targetReview.status === 'approved') {
          const updatedReviews = reviews.filter(r => r.id !== reviewId);
          const approvedKostReviews = updatedReviews.filter(r => r.kostId === targetReview.kostId && r.status === 'approved');
          const totalRating = approvedKostReviews.reduce((sum, r) => sum + r.rating, 0);
          const newAverage = approvedKostReviews.length > 0 ? Number((totalRating / approvedKostReviews.length).toFixed(1)) : 5.0;

          await supabase
            .from('kosts')
            .update({ rating: newAverage })
            .eq('id', targetReview.kostId);

          setKosts(prev =>
            prev.map(k => k.id === targetReview.kostId ? { ...k, rating: newAverage } : k)
          );
        }
      }
    } else if (action === 'approve') {
      const { error } = await supabase
        .from('reviews')
        .update({ status: 'approved' })
        .eq('id', reviewId);

      if (!error) {
        setReviews(prev =>
          prev.map(r => r.id === reviewId ? { ...r, status: 'approved' } : r)
        );

        const targetReview = reviews.find(r => r.id === reviewId);
        if (targetReview) {
          const updatedReviews = reviews.map(r => r.id === reviewId ? { ...r, status: 'approved' as const } : r);
          const approvedKostReviews = updatedReviews.filter(r => r.kostId === targetReview.kostId && r.status === 'approved');
          const totalRating = approvedKostReviews.reduce((sum, r) => sum + r.rating, 0);
          const newAverage = approvedKostReviews.length > 0 ? Number((totalRating / approvedKostReviews.length).toFixed(1)) : 5.0;

          await supabase
            .from('kosts')
            .update({ rating: newAverage })
            .eq('id', targetReview.kostId);

          setKosts(prev =>
            prev.map(k => k.id === targetReview.kostId ? { ...k, rating: newAverage } : k)
          );
        }
      }
    }
  };

  const updateUserRole = async (userId: string, role: User['role']) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
      if (currentUser && currentUser.id === userId) {
        setCurrentUser(prev => prev ? { ...prev, role } : null);
      }
    }
  };

  const deleteUser = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (!error) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      if (currentUser && currentUser.id === userId) {
        logout();
      }
    }
  };

  const resetUserPassword = async (userId: string, newPasswordPlain: string) => {
    console.log(`Password reset request for ${userId}`);
    const { data, error } = await supabase.rpc('admin_reset_user_password', {
      user_id: userId,
      new_password: newPasswordPlain
    });

    if (error) {
      console.error('Error invoking admin_reset_user_password:', error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Pengguna tidak ditemukan atau gagal mereset kata sandi.');
    }
  };

  const deleteKost = async (kostId: string) => {
    const { error } = await supabase
      .from('kosts')
      .delete()
      .eq('id', kostId);

    if (!error) {
      setKosts(prev => prev.filter(k => k.id !== kostId));
      setKostVerifications(prev => prev.filter(v => v.kostId !== kostId));
    }
  };

  const toggleFavorite = async (id: string) => {
    if (!currentUser) return;
    const isFav = favorites.includes(id);
    
    if (isFav) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('userId', currentUser.id)
        .eq('kostId', id);
      
      if (!error) {
        setFavorites(prev => prev.filter(item => item !== id));
      }
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({
          userId: currentUser.id,
          kostId: id
        });
      
      if (!error) {
        setFavorites(prev => [...prev, id]);
      }
    }
  };

  const toggleCompare = (id: string) => {
    setCompareList((prev) => {
      if (!prev.includes(id) && prev.length >= 3) {
        showToast('Anda hanya dapat membandingkan maksimal 3 kost secara bersamaan.', 'error');
        return prev;
      }
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      saveToStorage('vk_compare', updated, currentUser?.id || 'guest');
      return updated;
    });
  };

  const addToRecentlyViewed = (id: string) => {
    if (!currentUser) return;
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((item) => item !== id);
      const updated = [id, ...filtered].slice(0, 5);
      saveToStorage('vk_history', updated, currentUser.id);
      return updated;
    });
  };

  const addReview = async (kostId: string, userName: string, rating: number, comment: string) => {
    if (!currentUser) return;
    const newReview = {
      kostId,
      userName,
      userAvatar: currentUser.profileImage,
      rating,
      comment,
      verifiedTenant: currentUser.role === 'STUDENT',
      userId: currentUser.id,
      status: 'pending'
    };

    const { data, error } = await supabase
      .from('reviews')
      .insert(newReview)
      .select()
      .single();

    if (!error && data) {
      setReviews(prev => [data, ...prev]);
    }
  };

  const addKost = async (newKostData: Omit<Kost, 'id' | 'rating' | 'views' | 'ownerId' | 'ownerName' | 'ownerPhone'>) => {
    if (!currentUser) return;
    const newKost = {
      ...newKostData,
      rating: 5.0,
      views: 0,
      ownerId: currentUser.id,
      ownerName: currentUser.fullName,
      ownerPhone: currentUser.phone || '081234567890'
    };

    const { data, error } = await supabase
      .from('kosts')
      .insert(newKost)
      .select()
      .single();

    if (!error && data) {
      setKosts(prev => [data, ...prev]);
      await submitKostVerification(data.id);
    }
  };

  const updateKostAvailability = async (id: string, availability: 'available' | 'limited' | 'full') => {
    const { error } = await supabase
      .from('kosts')
      .update({ roomAvailability: availability })
      .eq('id', id);

    if (!error) {
      setKosts(prev => 
        prev.map(k => k.id === id ? { ...k, roomAvailability: availability } : k)
      );
    }
  };

  const addInquiry = async (kostId: string, message: string) => {
    if (!currentUser) return;
    const targetKost = kosts.find(k => k.id === kostId);
    const newInquiry = {
      kostId,
      kostName: targetKost ? targetKost.name : 'Unknown Kost',
      studentName: currentUser.fullName,
      studentEmail: currentUser.email,
      studentPhone: currentUser.phone || '081233445566',
      message,
      status: 'pending',
      studentId: currentUser.id
    };

    const { data, error } = await supabase
      .from('inquiries')
      .insert(newInquiry)
      .select()
      .single();

    if (!error && data) {
      setInquiries(prev => [data, ...prev]);
    }
  };

  const updateInquiryStatus = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('inquiries')
      .update({ status })
      .eq('id', id);

    if (!error) {
      setInquiries(prev => 
        prev.map(inq => inq.id === id ? { ...inq, status } : inq)
      );
    }
  };

  return (
    <AppContext.Provider
      value={{
        kosts,
        reviews,
        inquiries,
        favorites,
        compareList,
        recentlyViewed,
        currentUser,
        authLoading,
        users,
        ownerVerifications,
        kostVerifications,
        switchRole,
        toggleFavorite,
        toggleCompare,
        addToRecentlyViewed,
        addReview,
        addKost,
        updateKostAvailability,
        addInquiry,
        updateInquiryStatus,
        login,
        register,
        logout,
        updateProfile,
        adminUpdateProfile,
        submitOwnerVerification,
        submitKostVerification,
        approveOwner,
        approveKost,
        moderateReview,
        updateUserRole,
        deleteUser,
        resetUserPassword,
        deleteKost,
        toast,
        showToast
      }}
    >
      {children}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[9999] max-w-sm w-full bg-white dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-2xl shadow-2xl p-4 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30'
              : toast.type === 'error'
              ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/30'
              : 'bg-blue-50 text-blue-500 dark:bg-blue-950/30'
          }`}>
            {toast.type === 'success' ? (
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            ) : toast.type === 'error' ? (
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
          </div>
          <div className="flex-1 text-xs font-bold text-slate-800 dark:text-slate-200 leading-normal">
            {toast.message}
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
