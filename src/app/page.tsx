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
      if (!res.ok) throw new Error('API Service Busy');
      
      const result = await res.json();
      
      // Deep data normalization to prevent UI crashes
      const normalizedData = {
        summary: result.summary || { recommended_city: 'Both Cities', reason: 'Balanced value.' },
        travel: result.travel || { price: 'N/A', link: '#' },
        data: {
          city1: normalizeCity(result.data?.city1, city1),
          city2: normalizeCity(result.data?.city2, city2)
        }
      };
      
      setData(normalizedData);
    } catch (err) {
      console.error("UI Fetch Error:", err);
      setError('Service is currently updating or Rate Limited. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const normalizeCity = (c: any, defaultCode: string) => ({
    name: c?.info?.name || defaultCode,
    code: c?.info?.code || defaultCode,
    score: c?.info?.nomad_score || '7.5',
    temp: c?.weather?.temperature ?? c?.weather?.temp ?? 'N/A',
    internet: Number(c?.metrics?.["Internet Access"] || c?.metrics?.internet || 5.0),
    cost: Number(c?.metrics?.["Cost of Living"] || c?.metrics?.cost_of_living || 5.0),
    hotel: c?.lodging?.price || 'N/A',
    hotelLink: c?.lodging?.link || '#'
  });

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100 p-4 md:p-12 flex flex-col items-center">
      <div className="max-w-4xl w-full flex flex-col items-center">
        {/* Header - Simple CSS Transition */}
        <div className="text-center mb-12 animate-in fade-in duration-700 slide-in-from-top-4">
          <div className="inline-block bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full text-sky-400 text-[10px] font-bold tracking-[0.2em] uppercase mb-4">
            Travelpayouts API Live
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 text-white">
            Nomad<span className="text-sky-400">Index</span>
          </h1>
          <p className="text-slate-400 text-base max-w-lg mx-auto">
            Real-time nomad metric comparator. Built for sub-second precision.
          </p>
        </div>

        {/* Search Panel - No complex motion */}
        <div className="w-full max-w-2xl bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 md:p-10 mb-10 shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Origin</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-500" />
                <input 
                  type="text"
                  value={city1}
                  onChange={(e) => setCity1(e.target.value.toUpperCase().slice(0, 3))}
                  className="w-full bg-slate-800/50 border border-white/5 p-4 pl-12 rounded-xl outline-none focus:border-sky-500/50 transition-all font-mono"
                  placeholder="ICN"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Destination</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                <input 
                  type="text"
                  value={city2}
                  onChange={(e) => setCity2(e.target.value.toUpperCase().slice(0, 3))}
                  className="w-full bg-slate-800/50 border border-white/5 p-4 pl-12 rounded-xl outline-none focus:border-indigo-500/50 transition-all font-mono"
                  placeholder="BKK"
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
            <span className="uppercase tracking-widest">Update Comparison</span>
          </button>
          
          {error && (
            <div className="mt-4 text-center text-red-400 text-xs font-medium border border-red-400/20 bg-red-400/5 p-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Results Panel */}
        {data && data.data && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {[data.data.city1, data.data.city2].map((c, i) => (
                <div key={i} className="bg-slate-900/40 border border-white/5 p-8 rounded-[2rem] flex flex-col">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">{c.name}</h3>
                      <span className="text-slate-500 font-mono text-[10px] tracking-widest uppercase">{c.code}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-black text-sky-400 tabular-nums">{c.score}</div>
                      <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Global Index</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="bg-white/5 p-4 rounded-2xl flex flex-col items-center">
                      <DollarSign className="w-4 h-4 text-emerald-400 mb-2" />
                      <div className="text-xl font-bold text-white">${c.hotel}</div>
                      <div className="text-[9px] text-slate-500 font-bold uppercase mt-1">Rent Avg</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl flex flex-col items-center">
                      <Thermometer className="w-4 h-4 text-sky-400 mb-2" />
                      <div className="text-xl font-bold text-white">{c.temp}°C</div>
                      <div className="text-[9px] text-slate-500 font-bold uppercase mt-1">Live Temp</div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <SimpleBar label="Wifi" val={c.internet} />
                    <SimpleBar label="Vibe" val={c.cost} />
                  </div>
                </div>
              ))}
            </div>

            {data.summary && (
              <div className="bg-sky-500/10 border border-sky-500/20 p-6 rounded-2xl flex items-center gap-4 mb-10">
                <div className="bg-sky-500 p-3 rounded-xl shadow-lg shadow-sky-500/20">
                  <Info className="text-slate-900 w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-300 font-medium leading-relaxed">
                    <span className="text-white font-bold">{data.summary.recommended_city}</span>: {data.summary.reason}
                  </p>
                </div>
              </div>
            )}

            {data.travel && (
              <a href={data.travel.link || '#'} target="_blank" rel="noopener noreferrer" className="block w-full bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-2xl hover:bg-indigo-500/15 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Plane className="text-indigo-400 w-6 h-6" />
                    <div>
                      <h4 className="text-lg font-bold text-white">Find Best Route</h4>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Powered by Travelpayouts</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-indigo-400 tabular-nums">{data.travel.price === 'N/A' ? 'Check Price' : `$${data.travel.price}`}</div>
                  </div>
                </div>
              </a>
            )}
          </div>
        )}
      </div>
      
      <footer className="mt-auto pt-16 pb-8 text-[10px] text-slate-600 uppercase tracking-[0.3em] font-bold">
        City Comparator v1.0 • Node.js Stable
      </footer>
    </main>
  );
}

function SimpleBar({ label, val }: any) {
  const v = Number(val) || 5;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
        <span>{label}</span>
        <span className="text-slate-300 font-mono">{v.toFixed(1)}/10</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-sky-500 transition-all duration-1000" 
          style={{ width: `${v * 10}%` }}
        />
      </div>
    </div>
  );
}
