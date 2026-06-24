export interface User {
  id: string;
  fullName: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'STUDENT' | 'PARENT' | 'OWNER' | 'ADMIN';
  profileImage: string;
  avatar: string;
  createdAt: string;
  
  university?: string;
  faculty?: string;
  major?: string;
  
  occupation?: string;
  
  kostName?: string;
  kostAddress?: string;
  referralCode?: string;
  referredBy?: string;
  subscriptionExpiresAt?: string | null;
}

export interface OwnerVerification {
  id: string;
  ownerId: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  approvedAt?: string;
}

export interface KostVerification {
  id: string;
  kostId: string;
  status: 'pending' | 'scheduled' | 'paid' | 'approved' | 'rejected';
  submittedAt: string;
  approvedAt?: string;
  price?: number;
  visitDate?: string;
  paymentId?: string;
  expiredAt?: string;
}

export interface Kost {
  id: string;
  name: string;
  address: string;
  district: string;
  description: string;
  price: number;
  facilities: string[];
  images: string[];
  videoTour?: string;
  verifiedStatus: 'none' | 'verified' | 'highly-trusted';
  roomAvailability: 'available' | 'limited' | 'full';
  genderCategory: 'male' | 'female' | 'mixed';
  distanceToUB: number;
  distanceToUM: number;
  distanceToUMM: number;
  latitude?: number;
  longitude?: number;
  rating: number;
  ownerId: string;
  securityInfo: string;
  ownerName: string;
  ownerPhone: string;
  views: number;
  isDeleted?: boolean;
  bookingDpAmount?: number;
  promotionExpiresAt?: string | null;
  verifiedExpiresAt?: string | null;
}

export interface Review {
  id: string;
  kostId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  verifiedTenant: boolean;
  userId?: string;
  status?: 'pending' | 'approved' | 'rejected';
  ownerReply?: string;
}

export interface Inquiry {
  id: string;
  kostId: string;
  kostName: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  message: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  studentId: string;
}

export interface Room {
  id: string;
  kostId: string;
  roomNumber: string;
  floor: string;
  type: string;
  price: number;
  status: 'available' | 'occupied' | 'booked' | 'maintenance';
  notes?: string;
  createdAt?: string;
}

export interface Tenant {
  id: string;
  name: string;
  nik: string;
  university?: string;
  phone: string;
  email: string;
  kostId: string;
  roomId?: string; // Room ID reference
  checkIn: string; // Format YYYY-MM-DD
  checkOut?: string; // Format YYYY-MM-DD
  status: 'active' | 'pending' | 'moved_out';
  userId?: string; // Optional reference to profiles.id
  ktpUrl?: string;
  contractUrl?: string;
  createdAt?: string;
}

export interface Invoice {
  id: string;
  tenantId: string;
  roomId?: string;
  kostId: string;
  periodMonth: string; // '01' - '12'
  periodYear: string;  // e.g., '2026'
  amount: number;
  dueDate: string;     // Format YYYY-MM-DD
  paidDate?: string;   // Format YYYY-MM-DD
  status: 'unpaid' | 'paid' | 'overdue';
  paymentMethod?: string;
  notes?: string;
  createdAt?: string;
}

export const CAMPUSES = [
  { id: 'ub', name: 'Universitas Brawijaya (UB)', field: 'distanceToUB' },
  { id: 'um', name: 'Universitas Negeri Malang (UM)', field: 'distanceToUM' },
  { id: 'umm', name: 'Universitas Muhammadiyah Malang (UMM)', field: 'distanceToUMM' },
] as const;


export interface BookingPayment {
  id: string;
  inquiryId: string;
  studentId: string;
  kostId: string;
  roomId?: string | null;
  dpAmount: number;
  commissionAmount: number;
  status: 'pending' | 'paid' | 'expired';
  paymentMethod?: string | null;
  createdAt: string;
  paidAt?: string | null;
  expiresAt: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  smallRewardStatus: 'pending' | 'claimed';
  transactionRewardStatus: 'pending' | 'earned' | 'claimed';
  createdAt: string;
  
  // Virtual fields for frontend UI
  referredName?: string;
  referredEmail?: string;
}

export interface PlatformSettings {
  commissionType: 'flat' | 'percentage';
  commissionValue: number;
  commissionChargedTo: 'student' | 'owner';
  smallReferralReward: string;
  transactionReferralReward: string;
  ownerSubscriptionRate: number;
  ownerPromotionRate: number;
}

export interface OwnerPayment {
  id: string;
  ownerId: string;
  kostId?: string | null;
  amount: number;
  paymentType: 'subscription' | 'promotion' | 'verification';
  status: 'pending' | 'paid' | 'expired';
  durationDays: number;
  createdAt: string;
  paidAt?: string | null;
  expiresAt?: string | null;
}


