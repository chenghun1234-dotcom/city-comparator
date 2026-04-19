'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      // Explicitly bypass cache with headers and a new endpoint to resolve 500 crashes
      const res = await fetch(`/api/v1/nomad?city1=${city1.trim()}&city2=${city2.trim()}`, {
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Comparison Service Unavailable');
      setData(result);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCityData = (cityData: any) => ({
    name: cityData?.info?.name ?? 'Unknown Location',
    code: cityData?.info?.code ?? 'N/A',
    score: cityData?.info?.nomad_score ?? '75.0',
    temp: cityData?.weather?.temp ?? 'N/A',
    weatherDesc: cityData?.weather?.condition === 0 ? 'Clear Sky' : 'Partly Cloudy',
    internet: Number(cityData?.metrics?.internet ?? 5.0),
    safety: Number(cityData?.metrics?.safety ?? 5.0),
    cost: Number(cityData?.metrics?.cost_of_living ?? 5.0),
    hotelPrice: cityData?.lodging?.avg_price ?? 'N/A',
    hotelLink: cityData?.lodging?.booking_link ?? '#'
  });

  return (
    <main className="min-h-screen mesh-bg p-4 md:p-8 flex flex-col items-center overflow-x-hidden">
      {/* Hero Section */}
      <section className="w-full max-w-6xl mt-12 mb-16 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-white"
        >
          Compare <span className="text-gradient">Everywhere.</span><br />
          Work <span className="text-indigo-400">Anywhere.</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto"
        >
          Next-gen city comparison for nomads. Powered by <span className="text-sky-400 font-bold">Travelpayouts</span> real-time data.
        </motion.p>
      </section>

      {/* Input UI */}
      <section className="w-full max-w-4xl glass-card p-8 mb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-slate-400 text-xs mb-3 ml-1 tracking-[0.2em] uppercase font-semibold">Origin City (IATA)</label>
            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-400 w-5 h-5 group-focus-within:scale-110 transition-transform" />
              <input 
                value={city1}
                onChange={(e) => setCity1(e.target.value.toUpperCase().slice(0, 3))}
                placeholder="ICN"
                className="glass-input w-full pl-12 font-mono text-lg placeholder:text-slate-600"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-400 text-xs mb-3 ml-1 tracking-[0.2em] uppercase font-semibold">Destination (IATA)</label>
            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 w-5 h-5 group-focus-within:scale-110 transition-transform" />
              <input 
                value={city2}
                onChange={(e) => setCity2(e.target.value.toUpperCase().slice(0, 3))}
                placeholder="BKK"
                className="glass-input w-full pl-12 font-mono text-lg placeholder:text-slate-600"
              />
            </div>
          </div>
        </div>
        <button 
          onClick={fetchComparison}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
          {loading ? 'AI analyzing...' : 'Find Best Value'}
        </button>
        {error && (
          <motion.p initial={{opacity:0}} animate={{opacity:1}} className="text-red-400 text-center mt-6 text-sm font-medium bg-red-400/10 py-2 px-4 rounded-lg">
            {error}
          </motion.p>
        )}
      </section>

      {/* Results Rendering */}
      <AnimatePresence mode="wait">
        {data && data.data && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-6xl space-y-8 pb-24"
          >
            {/* Header Recommendation */}
            <div className="glass-card bg-sky-500/10 border-sky-500/20 p-6 flex items-start gap-4">
              <div className="bg-sky-500 rounded-full p-2 mt-1 shadow-lg shadow-sky-500/30">
                <Star className="text-white w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Nomad Value Insights</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {data.summary?.reason ?? "Search complete."} Destination lodging averages <span className="text-emerald-400 font-bold">${getCityData(data.data.city2).hotelPrice}</span>.
                </p>
              </div>
            </div>

            {/* City Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[data.data.city1, data.data.city2].map((rawCity, idx) => {
                const city = getCityData(rawCity);
                return (
                  <div key={idx} className="glass-card p-8 flex flex-col border-t-2 border-t-sky-500/50 hover:bg-white/[0.03] transition-colors">
                    <div className="flex justify-between items-start mb-10">
                      <div>
                        <h2 className="text-4xl font-bold text-white mb-1">{city.name}</h2>
                        <span className="text-slate-500 font-mono tracking-[0.3em] text-xs uppercase">{city.code}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-5xl font-black text-sky-400 tabular-nums">{city.score}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Nomad Index</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-10">
                      <a href={city.hotelLink} target="_blank" rel="noopener noreferrer" className="bg-white/[0.03] p-5 rounded-2xl hover:bg-white/[0.06] transition-all group border border-white/[0.05]">
                        <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold uppercase mb-2 tracking-widest">
                          <HomeIcon className="w-3 h-3" /> Lodging
                        </div>
                        <div className="text-2xl font-bold text-white">{city.hotelPrice === 'N/A' ? 'N/A' : `$${city.hotelPrice}`}</div>
                        <div className="text-[9px] text-slate-500 mt-2 group-hover:text-sky-400 transition-colors uppercase font-semibold">View on Travelpayouts</div>
                      </a>
                      <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/[0.05]">
                        <div className="flex items-center gap-2 text-[10px] text-sky-400 font-bold uppercase mb-2 tracking-widest">
                          <Wind className="w-3 h-3" /> Weather
                        </div>
                        <div className="text-2xl font-bold text-white">{city.temp === 'N/A' ? 'N/A' : `${city.temp}°C`}</div>
                        <div className="text-[9px] text-slate-500 mt-2 uppercase truncate">{city.weatherDesc}</div>
                      </div>
                    </div>

                    <div className="space-y-6 flex-grow">
                      <MetricRow icon={<Wifi className="w-4 h-4" />} label="Digital Infrastructure" score={city.internet} color="text-sky-400" />
                      <MetricRow icon={<Shield className="w-4 h-4" />} label="Safety & Order" score={city.safety} color="text-emerald-400" />
                      <MetricRow icon={<DollarSign className="w-4 h-4" />} label="Cost of Living" score={city.cost} color="text-amber-400" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Travel Footer Link */}
            {data.travel && (
              <motion.a
                href={data.travel.booking_link ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -4, backgroundColor: "rgba(99, 102, 241, 0.25)" }}
                className="glass-card bg-indigo-500/20 border-indigo-500/30 p-8 flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer group"
              >
                <div className="flex items-center gap-6">
                  <div className="bg-indigo-500 p-4 rounded-2xl shadow-xl shadow-indigo-500/20 group-hover:rotate-6 transition-transform">
                    <Plane className="text-white w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Global Travel Finder</h3>
                    <p className="text-slate-400 text-sm">Find cheapest routes via Aviasales (ID: 520319)</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className="text-4xl font-black text-indigo-400 tabular-nums">{data.travel.min_price === 'N/A' ? 'LIVE' : `$${data.travel.min_price}`}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Starting Price</div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-full group-hover:bg-indigo-500 transition-colors">
                    <ArrowRight className="w-6 h-6 text-white" />
                  </div>
                </div>
              </motion.a>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}

function MetricRow({ icon, label, score, color }: { icon: React.ReactNode, label: string, score: number, color: string }) {
  const safeScore = isNaN(score) ? 5 : Math.max(0, Math.min(10, score));
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3 text-xs text-slate-300 font-medium">
          <span className={color}>{icon}</span>
          {label}
        </div>
        <span className="text-xs font-mono text-slate-400">{safeScore.toFixed(1)}/10</span>
      </div>
      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${safeScore * 10}%` }}
          className={`h-full bg-gradient-to-r from-sky-500 to-indigo-500`}
        />
      </div>
    </div>
  );
}
