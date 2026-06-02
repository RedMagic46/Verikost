'use client';

import React, { useState, useRef } from 'react';
import { Play, Pause, RotateCcw, Video, Volume2, VolumeX } from 'lucide-react';

interface VideoTourProps {
  videoUrl?: string;
  posterImage?: string;
}

export default function VideoTour({ videoUrl, posterImage }: VideoTourProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!videoUrl) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground aspect-video">
        <Video className="h-10 w-10 text-slate-400 mb-2" />
        <p className="text-sm font-semibold">Video Tour Belum Tersedia</p>
        <p className="text-xs max-w-xs mt-1">Pemilik kost belum mengunggah rekaman tur kamar digital untuk hunian ini.</p>
      </div>
    );
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleMuteUnmute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-black shadow-md aspect-video">
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterImage}
        className="h-full w-full object-cover"
        loop
        muted={isMuted}
        playsInline
        onClick={handlePlayPause}
      />

      
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayPause}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-900 shadow-md hover:scale-105 active:scale-95 transition-transform"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="h-4 w-4 fill-slate-900 text-slate-900" /> : <Play className="h-4 w-4 fill-slate-900 text-slate-900" />}
            </button>
            <button
              onClick={handleRestart}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white shadow-md hover:scale-105 active:scale-95 transition-transform backdrop-blur-sm"
              title="Mulai Ulang"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600/90 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping"></span>
              Video Tour
            </span>

            
            <button
              onClick={handleMuteUnmute}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white shadow-md hover:scale-105 active:scale-95 transition-transform backdrop-blur-sm"
              title={isMuted ? 'Buka Suara' : 'Senyap'}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      
      {!isPlaying && (
        <button
          onClick={handlePlayPause}
          className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/40 hover:scale-110 active:scale-95 transition-all duration-300 z-10"
        >
          <Play className="h-6 w-6 fill-white text-white ml-0.5" />
        </button>
      )}
    </div>
  );
}
