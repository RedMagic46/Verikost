'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import { supabase } from '@/app/lib/supabase';
import { User, Kost } from '@/app/types';
import { 
  Send, 
  Search, 
  ArrowLeft, 
  MessageSquare, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  UserCheck, 
  Home, 
  Clock, 
  X,
  Compass
} from 'lucide-react';
import Link from 'next/link';

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
}

const defaultSeedMessages: ChatMessage[] = [
  {
    id: 'c1000000-0000-0000-0000-000000000001',
    senderId: 'user-student',
    receiverId: 'owner-1',
    message: 'Halo Ibu Endang, saya ingin bertanya lebih lanjut mengenai fasilitas WiFi di Kost Suhat Premium Female.',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'c1000000-0000-0000-0000-000000000002',
    senderId: 'owner-1',
    receiverId: 'user-student',
    message: 'Halo Mbak Alya! Tentu saja, WiFi di kos kami menggunakan jaringan fiber optik 100 Mbps dengan access point di setiap lantai. Dijamin sangat lancar untuk kuliah online.',
    createdAt: new Date(Date.now() - 1.75 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'c1000000-0000-0000-0000-000000000003',
    senderId: 'user-student',
    receiverId: 'owner-1',
    message: 'Wah, bagus sekali Bu! Apakah pintu gerbangnya bebas diakses 24 jam?',
    createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'c1000000-0000-0000-0000-000000000004',
    senderId: 'owner-1',
    receiverId: 'user-student',
    message: 'Untuk penghuni, pintu gerbang menggunakan akses kartu RFID digital lock, jadi bisa diakses 24 jam. Namun demi keamanan bersama, dilarang membawa tamu lawan jenis masuk ke area kamar ya.',
    createdAt: new Date(Date.now() - 1.25 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'c1000000-0000-0000-0000-000000000005',
    senderId: 'user-student',
    receiverId: 'owner-2',
    message: 'Permisi Pak Gunawan, apakah Kost Lowokwaru Putra Mandiri masih ada sisa kamar kosong untuk bulan depan?',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'c1000000-0000-0000-0000-000000000006',
    senderId: 'owner-2',
    receiverId: 'user-student',
    message: 'Halo! Masih ada 2 kamar kosong di lantai dua, Mas. Silakan jika ingin disurvei terlebih dahulu.',
    createdAt: new Date(Date.now() - 4.5 * 60 * 60 * 1000).toISOString()
  }
];

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, authLoading, users, kosts, showToast } = useApp();
  
  const targetOwnerId = searchParams.get('ownerId');
  const targetKostName = searchParams.get('kostName');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileDetailActive, setIsMobileDetailActive] = useState(false);
  const [isDbLoaded, setIsDbLoaded] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannelId]);

  useEffect(() => {
    if (!currentUser) return;

    const loadChats = async () => {
      try {
        const { data, error } = await supabase
          .from('chats')
          .select('*')
          .or(`senderId.eq.${currentUser.id},receiverId.eq.${currentUser.id}`)
          .order('createdAt', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          setMessages(data as ChatMessage[]);
          setIsDbLoaded(true);
        } else {
          loadSeedFallback();
        }
      } catch (err) {
        console.warn('Supabase chats loading failed, falling back to LocalStorage cache:', err);
        loadSeedFallback();
      }
    };

    const loadSeedFallback = () => {
      const savedChats = localStorage.getItem('vk_chats_cache');
      if (savedChats) {
        setMessages(JSON.parse(savedChats));
      } else {
        setMessages(defaultSeedMessages);
        localStorage.setItem('vk_chats_cache', JSON.stringify(defaultSeedMessages));
      }
      setIsDbLoaded(false);
    };

    loadChats();
  }, [currentUser]);

  useEffect(() => {
    if (targetOwnerId && currentUser && users.some(u => u.id === targetOwnerId)) {
      setActiveChannelId(targetOwnerId);
      setIsMobileDetailActive(true);

      if (targetKostName) {
        setInputMessage(`Halo, saya tertarik dengan "${targetKostName}". Apakah masih ada kamar kosong yang tersedia untuk disurvei?`);
      }
    }
  }, [targetOwnerId, targetKostName, users, currentUser]);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      showToast('Silakan masuk akun terlebih dahulu untuk menggunakan fitur chat.', 'info');
      router.push('/login');
    }
  }, [currentUser, authLoading, router]);

  const channels = useMemo(() => {
    if (!currentUser || users.length === 0) return [];

    const partnerIds = new Set<string>();
    
    messages.forEach((msg) => {
      if (msg.senderId === currentUser.id) {
        partnerIds.add(msg.receiverId);
      } else if (msg.receiverId === currentUser.id) {
        partnerIds.add(msg.senderId);
      }
    });

    if (targetOwnerId && targetOwnerId !== currentUser.id) {
      partnerIds.add(targetOwnerId);
    }

    const partnerList = users.filter((u) => partnerIds.has(u.id) && u.id !== currentUser.id);

    return partnerList.map((partner) => {
      const conversation = messages.filter(
        (m) => 
          (m.senderId === currentUser.id && m.receiverId === partner.id) ||
          (m.senderId === partner.id && m.receiverId === currentUser.id)
      );

      const lastMsg = conversation[conversation.length - 1];
      
      return {
        partner,
        lastMessage: lastMsg ? lastMsg.message : 'Mulai percakapan baru...',
        lastMessageTime: lastMsg ? new Date(lastMsg.createdAt) : new Date(partner.createdAt || Date.now()),
      };
    }).sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
  }, [messages, currentUser, users, targetOwnerId]);

  const filteredChannels = useMemo(() => {
    if (!searchQuery.trim()) return channels;
    const query = searchQuery.toLowerCase().trim();
    return channels.filter((ch) => 
      ch.partner.fullName.toLowerCase().includes(query) ||
      ch.partner.email.toLowerCase().includes(query) ||
      (ch.partner.kostName || '').toLowerCase().includes(query)
    );
  }, [channels, searchQuery]);

  const activeMessages = useMemo(() => {
    if (!currentUser || !activeChannelId) return [];
    return messages.filter(
      (m) => 
        (m.senderId === currentUser.id && m.receiverId === activeChannelId) ||
        (m.senderId === activeChannelId && m.receiverId === currentUser.id)
    );
  }, [messages, currentUser, activeChannelId]);

  const activePartner = useMemo(() => {
    if (!activeChannelId) return null;
    return users.find((u) => u.id === activeChannelId) || null;
  }, [activeChannelId, users]);

  const activePartnerKosts = useMemo(() => {
    if (!activePartner) return [];
    if (activePartner.role === 'OWNER') {
      return kosts.filter(k => k.ownerId === activePartner.id);
    }
    return [];
  }, [activePartner, kosts]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !activeChannelId || !inputMessage.trim()) return;

    const newMessageText = inputMessage.trim();
    setInputMessage('');

    const newMsg: ChatMessage = {
      id: `chat-${Math.random().toString(36).substr(2, 9)}`,
      senderId: currentUser.id,
      receiverId: activeChannelId,
      message: newMessageText,
      createdAt: new Date().toISOString()
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);

    if (isDbLoaded) {
      try {
        const { error } = await supabase
          .from('chats')
          .insert({
            senderId: currentUser.id,
            receiverId: activeChannelId,
            message: newMessageText
          });
        if (error) throw error;
      } catch (err) {
        console.warn('Failed to sync message to Supabase database. Kept in local cache.', err);
        localStorage.setItem('vk_chats_cache', JSON.stringify(updatedMessages));
      }
    } else {
      localStorage.setItem('vk_chats_cache', JSON.stringify(updatedMessages));
    }
  };

  if (authLoading || !currentUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] space-y-4 dark:bg-slate-950">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Memuat enkripsi pesan...</p>
      </div>
    );
  }

  if (!activeChannelId && channels.length > 0 && typeof window !== 'undefined' && window.innerWidth >= 768) {
    setActiveChannelId(channels[0].partner.id);
  }

  const roleLabels = {
    STUDENT: 'Mahasiswa',
    PARENT: 'Orang Tua',
    OWNER: 'Pemilik Kost',
    ADMIN: 'Super Admin'
  };

  const partnerDashboardLink = 
    currentUser.role === 'OWNER' 
      ? '/owner' 
      : currentUser.role === 'ADMIN'
      ? '/admin'
      : '/dashboard';

  return (
    <div className="flex-1 flex h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 overflow-hidden font-medium text-xs">
      
      <aside className={`w-full md:w-80 lg:w-96 bg-white dark:bg-slate-900 border-r border-border/80 flex flex-col shrink-0 transition-all ${
        isMobileDetailActive ? 'hidden md:flex' : 'flex'
      }`}>
        
        <div className="p-4 border-b border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href={partnerDashboardLink}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 transition-colors text-slate-600 dark:text-slate-200"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <p className="font-extrabold text-slate-800 dark:text-white leading-tight">Room Direct Chat</p>
              <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-0.5">Secure Hub</p>
            </div>
          </div>
          
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" title="Terhubung ke server"></div>
        </div>

        <div className="p-4 border-b border-border/50 bg-slate-50/50 dark:bg-slate-800/10">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Cari chat berdasarkan nama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 rounded-xl border border-border/80 pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-white font-semibold shadow-inner"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-none">
          {filteredChannels.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-3">
              <MessageSquare className="h-8 w-8 mx-auto text-slate-300" />
              <p className="font-bold">Belum Ada Percakapan</p>
              <p className="text-[10px] text-slate-400 leading-normal">
                {searchQuery ? 'Tidak ada kontak yang cocok dengan pencarian Anda.' : 'Pesan chat dari halaman detail kost untuk mulai berinteraksi dengan pemilik.'}
              </p>
            </div>
          ) : (
            filteredChannels.map((ch) => {
              const isSelected = activeChannelId === ch.partner.id;
              
              return (
                <button
                  key={ch.partner.id}
                  onClick={() => {
                    setActiveChannelId(ch.partner.id);
                    setIsMobileDetailActive(true);
                  }}
                  className={`w-full p-3.5 flex items-start gap-3 text-left transition-all duration-200 cursor-pointer rounded-2xl border relative overflow-hidden group ${
                    isSelected 
                      ? 'bg-primary/10 dark:bg-slate-800/70 border-primary/10 shadow-sm' 
                      : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/30'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-full"></div>
                  )}

                  <div className="relative shrink-0 pl-1">
                    <img
                      src={ch.partner.profileImage}
                      alt={ch.partner.fullName}
                      className="h-10 w-10 rounded-full object-cover border border-border"
                    />
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"></span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-center gap-2">
                      <p className={`font-extrabold truncate transition-colors ${isSelected ? 'text-primary dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                        {ch.partner.fullName}
                      </p>
                      <span className="text-[9px] text-slate-400 shrink-0 font-bold">
                        {ch.lastMessageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <span className={`inline-block text-[8px] font-black uppercase px-1.5 py-0.5 rounded leading-none border ${
                      ch.partner.role === 'OWNER' 
                        ? 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30' 
                        : 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30'
                    }`}>
                      {roleLabels[ch.partner.role] || ch.partner.role}
                    </span>

                    <p className={`text-[11px] truncate font-semibold mt-1 transition-colors ${isSelected ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                      {ch.lastMessage}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

      </aside>

      <section className={`flex-1 bg-slate-50 dark:bg-slate-950 flex flex-col transition-all overflow-hidden ${
        isMobileDetailActive ? 'flex' : 'hidden md:flex'
      }`}>
        
        {activePartner ? (
          <>
            <div className="p-4 bg-white dark:bg-slate-900 border-b border-border/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMobileDetailActive(false)}
                  className="md:hidden p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 transition-colors text-slate-600 dark:text-slate-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>

                <img
                  src={activePartner.profileImage}
                  alt={activePartner.fullName}
                  className="h-10 w-10 rounded-full object-cover border border-border"
                />
                
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-extrabold text-slate-900 dark:text-white text-sm leading-none">
                      {activePartner.fullName}
                    </p>
                    {activePartner.role === 'OWNER' && (
                      <span title="KTP Terverifikasi" className="text-blue-500">
                        <ShieldCheck className="h-4.5 w-4.5" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {roleLabels[activePartner.role]} • Aktif
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activePartner.phone && (
                  <a
                    href={`https://wa.me/${activePartner.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-950/20 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/25 transition-all shadow-sm"
                    title="Beralih ke WhatsApp"
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>

            {activePartnerKosts.length > 0 && (
              <div className="bg-blue-50/50 dark:bg-slate-900/60 border-b border-border/50 px-4 py-2.5 flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300 shrink-0">
                <div className="flex items-center gap-1.5 truncate">
                  <Home className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Mengelola Kost: <strong className="text-slate-800 dark:text-white font-extrabold">{activePartnerKosts[0].name}</strong></span>
                </div>
                <Link
                  href={`/kost/${activePartnerKosts[0].id}`}
                  className="text-xs font-bold text-primary hover:underline shrink-0 pl-4"
                >
                  Detail Kost →
                </Link>
              </div>
            )}

            <div className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-none bg-[radial-gradient(rgba(14,165,233,0.03)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(14,165,233,0.01)_1px,transparent_1px)] [background-size:16px_16px]">
              
              {activeMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-3xl border border-border/80 shadow-sm text-primary">
                    <MessageSquare className="h-8 w-8" />
                  </div>
                  <h4 className="font-extrabold text-slate-800 dark:text-white">Kirim Pesan Pertama Anda</h4>
                  <p className="text-[10px] text-slate-400 max-w-xs leading-normal">
                    Diskusikan detail sewa kamar, peraturan tamu, biaya air listrik, atau koordinasi survey lapangan langsung di bawah ini.
                  </p>
                </div>
              ) : (
                activeMessages.map((msg, idx) => {
                  const isMine = msg.senderId === currentUser.id;
                  
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col max-w-[75%] ${isMine ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                    >
                      <div className={`p-3.5 rounded-2xl leading-relaxed text-xs shadow-sm font-semibold ${
                        isMine 
                          ? 'bg-gradient-to-tr from-primary to-secondary text-white rounded-tr-none' 
                          : 'bg-white dark:bg-slate-900 border border-border/85 text-slate-800 dark:text-slate-200 rounded-tl-none'
                      }`}>
                        <p className="whitespace-pre-line">{msg.message}</p>
                      </div>
                      
                      <span className="text-[9px] text-slate-400 font-bold mt-1.5 px-1 uppercase tracking-wider flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-300" />
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border-t border-border/80 shrink-0">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Tulis pesan pertanyaan di sini..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-border/80 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-white font-semibold shadow-inner"
                  required
                  autoComplete="off"
                />
                
                <button
                  type="submit"
                  className="p-3 bg-primary hover:bg-blue-600 text-white rounded-2xl shadow transition-transform active:scale-95 flex items-center justify-center shrink-0 cursor-pointer"
                  title="Kirim Pesan"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-full border border-border shadow-sm text-primary animate-pulse">
              <MessageSquare className="h-10 w-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Pilih Percakapan Mitra</h3>
              <p className="text-[11px] text-slate-400 max-w-xs leading-normal">
                Pilih kontak di sebelah kiri untuk melihat pesan masuk, atau buka salah satu listing kost untuk berkonsultasi langsung.
              </p>
            </div>
          </div>
        )}

      </section>

    </div>
  );
}
