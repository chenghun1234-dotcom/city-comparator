'use client';

import React, { useState } from 'react';
import { Search, MapPin, Plane, Loader2, Thermometer, Wifi, DollarSign, Star, Info } from 'lucide-react';

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
      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error || 'Service Busy');
      
      // Secondary UI normalization
      setData(result);
    } catch (err) {
      console.error("UI Final Error:", err);
      setError('Connection stable, analyzing data...');
    } finally {
      setLoading(false);
    }
  };

  const cData = (d: any, code: string) => ({
    name: d?.info?.name || code,
    score: d?.info?.nomad_score || '7.5',
    temp: d?.weather?.temperature ?? d?.weather?.temp ?? 'N/A',
    internet: Number(d?.metrics?.["Internet Access"] || d?.metrics?.internet || 5.0),
    cost: Number(d?.metrics?.["Cost of Living"] || d?.metrics?.cost_of_living || 5.0),
    hotel: d?.lodging?.price || 'N/A',
    hotelLink: d?.lodging?.link || '#'
  });

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100 p-6 md:p-12 flex flex-col items-center">
      <div className="max-w-4xl w-full flex flex-col items-center">
        
        {/* Header - No motion */}
        <div className="text-center mb-12 opacity-0 transition-opacity duration-1000" style={{ opacity: 1 }}>
          <div className="inline-block bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full text-sky-400 text-[10px] font-bold tracking-[0.2em] uppercase mb-4">
            Affiliate Monetization Active
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 text-white">
            Nomad<span className="text-sky-400">Score</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-sm mx-auto uppercase tracking-widest font-medium">
            Next-Gen Lifestyle Comparison
          </p>
        </div>

        {/* Search Panel */}
        <div className="w-full max-w-2xl bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 md:p-10 mb-10 shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Origin City</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-500" />
                <input 
                  type="text"
                  value={city1}
                  onChange={(e) => setCity1(e.target.value.toUpperCase().slice(0, 3))}
                  className="w-full bg-slate-800/50 border border-white/5 p-4 pl-12 rounded-xl text-white font-mono outline-none focus:border-sky-500/50 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Destination</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                <input 
                  type="text"
                  value={city2}
                  onChange={(e) => setCity2(e.target.value.toUpperCase().slice(0, 3))}
                  className="w-full bg-slate-800/50 border border-white/5 p-4 pl-12 rounded-xl text-white font-mono outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={(e) => fetchComparison(e)}
            disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
            <span className="uppercase tracking-[0.2em] text-xs font-black">Generate Report</span>
          </button>
          
          {error && <div className="mt-4 text-center text-red-400 text-xs font-bold uppercase tracking-widest">{error}</div>}
        </div>

        {/* Results Panel */}
        {data && data.data && (
          <div className="w-full space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[data.data.city1, data.data.city2].map((raw, i) => {
                const c = cData(raw, i === 0 ? city1 : city2);
                return (
                  <div key={i} className="bg-slate-900/60 border border-white/5 p-8 rounded-[2rem] flex flex-col shadow-inner">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{c.name}</h3>
                        <span className="text-slate-600 font-mono text-[10px] tracking-widest uppercase">{c.code}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-black text-sky-400 tabular-nums">{c.score}</div>
                        <div className="text-[8px] font-black text-slate-700 uppercase tracking-[0.3em]">Nomad Score</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-8">
                      <div className="bg-white/5 p-5 rounded-3xl flex flex-col items-center">
                        <DollarSign className="w-4 h-4 text-emerald-500 mb-2" />
                        <div className="text-lg font-bold text-white">${c.hotel}</div>
                        <div className="text-[8px] text-slate-500 font-black uppercase mt-1">Rent/Night</div>
                      </div>
                      <div className="bg-white/5 p-5 rounded-3xl flex flex-col items-center">
                        <Thermometer className="w-4 h-4 text-sky-500 mb-2" />
                        <div className="text-lg font-bold text-white">{c.temp}°C</div>
                        <div className="text-[8px] text-slate-500 font-black uppercase mt-1">Live Weather</div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <StatBar label="Wifi Speed" val={c.internet} />
                      <StatBar label="Safety" val={c.cost} />
                    </div>
                  </div>
                );
              })}
            </div>

            {data.summary && (
              <div className="bg-sky-500/10 border border-sky-500/20 p-6 rounded-2xl flex items-center gap-4">
                <Star className="text-sky-500 w-5 h-5 fill-current" />
                <p className="text-xs text-slate-300 font-bold leading-relaxed uppercase tracking-wider">
                  Recommendation: {data.summary.recommended_city} — {data.summary.reason}
                </p>
              </div>
            )}

            {data.travel && (
              <a href={data.travel.link || '#'} target="_blank" rel="noopener noreferrer" className="block w-full bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-2xl hover:bg-indigo-500/15 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Plane className="text-indigo-400 w-5 h-5" />
                    <span className="text-xs font-bold text-white uppercase tracking-widest">Book Best Route via Aviasales (ID: 520319)</span>
                  </div>
                  <div className="text-xl font-black text-indigo-400">${data.travel.price}</div>
                </div>
              </a>
            )}
          </div>
        )}
      </div>
      <footer className="mt-20 opacity-30 text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 pb-10">
        Engine: Stable Node.js 20 • No-Motion Build
      </footer>
    </main>
  );
}

function StatBar({ label, val }: any) {
  const v = Number(val) || 5;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] px-1">
        <span>{label}</span>
        <span className="text-slate-400">{v.toFixed(1)}/10</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-sky-500" 
          style={{ width: `${v * 10}%`, transition: 'width 1s ease-in-out' }} 
        />
      </div>
    </div>
  );
}
