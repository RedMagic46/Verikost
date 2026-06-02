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
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  approvedAt?: string;
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
}

export const CAMPUSES = [
  { id: 'ub', name: 'Universitas Brawijaya (UB)', field: 'distanceToUB' },
  { id: 'um', name: 'Universitas Negeri Malang (UM)', field: 'distanceToUM' },
  { id: 'umm', name: 'Universitas Muhammadiyah Malang (UMM)', field: 'distanceToUMM' },
] as const;
