'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Plane, Loader2, Thermometer, Wifi, DollarSign, Star } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function Home() {
  const [city1, setCity1] = useState('ICN');
  const [city2, setCity2] = useState('BKK');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchComparison = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const url = `/api/v1/compare?city1=${city1.trim()}&city2=${city2.trim()}&t=${Date.now()}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('Service updating...');
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("UI Fetch Error:", err);
      setError('Comparison service is stabilizing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCData = (d: any) => ({
    name: d?.info?.name || 'City',
    score: d?.info?.nomad_score || '7.5',
    temp: d?.weather?.temperature ?? d?.weather?.temp ?? 'N/A',
    internet: d?.metrics?.["Internet Access"] || d?.metrics?.internet || 5.0,
    cost: d?.metrics?.["Cost of Living"] || d?.metrics?.cost_of_living || 5.0,
    hotel: d?.lodging?.price || 'N/A'
  });

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100 font-sans p-6 md:p-12 flex flex-col items-center selection:bg-sky-500/30">
      <div className="max-w-5xl w-full flex flex-col items-center">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-sky-500/10 border border-sky-500/20 px-4 py-1.5 rounded-full text-sky-400 text-xs font-bold tracking-[0.2em] uppercase mb-6">
            Travelpayouts Enabled
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">
            Nomad<span className="text-sky-400">Index</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
            Instant city comparison for the remote-first generation. Optimize your lifestyle with real-time analytics.
          </p>
        </motion.div>

        {/* Search Panel */}
        <div className="w-full max-w-3xl glass-card p-1 bg-gradient-to-br from-white/10 to-transparent rounded-[2.5rem] shadow-2xl mb-12">
          <div className="bg-[#0f172a]/90 backdrop-blur-2xl rounded-[2.4rem] p-8 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Home Base</label>
                <div className="relative group">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-500 group-focus-within:scale-110 transition-transform" />
                  <input 
                    type="text"
                    value={city1}
                    onChange={(e) => setCity1(e.target.value.toUpperCase().slice(0, 3))}
                    className="w-full bg-slate-800/40 border border-white/5 p-5 pl-14 rounded-2xl outline-none focus:border-sky-500/50 transition-all font-mono text-xl text-white placeholder:text-slate-700"
                    placeholder="ICN"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Target City</label>
                <div className="relative group">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500 group-focus-within:scale-110 transition-transform" />
                  <input 
                    type="text"
                    value={city2}
                    onChange={(e) => setCity2(e.target.value.toUpperCase().slice(0, 3))}
                    className="w-full bg-slate-800/40 border border-white/5 p-5 pl-14 rounded-2xl outline-none focus:border-indigo-500/50 transition-all font-mono text-xl text-white placeholder:text-slate-700"
                    placeholder="BKK"
                  />
                </div>
              </div>
            </div>
            
            <button 
              type="button"
              onClick={(e) => fetchComparison(e)}
              disabled={loading}
              className="w-full bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-900 font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-sky-500/20"
            >
              {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <Search className="w-6 h-6" />}
              <span className="text-lg uppercase tracking-widest">Run Comparison</span>
            </button>
            
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-center text-red-400 text-xs font-bold bg-red-400/5 py-3 rounded-xl border border-red-400/10">
                {error}
              </motion.div>
            )}
          </div>
        </div>

        {/* Results Panel */}
        <AnimatePresence>
          {data && data.data && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full space-y-8 pb-32"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {[data.data.city1, data.data.city2].map((raw, i) => {
                  const c = getCData(raw);
                  return (
                    <div key={i} className="bg-slate-900/50 border border-white/5 p-8 md:p-10 rounded-[3rem] backdrop-blur-xl hover:border-white/10 transition-colors">
                      <div className="flex justify-between items-start mb-10">
                        <div>
                          <h3 className="text-4xl font-bold text-white mb-2">{c.name}</h3>
                          <span className="text-slate-500 font-mono text-sm tracking-widest uppercase">{i === 0 ? 'Current' : 'Prospective'}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-6xl font-black text-sky-400 tabular-nums">{c.score}</div>
                          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Nomad Score</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-10">
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex flex-col items-center text-center">
                          <DollarSign className="w-5 h-5 text-emerald-400 mb-3" />
                          <div className="text-2xl font-bold text-white">${c.hotel}</div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Rent / Night</div>
                        </div>
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex flex-col items-center text-center">
                          <Thermometer className="w-5 h-5 text-sky-400 mb-3" />
                          <div className="text-2xl font-bold text-white">{c.temp}°C</div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Live Temp</div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <SimpleMetric icon={<Wifi />} label="Internet" val={c.internet} />
                        <SimpleMetric icon={<Star />} label="Vibe & Quality" val={c.cost} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {data.summary && (
                <div className="bg-sky-500/5 border border-sky-500/10 p-10 rounded-[3rem] flex flex-col md:flex-row items-center gap-8">
                  <div className="bg-sky-500 p-6 rounded-3xl shadow-xl shadow-sky-500/20">
                    <Plane className="text-slate-900 w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white mb-2">{data.summary.recommended_city} Is Ready</h4>
                    <p className="text-slate-400 leading-relaxed max-w-xl">
                      {data.summary.reason} Our AI predicts a higher satisfaction index for this transition based on your nomadic profile.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function SimpleMetric({ icon, label, val }: any) {
  const v = Number(val) || 5;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
          {icon} {label}
        </div>
        <div className="text-sm font-mono text-white">{v.toFixed(1)}</div>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${v * 10}%` }}
          className="h-full bg-sky-500"
        />
      </div>
    </div>
  );
}
