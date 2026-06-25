'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { CAMPUSES, Kost } from '../types';
import KostCard from '@/components/KostCard';
import { Search, MapPin, Grid, List, SlidersHorizontal, ArrowUpDown, X, Check, Award, ShieldCheck, Compass, HelpCircle, GraduationCap, Users } from 'lucide-react';
import CustomSelect from '@/components/CustomSelect';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 bg-slate-100 dark:bg-slate-900 animate-pulse flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  ),
});

const campusOptions = [
  { value: '', label: 'Semua Kampus' },
  { value: 'ub', label: 'Dekat UB' },
  { value: 'um', label: 'Dekat UM' },
  { value: 'umm', label: 'Dekat UMM' },
  { value: 'uin', label: 'Dekat UIN' }
];

const genderOptions = [
  { value: '', label: 'Gender (Semua)' },
  { value: 'male', label: 'Putra' },
  { value: 'female', label: 'Putri' },
  { value: 'mixed', label: 'Campur' }
];

const sortOptions = [
  { value: 'rating-desc', label: 'Rating Tertinggi' },
  { value: 'price-asc', label: 'Harga: Terendah ke Tertinggi' },
  { value: 'price-desc', label: 'Harga: Tertinggi ke Terendah' },
  { value: 'distance-asc', label: 'Jarak Terdekat' }
];

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { kosts, currentUser, campuses, getKostDistance } = useApp();

  const dynamicCampusOptions = useMemo(() => {
    const visible = campuses.filter(c => c.isVisible);
    return [
      { value: '', label: 'Semua Kampus' },
      ...visible.map(c => ({
        value: c.id,
        label: `Dekat ${c.name.includes('(') ? c.name.match(/\(([^)]+)\)/)?.[1] || c.name : c.name}`
      }))
    ];
  }, [campuses]);

  const [queryInput, setQueryInput] = useState('');
  const [selectedCampus, setSelectedCampus] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  
  const [maxPrice, setMaxPrice] = useState<number>(3000000);
  const [maxDistance, setMaxDistance] = useState<number>(5);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);

  
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number>(3000000);
  const [appliedMaxDistance, setAppliedMaxDistance] = useState<number>(5);
  const [appliedFacilities, setAppliedFacilities] = useState<string[]>([]);
  const [appliedOnlyAvailable, setAppliedOnlyAvailable] = useState<boolean>(false);

  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('rating-desc');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  const [activeMapKostId, setActiveMapKostId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

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



  useEffect(() => {
    const q = searchParams.get('query') || '';
    const camp = searchParams.get('campus') || '';
    const gend = searchParams.get('gender') || '';
    
    if (q) setQueryInput(q);
    if (camp) setSelectedCampus(camp);
    if (gend) setSelectedGender(gend);
  }, [searchParams]);

  const triggerSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (queryInput.trim()) params.append('query', queryInput.trim());
    if (selectedCampus) params.append('campus', selectedCampus);
    if (selectedGender) params.append('gender', selectedGender);
    router.replace(`/search?${params.toString()}`);
  };

  const allFacilities = [
    'AC', 'WiFi', 'Kamar Mandi Dalam', 'Water Heater', 
    'Kasur Springbed', 'Dapur Bersama', 'CCTV', 'Parkir Motor', 'Parkir Mobil'
  ];

  const handleFacilityToggle = (facility: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(facility) ? prev.filter((f) => f !== facility) : [...prev, facility]
    );
  };

  const handleApplyFilters = () => {
    setAppliedMaxPrice(maxPrice);
    setAppliedMaxDistance(maxDistance);
    setAppliedFacilities(selectedFacilities);
    setAppliedOnlyAvailable(onlyAvailable);
    setMobileFiltersOpen(false);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setQueryInput('');
    setSelectedCampus('');
    setSelectedGender('');
    
    setMaxPrice(3000000);
    setMaxDistance(5);
    setSelectedFacilities([]);
    setOnlyAvailable(false);

    setAppliedMaxPrice(3000000);
    setAppliedMaxDistance(5);
    setAppliedFacilities([]);
    setAppliedOnlyAvailable(false);

    setActiveMapKostId(null);
    setCurrentPage(1);
    router.replace('/search');
  };

  const hasPendingFilters = useMemo(() => {
    return (
      maxPrice !== appliedMaxPrice ||
      maxDistance !== appliedMaxDistance ||
      onlyAvailable !== appliedOnlyAvailable ||
      selectedFacilities.length !== appliedFacilities.length ||
      !selectedFacilities.every((f) => appliedFacilities.includes(f))
    );
  }, [maxPrice, appliedMaxPrice, maxDistance, appliedMaxDistance, onlyAvailable, appliedOnlyAvailable, selectedFacilities, appliedFacilities]);

  const filteredKosts = useMemo(() => {
    return kosts.filter((kost) => {
      if (kost.isDeleted) return false;

      const isAuthorized = currentUser && (currentUser.role === 'ADMIN' || currentUser.id === kost.ownerId);
      if (kost.verifiedStatus === 'none' && !isAuthorized) return false;

      if (queryInput.trim()) {
        const key = queryInput.toLowerCase();
        const matchesName = kost.name.toLowerCase().includes(key);
        const matchesAddr = kost.address.toLowerCase().includes(key);
        const matchesDesc = kost.description.toLowerCase().includes(key);
        const matchesDist = kost.district.toLowerCase().includes(key);
        if (!matchesName && !matchesAddr && !matchesDesc && !matchesDist) return false;
      }

      if (selectedCampus) {
        const dist = getKostDistance(kost, selectedCampus);
        if (dist <= 0 || dist > appliedMaxDistance) return false;
      } else {
        const distances = campuses
          .filter(c => c.isVisible)
          .map(c => getKostDistance(kost, c.id))
          .filter(d => d > 0);
        
        if (distances.length === 0) return false;
        const minDistance = Math.min(...distances);
        if (minDistance > appliedMaxDistance) return false;
      }

      if (selectedGender && kost.genderCategory !== selectedGender) return false;

      if (kost.price > appliedMaxPrice) return false;

      if (appliedFacilities.length > 0) {
        const hasAll = appliedFacilities.every((fac) => kost.facilities.includes(fac));
        if (!hasAll) return false;
      }

      if (appliedOnlyAvailable && kost.roomAvailability === 'full') return false;

      return true;
    });
  }, [kosts, queryInput, selectedCampus, selectedGender, appliedMaxPrice, appliedMaxDistance, appliedFacilities, appliedOnlyAvailable, currentUser]);

  const sortedKosts = useMemo(() => {
    const now = new Date();
    const isPromoted = (k: Kost) => k.promotionExpiresAt ? new Date(k.promotionExpiresAt) > now : false;

    const promoted = filteredKosts.filter(isPromoted);
    const regular = filteredKosts.filter((k) => !isPromoted(k));

    const sortFn = (a: Kost, b: Kost) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating-desc') {
        const rA = a.rating ?? 0;
        const rB = b.rating ?? 0;
        return rB - rA;
      }
      if (sortBy === 'distance-asc') {
        const getSortDistance = (k: Kost) => {
          if (selectedCampus) {
            const dist = getKostDistance(k, selectedCampus);
            return dist > 0 ? dist : Infinity;
          }
          
          const validDists = campuses
            .filter(c => c.isVisible)
            .map(c => getKostDistance(k, c.id))
            .filter(d => d > 0);
          return validDists.length > 0 ? Math.min(...validDists) : Infinity;
        };

        const distA = getSortDistance(a);
        const distB = getSortDistance(b);
        return distA - distB;
      }
      return 0;
    };

    promoted.sort(sortFn);
    regular.sort(sortFn);

    return [...promoted, ...regular];
  }, [filteredKosts, sortBy, selectedCampus]);

  const paginatedKosts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedKosts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedKosts, currentPage]);

  const totalPages = Math.ceil(sortedKosts.length / itemsPerPage);



  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      
      
      <section className="bg-white dark:bg-slate-900 border-b border-border py-6 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <form onSubmit={triggerSearchSubmit} className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            
            <div className="flex-1 relative flex items-center bg-slate-50 dark:bg-slate-800 rounded-xl border border-border px-3 py-2">
              <Search className="h-5 w-5 text-slate-400 shrink-0 mr-2" />
              <input
                type="text"
                placeholder="Cari jalan, area Lowokwaru, Suhat, atau nama kost..."
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                className="w-full text-sm bg-transparent outline-none text-slate-800 dark:text-white placeholder-slate-400"
              />
              {queryInput && (
                <button type="button" onClick={() => setQueryInput('')} className="text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0 items-center">
              
              <CustomSelect
                options={dynamicCampusOptions}
                value={selectedCampus}
                onChange={setSelectedCampus}
                icon={<GraduationCap className="h-4.5 w-4.5" />}
                className="w-full sm:w-48"
              />

              
              <CustomSelect
                options={genderOptions}
                value={selectedGender}
                onChange={setSelectedGender}
                icon={<Users className="h-4.5 w-4.5" />}
                className="w-full sm:w-48"
              />

              <button
                type="submit"
                className="rounded-xl bg-primary hover:bg-blue-600 text-white text-sm font-bold shadow-md shadow-primary/20 px-6 py-2.5 transition-colors w-full sm:w-auto flex items-center justify-center gap-1.5"
              >
                Cari
              </button>
            </div>

          </form>
        </div>
      </section>

      
      <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-border rounded-2xl p-5 shadow-sm space-y-6 sticky top-24">
              
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <SlidersHorizontal className="h-4.5 w-4.5 text-primary" />
                  Filter Lanjutan
                </span>
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Reset Semua
                </button>
              </div>

              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Harga Bulanan Maks</span>
                  <span className="font-extrabold text-primary">
                    Rp {(maxPrice / 1000000).toFixed(1)} JT
                  </span>
                </div>
                <input
                  type="range"
                  min="500000"
                  max="3000000"
                  step="100000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>500 Ribu</span>
                  <span>3 Juta</span>
                </div>
              </div>

              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Jarak Maks ke Kampus</span>
                  <span className="font-extrabold text-primary">{maxDistance} km</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0.5 km</span>
                  <span>5.0 km</span>
                </div>
              </div>

              
              <div className="space-y-3 border-t border-border/80 pt-4">
                <label className="flex items-center gap-2.5 cursor-pointer group text-xs text-slate-700 dark:text-slate-300 font-semibold select-none">
                  <input
                    type="checkbox"
                    checked={onlyAvailable}
                    onChange={(e) => setOnlyAvailable(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-2"
                  />
                  <span className="group-hover:text-primary transition-colors">Tersedia / Kamar Kos Kosong</span>
                </label>
              </div>

              
              <div className="space-y-3 border-t border-border/80 pt-4">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Fasilitas Kamar & Gedung</span>
                <div className="grid grid-cols-1 gap-2 pt-1">
                  {allFacilities.map((fac) => {
                    const isChecked = selectedFacilities.includes(fac);
                    return (
                      <label key={fac} className="flex items-center gap-2.5 cursor-pointer group text-xs text-slate-600 dark:text-slate-400 select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleFacilityToggle(fac)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-2"
                        />
                        <span className={`group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors ${isChecked ? 'text-slate-900 dark:text-slate-100 font-medium' : ''}`}>
                          {fac}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              
              <div className="border-t border-border/80 pt-4">
                <button
                  type="button"
                  onClick={handleApplyFilters}
                  className={`w-full rounded-xl py-2.5 text-xs font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5 ${
                    hasPendingFilters
                      ? 'bg-primary hover:bg-blue-600 text-white shadow-md shadow-primary/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Check className="h-4 w-4" />
                  Terapkan Filter
                </button>
              </div>

            </div>
          </aside>

          
          <main className="lg:col-span-3 space-y-6">
            
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-border p-4 rounded-2xl shadow-sm">
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Menampilkan <span className="text-primary font-bold">{sortedKosts.length}</span> kosan di Malang
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3">
                
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 py-2 px-3 border border-border rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  <span>Filter</span>
                </button>

                
                <CustomSelect
                  options={sortOptions}
                  value={sortBy}
                  onChange={setSortBy}
                  icon={<ArrowUpDown className="h-4 w-4" />}
                  className="w-48 sm:w-56"
                />

                
                <div className="flex items-center rounded-lg border border-border p-0.5 bg-slate-50 dark:bg-slate-800">
                  <button
                    onClick={() => setViewType('grid')}
                    className={`p-1.5 rounded-md transition-all ${
                      viewType === 'grid'
                        ? 'bg-white dark:bg-slate-700 text-primary shadow'
                        : 'text-slate-400 hover:text-foreground'
                    }`}
                    title="Grid View"
                  >
                    <Grid className="h-4.5 w-4.5" />
                  </button>
                  <button
                    onClick={() => setViewType('list')}
                    className={`p-1.5 rounded-md transition-all ${
                      viewType === 'list'
                        ? 'bg-white dark:bg-slate-700 text-primary shadow'
                        : 'text-slate-400 hover:text-foreground'
                    }`}
                    title="List View"
                  >
                    <List className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                
                {sortedKosts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-sm space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-slate-800 border border-blue-100">
                      <HelpCircle className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Kos Tidak Ditemukan</h3>
                    <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                      Maaf, kami tidak menemukan kos yang memenuhi kriteria pencarian Anda. Silakan longgarkan filter atau atur ulang harga.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="rounded-full bg-primary hover:bg-blue-600 text-white font-bold text-xs py-2.5 px-6 shadow transition-transform hover:scale-102"
                    >
                      Atur Ulang Pencarian
                    </button>
                  </div>
                ) : (
                  <div className={`grid gap-6 ${viewType === 'grid' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                    {paginatedKosts.map((kost) => {
                      const isActiveOnMap = activeMapKostId === kost.id;
                      return (
                        <div
                          key={kost.id}
                          className={`transition-all duration-300 rounded-2xl ${
                            isActiveOnMap
                              ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-900 scale-[1.01] shadow-lg shadow-primary/10'
                              : ''
                          }`}
                          onMouseEnter={() => setActiveMapKostId(kost.id)}
                          onMouseLeave={() => setActiveMapKostId(null)}
                        >
                          <KostCard kost={kost} viewType={viewType} />
                        </div>
                      );
                    })}
                  </div>
                )}

                
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 pt-6">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-border bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                    >
                      Sebelumnya
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`h-9 w-9 text-xs font-bold rounded-lg border transition-colors ${
                          currentPage === i + 1
                            ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20'
                            : 'border-border bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-border bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                    >
                      Selanjutnya
                    </button>
                  </div>
                )}

              </div>

              
              <div className="md:col-span-1 space-y-4 sticky top-24">
                <div className="border border-border bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm aspect-[3/4] flex flex-col">
                  
                  
                  <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-sky-400" />
                      <span className="text-xs font-bold uppercase tracking-wider">Peta Hunian Malang</span>
                    </div>
                    {activeMapKostId && (
                      <span className="text-[10px] bg-slate-800 text-slate-300 py-0.5 px-2 rounded-full font-mono">
                        Active Pin
                      </span>
                    )}
                  </div>

                  
                  <div className="flex-1 relative border-b border-border">
                    <MapComponent
                      kosts={filteredKosts}
                      selectedCampus={selectedCampus}
                      activeMapKostId={activeMapKostId}
                      setActiveMapKostId={setActiveMapKostId}
                    />
                  </div>

                  
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 shrink-0 text-center min-h-[70px] flex items-center justify-center">
                    {activeMapKostId ? (
                      (() => {
                        const targetKost = kosts.find((k) => k.id === activeMapKostId);
                        if (!targetKost) return null;
                        return (
                          <div className="w-full text-left space-y-1 animate-in fade-in duration-200">
                            <p className="text-[9px] uppercase tracking-wider text-primary font-extrabold">Active Selection</p>
                            <p className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1">{targetKost.name}</p>
                            <div className="flex gap-4 text-[10px] text-muted-foreground">
                              <span>UB: {targetKost.distanceToUB}km</span>
                              <span>UM: {targetKost.distanceToUM}km</span>
                              <span className="font-semibold text-primary">Rp {targetKost.price.toLocaleString('id-ID')}/bln</span>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <span className="text-xs text-muted-foreground leading-relaxed">
                        Layangkan kursor ke kartu kos atau klik pin koordinat peta untuk melihat ringkasan navigasi.
                      </span>
                    )}
                  </div>

                </div>

                
                <div className="bg-white dark:bg-slate-900 border border-border rounded-2xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Kampus Terdekat
                  </h3>
                  <ul className="space-y-2">
                    {campuses.filter(c => c.isVisible).map((campus) => {
                      const isActive = selectedCampus === campus.id;
                      const campusLabel = campus.name.replace(/\s*\([^)]*\)/, '');
                      const match = campus.name.match(/\(([^)]+)\)/);
                      const campusCode = match ? match[1].toUpperCase() : campus.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 4);

                      return (
                        <li key={campus.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCampus(isActive ? '' : campus.id);
                              setCurrentPage(1);
                            }}
                            className={`w-full text-left flex items-center justify-between py-1.5 px-3 rounded-xl border text-xs transition-all cursor-pointer ${
                              isActive
                                ? 'bg-primary/5 border-primary text-primary font-bold shadow-sm'
                                : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                            }`}
                          >
                            <span>{campusLabel}</span>
                            <span className={`text-[9px] font-extrabold py-0.5 px-2 rounded-full transition-colors ${
                              isActive
                                ? 'bg-primary text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                              {campusCode}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

            </div>

          </main>

        </div>
      </div>

      
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm h-full bg-white dark:bg-slate-900 p-6 overflow-y-auto space-y-6 shadow-xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <SlidersHorizontal className="h-5 w-5 text-primary" />
                  Filter Pencarian
                </span>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="rounded-lg p-1.5 hover:bg-muted text-slate-400 hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Harga Bulanan Maks</span>
                  <span className="font-extrabold text-primary">
                    Rp {(maxPrice / 1000000).toFixed(1)} JT
                  </span>
                </div>
                <input
                  type="range"
                  min="500000"
                  max="3000000"
                  step="100000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Jarak Maks ke Kampus</span>
                  <span className="font-extrabold text-primary">{maxDistance} km</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              
              <div className="space-y-3 border-t border-border pt-4">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300 font-semibold">
                  <input
                    type="checkbox"
                    checked={onlyAvailable}
                    onChange={(e) => setOnlyAvailable(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-2"
                  />
                  <span>Tersedia / Kamar Kos Kosong</span>
                </label>
              </div>

              
              <div className="space-y-3 border-t border-border pt-4">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Fasilitas Kamar & Gedung</span>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {allFacilities.map((fac) => {
                    const isChecked = selectedFacilities.includes(fac);
                    return (
                      <label key={fac} className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleFacilityToggle(fac)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-2"
                        />
                        <span className={isChecked ? 'text-slate-900 dark:text-slate-100 font-medium' : ''}>
                          {fac}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border flex gap-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 rounded-xl border border-border py-3 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-50 hover:bg-muted"
              >
                Reset Semua
              </button>
              <button
                type="button"
                onClick={handleApplyFilters}
                className={`flex-1 rounded-xl py-3 text-xs font-bold shadow transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  hasPendingFilters
                    ? 'bg-primary text-white shadow-primary/20 hover:bg-blue-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Check className="h-4 w-4" />
                Terapkan Filter
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function SearchResults() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div></div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
