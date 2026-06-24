'use client';

import React, { useState, useMemo } from 'react';
import { Kost, Review } from '@/app/types';
import { 
  Star, 
  MessageSquare, 
  CornerDownRight, 
  Send, 
  ShieldCheck, 
  Clock, 
  X,
  Check,
  Search,
  Filter
} from 'lucide-react';

interface ReviewsTabProps {
  myKosts: Kost[];
  myReviews: Review[];
  replyToReview: (reviewId: string, replyText: string) => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function ReviewsTab({
  myKosts,
  myReviews,
  replyToReview,
  showToast
}: ReviewsTabProps) {

  const activeKosts = useMemo(() => myKosts.filter(k => !k.isDeleted), [myKosts]);

  // Selected Kost Filter
  const [selectedKostId, setSelectedKostId] = useState<string>(
    activeKosts.length > 0 ? activeKosts[0].id : ''
  );

  // States
  const [replyInputMap, setReplyInputMap] = useState<Record<string, string>>({});
  const [activeReplyBox, setActiveReplyBox] = useState<string | null>(null);

  // Filtered reviews
  const kostReviews = useMemo(() => {
    return myReviews.filter(r => r.kostId === selectedKostId);
  }, [myReviews, selectedKostId]);

  const handleOpenReplyBox = (review: Review) => {
    if (review.status === 'pending') {
      showToast('Ulasan yang masih berstatus pending belum dapat dibalas.', 'info');
      return;
    }
    setReplyInputMap(prev => ({
      ...prev,
      [review.id]: review.ownerReply || ''
    }));
    setActiveReplyBox(review.id);
  };

  const handleSaveReply = async (reviewId: string) => {
    const replyText = replyInputMap[reviewId];
    if (!replyText || !replyText.trim()) {
      showToast('Isi balasan tidak boleh kosong.', 'error');
      return;
    }

    try {
      await replyToReview(reviewId, replyText.trim());
      setActiveReplyBox(null);
    } catch (err: any) {
      console.error(err);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-3.5 w-3.5 ${
          i < rating 
            ? 'fill-amber-400 text-amber-400' 
            : 'text-slate-350 dark:text-slate-700'
        }`} 
      />
    ));
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Kost Selector */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Ulasan & Reputasi</h1>
          <p className="text-xs text-muted-foreground font-semibold">Tinjau ulasan penyewa kost, balas kritik & saran, dan pantau reputasi bintang properti Anda.</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {activeKosts.length > 0 && (
            <select
              value={selectedKostId}
              onChange={(e) => {
                setSelectedKostId(e.target.value);
                setActiveReplyBox(null);
              }}
              className="bg-white dark:bg-slate-900 border border-border/80 text-xs rounded-xl p-2.5 focus:outline-none text-slate-800 dark:text-slate-200 font-extrabold shadow-sm min-w-[200px]"
            >
              {activeKosts.map((kost) => (
                <option key={kost.id} value={kost.id}>{kost.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {activeKosts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-border rounded-3xl text-slate-400 font-semibold flex flex-col items-center justify-center">
          <MessageSquare className="h-12 w-12 text-slate-350 dark:text-slate-700 mb-3" />
          <p>Harap daftarkan properti kost terlebih dahulu untuk melihat ulasan.</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Average Rating Summary */}
          {kostReviews.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-3xl border border-border/80 flex flex-col sm:flex-row items-center gap-6 shadow-xs">
              <div className="text-center sm:border-r border-border/60 sm:pr-8">
                <span className="text-4xl font-black text-slate-800 dark:text-white">
                  {(kostReviews.reduce((sum, r) => sum + r.rating, 0) / kostReviews.length).toFixed(1)}
                </span>
                <div className="flex justify-center my-1.5">
                  {renderStars(Math.round(kostReviews.reduce((sum, r) => sum + r.rating, 0) / kostReviews.length))}
                </div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase">
                  {kostReviews.length} Ulasan Masuk
                </span>
              </div>
              <div className="flex-1 space-y-2 text-xs font-semibold">
                <h4 className="font-extrabold text-slate-700 dark:text-slate-300">Statistik Bintang Ulasan</h4>
                <div className="space-y-1.5">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = kostReviews.filter(r => r.rating === rating).length;
                    const percent = kostReviews.length > 0 ? (count / kostReviews.length) * 100 : 0;
                    return (
                      <div key={rating} className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                        <span className="w-3 shrink-0">{rating}★</span>
                        <div className="flex-grow h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${percent}%` }}></div>
                        </div>
                        <span className="w-6 text-right shrink-0">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Reviews List */}
          {kostReviews.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-border rounded-3xl text-sm text-slate-400 font-semibold flex flex-col items-center justify-center">
              <MessageSquare className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-3" />
              <p>Belum ada ulasan masuk untuk kost ini.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {kostReviews.map((rev) => (
                <div 
                  key={rev.id}
                  className="bg-white dark:bg-slate-900 border border-border p-5 rounded-3xl shadow-sm space-y-4 animate-in fade-in"
                >
                  {/* Review Header: User profile & Rating */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={rev.userAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
                        alt={rev.userName} 
                        className="h-9 w-9 rounded-full object-cover border border-border" 
                      />
                      <div>
                        <span className="font-extrabold text-slate-800 dark:text-white block">
                          {rev.userName}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-slate-400 font-bold">{rev.date}</span>
                          {rev.verifiedTenant && (
                            <span className="inline-flex items-center gap-0.5 bg-blue-50 text-blue-700 border border-blue-100 dark:bg-slate-850 dark:text-blue-400 dark:border-blue-900/30 px-1.5 py-0.5 rounded text-[8px] font-black uppercase">
                              <ShieldCheck className="h-2.5 w-2.5" /> Penyewa Terverifikasi
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex gap-0.5">{renderStars(rev.rating)}</div>
                      {rev.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-200/50 dark:border-amber-900/30 text-[9px] font-black uppercase animate-pulse">
                          <Clock className="h-3 w-3" /> Menunggu Moderasi Admin
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Comment Text */}
                  <p className="text-slate-700 dark:text-slate-350 text-xs font-semibold leading-relaxed pl-1">
                    "{rev.comment}"
                  </p>

                  {/* Owner Reply Section */}
                  {rev.ownerReply ? (
                    <div className="bg-slate-50 dark:bg-slate-850/40 p-4 rounded-2xl border border-border/60 ml-6 flex gap-3 animate-in fade-in">
                      <CornerDownRight className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
                      <div className="space-y-1 flex-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-800 dark:text-white">
                            Balasan Pemilik Kost
                          </span>
                          {activeReplyBox !== rev.id && (
                            <button
                              onClick={() => handleOpenReplyBox(rev)}
                              className="text-[9px] font-bold text-primary hover:underline cursor-pointer"
                            >
                              Edit Balasan
                            </button>
                          )}
                        </div>
                        
                        {activeReplyBox === rev.id ? (
                          /* Edit Mode inside reply box */
                          <div className="space-y-3 pt-2">
                            <textarea
                              rows={3}
                              value={replyInputMap[rev.id] || ''}
                              onChange={(e) => setReplyInputMap(prev => ({ ...prev, [rev.id]: e.target.value }))}
                              className="w-full bg-white dark:bg-slate-900 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-850 dark:text-white"
                            />
                            <div className="flex justify-end gap-2 text-[10px]">
                              <button
                                type="button"
                                onClick={() => setActiveReplyBox(null)}
                                className="px-3 py-1.5 border border-border rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer font-bold"
                              >
                                Batal
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveReply(rev.id)}
                                className="px-3.5 py-1.5 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm cursor-pointer font-black"
                              >
                                Simpan Balasan
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Display Mode */
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                            "{rev.ownerReply}"
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Show reply box input button */
                    activeReplyBox === rev.id ? (
                      <div className="bg-slate-50 dark:bg-slate-850/40 p-4 rounded-2xl border border-border/60 ml-6 space-y-3 animate-in slide-in-from-top-2 duration-150">
                        <span className="text-[10px] text-slate-500 font-extrabold uppercase block">Tulis Balasan Ulasan:</span>
                        <textarea
                          rows={3}
                          placeholder="Terima kasih atas ulasannya! Kami akan terus meningkatkan kualitas..."
                          value={replyInputMap[rev.id] || ''}
                          onChange={(e) => setReplyInputMap(prev => ({ ...prev, [rev.id]: e.target.value }))}
                          className="w-full bg-white dark:bg-slate-900 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-700 dark:text-white"
                        />
                        <div className="flex justify-end gap-2 text-[10px]">
                          <button
                            type="button"
                            onClick={() => setActiveReplyBox(null)}
                            className="px-3 py-1.5 border border-border rounded-lg text-slate-605 hover:bg-slate-100 cursor-pointer font-bold"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveReply(rev.id)}
                            className="px-3.5 py-1.5 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm cursor-pointer font-black"
                          >
                            Kirim Balasan
                          </button>
                        </div>
                      </div>
                    ) : (
                      rev.status !== 'pending' && (
                        <div className="pl-6 pt-1">
                          <button
                            onClick={() => handleOpenReplyBox(rev)}
                            className="text-[10px] font-black text-primary hover:text-blue-600 flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <CornerDownRight className="h-3.5 w-3.5" />
                            <span>Balas Ulasan Ini</span>
                          </button>
                        </div>
                      )
                    )
                  )}

                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
