'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '@/app/context/AppContext';
import { supabase } from '@/app/lib/supabase';
import { User, Kost } from '@/app/types';
import { 
  Send, 
  Search, 
  MessageSquare, 
  Phone, 
  Clock, 
  X,
  ShieldCheck,
  Building2
} from 'lucide-react';

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

export default function ChatTab() {
  const { currentUser, authLoading, users, kosts } = useApp();

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

        setIsDbLoaded(true);

        if (data && data.length > 0) {
          setMessages(data as ChatMessage[]);
        } else {
          // If no chats in DB, load local seed cache/messages
          const savedChats = localStorage.getItem('vk_chats_cache');
          if (savedChats) {
            setMessages(JSON.parse(savedChats));
          } else {
            setMessages(defaultSeedMessages);
            localStorage.setItem('vk_chats_cache', JSON.stringify(defaultSeedMessages));
          }
        }
      } catch (err) {
        console.warn('Supabase chats loading failed, falling back to LocalStorage cache:', err);
        const savedChats = localStorage.getItem('vk_chats_cache');
        if (savedChats) {
          setMessages(JSON.parse(savedChats));
        } else {
          setMessages(defaultSeedMessages);
          localStorage.setItem('vk_chats_cache', JSON.stringify(defaultSeedMessages));
        }
        setIsDbLoaded(false);
      }
    };

    loadChats();

    // Subscribe to realtime updates for chats table
    const channel = supabase
      .channel(`public:chats:${currentUser.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chats' },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          if (newMsg.senderId === currentUser.id || newMsg.receiverId === currentUser.id) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

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
  }, [messages, currentUser, users]);

  const filteredChannels = useMemo(() => {
    if (!searchQuery.trim()) return channels;
    const query = searchQuery.toLowerCase().trim();
    return channels.filter((ch) => 
      ch.partner.fullName.toLowerCase().includes(query) ||
      ch.partner.email.toLowerCase().includes(query)
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
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Memuat enkripsi pesan...</p>
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

  return (
    <div className="flex h-[calc(100vh-13rem)] bg-white dark:bg-slate-900 border border-border/80 rounded-3xl overflow-hidden shadow-sm text-xs font-semibold text-slate-800 dark:text-slate-200">
      
      {/* Sidebar List */}
      <aside className={`w-full md:w-80 border-r border-border/80 flex flex-col shrink-0 transition-all ${
        isMobileDetailActive ? 'hidden md:flex' : 'flex'
      }`}>
        
        {/* Search Header */}
        <div className="p-4 border-b border-border/50 bg-slate-50/50 dark:bg-slate-800/10 shrink-0">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Cari kontak chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-850 rounded-xl border border-border/80 pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-white placeholder-slate-400"
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

        {/* Channel list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
          {filteredChannels.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <MessageSquare className="h-8 w-8 mx-auto text-slate-350" />
              <p className="font-extrabold text-slate-500">Belum Ada Chat</p>
              <p className="text-[10px] leading-relaxed">
                {searchQuery ? 'Tidak ada kontak yang cocok.' : 'Pesan dari mahasiswa akan muncul di sini secara otomatis.'}
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
                  className={`w-full p-3 flex items-start gap-3 text-left transition-all duration-150 cursor-pointer rounded-2xl border relative ${
                    isSelected 
                      ? 'bg-primary/10 border-primary/10 dark:bg-slate-800/70 shadow-sm' 
                      : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/20'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-primary rounded-r-full"></div>
                  )}

                  <div className="relative shrink-0">
                    <img
                      src={ch.partner.profileImage}
                      alt={ch.partner.fullName}
                      className="h-9 w-9 rounded-full object-cover border border-border"
                    />
                    <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"></span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex justify-between items-center gap-2">
                      <p className={`font-extrabold truncate ${isSelected ? 'text-primary dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>
                        {ch.partner.fullName}
                      </p>
                      <span className="text-[8px] text-slate-400 shrink-0 font-bold">
                        {ch.lastMessageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <span className="inline-block text-[8px] font-black uppercase bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-450 dark:border-blue-900/30 px-1 rounded leading-none">
                      {roleLabels[ch.partner.role] || ch.partner.role}
                    </span>

                    <p className="text-[10px] truncate font-semibold mt-1 text-slate-500 dark:text-slate-450">
                      {ch.lastMessage}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

      </aside>

      {/* Main Chat Workspace */}
      <section className={`flex-1 bg-slate-55/30 dark:bg-slate-900/10 flex flex-col transition-all overflow-hidden ${
        isMobileDetailActive ? 'flex' : 'hidden md:flex'
      }`}>
        
        {activePartner ? (
          <>
            {/* Header info */}
            <div className="p-3.5 bg-white dark:bg-slate-900 border-b border-border/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMobileDetailActive(false)}
                  className="md:hidden p-1.5 rounded-lg bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 transition-colors text-slate-600 dark:text-slate-200"
                >
                  <Search className="h-4 w-4 rotate-90" />
                </button>

                <img
                  src={activePartner.profileImage}
                  alt={activePartner.fullName}
                  className="h-9 w-9 rounded-full object-cover border border-border"
                />
                
                <div>
                  <p className="font-extrabold text-slate-900 dark:text-white text-xs leading-none">
                    {activePartner.fullName}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 leading-none">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase">
                      {roleLabels[activePartner.role]}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                {activePartner.phone && (
                  <a
                    href={`https://wa.me/${activePartner.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl border border-emerald-100 dark:border-emerald-950/20 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/25 transition-all shadow-sm flex items-center gap-1 font-bold text-[10px]"
                    title="Hubungi via WhatsApp"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3.5 scrollbar-thin bg-[radial-gradient(rgba(14,165,233,0.02)_1px,transparent_1px)] [background-size:16px_16px]">
              {activeMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-3xl border border-border/80 shadow-sm text-primary">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <h4 className="font-extrabold text-slate-800 dark:text-white">Percakapan Baru</h4>
                  <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
                    Kirim pesan pertama Anda di bawah untuk mendiskusikan ketersediaan unit properti Anda secara langsung.
                  </p>
                </div>
              ) : (
                activeMessages.map((msg) => {
                  const isMine = msg.senderId === currentUser.id;
                  
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col max-w-[80%] ${isMine ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                    >
                      <div className={`p-3 rounded-2xl leading-relaxed text-xs shadow-xs font-semibold ${
                        isMine 
                          ? 'bg-primary text-white rounded-tr-none' 
                          : 'bg-white dark:bg-slate-900 border border-border/70 text-slate-800 dark:text-slate-200 rounded-tl-none'
                      }`}>
                        <p className="whitespace-pre-line">{msg.message}</p>
                      </div>
                      
                      <span className="text-[8px] text-slate-400 font-bold mt-1 px-1 uppercase tracking-wider">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3.5 bg-white dark:bg-slate-900 border-t border-border/80 shrink-0">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ketik pesan balasan Anda..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-slate-850 rounded-xl border border-border/80 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-white placeholder-slate-400 font-semibold shadow-inner"
                  required
                  autoComplete="off"
                />
                
                <button
                  type="submit"
                  className="p-2.5 bg-primary hover:bg-blue-600 text-white rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center shrink-0 cursor-pointer border-0"
                  title="Kirim"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-full border border-border/85 shadow-sm text-primary">
              <MessageSquare className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-800 dark:text-white">Pilih Percakapan</h3>
              <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed mt-1">
                Silakan pilih salah satu percakapan di bilah kiri untuk membalas chat calon penyewa kost Anda.
              </p>
            </div>
          </div>
        )}

      </section>

    </div>
  );
}
