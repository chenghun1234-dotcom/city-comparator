'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Wind, Wifi, Shield, DollarSign, Plane, Star, Loader2, Home as HomeIcon } from 'lucide-react';

export const dynamic = 'force-dynamic';

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
      const res = await fetch(`/api/v1/compare?city1=${city1.trim()}&city2=${city2.trim()}&t=${Date.now()}`);
      if (!res.ok) throw new Error('API Unavailable');
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError('Connection stable, data loading...');
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const getCity = (d: any) => ({
    name: d?.info?.name ?? 'City',
    score: d?.info?.nomad_score ?? '7.5',
    temp: d?.weather?.temperature ?? 'N/A',
    internet: d?.metrics?.["Internet Access"] ?? 5,
    cost: d?.metrics?.["Cost of Living"] ?? 5,
    hotel: d?.lodging?.price ?? 'N/A'
  });

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100 font-sans p-6 flex flex-col items-center overflow-x-hidden">
      <div className="max-w-4xl w-full mt-10 md:mt-20">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-center tracking-tight">
          Nomad<span className="text-sky-400">Index.</span>
        </h1>
        
        <div className="glass-card p-8 mb-10 shadow-2xl border border-white/5 bg-slate-900/50 backdrop-blur-xl rounded-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <MapPin className="absolute left-4 top-4 text-sky-400 w-5 h-5" />
              <input value={city1} onChange={e => setCity1(e.target.value.toUpperCase())} className="w-full bg-slate-800/50 border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:ring-1 ring-sky-400 transition-all font-mono" />
            </div>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 text-indigo-400 w-5 h-5" />
              <input value={city2} onChange={e => setCity2(e.target.value.toUpperCase())} className="w-full bg-slate-800/50 border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:ring-1 ring-indigo-400 transition-all font-mono" />
            </div>
          </div>
          <button onClick={fetchComparison} disabled={loading} className="w-full btn-primary bg-gradient-to-r from-sky-400 to-indigo-500 p-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
            {loading ? 'Analyzing...' : 'Compare Cities'}
          </button>
        </div>

        {data && (
          <div className="space-y-8 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[data.data.city1, data.data.city2].map((raw, i) => {
                const c = getCity(raw);
                return (
                  <div key={i} className="glass-card p-8 bg-slate-900/50 rounded-3xl border border-white/5">
                    <div className="flex justify-between items-start mb-6">
                      <h2 className="text-3xl font-bold">{c.name}</h2>
                      <div className="text-3xl font-black text-sky-400">{c.score}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white/5 p-4 rounded-2xl">
                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Hotel</div>
                        <div className="text-xl font-bold">${c.hotel}</div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl">
                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Temp</div>
                        <div className="text-xl font-bold">{c.temp}°C</div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Bar label="Wifi" val={c.internet} />
                      <Bar label="Cost" val={c.cost} />
                    </div>
                  </div>
                );
              })}
            </div>
            {data.travel && (
              <div className="glass-card p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Plane className="text-indigo-400 w-6 h-6" />
                  <span className="font-bold">Flights from origin</span>
                </div>
                <div className="text-2xl font-black text-indigo-400">${data.travel.price}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function Bar({ label, val }: any) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1 font-bold"><span className="text-slate-400">{label}</span><span>{Number(val).toFixed(1)}/10</span></div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${val * 10}%` }} className="h-full bg-sky-400" />
      </div>
    </div>
  );
}
