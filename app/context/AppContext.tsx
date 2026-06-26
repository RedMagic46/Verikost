'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Kost, 
  Review, 
  Inquiry, 
  User, 
  OwnerVerification, 
  KostVerification,
  Room,
  Tenant,
  Invoice,
  BookingPayment,
  Referral,
  PlatformSettings,
  OwnerPayment,
  Campus
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
  rooms: Room[];
  tenants: Tenant[];
  invoices: Invoice[];
  bookingPayments: BookingPayment[];
  referrals: Referral[];
  platformSettings: PlatformSettings;
  campuses: Campus[];
  distanceOverrides: Record<string, Record<string, number>>;
  updateCampuses: (newCampuses: Campus[]) => Promise<void>;
  updateDistanceOverrides: (newOverrides: Record<string, Record<string, number>>) => Promise<void>;
  getKostCoordinates: (kost: Kost) => [number, number];
  getKostDistance: (kost: Kost, campusId: string) => number;
  switchRole: (role: string) => void;
  toggleFavorite: (id: string) => void;
  toggleCompare: (id: string) => void;
  addToRecentlyViewed: (id: string) => void;
  addReview: (kostId: string, userName: string, rating: number, comment: string) => Promise<void>;
  addKost: (kost: Omit<Kost, 'id' | 'rating' | 'views' | 'ownerId' | 'ownerName' | 'ownerPhone'>) => Promise<string | null>;
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
  scheduleKostVerification: (verificationId: string, price: number, visitDate: string) => Promise<void>;
  approveOwner: (verificationId: string, status: 'approved' | 'rejected') => Promise<void>;
  approveKost: (verificationId: string, status: 'approved' | 'rejected', badge?: 'verified' | 'highly-trusted', expiredAt?: string) => Promise<void>;
  adminVerifyKostDirectly: (kostId: string, badge?: 'verified' | 'highly-trusted', expiredAt?: string) => Promise<void>;
  moderateReview: (reviewId: string, action: 'approve' | 'delete') => Promise<void>;
  updateUserRole: (userId: string, role: User['role']) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  resetUserPassword: (userId: string, newPasswordPlain: string) => Promise<void>;
  deleteKost: (kostId: string) => Promise<void>;
  
  // Kamar CRUD
  addRoom: (room: Omit<Room, 'id'>) => Promise<void>;
  updateRoom: (id: string, room: Partial<Room>) => Promise<void>;
  deleteRoom: (roomId: string) => Promise<void>;
  bulkUpdateRoomStatus: (roomIds: string[], status: Room['status']) => Promise<void>;

  // Penyewa CRUD
  addTenant: (tenant: Omit<Tenant, 'id'>) => Promise<void>;
  updateTenant: (id: string, tenant: Partial<Tenant>) => Promise<void>;
  deleteTenant: (tenantId: string) => Promise<void>;

  // Invoices/Tagihan CRUD
  addInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<void>;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (invoiceId: string) => Promise<void>;
  bulkGenerateInvoices: (kostId: string, month: string, year: string, dueDate: string) => Promise<void>;

  // Review Replies
  replyToReview: (reviewId: string, replyText: string) => Promise<void>;
  
  createBookingPayment: (inquiryId: string) => Promise<void>;
  executeMockPayment: (paymentId: string, method: string) => Promise<void>;
  updateReferralCode: (newCode: string) => Promise<boolean>;
  updatePlatformSettings: (settings: PlatformSettings) => Promise<void>;
  claimReferralReward: (referralId: string, rewardType: 'small' | 'transaction') => Promise<void>;

  incrementKostViews: (kostId: string) => Promise<void>;

  ownerPayments: OwnerPayment[];
  createOwnerPayment: (paymentType: 'subscription' | 'promotion' | 'verification', amount: number, durationDays: number, kostId?: string | null) => Promise<string | null>;
  executeMockOwnerPayment: (paymentId: string, method: string) => Promise<void>;
  adminAdjustOwnerPayment: (paymentId: string, updates: Partial<OwnerPayment>) => Promise<void>;
  adminAdjustReferral: (referralId: string, updates: Partial<Referral>) => Promise<void>;
  adminAdjustOwnerSubscription: (ownerId: string, expiresAt: string | null) => Promise<void>;
  adminAdjustKostPromotion: (kostId: string, expiresAt: string | null) => Promise<void>;

  // Parent-Student Linking & Payment
  generateParentCode: () => Promise<void>;
  linkChild: (code: string) => Promise<boolean>;
  unlinkChild: () => Promise<void>;
  payInvoice: (invoiceId: string, paymentMethod: string, voucherCode?: string, discountAmount?: number) => Promise<void>;

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
  const currentUserRef = React.useRef<User | null>(null);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);
  const [authLoading, setAuthLoading] = useState(true);
  const [ownerVerifications, setOwnerVerifications] = useState<OwnerVerification[]>([]);
  const [kostVerifications, setKostVerifications] = useState<KostVerification[]>([]);
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  const [bookingPayments, setBookingPayments] = useState<BookingPayment[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    commissionType: 'flat',
    commissionValue: 0,
    commissionChargedTo: 'student',
    smallReferralReward: 'Voucher Diskon Rp 10.000',
    transactionReferralReward: 'Voucher Diskon Rp 50.000',
    ownerSubscriptionRate: 3000,
    ownerPromotionRate: 5000
  });

  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [distanceOverrides, setDistanceOverrides] = useState<Record<string, Record<string, number>>>({});

  const DEFAULT_CAMPUSES: Campus[] = [
    { id: 'ub', name: 'Universitas Brawijaya (UB)', latitude: -7.9525, longitude: 112.6144, isVisible: true },
    { id: 'um', name: 'Universitas Negeri Malang (UM)', latitude: -7.9626, longitude: 112.6175, isVisible: true },
    { id: 'umm', name: 'Universitas Muhammadiyah Malang (UMM)', latitude: -7.9213, longitude: 112.5976, isVisible: true }
  ];
  
  const [ownerPayments, setOwnerPayments] = useState<OwnerPayment[]>([]);
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

      let finalKosts = dbKosts || [];
      const finalKostVerifs = dbKostVerifs || [];

      if (dbKosts) {
        finalKosts = dbKosts.map(kost => {
          const verifs = finalKostVerifs.filter(v => v.kostId === kost.id);
          if (verifs.length === 0) {
            return { ...kost, verifiedStatus: 'none', verifiedExpiresAt: null };
          }
          const latest = [...verifs].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0];
          
          const isApproved = latest.status === 'approved';
          const isExpired = latest.expiredAt && new Date(latest.expiredAt) < new Date();

          if (isApproved && !isExpired) {
            return { 
              ...kost, 
              verifiedStatus: (kost.verifiedStatus === 'highly-trusted' ? 'highly-trusted' : 'verified'),
              verifiedExpiresAt: latest.expiredAt
            };
          }
          return { ...kost, verifiedStatus: 'none', verifiedExpiresAt: latest.expiredAt || null };
        });
      }

      if (dbKosts) setKosts(finalKosts);
      if (dbReviews) setReviews(dbReviews);
      if (dbInquiries) setInquiries(dbInquiries);
      if (dbOwnerVerifs) setOwnerVerifications(dbOwnerVerifs);
      if (dbKostVerifs) setKostVerifications(dbKostVerifs);
      if (dbProfiles) setUsers(dbProfiles);

      // Fetch new tables safely with separate try-catches
      try {
        const { data: dbRooms } = await supabase
          .from('rooms')
          .select('*')
          .order('createdAt', { ascending: false });
        if (dbRooms) setRooms(dbRooms);
      } catch (err) {
        console.warn('Rooms table might not exist yet:', err);
      }

      try {
        const { data: dbTenants } = await supabase
          .from('tenants')
          .select('*')
          .order('createdAt', { ascending: false });
        if (dbTenants) setTenants(dbTenants);
      } catch (err) {
        console.warn('Tenants table might not exist yet:', err);
      }

      try {
        const { data: dbInvoices } = await supabase
          .from('invoices')
          .select('*')
          .order('createdAt', { ascending: false });
        if (dbInvoices) setInvoices(dbInvoices);
      } catch (err) {
        console.warn('Invoices table might not exist yet:', err);
      }

      try {
        const { data: dbBookingPayments } = await supabase
          .from('booking_payments')
          .select('*')
          .order('createdAt', { ascending: false });
        if (dbBookingPayments) setBookingPayments(dbBookingPayments);
      } catch (err) {
        console.warn('booking_payments table might not exist yet:', err);
      }

      try {
        const { data: dbReferrals } = await supabase
          .from('referrals')
          .select('*')
          .order('createdAt', { ascending: false });
        
        if (dbReferrals) {
          // Fetch referred user details for UI display
          const { data: dbProfiles } = await supabase
            .from('profiles')
            .select('id, fullName, email');
          
          const profilesMap = new Map((dbProfiles || []).map(p => [p.id, p]));
          const referralsWithDetails = dbReferrals.map(ref => {
            const profile = profilesMap.get(ref.referredId);
            return {
              ...ref,
              referredName: profile?.fullName || 'Siswa Terdaftar',
              referredEmail: profile?.email || ''
            };
          });
          setReferrals(referralsWithDetails);
        }
      } catch (err) {
        console.warn('referrals table might not exist yet:', err);
      }

      try {
        const { data: dbPlatformSettings } = await supabase
          .from('platform_settings')
          .select('*');
        if (dbPlatformSettings && dbPlatformSettings.length > 0) {
          const settingsObj: Partial<PlatformSettings> = {};
          let dbCampuses: Campus[] | null = null;
          let dbOverrides: Record<string, Record<string, number>> | null = null;

          dbPlatformSettings.forEach((item) => {
            if (item.key === 'commissionType') settingsObj.commissionType = item.value as any;
            if (item.key === 'commissionValue') settingsObj.commissionValue = Number(item.value);
            if (item.key === 'commissionChargedTo') settingsObj.commissionChargedTo = item.value as any;
            if (item.key === 'smallReferralReward') settingsObj.smallReferralReward = item.value;
            if (item.key === 'transactionReferralReward') settingsObj.transactionReferralReward = item.value;
            if (item.key === 'ownerSubscriptionRate') settingsObj.ownerSubscriptionRate = Number(item.value);
            if (item.key === 'ownerPromotionRate') settingsObj.ownerPromotionRate = Number(item.value);
            if (item.key === 'campuses') {
              try {
                dbCampuses = JSON.parse(item.value);
              } catch (e) {
                console.error("Gagal parse campuses:", e);
              }
            }
            if (item.key === 'distance_overrides') {
              try {
                dbOverrides = JSON.parse(item.value);
              } catch (e) {
                console.error("Gagal parse distance_overrides:", e);
              }
            }
          });
          setPlatformSettings(prev => ({ ...prev, ...settingsObj }));
          if (dbCampuses) {
            setCampuses(dbCampuses);
          } else {
            setCampuses(DEFAULT_CAMPUSES);
          }
          if (dbOverrides) {
            setDistanceOverrides(dbOverrides);
          }
        } else {
          setCampuses(DEFAULT_CAMPUSES);
        }
      } catch (err) {
        console.warn('platform_settings table might not exist yet:', err);
        setCampuses(DEFAULT_CAMPUSES);
      }

      try {
        const { data: dbOwnerPayments } = await supabase
          .from('owner_payments')
          .select('*')
          .order('createdAt', { ascending: false });
        if (dbOwnerPayments) setOwnerPayments(dbOwnerPayments);
      } catch (err) {
        console.warn('owner_payments table might not exist yet:', err);
      }
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
      if (!currentUserRef.current || currentUserRef.current.id !== userId) {
        setAuthLoading(true);
      }
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
    // Lookup referrer id for signup
    let referrerId: string | null = null;
    if (newUserFields.role === 'STUDENT' && newUserFields.referredBy) {
      const { data: refProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('referralCode', newUserFields.referredBy.toLowerCase().trim())
        .single();
      if (refProfile) {
        referrerId = refProfile.id;
      }
    }

    const generatedCode = newUserFields.role === 'STUDENT'
      ? newUserFields.fullName.toLowerCase().replace(/\s+/g, '') + '-' + Math.random().toString(36).substring(2, 6)
      : null;

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
          kostAddress: newUserFields.kostAddress,
          referredByCode: newUserFields.referredBy || null
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
          kostAddress: newUserFields.kostAddress,
          referralCode: generatedCode,
          referredBy: referrerId
        });

      if (profileError) {
        console.error('Database profile registration error:', profileError);
      }

      if (referrerId) {
        // Create a referral reward tracking record (Tier 1 is active on sign up, status starts as pending but is created)
        const { error: refError } = await supabase
          .from('referrals')
          .insert({
            referrerId,
            referredId: data.user.id,
            smallRewardStatus: 'pending',
            transactionRewardStatus: 'pending'
          });
        if (refError) {
          console.error('Referral record creation error:', refError);
        }
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
      setKosts(prev => 
        prev.map(k => k.id === kostId ? { ...k, verifiedStatus: 'none' } : k)
      );
    }
  };

  const scheduleKostVerification = async (
    verificationId: string,
    price: number,
    visitDate: string
  ) => {
    const { error } = await supabase
      .from('kost_verifications')
      .update({
        status: 'scheduled',
        price,
        visitDate
      })
      .eq('id', verificationId);

    if (!error) {
      setKostVerifications(prev => 
        prev.map(kv => kv.id === verificationId ? { ...kv, status: 'scheduled', price, visitDate } : kv)
      );
      showToast('Jadwal kunjungan survey berhasil ditentukan.', 'success');
    } else {
      console.error('Error scheduling verification:', error);
      showToast('Gagal menentukan jadwal: ' + error.message, 'error');
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
    badge: 'verified' | 'highly-trusted' = 'verified',
    expiredAt?: string
  ) => {
    const approvedAt = status === 'approved' ? new Date().toISOString().split('T')[0] : undefined;
    const targetVerif = kostVerifications.find(kv => kv.id === verificationId);
    if (!targetVerif) return;

    const updates: Partial<KostVerification> = { status, approvedAt };
    if (status === 'approved' && expiredAt) {
      updates.expiredAt = expiredAt;
    }

    const { error } = await supabase
      .from('kost_verifications')
      .update(updates)
      .eq('id', verificationId);

    if (!error) {
      setKostVerifications(prev => 
        prev.map(kv => kv.id === verificationId ? { ...kv, ...updates } : kv)
      );

      const nextStatus = status === 'approved' ? badge : 'none';
      await supabase
        .from('kosts')
        .update({ verifiedStatus: nextStatus })
        .eq('id', targetVerif.kostId);

      setKosts(prev => 
        prev.map(k => k.id === targetVerif.kostId ? { 
          ...k, 
          verifiedStatus: nextStatus,
          verifiedExpiresAt: status === 'approved' ? (expiredAt || null) : null
        } : k)
      );
    }
  };

  const adminVerifyKostDirectly = async (
    kostId: string,
    badge: 'verified' | 'highly-trusted' = 'verified',
    expiredAt?: string
  ) => {
    const now = new Date().toISOString();
    const approvedAt = now.split('T')[0];

    const newVerif = {
      kostId,
      status: 'approved' as const,
      submittedAt: now,
      approvedAt,
      price: 0,
      visitDate: approvedAt,
      expiredAt
    };

    const { data: verifData, error: verifError } = await supabase
      .from('kost_verifications')
      .insert(newVerif)
      .select()
      .single();

    if (verifError) {
      console.error('Error creating direct verification:', verifError);
      showToast('Gagal memproses verifikasi langsung: ' + verifError.message, 'error');
      return;
    }

    if (verifData) {
      setKostVerifications(prev => [verifData, ...prev]);

      const { error: kostError } = await supabase
        .from('kosts')
        .update({ 
          verifiedStatus: badge,
          verifiedExpiresAt: expiredAt || null
        })
        .eq('id', kostId);

      if (!kostError) {
        setKosts(prev => 
          prev.map(k => k.id === kostId ? { 
            ...k, 
            verifiedStatus: badge,
            verifiedExpiresAt: expiredAt || null
          } : k)
        );
        showToast('Kost berhasil diverifikasi langsung!', 'success');
      } else {
        console.error('Error updating kost verified status:', kostError);
        showToast('Gagal memperbarui status verifikasi kost.', 'error');
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
          const newAverage = approvedKostReviews.length > 0 ? Number((totalRating / approvedKostReviews.length).toFixed(1)) : null;

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
          const newAverage = approvedKostReviews.length > 0 ? Number((totalRating / approvedKostReviews.length).toFixed(1)) : null;

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

    if (error) {
      console.error('Error deleting kost:', error);
      showToast('Gagal menghapus kost: ' + error.message, 'error');
      throw error;
    }
    setKosts(prev => prev.filter(k => k.id !== kostId));
    showToast('Kost berhasil dihapus.', 'success');
  };

  // Kamar CRUD
  const addRoom = async (roomData: Omit<Room, 'id'>) => {
    const { data, error } = await supabase
      .from('rooms')
      .insert(roomData)
      .select()
      .single();
    if (error) {
      console.error('Error adding room:', error);
      showToast('Gagal menambahkan kamar: ' + error.message, 'error');
      throw error;
    }
    if (data) {
      setRooms(prev => [...prev, data]);
      showToast('Kamar berhasil ditambahkan.', 'success');
    }
  };

  const updateRoom = async (id: string, roomData: Partial<Room>) => {
    const { data, error } = await supabase
      .from('rooms')
      .update(roomData)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Error updating room:', error);
      showToast('Gagal memperbarui kamar: ' + error.message, 'error');
      throw error;
    }
    if (data) {
      setRooms(prev => prev.map(r => r.id === id ? data : r));
      showToast('Kamar berhasil diperbarui.', 'success');
    }
  };

  const deleteRoom = async (roomId: string) => {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', roomId);
    if (error) {
      console.error('Error deleting room:', error);
      showToast('Gagal menghapus kamar: ' + error.message, 'error');
      throw error;
    }
    setRooms(prev => prev.filter(r => r.id !== roomId));
    showToast('Kamar berhasil dihapus.', 'success');
  };

  const bulkUpdateRoomStatus = async (roomIds: string[], status: Room['status']) => {
    const { error } = await supabase
      .from('rooms')
      .update({ status })
      .in('id', roomIds);
    if (error) {
      console.error('Error bulk updating room status:', error);
      showToast('Gagal memperbarui status kamar: ' + error.message, 'error');
      throw error;
    }
    setRooms(prev => prev.map(r => roomIds.includes(r.id) ? { ...r, status } : r));
    showToast('Status kamar berhasil diperbarui.', 'success');
  };

  // Penyewa CRUD
  const addTenant = async (tenantData: Omit<Tenant, 'id'>) => {
    const { data, error } = await supabase
      .from('tenants')
      .insert(tenantData)
      .select()
      .single();
    if (error) {
      console.error('Error adding tenant:', error);
      showToast('Gagal menambahkan penyewa: ' + error.message, 'error');
      throw error;
    }
    if (data) {
      setTenants(prev => [...prev, data]);
      // If roomId is set and status is 'active', automatically set room status to 'occupied'
      if (tenantData.roomId && tenantData.status === 'active') {
        await updateRoom(tenantData.roomId, { status: 'occupied' });
      }
      showToast('Penyewa berhasil ditambahkan.', 'success');
    }
  };

  const updateTenant = async (id: string, tenantData: Partial<Tenant>) => {
    const oldTenant = tenants.find(t => t.id === id);
    const { data, error } = await supabase
      .from('tenants')
      .update(tenantData)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Error updating tenant:', error);
      showToast('Gagal memperbarui penyewa: ' + error.message, 'error');
      throw error;
    }
    if (data) {
      setTenants(prev => prev.map(t => t.id === id ? data : t));
      // Handle room status changes
      if (oldTenant && tenantData.roomId !== undefined && oldTenant.roomId !== tenantData.roomId) {
        // Free old room if active
        if (oldTenant.roomId) {
          await updateRoom(oldTenant.roomId, { status: 'available' });
        }
        // Occupy new room if active
        if (tenantData.roomId && data.status === 'active') {
          await updateRoom(tenantData.roomId, { status: 'occupied' });
        }
      } else if (oldTenant && tenantData.status !== undefined && oldTenant.status !== tenantData.status) {
        if (data.status === 'active' && data.roomId) {
          await updateRoom(data.roomId, { status: 'occupied' });
        } else if (data.status === 'moved_out' && data.roomId) {
          await updateRoom(data.roomId, { status: 'available' });
        }
      }
      showToast('Penyewa berhasil diperbarui.', 'success');
    }
  };

  const deleteTenant = async (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    const { error } = await supabase
      .from('tenants')
      .delete()
      .eq('id', tenantId);
    if (error) {
      console.error('Error deleting tenant:', error);
      showToast('Gagal menghapus penyewa: ' + error.message, 'error');
      throw error;
    }
    setTenants(prev => prev.filter(t => t.id !== tenantId));
    if (tenant && tenant.roomId && tenant.status === 'active') {
      await updateRoom(tenant.roomId, { status: 'available' });
    }
    showToast('Penyewa berhasil dihapus.', 'success');
  };

  // Invoices/Tagihan CRUD
  const addInvoice = async (invoiceData: Omit<Invoice, 'id'>) => {
    const { data, error } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();
    if (error) {
      console.error('Error adding invoice:', error);
      showToast('Gagal menambahkan tagihan: ' + error.message, 'error');
      throw error;
    }
    if (data) {
      setInvoices(prev => [...prev, data]);
      showToast('Tagihan berhasil dibuat.', 'success');
    }
  };

  const updateInvoice = async (id: string, invoiceData: Partial<Invoice>) => {
    const { data, error } = await supabase
      .from('invoices')
      .update(invoiceData)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Error updating invoice:', error);
      showToast('Gagal memperbarui tagihan: ' + error.message, 'error');
      throw error;
    }
    if (data) {
      setInvoices(prev => prev.map(inv => inv.id === id ? data : inv));
      showToast('Tagihan berhasil diperbarui.', 'success');
    }
  };

  const deleteInvoice = async (invoiceId: string) => {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId);
    if (error) {
      console.error('Error deleting invoice:', error);
      showToast('Gagal menghapus tagihan: ' + error.message, 'error');
      throw error;
    }
    setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
    showToast('Tagihan berhasil dihapus.', 'success');
  };

  const bulkGenerateInvoices = async (kostId: string, month: string, year: string, dueDate: string) => {
    const activeTenants = tenants.filter(t => t.kostId === kostId && t.status === 'active');
    if (activeTenants.length === 0) {
      showToast('Tidak ada penyewa aktif untuk kost ini.', 'error');
      return;
    }

    const tenantsToBill = activeTenants.filter(t => {
      const alreadyHasInvoice = invoices.some(inv => 
        inv.tenantId === t.id && 
        inv.periodMonth === month && 
        inv.periodYear === year
      );
      return !alreadyHasInvoice;
    });

    if (tenantsToBill.length === 0) {
      showToast('Semua penyewa aktif sudah memiliki tagihan untuk periode ini.', 'info');
      return;
    }

    const newInvoicesPayload = tenantsToBill.map(t => {
      const room = rooms.find(r => r.id === t.roomId);
      const amount = room ? room.price : (kosts.find(k => k.id === kostId)?.price || 1000000);
      
      return {
        tenantId: t.id,
        roomId: t.roomId || null,
        kostId: kostId,
        periodMonth: month,
        periodYear: year,
        amount: amount,
        dueDate: dueDate,
        status: 'unpaid' as const,
        notes: `Tagihan bulanan otomatis untuk periode ${month}/${year}`
      };
    });

    const { data, error } = await supabase
      .from('invoices')
      .insert(newInvoicesPayload)
      .select();

    if (error) {
      console.error('Error bulk generating invoices:', error);
      showToast('Gagal membuat tagihan: ' + error.message, 'error');
      throw error;
    }

    if (data) {
      setInvoices(prev => [...prev, ...data]);
      showToast(`${data.length} tagihan berhasil dibuat untuk periode ${month}/${year}.`, 'success');
    }
  };

  // Balas Review
  const replyToReview = async (reviewId: string, replyText: string) => {
    const { error } = await supabase
      .from('reviews')
      .update({ ownerReply: replyText })
      .eq('id', reviewId);

    if (error) {
      console.error('Error replying to review:', error);
      showToast('Gagal menyimpan balasan: ' + error.message, 'error');
      throw error;
    }

    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, ownerReply: replyText } : r));
    showToast('Balasan ulasan berhasil disimpan.', 'success');
  };

  const incrementKostViews = async (kostId: string) => {
    try {
      const { data, error } = await supabase
        .from('kosts')
        .select('views')
        .eq('id', kostId)
        .single();
        
      if (!error && data) {
        const nextViews = (data.views || 0) + 1;
        await supabase
          .from('kosts')
          .update({ views: nextViews })
          .eq('id', kostId);
          
        setKosts(prev => 
          prev.map(k => k.id === kostId ? { ...k, views: nextViews } : k)
        );
      }
    } catch (err) {
      console.error('Error incrementing views:', err);
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

  const getKostCoordinates = (kost: Kost): [number, number] => {
    if (kost.latitude && kost.longitude) {
      return [Number(kost.latitude), Number(kost.longitude)];
    }
    const coords: Record<string, [number, number]> = {
      'kost-1': [-7.9495, 112.6155],
      'kost-2': [-7.9452, 112.6225],
      'kost-3': [-7.9575, 112.6085],
      'kost-4': [-7.9235, 112.5955],
      'kost-5': [-7.9185, 112.5895],
      'kost-6': [-7.9605, 112.6125],
    };
    if (coords[kost.id]) return coords[kost.id];
    let hash = 0;
    for (let i = 0; i < kost.id.length; i++) {
      hash = kost.id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const latOffset = ((Math.abs(hash) % 400) - 200) / 10000;
    const lngOffset = ((Math.abs(hash >> 2) % 400) - 200) / 10000;
    return [-7.95 + latOffset, 112.61 + lngOffset];
  };

  const getKostDistance = (kost: Kost, campusId: string): number => {
    if (distanceOverrides[kost.id]?.[campusId] !== undefined) {
      return distanceOverrides[kost.id][campusId];
    }
    if (campusId === 'ub' && kost.distanceToUB > 0) return kost.distanceToUB;
    if (campusId === 'um' && kost.distanceToUM > 0) return kost.distanceToUM;
    if (campusId === 'umm' && kost.distanceToUMM > 0) return kost.distanceToUMM;

    const campus = campuses.find(c => c.id === campusId);
    if (!campus) return 0;

    const kostCoords = getKostCoordinates(kost);
    const dLat = (kostCoords[0] - campus.latitude) * 111.12;
    const dLng = (kostCoords[1] - campus.longitude) * 110.06;
    return Number(Math.sqrt(dLat * dLat + dLng * dLng).toFixed(1));
  };

  const updateCampuses = async (newCampuses: Campus[]) => {
    setCampuses(newCampuses);
    try {
      const { error } = await supabase
        .from('platform_settings')
        .upsert({ key: 'campuses', value: JSON.stringify(newCampuses) });
      if (error) throw error;
    } catch (err: any) {
      showToast('Gagal menyimpan daftar kampus ke database: ' + err.message, 'error');
    }
  };

  const updateDistanceOverrides = async (newOverrides: Record<string, Record<string, number>>) => {
    setDistanceOverrides(newOverrides);
    try {
      const { error } = await supabase
        .from('platform_settings')
        .upsert({ key: 'distance_overrides', value: JSON.stringify(newOverrides) });
      if (error) throw error;
    } catch (err: any) {
      showToast('Gagal menyimpan data override jarak ke database: ' + err.message, 'error');
    }
  };

  const addKost = async (newKostData: Omit<Kost, 'id' | 'rating' | 'views' | 'ownerId' | 'ownerName' | 'ownerPhone'>): Promise<string | null> => {
    if (!currentUser) return null;
    const newKost = {
      ...newKostData,
      rating: null,
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
      return data.id;
    }
    return null;
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

  const createBookingPayment = async (inquiryId: string) => {
    try {
      const inquiry = inquiries.find(i => i.id === inquiryId);
      if (!inquiry) {
        showToast('Inquiry tidak ditemukan.', 'error');
        return;
      }
      
      const kost = kosts.find(k => k.id === inquiry.kostId);
      if (!kost) {
        showToast('Kost tidak ditemukan.', 'error');
        return;
      }

      const dpAmount = kost.bookingDpAmount || 0;
      if (dpAmount <= 0) {
        showToast('Kost ini tidak memerlukan pembayaran DP.', 'info');
        return;
      }

      const commissionAmount = 0;

      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const newPayment = {
        inquiryId,
        studentId: inquiry.studentId,
        kostId: inquiry.kostId,
        roomId: null,
        dpAmount,
        commissionAmount,
        status: 'pending' as const,
        expiresAt
      };

      const { data, error } = await supabase
        .from('booking_payments')
        .insert(newPayment)
        .select()
        .single();

      if (error) {
        console.error('Error creating booking payment:', error);
        showToast('Gagal membuat tagihan DP: ' + error.message, 'error');
        return;
      }

      if (data) {
        setBookingPayments(prev => [data, ...prev]);
        showToast('Tagihan pembayaran DP sebesar ' + new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(dpAmount) + ' telah dibuat.', 'success');
      }
    } catch (err: any) {
      console.error(err);
      showToast('Terjadi kesalahan saat membuat tagihan.', 'error');
    }
  };

  const executeMockPayment = async (paymentId: string, method: string) => {
    try {
      const payment = bookingPayments.find(p => p.id === paymentId);
      if (!payment) {
        showToast('Tagihan pembayaran tidak ditemukan.', 'error');
        return;
      }

      const paidAt = new Date().toISOString();
      const { data: updatedPayment, error: payError } = await supabase
        .from('booking_payments')
        .update({
          status: 'paid' as const,
          paidAt,
          paymentMethod: method
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (payError || !updatedPayment) {
        console.error('Payment execution error:', payError);
        showToast('Gagal memproses pembayaran: ' + payError?.message, 'error');
        return;
      }

      // Update related inquiry status to 'approved'
      await supabase
        .from('inquiries')
        .update({ status: 'approved' })
        .eq('id', payment.inquiryId);

      // Check if student has a referrer
      const { data: studentProfile } = await supabase
        .from('profiles')
        .select('referredBy')
        .eq('id', payment.studentId)
        .single();

      if (studentProfile && studentProfile.referredBy) {
        const { data: refRecord } = await supabase
          .from('referrals')
          .select('*')
          .eq('referrerId', studentProfile.referredBy)
          .eq('referredId', payment.studentId)
          .single();

        if (refRecord) {
          if (refRecord.transactionRewardStatus === 'pending') {
            await supabase
              .from('referrals')
              .update({ transactionRewardStatus: 'earned' })
              .eq('id', refRecord.id);
          }
        }
      }

      // Update state local variables
      setBookingPayments(prev => prev.map(p => p.id === paymentId ? updatedPayment : p));
      setInquiries(prev => prev.map(i => i.id === payment.inquiryId ? { ...i, status: 'approved' as const } : i));
      
      showToast('Pembayaran booking DP berhasil diproses!', 'success');
      await fetchSupabaseData();
    } catch (err: any) {
      console.error(err);
      showToast('Terjadi kesalahan saat memproses pembayaran.', 'error');
    }
  };

  const updateReferralCode = async (newCode: string): Promise<boolean> => {
    if (!currentUser) return false;
    const formattedCode = newCode.toLowerCase().replace(/\s+/g, '').trim();
    if (!formattedCode) {
      showToast('Kode referral tidak boleh kosong.', 'error');
      return false;
    }

    try {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('referralCode', formattedCode)
        .neq('id', currentUser.id);

      if (existingUser && existingUser.length > 0) {
        showToast('Kode referral "' + formattedCode + '" sudah digunakan oleh mahasiswa lain.', 'error');
        return false;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ referralCode: formattedCode })
        .eq('id', currentUser.id);

      if (error) {
        console.error('Error updating referral code:', error);
        showToast('Gagal memperbarui kode referral: ' + error.message, 'error');
        return false;
      }

      setCurrentUser(prev => prev ? { ...prev, referralCode: formattedCode } : null);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, referralCode: formattedCode } : u));
      showToast('Kode referral berhasil diperbarui!', 'success');
      return true;
    } catch (err: any) {
      console.error(err);
      showToast('Terjadi kesalahan.', 'error');
      return false;
    }
  };

  const updatePlatformSettings = async (settings: PlatformSettings) => {
    try {
      const keys = Object.keys(settings) as Array<keyof PlatformSettings>;
      
      const promises = keys.map(async (key) => {
        return supabase
          .from('platform_settings')
          .upsert({
            key,
            value: settings[key].toString()
          });
      });

      await Promise.all(promises);
      
      setPlatformSettings(settings);
      showToast('Pengaturan platform berhasil diperbarui.', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Gagal memperbarui pengaturan platform.', 'error');
    }
  };

  const claimReferralReward = async (referralId: string, rewardType: 'small' | 'transaction') => {
    try {
      const updateField = rewardType === 'small' 
        ? { smallRewardStatus: 'claimed' as const } 
        : { transactionRewardStatus: 'claimed' as const };

      const { error } = await supabase
        .from('referrals')
        .update(updateField)
        .eq('id', referralId);

      if (error) {
        showToast('Gagal mengklaim reward: ' + error.message, 'error');
        return;
      }

      setReferrals(prev => prev.map(r => r.id === referralId ? { ...r, ...updateField } : r));
      const rewardDesc = rewardType === 'small' ? platformSettings.smallReferralReward : platformSettings.transactionReferralReward;
      showToast(`Sukses klaim reward! Kode voucher [${rewardDesc}] telah diaktifkan di akun Anda.`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Terjadi kesalahan saat mengklaim reward.', 'error');
    }
  };

  const createOwnerPayment = async (
    paymentType: 'subscription' | 'promotion' | 'verification', 
    amount: number, 
    durationDays: number, 
    kostId: string | null = null
  ): Promise<string | null> => {
    if (!currentUser) return null;
    try {
      const newPayment = {
        ownerId: currentUser.id,
        kostId,
        amount,
        paymentType,
        status: 'pending' as const,
        durationDays
      };
      const { data, error } = await supabase
        .from('owner_payments')
        .insert(newPayment)
        .select()
        .single();

      if (error) {
        console.error('Error creating owner payment:', error);
        showToast('Gagal membuat tagihan pembayaran: ' + error.message, 'error');
        return null;
      }

      if (data) {
        setOwnerPayments(prev => [data, ...prev]);
        return data.id;
      }
    } catch (err) {
      console.error(err);
      showToast('Terjadi kesalahan saat membuat tagihan.', 'error');
    }
    return null;
  };

  const executeMockOwnerPayment = async (paymentId: string, method: string) => {
    try {
      const payment = ownerPayments.find(p => p.id === paymentId);
      if (!payment) {
        showToast('Tagihan pembayaran tidak ditemukan.', 'error');
        return;
      }
      const paidAt = new Date().toISOString();
      const expiresAt = new Date(Date.now() + payment.durationDays * 24 * 60 * 60 * 1000).toISOString();

      const { data: updatedPayment, error: payError } = await supabase
        .from('owner_payments')
        .update({
          status: 'paid' as const,
          paidAt,
          expiresAt
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (payError || !updatedPayment) {
        console.error('Owner payment execution error:', payError);
        showToast('Gagal memproses pembayaran: ' + payError?.message, 'error');
        return;
      }

      if (payment.paymentType === 'subscription') {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ subscriptionExpiresAt: expiresAt })
          .eq('id', payment.ownerId);
        
        if (!profileError) {
          if (currentUser && currentUser.id === payment.ownerId) {
            setCurrentUser(prev => prev ? { ...prev, subscriptionExpiresAt: expiresAt } : null);
          }
          setUsers(prev => prev.map(u => u.id === payment.ownerId ? { ...u, subscriptionExpiresAt: expiresAt } : u));
        }
      } else if (payment.paymentType === 'promotion' && payment.kostId) {
        const { error: kostError } = await supabase
          .from('kosts')
          .update({ promotionExpiresAt: expiresAt })
          .eq('id', payment.kostId);

        if (!kostError) {
          setKosts(prev => prev.map(k => k.id === payment.kostId ? { ...k, promotionExpiresAt: expiresAt } : k));
        }
      } else if (payment.paymentType === 'verification' && payment.kostId) {
        const scheduledVerif = kostVerifications.find(
          v => v.kostId === payment.kostId && v.status === 'scheduled'
        );
        if (scheduledVerif) {
          const { error: verifError } = await supabase
            .from('kost_verifications')
            .update({ 
              status: 'paid' as const,
              paymentId: paymentId
            })
            .eq('id', scheduledVerif.id);
            
          if (!verifError) {
            setKostVerifications(prev => 
              prev.map(kv => kv.id === scheduledVerif.id ? { 
                ...kv, 
                status: 'paid', 
                paymentId 
              } : kv)
            );
          } else {
            console.error('Error updating verification status after payment:', verifError);
          }
        }
      }

      setOwnerPayments(prev => prev.map(p => p.id === paymentId ? updatedPayment : p));
      showToast('Pembayaran berhasil diproses!', 'success');
      await fetchSupabaseData();
    } catch (err) {
      console.error(err);
      showToast('Terjadi kesalahan saat memproses pembayaran.', 'error');
    }
  };

  const adminAdjustOwnerPayment = async (paymentId: string, updates: Partial<OwnerPayment>) => {
    try {
      const { data: updatedPayment, error } = await supabase
        .from('owner_payments')
        .update(updates)
        .eq('id', paymentId)
        .select()
        .single();

      if (error) {
        showToast('Gagal menyesuaikan pembayaran: ' + error.message, 'error');
        return;
      }

      if (updatedPayment) {
        setOwnerPayments(prev => prev.map(p => p.id === paymentId ? updatedPayment : p));
        
        if (updatedPayment.status === 'paid' && updates.expiresAt) {
          if (updatedPayment.paymentType === 'subscription') {
            await supabase
              .from('profiles')
              .update({ subscriptionExpiresAt: updates.expiresAt })
              .eq('id', updatedPayment.ownerId);
            
            if (currentUser && currentUser.id === updatedPayment.ownerId) {
              setCurrentUser(prev => prev ? { ...prev, subscriptionExpiresAt: updates.expiresAt } : null);
            }
            setUsers(prev => prev.map(u => u.id === updatedPayment.ownerId ? { ...u, subscriptionExpiresAt: updates.expiresAt } : u));
          } else if (updatedPayment.paymentType === 'promotion' && updatedPayment.kostId) {
            await supabase
              .from('kosts')
              .update({ promotionExpiresAt: updates.expiresAt })
              .eq('id', updatedPayment.kostId);
            setKosts(prev => prev.map(k => k.id === updatedPayment.kostId ? { ...k, promotionExpiresAt: updates.expiresAt } : k));
          }
        }
        showToast('Data pembayaran berhasil disesuaikan.', 'success');
        await fetchSupabaseData();
      }
    } catch (err) {
      console.error(err);
      showToast('Terjadi kesalahan.', 'error');
    }
  };

  const adminAdjustReferral = async (referralId: string, updates: Partial<Referral>) => {
    try {
      const { data: updatedReferral, error } = await supabase
        .from('referrals')
        .update(updates)
        .eq('id', referralId)
        .select()
        .single();

      if (error) {
        showToast('Gagal menyesuaikan referral: ' + error.message, 'error');
        return;
      }

      if (updatedReferral) {
        setReferrals(prev => prev.map(r => r.id === referralId ? { ...r, ...updatedReferral } : r));
        showToast('Data referral berhasil disesuaikan.', 'success');
        await fetchSupabaseData();
      }
    } catch (err) {
      console.error(err);
      showToast('Terjadi kesalahan.', 'error');
    }
  };

  const adminAdjustOwnerSubscription = async (ownerId: string, expiresAt: string | null) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ subscriptionExpiresAt: expiresAt })
        .eq('id', ownerId);

      if (error) {
        showToast('Gagal menyesuaikan langganan: ' + error.message, 'error');
        return;
      }

      setUsers(prev => prev.map(u => u.id === ownerId ? { ...u, subscriptionExpiresAt: expiresAt } : u));
      if (currentUser && currentUser.id === ownerId) {
        setCurrentUser(prev => prev ? { ...prev, subscriptionExpiresAt: expiresAt } : null);
      }
      showToast('Status langganan owner berhasil diperbarui.', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Terjadi kesalahan saat menyesuaikan langganan.', 'error');
    }
  };

  const adminAdjustKostPromotion = async (kostId: string, expiresAt: string | null) => {
    try {
      const { error } = await supabase
        .from('kosts')
        .update({ promotionExpiresAt: expiresAt })
        .eq('id', kostId);

      if (error) {
        showToast('Gagal menyesuaikan promosi: ' + error.message, 'error');
        return;
      }

      setKosts(prev => prev.map(k => k.id === kostId ? { ...k, promotionExpiresAt: expiresAt } : k));
      showToast('Status promosi kost berhasil diperbarui.', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Terjadi kesalahan saat menyesuaikan promosi.', 'error');
    }
  };

  // ==================== PARENT-STUDENT LINKING & PAYMENT ====================

  const generateParentCode = async () => {
    if (!currentUser) return;
    const code = 'VK-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const { error } = await supabase
      .from('profiles')
      .update({ parentCode: code })
      .eq('id', currentUser.id);

    if (error) {
      console.error('Error generating parent code:', error);
      showToast('Gagal membuat Kode Hubung: ' + error.message, 'error');
      return;
    }

    setCurrentUser(prev => prev ? { ...prev, parentCode: code } : null);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, parentCode: code } : u));
    showToast('Kode Hubung Orang Tua berhasil dibuat: ' + code, 'success');
  };

  const linkChild = async (code: string): Promise<boolean> => {
    if (!currentUser) return false;
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      showToast('Kode hubung tidak boleh kosong.', 'error');
      return false;
    }

    const { data: studentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id, fullName')
      .eq('parentCode', trimmed)
      .single();

    if (fetchError || !studentProfile) {
      showToast('Kode Hubung tidak ditemukan. Pastikan kode yang dimasukkan benar.', 'error');
      return false;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ childId: studentProfile.id })
      .eq('id', currentUser.id);

    if (updateError) {
      console.error('Error linking child:', updateError);
      showToast('Gagal menghubungkan akun: ' + updateError.message, 'error');
      return false;
    }

    setCurrentUser(prev => prev ? { ...prev, childId: studentProfile.id } : null);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, childId: studentProfile.id } : u));
    showToast(`Berhasil terhubung dengan akun ${studentProfile.fullName}!`, 'success');
    return true;
  };

  const unlinkChild = async () => {
    if (!currentUser) return;
    const { error } = await supabase
      .from('profiles')
      .update({ childId: null })
      .eq('id', currentUser.id);

    if (error) {
      showToast('Gagal memutus hubungan akun: ' + error.message, 'error');
      return;
    }

    setCurrentUser(prev => prev ? { ...prev, childId: undefined } : null);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, childId: undefined } : u));
    showToast('Hubungan akun anak berhasil diputus.', 'success');
  };

  const payInvoice = async (invoiceId: string, paymentMethod: string, voucherCode?: string, discountAmount?: number) => {
    const paidDate = new Date().toISOString().split('T')[0];
    
    // Fetch the current invoice first to get its current amount and notes
    const currentInvoice = invoices.find(inv => inv.id === invoiceId);
    const originalAmount = currentInvoice?.amount || 0;
    const currentNotes = currentInvoice?.notes || '';
    
    const finalAmount = Math.max(0, originalAmount - (discountAmount || 0));
    const appendNotes = voucherCode ? ` (Voucher ${voucherCode} digunakan. Diskon: Rp ${discountAmount?.toLocaleString('id-ID')})` : '';
    const newNotes = currentNotes + appendNotes;

    const { data, error } = await supabase
      .from('invoices')
      .update({
        status: 'paid' as const,
        paidDate,
        paymentMethod,
        amount: finalAmount,
        notes: newNotes
      })
      .eq('id', invoiceId)
      .select()
      .single();

    if (error) {
      console.error('Error paying invoice:', error);
      showToast('Gagal memproses pembayaran: ' + error.message, 'error');
      return;
    }

    if (data) {
      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? data : inv));
      showToast(voucherCode ? `Pembayaran berhasil! Diskon voucher diterapkan: Rp ${discountAmount?.toLocaleString('id-ID')}` : 'Pembayaran berhasil! Tagihan telah dilunasi.', 'success');
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
        rooms,
        tenants,
        invoices,
        bookingPayments,
        referrals,
        platformSettings,
        switchRole,
        toggleFavorite,
        toggleCompare,
        addToRecentlyViewed,
        addReview,
        addKost,
        campuses,
        distanceOverrides,
        updateCampuses,
        updateDistanceOverrides,
        getKostCoordinates,
        getKostDistance,
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
        scheduleKostVerification,
        approveOwner,
        approveKost,
        adminVerifyKostDirectly,
        moderateReview,
        updateUserRole,
        deleteUser,
        resetUserPassword,
        deleteKost,
        addRoom,
        updateRoom,
        deleteRoom,
        bulkUpdateRoomStatus,
        addTenant,
        updateTenant,
        deleteTenant,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        bulkGenerateInvoices,
        replyToReview,
        incrementKostViews,
        createBookingPayment,
        executeMockPayment,
        updateReferralCode,
        updatePlatformSettings,
        claimReferralReward,
        ownerPayments,
        createOwnerPayment,
        executeMockOwnerPayment,
        adminAdjustOwnerPayment,
        adminAdjustReferral,
        adminAdjustOwnerSubscription,
        adminAdjustKostPromotion,
        generateParentCode,
        linkChild,
        unlinkChild,
        payInvoice,
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
