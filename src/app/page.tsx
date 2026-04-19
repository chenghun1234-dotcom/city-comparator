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
      const res = await fetch(`/api/v1/compare?city1=${city1}&city2=${city2}`);
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to fetch comparison');
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Safe data accessors
  const getCityData = (cityData: any) => ({
    name: cityData?.info?.name ?? 'Unknown',
    code: cityData?.info?.code ?? 'N/A',
    score: cityData?.info?.nomad_score ?? '75.0',
    temp: cityData?.weather?.temp ?? 'N/A',
    weatherDesc: cityData?.weather?.condition === 0 ? 'Clear Sky' : 'Partly Cloudy',
    internet: cityData?.metrics?.internet ?? 5.0,
    safety: cityData?.metrics?.safety ?? 5.0,
    cost: cityData?.metrics?.cost_of_living ?? 5.0,
    hotelPrice: cityData?.lodging?.avg_price ?? 'N/A',
    hotelLink: cityData?.lodging?.booking_link ?? '#'
  });

  return (
    <main className="min-h-screen mesh-bg p-4 md:p-8 flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-6xl mt-12 mb-16 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
        >
          Compare <span className="text-gradient">Everywhere.</span><br />
          Work <span className="text-indigo-400">Anywhere.</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto"
        >
          Ultra-fast city comparison for digital nomads. Optimized for Vercel Edge with <span className="text-sky-400 font-bold">Travelpayouts</span> real-time data.
        </motion.p>
      </section>

      {/* Input Section */}
      <section className="w-full max-w-4xl glass-card p-8 mb-12 relative z-10 transition-all hover:border-sky-500/30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="relative">
            <label className="block text-slate-400 text-sm mb-2 ml-2 tracking-widest uppercase">From (IATA)</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-400 w-5 h-5" />
              <input 
                value={city1}
                onChange={(e) => setCity1(e.target.value.toUpperCase().slice(0, 3))}
                placeholder="e.g. ICN"
                className="glass-input w-full pl-12 font-mono text-lg"
              />
            </div>
          </div>
          <div className="relative">
            <label className="block text-slate-400 text-sm mb-2 ml-2 tracking-widest uppercase">To (IATA)</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 w-5 h-5" />
              <input 
                value={city2}
                onChange={(e) => setCity2(e.target.value.toUpperCase().slice(0, 3))}
                placeholder="e.g. BKK"
                className="glass-input w-full pl-12 font-mono text-lg"
              />
            </div>
          </div>
        </div>
        <button 
          onClick={fetchComparison}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-3 active:scale-95 transition-transform"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Search className="w-5 h-5" />}
          {loading ? 'AI analyzing cities...' : 'Find Best Value'}
        </button>
        {error && <p className="text-red-400 text-center mt-4 text-sm font-medium">{error}</p>}
      </section>

      {/* Results Dashboard */}
      <AnimatePresence mode="wait">
        {data && data.data && (
          <motion.section 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="w-full max-w-6xl space-y-8 pb-20"
          >
            {/* Summary Banner */}
            <div className="glass-card bg-sky-500/10 border-sky-500/20 p-6 flex items-start gap-4">
              <div className="bg-sky-500 rounded-full p-2 mt-1">
                <Star className="text-white w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Top Recommendation Explorer</h3>
                <p className="text-slate-300">
                  {data.summary?.reason ?? "Comparison results ready."} Flight starting from <span className="text-sky-400 font-bold">${data.travel?.min_price ?? 'N/A'}</span>.
                </p>
              </div>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[data.data.city1, data.data.city2].map((rawCity, idx) => {
                const city = getCityData(rawCity);
                return (
                  <div key={idx} className="glass-card p-8 flex flex-col border-t-4 border-t-sky-500/50 hover:shadow-2xl hover:shadow-sky-500/10 transition-all">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h2 className="text-3xl font-bold mb-1">{city.name}</h2>
                        <span className="text-slate-400 font-mono tracking-widest">{city.code}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-bold text-sky-400">{city.score}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-widest">Nomad Score</div>
                      </div>
                    </div>

                    {/* Pricing Row */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <a href={city.hotelLink} target="_blank" rel="noopener noreferrer" className="bg-slate-800/60 p-5 rounded-2xl hover:bg-slate-700/60 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold uppercase mb-2">
                          <HomeIcon className="w-3 h-3" /> Lodging
                        </div>
                        <div className="text-2xl font-bold">{city.hotelPrice === 'N/A' ? 'N/A' : `$${city.hotelPrice}`}</div>
                        <div className="text-[10px] text-slate-500 mt-1 group-hover:text-sky-400 transition-colors underline">Deals on Travelpayouts</div>
                      </a>
                      <div className="bg-slate-800/60 p-5 rounded-2xl">
                        <div className="flex items-center gap-2 text-xs text-sky-400 font-bold uppercase mb-2">
                          <Wind className="w-3 h-3" /> Current
                        </div>
                        <div className="text-2xl font-bold">{city.temp === 'N/A' ? 'N/A' : `${city.temp}°C`}</div>
                        <div className="text-[10px] text-slate-500 mt-1 uppercase truncate">{city.weatherDesc}</div>
                      </div>
                    </div>

                    {/* Detailed Metrics */}
                    <div className="space-y-5 flex-grow">
                      <MetricRow 
                        icon={<Wifi className="w-4 h-4" />} 
                        label="Internet Access" 
                        score={Number(city.internet)} 
                        color="text-sky-400" 
                      />
                      <MetricRow 
                        icon={<Shield className="w-4 h-4" />} 
                        label="Safety Index" 
                        score={Number(city.safety)} 
                        color="text-emerald-400" 
                      />
                      <MetricRow 
                        icon={<DollarSign className="w-4 h-4" />} 
                        label="Living Cost" 
                        score={Number(city.cost)} 
                        color="text-amber-400" 
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Travel CTA */}
            {data.travel?.min_price && (
              <motion.a
                href={data.travel?.booking_link ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -5 }}
                className="glass-card bg-indigo-500/20 border-indigo-500/30 p-8 flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer group"
              >
                <div className="flex items-center gap-6">
                  <div className="bg-indigo-500 p-4 rounded-2xl group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-500/20">
                    <Plane className="text-white w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-1">Global Travel Finder</h3>
                    <p className="text-slate-400 tracking-tight">Best route via Aviasales (Affiliate: 520319)</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className="text-3xl font-bold text-indigo-400">{data.travel.min_price === 'N/A' ? 'Check Price' : `$${data.travel.min_price}`}</div>
                    <div className="text-xs text-slate-500 uppercase">One Way Ticket</div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-full group-hover:bg-indigo-500 transition-colors">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                </div>
              </motion.a>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      <footer className="mt-20 py-10 text-slate-500 text-sm border-t border-white/5 w-full max-w-6xl text-center">
        <p>© 2026 NomadCity. Built with Vercel Serverless. Data: Travelpayouts, Open-Meteo, and Teleport.</p>
      </footer>
    </main>
  );
}

function MetricRow({ icon, label, score, color }: { icon: React.ReactNode, label: string, score: number, color: string }) {
  // Defensive clamp and check
  const safeScore = isNaN(score) ? 5 : Math.max(0, Math.min(10, score));
  
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <span className={color}>{icon}</span>
          {label}
        </div>
        <span className="text-sm font-mono">{safeScore.toFixed(1)}/10</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${safeScore * 10}%` }}
          className={`h-full bg-gradient-to-r from-sky-400 to-indigo-500`}
        />
      </div>
    </div>
  );
}
