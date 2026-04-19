'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Wind, Wifi, Shield, DollarSign, Plane, ArrowRight, Star, Loader2, Home as HomeIcon } from 'lucide-react';

export default function Home() {
  const [city1, setCity1] = useState('ICN');
  const [city2, setCity2] = useState('BKK');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchComparison = async () => {
    setLoading(true);
    setError(null);
    try {
      // Hard cache-busting to ensure we hit the fresh deployment
      const res = await fetch(`/api/v1/compare?city1=${city1.trim()}&city2=${city2.trim()}&t=${Date.now()}`, {
        cache: 'no-store'
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Comparison Service Busy');
      setData(result);
    } catch (err) {
      console.error("Client Fetch Error:", err);
      setError('Service is updating or data is unavailable. Please try again in 5 seconds.');
    } finally {
      setLoading(false);
    }
  };

  const getCityData = (cityData: any) => ({
    name: cityData?.info?.name ?? 'City',
    code: cityData?.info?.code ?? 'N/A',
    score: cityData?.info?.nomad_score ?? '7.5',
    temp: cityData?.weather?.temp ?? 'N/A',
    weatherDesc: cityData?.weather?.condition === 0 ? 'Clear' : 'Cloudy',
    internet: Number(cityData?.metrics?.internet ?? 5),
    safety: Number(cityData?.metrics?.safety ?? 5),
    cost: Number(cityData?.metrics?.cost_of_living ?? 5),
    hotelPrice: cityData?.lodging?.avg_price ?? 'N/A',
    hotelLink: cityData?.lodging?.booking_link ?? '#'
  });

  return (
    <main className="min-h-screen mesh-bg p-4 md:p-8 flex flex-col items-center">
      <section className="w-full max-w-6xl mt-12 mb-16 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-white">
          Compare <span className="text-gradient">Everywhere.</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
          Ultra-reliable city comparison for nomads. Powered by <span className="text-sky-400">Travelpayouts</span>.
        </p>
      </section>

      <section className="w-full max-w-4xl glass-card p-8 mb-12 relative z-10 transition-all hover:border-sky-500/30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-slate-400 text-xs mb-3 ml-1 uppercase font-semibold tracking-widest">From</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-400 w-5 h-5" />
              <input value={city1} onChange={(e) => setCity1(e.target.value.toUpperCase().slice(0,3))} className="glass-input w-full pl-12 font-mono text-lg" />
            </div>
          </div>
          <div>
            <label className="block text-slate-400 text-xs mb-3 ml-1 uppercase font-semibold tracking-widest">To</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 w-5 h-5" />
              <input value={city2} onChange={(e) => setCity2(e.target.value.toUpperCase().slice(0,3))} className="glass-input w-full pl-12 font-mono text-lg" />
            </div>
          </div>
        </div>
        <button onClick={fetchComparison} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-3">
          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
          {loading ? 'Comparing...' : 'Find Best Value'}
        </button>
        {error && <p className="text-red-400 text-center mt-6 text-sm font-medium">{error}</p>}
      </section>

      {data && data.data && (
        <div className="w-full max-w-6xl space-y-8 pb-24">
          <div className="glass-card bg-sky-500/10 border-sky-500/20 p-6 flex items-start gap-4">
            <Star className="text-sky-500 w-6 h-6 fill-current" />
            <div>
              <p className="text-slate-300 text-sm leading-relaxed">{data.summary?.reason ?? "Displaying insights."}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[data.data.city1, data.data.city2].map((rawCity, idx) => {
              const city = getCityData(rawCity);
              return (
                <div key={idx} className="glass-card p-8 flex flex-col border-t-2 border-t-sky-500/50 hover:bg-white/[0.03] transition-all">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h2 className="text-4xl font-bold text-white mb-1">{city.name}</h2>
                      <span className="text-slate-500 font-mono text-xs uppercase">{city.code}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-5xl font-black text-sky-400 tabular-nums">{city.score}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <a href={city.hotelLink} target="_blank" rel="noopener noreferrer" className="bg-white/[0.03] p-5 rounded-2xl border border-white/[0.05] block">
                      <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold uppercase mb-2">
                        <HomeIcon className="w-3 h-3" /> Lodging
                      </div>
                      <div className="text-2xl font-bold text-white">{city.hotelPrice === 'N/A' ? 'N/A' : `$${city.hotelPrice}`}</div>
                    </a>
                    <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/[0.05]">
                      <div className="flex items-center gap-2 text-[10px] text-sky-400 font-bold uppercase mb-2">
                        <Wind className="w-3 h-3" /> Weather
                      </div>
                      <div className="text-2xl font-bold text-white">{city.temp === 'N/A' ? 'N/A' : `${city.temp}°C`}</div>
                    </div>
                  </div>

                  <div className="space-y-6 flex-grow">
                    <MetricRow icon={<Wifi className="w-4 h-4" />} label="Internet" score={city.internet} color="text-sky-400" />
                    <MetricRow icon={<Shield className="w-4 h-4" />} label="Safety" score={city.safety} color="text-emerald-400" />
                    <MetricRow icon={<DollarSign className="w-4 h-4" />} label="Cost" score={city.cost} color="text-amber-400" />
                  </div>
                </div>
              );
            })}
          </div>

          {data.travel && (
            <a href={data.travel.booking_link ?? '#'} target="_blank" rel="noopener noreferrer" className="glass-card bg-indigo-500/20 border-indigo-500/30 p-8 flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer hover:bg-indigo-500/25 transition-all">
              <div className="flex items-center gap-6">
                <Plane className="text-white w-8 h-8" />
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Global Travel Finder</h3>
                  <p className="text-slate-400 text-sm">Best route via Aviasales</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-indigo-400 tabular-nums">{data.travel.min_price === 'N/A' ? 'Live Price' : `$${data.travel.min_price}`}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Starting Price</div>
              </div>
            </a>
          )}
        </div>
      )}
    </main>
  );
}

function MetricRow({ icon, label, score, color }: { icon: React.ReactNode, label: string, score: number, color: string }) {
  const safeScore = isNaN(score) ? 5 : Math.max(0, Math.min(10, score));
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex justify-between items-center text-xs text-slate-300 font-medium px-1">
        <div className="flex items-center gap-2">
          <span className={color}>{icon}</span>
          {label}
        </div>
        <span className="font-mono text-slate-400">{safeScore.toFixed(1)}/10</span>
      </div>
      <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${safeScore * 10}%` }} className="h-full bg-gradient-to-r from-sky-500 to-indigo-500" />
      </div>
    </div>
  );
}
