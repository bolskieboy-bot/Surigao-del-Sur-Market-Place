import React from 'react';
import { ShoppingBag, ShieldCheck, Heart } from 'lucide-react';
import { SURIGAO_DEL_SUR_MUNICIPALITIES } from '../../data/surigaoData';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { setSelectedMunicipality, setBuyerTab, role, setRole } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-300 text-xs border-t border-slate-800 mt-16 pt-12 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-700 to-indigo-900 text-amber-400 flex items-center justify-center font-bold border border-amber-400/40">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-white text-sm tracking-tight">
                SURIGAO DEL SUR MARKETPLACE
              </span>
            </div>
            <p className="text-amber-400 font-semibold text-xs italic">
              “Buy Local. Sell Local. Grow Surigao del Sur.”
            </p>
            <p className="text-slate-400 text-xs leading-relaxed">
              An independent online marketplace connecting local producers, farmers, artisans, and family businesses across the entire province.
            </p>

            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                Accepted Payment Methods:
              </span>
              <div className="flex items-center space-x-2">
                <span className="bg-blue-600/30 text-blue-300 font-bold px-2 py-0.5 rounded-sm border border-blue-500/40 text-[10px]">
                  GCash
                </span>
                <span className="bg-emerald-600/30 text-emerald-300 font-bold px-2 py-0.5 rounded-sm border border-emerald-500/40 text-[10px]">
                  Maya
                </span>
                <span className="bg-amber-600/30 text-amber-300 font-bold px-2 py-0.5 rounded-sm border border-amber-500/40 text-[10px]">
                  Cash on Delivery (COD)
                </span>
              </div>
            </div>
          </div>

          {/* Col 2: Provincial Municipalities Quick Jump */}
          <div className="md:col-span-2 space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              19 Municipalities & Cities of Surigao del Sur
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px] text-slate-400 pt-1">
              {SURIGAO_DEL_SUR_MUNICIPALITIES.map((m) => (
                <button
                  key={m.name}
                  onClick={() => {
                    setSelectedMunicipality(m.name);
                    if (role === 'buyer') setBuyerTab('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-left hover:text-amber-400 transition-colors flex items-center space-x-1"
                >
                  <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                  <span>{m.name} {m.isCity ? '(City)' : ''}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Col 3: Safe Marketplace & Transparent Commission */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Provincial Protection</span>
            </h4>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-2 text-xs">
              <p className="text-slate-300">
                <strong className="text-amber-400">3% Fair Commission:</strong> Calculated strictly on product sale value upon completed delivery. Delivery fees are 100% exempt.
              </p>
              <p className="text-slate-400 text-[11px]">
                Verified local sellers, transparent GCash & Maya accounts, and community buyer protection.
              </p>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Box as mandated by branding rules */}
        <div className="border-t border-slate-800 pt-6 text-center space-y-2">
          <p className="text-slate-400 text-xs max-w-3xl mx-auto leading-relaxed">
            <span className="font-semibold text-slate-300">Disclaimer:</span> Surigao del Sur Marketplace is an independent online marketplace platform for local buyers and sellers in Surigao del Sur. This platform is not an official Provincial Government entity or government portal.
          </p>
          <p className="text-slate-400 text-[11px] flex items-center justify-center space-x-1">
            <span>Built with care for the people of Surigao del Sur</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            <span>© {new Date().getFullYear()} Surigao del Sur Marketplace</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
