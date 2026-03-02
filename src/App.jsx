import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, Check, ArrowRight, Store, Info, Zap, 
  Settings, List, Tags, TrendingUp, BarChart3, Wallet, Ticket, 
  ChevronDown, AlertCircle, Plus, Minus, Megaphone, 
  MousePointer2, ShoppingBag, Activity, Eye, Calculator, 
  Receipt, Crosshair, BarChart, ChevronRight, Sparkles, Edit3, X, HelpCircle
} from 'lucide-react';

// --- CONSTANTS & DATA ---
const STRATEGY = {
  'normal': { k: 20, v: 0, tiers: null, title: 'Normal Plan', subtitle: 'Basic', benefits: ['Margin optimal 100%', 'Tanpa biaya ekstra'] },
  'puas-cuan': { k: 32, v: 30, tiers: { hemat: { max: 45000, min: 15000 }, ekstra: { max: 80000, min: 35000 } }, title: 'Cuan 32%', subtitle: 'High Volume', benefits: ['Promo aktif 30%', 'Prioritas visibilitas'] },
  'booster': { k: 38, v: 35, tiers: { hemat: { max: 55000, min: 15000 }, ekstra: { max: 100000, min: 35000 } }, title: 'Booster 38%', subtitle: 'Max Exposure', benefits: ['Flash Sale 50%', 'Ranking pencarian #1'] },
  'cofund': { k: 20, v: 40, tiers: null, title: 'Co-Fund', subtitle: 'Partnership', benefits: ['Patungan diskon', 'Beban fleksibel'] }
};

const VOUCHERS = [
  { code: 'PROMO30', scheme: 'puas-cuan', label: 'Diskon Reguler 30%', desc: 'Potongan 30%', disc: 30 },
  { code: 'BOOSTER35', scheme: 'booster', label: 'Diskon Spesial 35%', desc: 'Potongan 35%', disc: 35 },
  { code: 'KILAT50', scheme: 'booster', label: 'Diskon Kilat 50%', desc: 'Maks. Rp40.000', disc: 50, overrideMin: 59000, overrideMax: 40000 },
  { code: 'COFUND20', scheme: 'cofund', label: 'Diskon Patungan 20%', desc: 'Sharing Cost', disc: 20 },
  { code: 'COFUND40', scheme: 'cofund', label: 'Diskon Patungan 40%', desc: 'Sharing Cost', disc: 40 },
  { code: 'COFUND50', scheme: 'cofund', label: 'Diskon Patungan 50%', desc: 'Sharing Cost', disc: 50 }
];

const COFUND_PRESETS = [
  { id: 'p50_60', label: 'Diskon 50% (Toko 60%)', vDisk: 50, mShare: 60 },
  { id: 'p40_50', label: 'Diskon 40% (Toko 50%)', vDisk: 40, mShare: 50 },
  { id: 'p35_50', label: 'Diskon 35% (Toko 50%)', vDisk: 35, mShare: 50 },
  { id: 'p30_40', label: 'Diskon 30% (Toko 40%)', vDisk: 30, mShare: 40 },
  { id: 'p20_30', label: 'Diskon 20% (Toko 30%)', vDisk: 20, mShare: 30 }
];

const METRICS_GUIDE = [
  { metric: "Click-Through Rate (CTR)", rows: [ { status: "Perlu Perbaikan", range: "< 1%", desc: "Foto kurang menarik, perbaiki visual.", color: "text-rose-400", dot: "bg-rose-500" }, { status: "Cukup Sehat", range: "1.5% - 2.5%", desc: "Tampil di audiens yang tepat.", color: "text-blue-400", dot: "bg-blue-500" }, { status: "Sangat Ideal", range: "> 3.5%", desc: "Foto kuat & promo memicu klik.", color: "text-emerald-400", dot: "bg-emerald-500" } ] },
  { metric: "Conversion Rate (CVR)", rows: [ { status: "Perlu Perbaikan", range: "< 5%", desc: "Harga/ongkir tinggi, hambatan konversi.", color: "text-rose-400", dot: "bg-rose-500" }, { status: "Cukup Sehat", range: "8% - 12%", desc: "Harga sesuai ekspektasi pasar.", color: "text-blue-400", dot: "bg-blue-500" }, { status: "Sangat Ideal", range: "> 15%", desc: "Mesin penjual sangat efektif.", color: "text-emerald-400", dot: "bg-emerald-500" } ] },
  { metric: "Return on Ad Spend (ROAS)", rows: [ { status: "Perlu Perbaikan", range: "< 2.5x", desc: "Rugi operasional, evaluasi margin.", color: "text-rose-400", dot: "bg-rose-500" }, { status: "Cukup Sehat", range: "4x - 6x", desc: "Balik modal & mulai mendapat margin.", color: "text-blue-400", dot: "bg-blue-500" }, { status: "Sangat Ideal", range: "> 8x", desc: "Iklan efisien, margin sangat tebal.", color: "text-emerald-400", dot: "bg-emerald-500" } ] }
];

// --- UTILS ---
const fNum = (n) => Math.round(n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const pNum = (n) => { if (typeof n === 'number') return n; if (!n) return 0; return parseFloat(n.toString().replace(/[^0-9]/g, '')) || 0; };
const pFloat = (n) => { if (typeof n === 'number') return n; if (!n) return 0; return parseFloat(n.toString().replace(/,/g, '.').replace(/[^0-9.]/g, '')) || 0; };

// --- CLEAN UI COMPONENTS (DARK MODE) ---
const CleanCard = ({ children, className = "", onClick, clickable = false }) => (
  <div 
    onClick={onClick}
    className={`bg-zinc-900 rounded-2xl p-6 md:p-8 border border-white/5 shadow-sm transition-all duration-200 
      ${clickable ? 'cursor-pointer hover:border-white/20 active:scale-[0.99]' : ''} 
      ${className}`}
  >
    {children}
  </div>
);

const SectionHeading = ({ icon: Icon, title, subtitle, className = "mb-8" }) => (
  <div className={`flex items-start gap-4 ${className}`}>
    <div className="p-3 rounded-xl bg-zinc-800/50 border border-white/5 text-zinc-400 shrink-0">
      {Icon && <Icon size={20} strokeWidth={2} />}
    </div>
    <div className="pt-0.5">
      <h2 className="text-lg font-semibold text-white tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>}
    </div>
  </div>
);

const CleanInput = ({ label, value, onChange, prefix, suffix, type = "text", hint }) => (
  <div className="w-full flex flex-col gap-2">
    {label && <label className="text-xs font-medium text-zinc-400">{label}</label>}
    <div className="relative flex items-center bg-zinc-950/50 hover:bg-zinc-950 border border-white/10 hover:border-white/20 rounded-xl h-12 px-4 transition-all duration-200 focus-within:border-emerald-500/50 focus-within:bg-zinc-950 focus-within:ring-4 focus-within:ring-emerald-500/10">
      {prefix && <span className="text-zinc-500 font-medium mr-2">{prefix}</span>}
      <input 
        type={type} inputMode={type === 'number' ? 'decimal' : 'numeric'}
        className="flex-1 bg-transparent border-none outline-none text-white font-medium text-base tabular-nums placeholder:text-zinc-600 w-full"
        value={value} onChange={onChange}
      />
      {suffix && <span className="text-zinc-500 font-medium ml-2">{suffix}</span>}
    </div>
    {hint && <div className="text-[10px] text-zinc-500 w-full">{hint}</div>}
  </div>
);

export default function App() {
  const [page, setPage] = useState('calc'); 
  const [scheme, setScheme] = useState('normal');
  const [tier, setTier] = useState('hemat');
  const [subMode, setSubMode] = useState('val'); 
  const [activeModal, setActiveModal] = useState(null); 

  const [inputs, setInputs] = useState({ mainVal: "25.000", subVal: "0", menuName: "Kopi Susu Gula Aren", kPct: 20, vDisk: 0, mDisk: "0", minO: "0", mShare: 50 });
  const [histData, setHistData] = useState({ omset: "5.000.000", orders: "100", aov: "50.000", invest: "20" });
  const [growthProj, setGrowthProj] = useState(20);
  const [futureCostPct, setFutureCostPct] = useState(5); 

  const [adsBudget, setAdsBudget] = useState("50.000"); 
  const [adsType, setAdsType] = useState('keyword'); 
  const [cpcBid, setCpcBid] = useState("2.500");
  const [adsCvr, setAdsCvr] = useState("15"); 
  const [adsCtr, setAdsCtr] = useState("3.5");

  // --- STATE UNTUK EDIT HARGA APP ---
  const [localAppPrice, setLocalAppPrice] = useState("");
  const [isEditingAppPrice, setIsEditingAppPrice] = useState(false);

  const [cart, setCart] = useState([]);
  const [activeVoucher, setActiveVoucher] = useState(null);
  const [deliveryType, setDeliveryType] = useState('prioritas');
  const [showVoucherDropdown, setShowVoucherDropdown] = useState(false);

  // --- REVERSE CALCULATION LOGIC ---
  const handleAppPriceManualChange = (val) => {
    // Simpan nilai mentah yang sedang diketik (hanya angka)
    const rawVal = val.replace(/[^0-9]/g, '');
    setLocalAppPrice(fNum(parseInt(rawVal || '0', 10)));

    const newAppPrice = parseInt(rawVal || '0', 10);
    const k = pNum(inputs.kPct) / 100;
    const subRaw = pNum(inputs.subVal);
    let newOfflinePrice = 0;
    if (subMode === 'val') { newOfflinePrice = newAppPrice * (1 - k) + subRaw; } 
    else { const sPct = subRaw / 100; if (sPct < 1) newOfflinePrice = (newAppPrice * (1 - k)) / (1 - sPct); }
    
    setInputs(prev => ({ ...prev, mainVal: fNum(Math.round(newOfflinePrice)) }));
  };

  // Core calculations logic
  const calc = useMemo(() => {
    const off = pNum(inputs.mainVal); const subRaw = pNum(inputs.subVal); const actSub = subMode === 'val' ? subRaw : (off * subRaw / 100);
    const k = pNum(inputs.kPct); const v = pNum(inputs.vDisk); const md = pNum(inputs.mDisk) || Infinity; const s = pNum(inputs.mShare);
    const list = Math.ceil(((off - actSub) / (1 - k / 100)) / 100) * 100;
    const disc = Math.round(Math.min(list * v / 100, md));
    const pay = list - disc;
    let mPromoCost = 0; if (scheme === 'cofund') mPromoCost = Math.round((s / 100) * (v / 100) * list);
    const commAmount = (list - mPromoCost) * (k/100); 
    const net = Math.round(list - commAmount - mPromoCost);
    const totalCut = list - net;
    const mexInvestPct = list > 0 ? (totalCut / list) * 100 : 0;
    return { list, pay, net, mPromoCost, totalDisc: disc, mexInvestPct };
  }, [inputs, subMode, scheme]);

  useEffect(() => {
    const conf = STRATEGY[scheme];
    setInputs(prev => ({ ...prev, kPct: conf.k, vDisk: conf.v, mDisk: conf.tiers ? fNum(conf.tiers[tier].max) : "0", minO: conf.tiers ? fNum(conf.tiers[tier].min) : "0" }));
  }, [scheme, tier]);

  useEffect(() => {
    if (adsType === 'keyword') { setCpcBid("2.500"); setAdsCvr("15"); setAdsCtr("3.5"); } 
    else if (adsType === 'banner') { setCpcBid("800"); setAdsCvr("5"); setAdsCtr("1.2"); } 
    else if (adsType === 'cpo') { setCpcBid("8.000"); setAdsCvr("100"); setAdsCtr("2.0"); }
  }, [adsType]);

  const handleInputChange = (key, value) => {
    let cleanVal = value; if (['mainVal', 'subVal', 'mDisk', 'minO'].includes(key)) cleanVal = fNum(pNum(value));
    setInputs(prev => ({ ...prev, [key]: cleanVal }));
  };

  const handleHistChange = (key, value) => {
    if (key === 'invest') { setHistData(prev => ({ ...prev, [key]: value.replace(/[^0-9.,]/g, '') })); return; }
    const rawVal = pNum(value);
    setHistData(prev => {
      const curOrders = pNum(prev.orders); const curAov = pNum(prev.aov);
      let newData = { ...prev, [key]: fNum(rawVal) };
      if (key === 'omset') { if (curOrders > 0) newData.aov = fNum(rawVal / curOrders); } 
      else if (key === 'orders') { newData.omset = fNum(rawVal * curAov); } 
      else if (key === 'aov') { newData.omset = fNum(curOrders * rawVal); }
      return newData;
    });
  };

  const handleTargetOrderChange = (val) => {
    const rawVal = pNum(val); const baseOrders = pNum(histData.orders);
    if (baseOrders > 0) setGrowthProj(((rawVal - baseOrders) / baseOrders) * 100);
  };

  const addToCart = () => {
    const newItem = { id: Date.now(), name: inputs.menuName, price: pNum(calc.list), qty: 1 };
    setCart(prev => {
      const idx = prev.findIndex(i => i.name === newItem.name && i.price === newItem.price);
      if (idx > -1) { const next = [...prev]; next[idx].qty += 1; return next; }
      return [...prev, newItem];
    });
  };

  const updateCartQty = (id, delta) => setCart(prev => prev.map(item => item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item));
  const selectVoucher = (v) => { setActiveVoucher(v); setShowVoucherDropdown(false); };

  const checkout = useMemo(() => {
    const baseOngkir = { prioritas: 15000, standar: 10000, hemat: 5000 }[deliveryType];
    let subtotal = cart.reduce((a, b) => a + (b.price * b.qty), 0);
    let totalPotDisc = 0, schemeKey = 'normal', totalMerchantCost = 0, limitMin = 0, limitMax = Infinity, thresholdMet = true;

    if (activeVoucher) {
      schemeKey = activeVoucher.scheme; const conf = STRATEGY[schemeKey];
      if (activeVoucher.overrideMin !== undefined) { limitMin = activeVoucher.overrideMin; limitMax = activeVoucher.overrideMax; } 
      else if (conf.tiers && conf.tiers[tier]) { limitMin = conf.tiers[tier].min; limitMax = conf.tiers[tier].max; } 
      else if (schemeKey === 'cofund') { limitMin = pNum(inputs.minO); limitMax = pNum(inputs.mDisk) || Infinity; }

      if (subtotal >= limitMin) {
        totalPotDisc = Math.min(Math.round(subtotal * (activeVoucher.disc / 100)), limitMax);
        if (schemeKey === 'cofund') totalMerchantCost = Math.round(totalPotDisc * (inputs.mShare / 100));
      } else { thresholdMet = false; }
    }
    const ongkirDisc = (schemeKey !== 'normal') ? 10000 : 0;
    const finalOngkir = Math.max(0, baseOngkir - ongkirDisc);
    return { subtotal, finalDisc: totalPotDisc, finalOngkir, total: subtotal - totalPotDisc + finalOngkir + 1500, ongkirDisc, totalMerchantCost, schemeKey, limitMin, limitMax, thresholdMet };
  }, [cart, activeVoucher, deliveryType, inputs.mShare, inputs.minO, inputs.mDisk, tier]);

  const projection = useMemo(() => {
    const hOmset = pNum(histData.omset); const hOrders = pNum(histData.orders); const hAOV = pNum(histData.aov); const hInvestPct = pFloat(histData.invest); 
    const pOrders = Math.round(hOrders * (1 + growthProj / 100));
    const newAOV = checkout.subtotal > 0 ? checkout.subtotal : hAOV;
    const pOmset = pOrders * newAOV;
    const pInvestTotal = Math.round(pOmset * (pFloat(futureCostPct) / 100));
    return { 
      hOmset, hOrders, hDailyOrders: hOrders > 0 ? Math.round(hOrders / 30) : 0, hInvestAmount: Math.round(hOmset * (hInvestPct / 100)), hInvestPct, hAOV, 
      pOmset, pOrders, pDailyOrders: Math.round(pOrders / 30), pInvestTotal, pNet: pOmset - pInvestTotal, newAOV, futureInvestPct: pFloat(futureCostPct),
      hNet: hOmset - Math.round(hOmset * (hInvestPct / 100))
    };
  }, [histData, growthProj, checkout, futureCostPct]);

  // --- LOGIKA ADS YANG LEBIH REALISTIS (SIMULASI AUCTION) ---
  const adsSim = useMemo(() => {
    const budget = pNum(adsBudget) || 0; 
    const inputBid = pNum(cpcBid) || 0; 
    const cvrVal = pNum(adsCvr) || 0; 
    const ctrVal = pNum(adsCtr) || 0.1; 
    
    const cvr = cvrVal / 100; 
    const ctr = ctrVal / 100; 
    const baseAOV = pNum(histData.aov) || 40000;
    
    let estClicks = 0, estOrders = 0, estGrossSales = 0, roas = 0, actualCost = 0, estImpressions = 0;
    let bidStatus = { label: 'Optimal', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };

    if (adsType === 'cpo') {
       // CPO: Garansi Order. Budget / Biaya per Order = Total Order.
       const costPerOrder = inputBid || 10000;
       estOrders = Math.floor(budget / costPerOrder); 
       actualCost = estOrders * costPerOrder; 
       estGrossSales = estOrders * baseAOV;
       
       // Hitung mundur (Reverse) untuk traffic
       estClicks = cvr > 0 ? Math.round(estOrders / (cvrVal > 99 ? 0.2 : cvr)) : 0; 
       estImpressions = ctr > 0 ? Math.round(estClicks / ctr) : 0;
       roas = actualCost > 0 ? (estGrossSales / actualCost) : 0;
       bidStatus = { label: 'Garansi CPO', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };

    } else {
       // CPC (Pencarian / Banner): Simulasi Lelang & Penyerapan Budget
       const recommendedBid = adsType === 'keyword' ? 2500 : 800;
       
       // Faktor Serapan (Absorption Factor): Seberapa kompetitif bid kita?
       // Jika bid jauh di bawah rekomendasi, iklan jarang tayang (serapan rendah).
       // Jika bid sama atau lebih tinggi, serapan maksimal (100% budget habis).
       let absorptionRate = 0;
       if (inputBid >= recommendedBid) {
           absorptionRate = 1; // 100% terserap
           if (inputBid > recommendedBid * 2) {
             bidStatus = { label: 'Terlalu Tinggi (Cepat Habis)', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
           } else {
             bidStatus = { label: 'Sangat Kompetitif', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
           }
       } else if (inputBid > 0) {
           // Kurva eksponensial: Bid 500 dari 2500 mungkin cuma terserap 5% budgetnya
           absorptionRate = Math.pow((inputBid / recommendedBid), 2.5); 
           // Pastikan minimal ada sedikit serapan jika bid tidak 0
           absorptionRate = Math.max(0.02, Math.min(1, absorptionRate)); 
           
           if (inputBid < recommendedBid * 0.4) {
             bidStatus = { label: 'Terlalu Rendah (Iklan Sulit Tayang)', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
           } else {
             bidStatus = { label: 'Kurang Optimal', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
           }
       } else {
           bidStatus = { label: 'Bid Kosong', color: 'text-zinc-400 bg-zinc-800 border-zinc-700' };
       }

       // Hitung Biaya Aktual yang berhasil dihabiskan oleh sistem
       actualCost = budget * absorptionRate;
       
       // Hitung Klik dari Biaya Aktual
       estClicks = inputBid > 0 ? Math.floor(actualCost / inputBid) : 0; 
       
       // Sempurnakan cost sesuai klik riil
       actualCost = estClicks * inputBid;

       // Funnel ke bawah
       estImpressions = ctr > 0 ? Math.round(estClicks / ctr) : 0;
       estOrders = Math.floor(estClicks * cvr); 
       estGrossSales = estOrders * baseAOV;
       roas = actualCost > 0 ? (estGrossSales / actualCost) : 0;
    }

    return { cpc: inputBid, estClicks, cvr, ctrVal, estImpressions, estOrders, estGrossSales, roas, baseAOV, actualCost, bidStatus };
  }, [adsBudget, adsType, histData.aov, cpcBid, adsCvr, adsCtr]);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden relative pb-32">
      
      {/* GLOBAL STYLES */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', -apple-system, sans-serif; background-color: #09090b; }
        
        .clean-slider { -webkit-appearance: none; width: 100%; background: transparent; }
        .clean-slider:focus { outline: none; }
        .clean-slider::-webkit-slider-runnable-track { width: 100%; height: 4px; cursor: pointer; background: #27272a; border-radius: 4px; transition: background 0.3s; }
        .clean-slider:hover::-webkit-slider-runnable-track { background: #3f3f46; }
        .clean-slider::-webkit-slider-thumb { height: 18px; width: 18px; border-radius: 50%; background: #10b981; box-shadow: 0 2px 4px rgba(0,0,0,0.5); cursor: pointer; -webkit-appearance: none; margin-top: -7px; border: 2px solid #09090b; transition: transform 0.1s; }
        .clean-slider::-webkit-slider-thumb:hover { transform: scale(1.1); }
        
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .dashed-underline { border-bottom: 1px dashed #52525b; transition: border-color 0.2s; }
        .dashed-underline:focus-within { border-bottom: 1px solid #10b981; }
      `}} />

      {/* MODAL / BOTTOM SHEET */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-0">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setActiveModal(null)} />
          <div className={`relative w-full ${activeModal === 'metrics' ? 'max-w-xl' : 'max-w-md'} bg-zinc-900 md:rounded-3xl rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]`}>
            
            {/* Modal Header */}
            <div className="p-6 md:p-8 pb-5 flex-shrink-0 flex justify-between items-center border-b border-white/5">
               <h3 className="font-semibold text-zinc-300">
                 {activeModal === 'cust' ? 'Rincian Pembayaran' : activeModal === 'net' ? 'Rincian Pendapatan' : 'Panduan Metrik Kinerja Iklan'}
               </h3>
               <button onClick={() => setActiveModal(null)} className="p-2 -mr-2 rounded-full text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"><X size={18}/></button>
            </div>
            
            {/* Modal Body */}
            <div className="overflow-y-auto custom-scrollbar">
              {activeModal === 'metrics' ? (
                <div className="p-6 md:p-8 pt-6 space-y-8">
                  {METRICS_GUIDE.map((m, idx) => (
                    <div key={idx}>
                      <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center border border-white/5"><Activity size={14} className="text-emerald-500"/></div>
                        {m.metric}
                      </h4>
                      <div className="space-y-3">
                        {m.rows.map((r, rIdx) => (
                          <div key={rIdx} className="flex items-start gap-4 bg-zinc-950/50 p-4 rounded-xl border border-white/5">
                             <div className={`w-2.5 h-2.5 mt-1.5 rounded-full shrink-0 shadow-sm ${r.dot}`}></div>
                             <div>
                               <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                                 <span className={`text-sm font-bold ${r.color}`}>{r.status}</span>
                                 <span className="text-[10px] text-zinc-400 font-semibold px-2 py-0.5 rounded bg-zinc-900 border border-white/10">{r.range}</span>
                               </div>
                               <p className="text-xs text-zinc-400 leading-relaxed">{r.desc}</p>
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 md:p-8 pt-4 space-y-5 font-medium text-sm text-zinc-400">
                  <div className="flex justify-between items-center"><span>Harga di Aplikasi</span><span className="text-white">Rp {fNum(calc.list)}</span></div>
                  {activeModal === 'cust' ? (
                    <div className="flex justify-between items-center text-emerald-400"><span>Diskon Promo</span><span>- Rp {fNum(calc.list - calc.pay)}</span></div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center text-rose-400"><span>Komisi Platform ({inputs.kPct}%)</span><span>- Rp {fNum((calc.list - calc.mPromoCost) * (pNum(inputs.kPct)/100))}</span></div>
                      {scheme === 'cofund' && (<div className="flex justify-between items-center text-blue-400"><span>Beban Promo Resto</span><span>- Rp {fNum(calc.mPromoCost)}</span></div>)}
                      <div className="flex justify-between items-center pt-5 mt-5 border-t border-white/10">
                        <span className="text-zinc-500">Marketing Investment</span>
                        <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-xs">{calc.mexInvestPct.toFixed(1)}%</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {/* Modal Footer (hanya untuk kalkulator harga) */}
            {activeModal !== 'metrics' && (
              <div className="bg-zinc-950 p-6 md:p-8 border-t border-white/5 flex justify-between items-end shrink-0">
                <p className="text-sm font-medium text-zinc-500">
                  {activeModal === 'cust' ? 'Total Tagihan' : 'Net Diterima'}
                </p>
                <p className={`text-3xl font-semibold tracking-tight ${activeModal === 'cust' ? 'text-white' : 'text-emerald-500'}`}>
                  Rp {fNum(activeModal === 'cust' ? calc.pay : calc.net)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOP NAVIGATION (Horizontal) */}
      <header className="sticky top-0 z-40 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/10 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
              <Calculator size={18} className="text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base md:text-lg font-semibold text-white tracking-tight leading-tight">Grab Merchant</h1>
              <span className="text-[10px] text-zinc-400 font-medium">Simulator & Proyeksi</span>
            </div>
          </div>

          {/* Desktop Tabs */}
          <nav className="hidden md:flex items-center bg-zinc-900 p-1 rounded-lg border border-white/5">
            {[
              { id: 'calc', label: 'Margin & Menu' },
              { id: 'checkout', label: 'Cart Checkout' },
              { id: 'prospect', label: 'Proyeksi Bisnis' },
              { id: 'ads', label: 'Kinerja Iklan' }
            ].map(item => (
              <button 
                key={item.id} onClick={() => setPage(item.id)}
                className={`relative px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 
                  ${page === item.id ? 'bg-zinc-800 text-white shadow-sm border border-white/5' : 'text-zinc-400 hover:text-zinc-200'}
                `}
              >
                {item.label}
                {item.id === 'checkout' && cart.length > 0 && <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
              </button>
            ))}
          </nav>

        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12 min-h-[calc(100vh-80px)]">
        
        {/* =========================================
            PAGE 1: MARGIN & MENU CALCULATION
            ========================================= */}
        {page === 'calc' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
               <CleanCard className="flex flex-col justify-center items-center group text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Tags size={16} className="text-zinc-500"/>
                    <p className="text-xs font-medium text-zinc-400">Harga di Aplikasi</p>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 dashed-underline pb-1 w-fit mx-auto mt-2">
                    <span className="text-xl font-medium text-zinc-500">Rp</span>
                    <input 
                      type="text" inputMode="numeric" 
                      className="bg-transparent border-none outline-none text-3xl md:text-4xl font-semibold text-white tracking-tight w-full max-w-[140px] text-center tabular-nums p-0" 
                      value={isEditingAppPrice ? localAppPrice : fNum(calc.list)} 
                      onChange={(e) => handleAppPriceManualChange(e.target.value)}
                      onFocus={() => { 
                        setIsEditingAppPrice(true); 
                        setLocalAppPrice(fNum(calc.list)); 
                      }}
                      onBlur={() => { 
                        setIsEditingAppPrice(false); 
                      }}
                    />
                  </div>
               </CleanCard>

               <CleanCard clickable onClick={() => setActiveModal('cust')} className="flex flex-col justify-center items-center text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <ShoppingCart size={16} className="text-blue-500"/>
                    <p className="text-xs font-medium text-zinc-400">Total Dibayar Pelanggan</p>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    <span className="text-xl font-medium text-blue-500/70">Rp</span>
                    <p className="text-3xl md:text-4xl font-semibold text-blue-400 tracking-tight tabular-nums">{fNum(calc.pay)}</p>
                  </div>
               </CleanCard>

               <CleanCard clickable onClick={() => setActiveModal('net')} className="flex flex-col justify-center items-center text-center bg-emerald-500/5 border-emerald-500/20">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Wallet size={16} className="text-emerald-500"/>
                    <p className="text-xs font-medium text-emerald-500">Net Diterima Resto</p>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    <span className="text-xl font-medium text-emerald-500/70">Rp</span>
                    <p className="text-3xl md:text-4xl font-semibold text-emerald-400 tracking-tight tabular-nums">{fNum(calc.net)}</p>
                  </div>
                  <div className="mt-3">
                    <span className="text-[10px] font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full">MI: {calc.mexInvestPct.toFixed(1)}%</span>
                  </div>
               </CleanCard>
            </div>

            {/* Scheme Selection */}
            <CleanCard>
              <SectionHeading icon={Sparkles} title="Strategi Campaign" subtitle="Pilih skema promo untuk mengkalkulasi komisi dan margin." />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(STRATEGY).map(([k, s]) => {
                  const isActive = scheme === k;
                  return (
                    <button key={k} onClick={() => setScheme(k)} className={`text-left p-5 rounded-xl border transition-all duration-200 flex flex-col justify-between min-h-[120px] ${isActive ? 'bg-emerald-500/10 border-emerald-500 shadow-sm ring-1 ring-emerald-500/20' : 'bg-zinc-900 border-white/10 hover:border-white/20 hover:bg-zinc-800'}`}>
                      <div className="flex justify-between items-start w-full mb-4">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`}>{s.subtitle}</span>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${isActive ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-white/10 text-transparent'}`}><Check size={12} strokeWidth={3}/></div>
                      </div>
                      <h3 className={`text-base font-semibold ${isActive ? 'text-white' : 'text-zinc-300'}`}>{s.title}</h3>
                    </button>
                  )
                })}
              </div>

              {/* Dynamic Benefits / Cofund Presets */}
              <div className="mt-6 p-5 rounded-xl bg-zinc-950 border border-white/5 flex flex-col md:flex-row gap-6 md:items-center">
                 {scheme !== 'cofund' ? (
                   <div className="flex-1 flex flex-wrap gap-4">
                      {STRATEGY[scheme].benefits.map((b, i) => (
                        <span key={i} className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                          <Check size={16} className="text-emerald-500"/> {b}
                        </span>
                      ))}
                   </div>
                 ) : (
                   <div className="flex-1 flex flex-col gap-5 w-full">
                      <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                        <div className="relative w-full sm:w-64">
                           <select className="w-full appearance-none bg-zinc-900 border border-white/10 text-white py-3 px-4 rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 cursor-pointer"
                             value={COFUND_PRESETS.find(p => p.vDisk === pNum(inputs.vDisk) && p.mShare === pNum(inputs.mShare))?.id || 'custom'}
                             onChange={(e) => { const sel = COFUND_PRESETS.find(p => p.id === e.target.value); if(sel) setInputs(prev => ({ ...prev, vDisk: sel.vDisk, mShare: sel.mShare })); }}
                           >
                             {COFUND_PRESETS.map(p => <option key={p.id} value={p.id} className="bg-zinc-900">{p.label}</option>)}
                             <option value="custom" className="bg-zinc-900">Pengaturan Manual</option>
                           </select>
                           <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"/>
                        </div>
                        <div className="flex items-center gap-4 text-sm bg-zinc-900 px-4 py-2.5 rounded-lg border border-white/5 w-full sm:w-auto justify-between sm:justify-start">
                           <span className="text-zinc-400">Resto: <span className="font-semibold text-white">Rp {fNum(calc.mPromoCost)}</span></span>
                           <span className="text-zinc-600">|</span>
                           <span className="text-zinc-400">Platform: <span className="font-semibold text-emerald-400">Rp {fNum(calc.totalDisc - calc.mPromoCost)}</span></span>
                        </div>
                      </div>
                      
                      <div className="w-full pt-1 border-t border-white/5">
                        <div className="flex justify-between items-center mb-3">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Beban Promo Toko</p>
                          <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{inputs.mShare}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" step="5" value={inputs.mShare}
                          onChange={(e) => setInputs(prev => ({ ...prev, mShare: parseInt(e.target.value) }))}
                          className="clean-slider"
                        />
                      </div>
                   </div>
                 )}

                 {/* Tiers */}
                 {STRATEGY[scheme].tiers && (
                   <div className="flex bg-zinc-900 p-1 rounded-lg shrink-0 border border-white/5 w-full sm:w-auto">
                      {['hemat', 'ekstra'].map(t => (
                        <button key={t} onClick={() => setTier(t)} className={`flex-1 sm:flex-none px-6 py-2 text-xs font-semibold capitalize rounded-md transition-all ${tier === t ? 'bg-zinc-800 text-white shadow-sm border border-white/5' : 'text-zinc-500 hover:text-zinc-300'}`}>{t}</button>
                      ))}
                   </div>
                 )}
              </div>
            </CleanCard>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <CleanCard>
                <SectionHeading icon={List} title="Data Produk" subtitle="Atur harga dasar dan mark-up." />
                <div className="space-y-6">
                  <CleanInput label="Harga Jual Offline" prefix="Rp" value={inputs.mainVal} onChange={(e) => handleInputChange('mainVal', e.target.value)} />
                  
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <CleanInput label="Nama Item (Opsional)" value={inputs.menuName} onChange={(e) => handleInputChange('menuName', e.target.value)} />
                    </div>
                    <div className="w-32">
                       <label className="text-xs font-medium text-zinc-400 mb-2 block">Mark-up</label>
                       <div className="flex bg-zinc-950/50 border border-white/10 rounded-xl h-12 p-1 focus-within:border-emerald-500/50 transition-all">
                         <input type="text" inputMode="numeric" className="w-12 bg-transparent border-none outline-none font-medium text-sm px-2 text-center text-white" value={inputs.subVal} onChange={(e) => handleInputChange('subVal', e.target.value)} />
                         <div className="flex gap-0.5 w-full">
                           <button onClick={() => setSubMode('pct')} className={`flex-1 rounded-lg text-xs font-medium transition-all ${subMode === 'pct' ? 'bg-zinc-800 text-white border border-white/5' : 'text-zinc-500'}`}>%</button>
                           <button onClick={() => setSubMode('val')} className={`flex-1 rounded-lg text-xs font-medium transition-all ${subMode === 'val' ? 'bg-zinc-800 text-white border border-white/5' : 'text-zinc-500'}`}>Rp</button>
                         </div>
                       </div>
                    </div>
                  </div>
                  
                  <button onClick={addToCart} className="w-full h-12 bg-white hover:bg-zinc-200 text-zinc-900 rounded-xl font-medium text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2">
                    Tambahkan ke Cart <ArrowRight size={16}/>
                  </button>
                </div>
              </CleanCard>

              <CleanCard>
                <SectionHeading icon={Settings} title="Parameter Detail" subtitle="Kondisi batas dan komisi platform." />
                <div className="grid grid-cols-2 gap-5 md:gap-6">
                  <CleanInput label="Komisi Platform" suffix="%" value={inputs.kPct} type="number" onChange={(e) => handleInputChange('kPct', e.target.value)} />
                  <CleanInput label="Besaran Diskon" suffix="%" value={inputs.vDisk} type="number" onChange={(e) => handleInputChange('vDisk', e.target.value)} />
                  <CleanInput label="Minimum Order" prefix="Rp" value={inputs.minO} onChange={(e) => handleInputChange('minO', e.target.value)} />
                  <CleanInput label="Maksimal Potongan" prefix="Rp" value={inputs.mDisk} onChange={(e) => handleInputChange('mDisk', e.target.value)} />
                  {scheme === 'cofund' && (
                     <div className="col-span-2 pt-2 border-t border-white/5"><CleanInput label="Persentase Beban Toko" suffix="%" value={inputs.mShare} type="number" onChange={(e) => handleInputChange('mShare', e.target.value)} /></div>
                  )}
                </div>
              </CleanCard>
            </div>
          </div>
        )}

        {/* =========================================
            PAGE 2: CHECKOUT / CART
            ========================================= */}
        {page === 'checkout' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            {/* Left: Cart */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              <CleanCard>
                <SectionHeading icon={Info} title="Kecepatan Pengiriman" subtitle="Mempengaruhi estimasi waktu dan tarif ongkir." />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {['prioritas', 'standar', 'hemat'].map(id => {
                     const isSelected = deliveryType === id;
                     const baseOngkir = id === 'prioritas' ? 15000 : id === 'standar' ? 10000 : 5000;
                     return (
                        <div key={id} onClick={() => setDeliveryType(id)} className={`relative p-5 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col gap-4 ${isSelected ? 'bg-blue-500/10 border-blue-500/50' : 'bg-zinc-900 border-white/10 hover:border-white/20'}`}>
                           <div className="flex justify-between items-center">
                             <h4 className={`font-semibold capitalize text-sm ${isSelected ? 'text-blue-400' : 'text-zinc-400'}`}>{id}</h4>
                             <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'border-blue-400 bg-blue-500' : 'border-zinc-600'}`}>
                               {isSelected && <Check size={10} strokeWidth={4} className="text-white"/>}
                             </div>
                           </div>
                           <div>
                             {checkout.ongkirDisc > 0 ? (
                               <div className="flex items-center gap-2">
                                 <span className="text-xs text-zinc-500 line-through">Rp {fNum(baseOngkir)}</span>
                                 <span className="font-semibold text-white">Rp {fNum(Math.max(0, baseOngkir - checkout.ongkirDisc))}</span>
                               </div>
                             ) : (
                               <span className="font-semibold text-white">Rp {fNum(baseOngkir)}</span>
                             )}
                           </div>
                        </div>
                     )
                  })}
                </div>
              </CleanCard>

              <CleanCard className="!p-0 overflow-hidden flex-1">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-zinc-950/50">
                  <SectionHeading icon={ShoppingBag} title="Keranjang" />
                  <span className="text-xs font-medium text-zinc-400 bg-zinc-900 border border-white/10 px-3 py-1 rounded-full">{cart.reduce((a,b)=>a+b.qty,0)} Items</span>
                </div>
                
                <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto custom-scrollbar">
                  {cart.length === 0 ? (
                     <div className="py-20 flex flex-col items-center justify-center text-zinc-500">
                        <ShoppingCart size={32} className="mb-4 opacity-50" strokeWidth={1.5} />
                        <p className="text-sm font-medium">Keranjang masih kosong</p>
                     </div>
                  ) : cart.map(item => (
                    <div key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-zinc-800/30 transition-colors gap-4">
                      <div className="flex flex-col">
                        <p className="font-semibold text-white text-base mb-1">{item.name}</p>
                        <p className="font-medium text-zinc-400 text-sm tabular-nums">@ Rp {fNum(item.price)}</p>
                      </div>
                      <div className="flex items-center justify-between w-full sm:w-auto gap-8">
                        <p className="font-semibold text-white text-lg tabular-nums">Rp {fNum(item.price * item.qty)}</p>
                        <div className="flex items-center gap-4">
                          <button onClick={() => setCart(prev => prev.filter(i=>i.id!==item.id))} className="text-xs text-rose-500 font-medium hover:text-rose-400 transition-colors">Hapus</button>
                          <div className="flex items-center bg-zinc-950 rounded-lg p-1 border border-white/5">
                            <button onClick={() => updateCartQty(item.id, -1)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-zinc-800 text-zinc-400 transition-all"><Minus size={14}/></button>
                            <span className="text-sm font-semibold text-white w-8 text-center">{item.qty}</span>
                            <button onClick={() => updateCartQty(item.id, 1)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-zinc-800 text-zinc-400 transition-all"><Plus size={14}/></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CleanCard>
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-5 flex flex-col gap-8 lg:sticky lg:top-28">
               <CleanCard className="bg-amber-500/5 border-amber-500/20">
                  <SectionHeading icon={Ticket} title="Promo & Diskon" subtitle="Pilih voucher yang tersedia." />
                  <div className="relative">
                    <select className="w-full appearance-none bg-zinc-950 border border-white/10 text-white h-12 px-4 rounded-xl font-medium text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 cursor-pointer transition-all"
                      value={activeVoucher?.code || ''} onChange={(e) => selectVoucher(VOUCHERS.find(v => v.code === e.target.value) || null)}
                    >
                      <option value="" className="bg-zinc-900">Tanpa Promo (Harga Normal)</option>
                      {VOUCHERS.map(v => <option key={v.code} value={v.code} className="bg-zinc-900">{v.code} - {v.label}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"/>
                  </div>
                  {activeVoucher && (
                    <div className="bg-zinc-900 rounded-xl border border-white/10 p-4 mt-4 shadow-sm">
                      <div className="flex justify-between mb-2 text-sm"><span className="text-zinc-400">Min. Order</span><span className="font-medium text-white">Rp {fNum(checkout.limitMin)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-zinc-400">Max. Diskon</span><span className="font-medium text-white">{checkout.limitMax === Infinity ? 'Tanpa Batas' : `Rp ${fNum(checkout.limitMax)}`}</span></div>
                      {!checkout.thresholdMet && <div className="text-xs text-rose-400 font-medium mt-4 pt-3 border-t border-white/5 flex items-center gap-2"><AlertCircle size={14}/> Belum memenuhi minimum order</div>}
                    </div>
                  )}
               </CleanCard>

               <CleanCard className="bg-zinc-900 !border-white/10 shadow-xl">
                  <h2 className="text-lg font-semibold text-white mb-6">Ringkasan Tagihan</h2>
                  <div className="space-y-4 mb-8 text-sm font-medium">
                      <div className="flex justify-between text-zinc-400"><span>Subtotal Menu</span><span className="text-white">Rp {fNum(checkout.subtotal)}</span></div>
                      <div className="flex justify-between text-zinc-400"><span>Ongkos Kirim</span><span className="text-white">Rp {fNum(checkout.finalOngkir)}</span></div>
                      <div className="flex justify-between text-zinc-400"><span>Biaya Jasa Aplikasi</span><span className="text-white">Rp 1.500</span></div>
                      {checkout.finalDisc > 0 && (
                        <div className="flex justify-between text-emerald-400 pt-4 border-t border-white/5">
                          <span>Potongan Promo</span>
                          <span>- Rp {fNum(checkout.finalDisc)}</span>
                        </div>
                      )}
                  </div>
                  
                  <div className="pt-6 border-t border-white/10">
                    <p className="text-xs text-zinc-500 mb-2">Total Pembayaran</p>
                    <p className="text-4xl font-semibold tracking-tight text-white mb-8">Rp {fNum(checkout.total)}</p>
                    <button className="w-full bg-white hover:bg-zinc-200 text-zinc-900 h-14 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] flex justify-center items-center gap-2">
                        Pesan Sekarang <ArrowRight size={16} />
                    </button>
                  </div>
               </CleanCard>
            </div>
          </div>
        )}

        {/* =========================================
            PAGE 3: PROSPECT (P&L)
            ========================================= */}
        {page === 'prospect' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch animate-fade-in">
            
            {/* Left: Inputs */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              <CleanCard>
                <SectionHeading icon={BarChart3} title="Data Historis" subtitle="Rata-rata metrik bulan sebelumnya." />
                <div className="space-y-6">
                  <CleanInput label="Total Omset Kotor" prefix="Rp" value={histData.omset} onChange={(e) => handleHistChange('omset', e.target.value)} />
                  <div className="grid grid-cols-2 gap-4">
                    <CleanInput label="Jumlah Pesanan" suffix="trx" value={histData.orders} onChange={(e) => handleHistChange('orders', e.target.value)} />
                    <CleanInput label="Avg Order Value" prefix="Rp" value={histData.aov} onChange={(e) => handleHistChange('aov', e.target.value)} />
                  </div>
                  <CleanInput label="Merchant Investment % (Aktif)" suffix="%" value={histData.invest} onChange={(e) => handleHistChange('invest', e.target.value)} />
                </div>
              </CleanCard>

              <CleanCard>
                <SectionHeading icon={TrendingUp} title="Target Proyeksi" subtitle="Atur ekspektasi pertumbuhan." />
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-medium text-zinc-400">Ekspektasi Order</span>
                      <span className="text-sm font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">+{growthProj}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="200" step="5" value={growthProj} onChange={(e) => setGrowthProj(Number(e.target.value))} 
                      className="clean-slider mb-2" 
                    />
                    <div className="mt-4 flex justify-between text-sm">
                      <span className="text-zinc-500">Target Trx:</span>
                      <span className="font-semibold text-white">{fNum(Math.round(pNum(histData.orders) * (1 + growthProj/100)))} order</span>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-white/5">
                    <CleanInput label="Merchant Investment % (Target Baru)" suffix="%" type="number" value={futureCostPct} onChange={(e) => setFutureCostPct(e.target.value)} />
                  </div>
                </div>
              </CleanCard>
            </div>

            {/* Right: P&L Statement */}
            <div className="lg:col-span-7 flex flex-col gap-6 h-full">
              
              <div className={`p-6 md:p-8 rounded-[28px] text-white flex flex-col justify-center relative overflow-hidden transition-all duration-500 ${projection.pNet >= projection.hNet ? 'bg-gradient-to-br from-emerald-800 to-emerald-950 shadow-[0_15px_40px_-10px_rgba(16,185,129,0.2)] border border-emerald-500/20' : 'bg-gradient-to-br from-rose-800 to-rose-950 shadow-[0_15px_40px_-10px_rgba(244,63,94,0.2)] border border-rose-500/20'}`}>
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 blur-3xl rounded-full"></div>
                <div className="flex items-center gap-3 mb-4 opacity-90 relative z-10 text-white">
                  <Receipt size={20} className={projection.pNet >= projection.hNet ? "text-emerald-300" : "text-rose-300"} />
                  <h3 className="text-sm font-medium text-zinc-100">Potensi Tambahan Laba Bersih</h3>
                </div>
                <div className="flex items-end gap-3 relative z-10">
                  <p className={`text-4xl md:text-5xl font-semibold tracking-tighter text-white drop-shadow-md`}>
                    {projection.pNet >= projection.hNet ? '+' : ''}Rp {fNum(projection.pNet - projection.hNet)}
                  </p>
                  <span className={`text-sm mb-2 ${projection.pNet >= projection.hNet ? "text-emerald-200" : "text-rose-200"}`}>/ bulan</span>
                </div>
              </div>

              <CleanCard className="flex-1 flex flex-col !p-0">
                <div className="px-6 py-5 md:px-8 md:py-6 border-b border-white/5">
                  <SectionHeading icon={Wallet} title="Laporan Komparasi (P&L)" subtitle="Estimasi performa sebelum dan sesudah." className="mb-0" />
                </div>
                
                <div className="flex-1 p-5 md:p-6 space-y-4 bg-zinc-950/30">
                  {/* Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/5 gap-3">
                    <span className="text-sm font-medium text-zinc-400 w-32">Omset Kotor</span>
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto flex-1">
                      <span className="text-sm text-zinc-600 line-through">Rp {fNum(projection.hOmset)}</span>
                      <ArrowRight size={14} className="text-zinc-600 shrink-0" />
                      <span className="text-base font-semibold text-white w-[120px] text-right">Rp {fNum(projection.pOmset)}</span>
                    </div>
                  </div>
                  
                  {/* Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/5 gap-3">
                    <span className="text-sm font-medium text-zinc-400 w-32">Total Pesanan</span>
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto flex-1">
                      <span className="text-sm text-zinc-600 line-through">{fNum(projection.hOrders)} trx</span>
                      <ArrowRight size={14} className="text-zinc-600 shrink-0" />
                      <span className="text-base font-semibold text-white w-[120px] text-right">{fNum(projection.pOrders)} trx</span>
                    </div>
                  </div>

                  {/* Row: Rata-rata Harian */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/5 gap-3">
                    <div className="flex flex-col w-32">
                      <span className="text-sm font-medium text-zinc-400">Rata-rata Harian</span>
                      <span className="text-[10px] text-zinc-600 mt-1 uppercase tracking-widest">*Perkiraan per hari</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto flex-1">
                      <span className="text-sm text-zinc-600 line-through">{fNum(projection.hDailyOrders)} trx</span>
                      <ArrowRight size={14} className="text-zinc-600 shrink-0" />
                      <span className="text-base font-semibold text-white w-[120px] text-right">{fNum(projection.pDailyOrders)} trx</span>
                    </div>
                  </div>

                  {/* Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/5 gap-3">
                    <div className="flex flex-col w-32">
                      <span className="text-sm font-medium text-zinc-400">Rata-rata Order</span>
                      {checkout.subtotal > 0 && <span className="text-[9px] text-emerald-500/70 mt-1 uppercase tracking-widest">*Dari Simulasi Cart</span>}
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto flex-1">
                      <span className="text-sm text-zinc-600 line-through">Rp {fNum(projection.hAOV)}</span>
                      <ArrowRight size={14} className="text-zinc-600 shrink-0" />
                      <span className="text-base font-semibold text-white w-[120px] text-right">Rp {fNum(projection.newAOV)}</span>
                    </div>
                  </div>
                  
                  {/* Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-col w-32">
                      <span className="text-sm font-medium text-rose-500">Merchant Inv.</span>
                      <span className="text-xs text-rose-400/80 mt-1">{projection.hInvestPct}% ➔ {futureCostPct}%</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto flex-1">
                      <span className="text-sm text-rose-500/50 line-through">Rp {fNum(projection.hInvestAmount)}</span>
                      <ArrowRight size={14} className="text-rose-500/50 shrink-0" />
                      <span className="text-base font-semibold text-rose-400 w-[120px] text-right">Rp {fNum(projection.pInvestTotal)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900 p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/5">
                  <span className="text-sm font-semibold text-emerald-500">Estimasi Laba Bersih</span>
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                    <span className="text-sm text-zinc-500 line-through">Rp {fNum(projection.hNet)}</span>
                    <ArrowRight size={16} className="text-zinc-600 shrink-0" />
                    <span className="text-2xl font-semibold text-emerald-400 w-[140px] text-right">Rp {fNum(projection.pNet)}</span>
                  </div>
                </div>
              </CleanCard>
            </div>
          </div>
        )}

        {/* =========================================
            PAGE 4: ADS & PERFORMANCE
            ========================================= */}
        {page === 'ads' && (
          <div className="space-y-8 max-w-5xl mx-auto pb-24 md:pb-8 animate-fade-in">
            {/* Top Setup */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <CleanCard className="md:col-span-7 flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <SectionHeading icon={Megaphone} title="Platform Penempatan Iklan" subtitle="Pilih metode akuisisi trafik." className="mb-0" />
                  <button onClick={() => setActiveModal('metrics')} className="flex items-center justify-center p-2.5 bg-zinc-800/50 hover:bg-blue-500/10 text-zinc-400 hover:text-blue-400 border border-white/5 hover:border-blue-500/30 rounded-xl transition-all duration-200 group shrink-0" title="Panduan Metrik">
                    <HelpCircle size={18} className="group-active:scale-95 transition-transform" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  {[ { id: 'keyword', title: 'Pencarian', desc: 'CPC Targeted' }, { id: 'banner', title: 'Banner', desc: 'Brand Awareness' }, { id: 'cpo', title: 'Pesanan', desc: 'Garansi CPO' } ].map(ad => (
                     <div key={ad.id} onClick={() => setAdsType(ad.id)} className={`p-4 rounded-xl cursor-pointer transition-all flex flex-col gap-2 border ${adsType === ad.id ? 'bg-zinc-800 border-zinc-700 text-white shadow-md' : 'bg-zinc-900 border-white/10 hover:border-white/20 text-zinc-300'}`}>
                       <h4 className="text-sm font-semibold">{ad.title}</h4>
                       <p className={`text-[10px] uppercase tracking-widest font-semibold ${adsType === ad.id ? 'text-emerald-400' : 'text-zinc-500'}`}>{ad.desc}</p>
                     </div>
                  ))}
                </div>

                {/* Educational Info Box */}
                <div className="mt-auto p-4 rounded-xl bg-zinc-950/50 border border-white/5 flex items-start gap-3">
                  <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-zinc-300 mb-1.5">
                      {adsType === 'keyword' ? 'Cara Kerja Iklan Pencarian' : adsType === 'banner' ? 'Cara Kerja Iklan Banner' : 'Cara Kerja Garansi CPO'}
                    </h5>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      {adsType === 'keyword' 
                        ? 'Iklan akan muncul di halaman atas saat pelanggan mencari kata kunci relevan. Anda hanya membayar saat iklan diklik (CPC). Efektif untuk menangkap pelanggan yang sudah memiliki niat beli spesifik.'
                        : adsType === 'banner'
                        ? 'Menampilkan visual grafis di halaman utama atau kategori. Sangat cocok untuk membangun brand awareness, mempromosikan menu baru, atau mendongkrak trafik secara masif.'
                        : 'Model iklan paling aman. Anda hanya akan ditagih komisi (Biaya per Order) JIKA terjadi transaksi sukses dari iklan tersebut. Bebas risiko boncos karena klik tanpa beli tidak dikenakan biaya.'
                      }
                    </p>
                  </div>
                </div>
              </CleanCard>
              
              <CleanCard className="md:col-span-5">
                <div className="flex justify-between items-start mb-6">
                   <SectionHeading icon={Crosshair} title="Budget & Bidding" subtitle="Parameter biaya harian." className="mb-0" />
                </div>
                <div className="space-y-5">
                  <CleanInput label="Budget Maksimal Harian" prefix="Rp" value={adsBudget} onChange={(e) => setAdsBudget(e.target.value)} />
                  <CleanInput 
                    label={adsType === 'cpo' ? "Biaya per Order (Target CPO)" : "Max Bid per Klik (CPC)"} 
                    prefix="Rp" value={cpcBid} onChange={(e) => setCpcBid(e.target.value)} type="number" 
                    hint={
                      <div className="flex items-center justify-between w-full">
                        <span>{adsType === 'keyword' ? "Rekomendasi: Rp 2.500/klik" : adsType === 'banner' ? "Rekomendasi: Rp 800/klik" : "Nilai komisi saat pesanan terjadi."}</span>
                        <span className={`px-2 py-0.5 rounded border text-[8px] font-bold uppercase tracking-widest ${adsSim.bidStatus.color}`}>
                          {adsSim.bidStatus.label}
                        </span>
                      </div>
                    }
                  />
                </div>
              </CleanCard>
            </div>

            {/* HORIZONTAL FUNNEL */}
            <CleanCard className="!p-8 md:!p-10 relative overflow-hidden bg-zinc-900">
              
              <SectionHeading icon={Activity} title="Pipeline Estimasi Harian" subtitle="Proyeksi perjalanan pembeli dari tayangan hingga pesanan." className="mb-8" />
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 w-full">
                {/* CTR & CVR moved back to Top next to ROAS */}
                {adsType !== 'cpo' && (
                  <div className="flex items-center gap-4 bg-zinc-950/50 border border-white/5 px-4 py-3 rounded-xl justify-center">
                    <div className="text-center w-20 sm:w-24">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">Est. CTR</p>
                      <div className="relative flex items-center bg-zinc-900 border border-white/10 rounded-md h-8 px-2 focus-within:border-blue-500/50 transition-colors">
                        <input 
                          type="number" inputMode="decimal"
                          className="w-full bg-transparent border-none outline-none text-center font-semibold text-blue-400 text-sm"
                          value={adsCtr} onChange={(e) => setAdsCtr(e.target.value)}
                        />
                        <span className="text-blue-500/50 font-bold text-xs ml-1">%</span>
                      </div>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div className="text-center w-20 sm:w-24">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">Est. CVR</p>
                      <div className="relative flex items-center bg-zinc-900 border border-white/10 rounded-md h-8 px-2 focus-within:border-emerald-500/50 transition-colors">
                        <input 
                          type="number" inputMode="decimal"
                          className="w-full bg-transparent border-none outline-none text-center font-semibold text-emerald-400 text-sm"
                          value={adsCvr} onChange={(e) => setAdsCvr(e.target.value)}
                        />
                        <span className="text-emerald-500/50 font-bold text-xs ml-1">%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Highlighted ROAS */}
                <div className="bg-zinc-950 px-6 py-3 rounded-xl flex items-center justify-center gap-6 border border-emerald-500/30 shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]">
                  <div className="flex flex-col text-left">
                    <span className="text-[11px] text-emerald-500 font-bold uppercase tracking-widest mb-0.5">Target ROAS</span>
                    <span className="text-[10px] text-zinc-500 font-medium">Return on Ad Spend</span>
                  </div>
                  <span className="text-3xl font-black text-emerald-400">{adsSim.roas.toFixed(1)}x</span>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-4 justify-between relative mt-4">
                {/* Horizontal Connector Line */}
                <div className="hidden md:block absolute top-10 left-20 right-20 h-px bg-zinc-800 z-0"></div>

                {/* Tayangan */}
                <div className="flex-1 bg-zinc-900 border border-white/5 rounded-2xl p-6 text-center w-full relative z-10">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-zinc-800 flex items-center justify-center mb-4"><Eye size={20} className="text-zinc-400"/></div>
                  <p className="text-xs font-medium text-zinc-400 mb-1">Tayangan (Mata)</p>
                  <p className="text-3xl font-semibold text-white tabular-nums">{fNum(adsSim.estImpressions)}</p>
                </div>

                <div className="md:w-8 flex justify-center text-zinc-600 relative z-10"><ArrowRight size={20} className="hidden md:block"/><Plus size={20} className="rotate-45 md:hidden"/></div>

                {/* Klik */}
                <div className="flex-1 bg-zinc-900 border border-white/5 rounded-2xl p-6 text-center w-full relative z-10">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mb-4"><MousePointer2 size={20}/></div>
                  <p className="text-xs font-medium text-zinc-400 mb-1">Klik (Traffic)</p>
                  <p className="text-3xl font-semibold text-white tabular-nums">{fNum(adsSim.estClicks)}</p>
                </div>

                <div className="md:w-8 flex justify-center text-zinc-600 relative z-10"><ArrowRight size={20} className="hidden md:block"/><Plus size={20} className="rotate-45 md:hidden"/></div>

                {/* Order */}
                <div className="flex-1 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center w-full relative z-10 shadow-sm">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-500 flex items-center justify-center mb-4 text-white shadow-md"><ShoppingBag size={20}/></div>
                  <p className="text-xs font-medium text-emerald-400 mb-1">Pesanan (Order)</p>
                  <p className="text-3xl font-bold text-emerald-400 tabular-nums">{fNum(adsSim.estOrders)}</p>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-center items-center text-center gap-6 md:gap-16">
                 <div>
                   <p className="text-xs font-medium text-zinc-500 mb-1">Total Biaya Iklan</p>
                   <p className="text-xl font-semibold text-rose-400 tabular-nums">Rp {fNum(adsSim.actualCost)}</p>
                 </div>
                 <div className="hidden sm:block w-px h-10 bg-white/10"></div>
                 <div>
                   <p className="text-xs font-medium text-zinc-500 mb-1">Estimasi Omset Baru</p>
                   <p className="text-2xl font-bold text-emerald-400 tabular-nums">Rp {fNum(adsSim.estGrossSales)}</p>
                 </div>
              </div>
            </CleanCard>
          </div>
        )}
      </main>

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-t border-white/10 px-2 py-1 pb-safe">
        <div className="flex justify-between items-center max-w-sm mx-auto">
          {[
            { id: 'calc', icon: Calculator, label: 'Menu' },
            { id: 'checkout', icon: ShoppingCart, label: 'Cart' },
            { id: 'prospect', icon: TrendingUp, label: 'P&L' },
            { id: 'ads', icon: Megaphone, label: 'Ads' }
          ].map((item) => {
            const isActive = page === item.id;
            return (
              <button key={item.id} onClick={() => setPage(item.id)} className={`relative flex flex-col items-center gap-1 w-16 py-2 transition-all ${isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-emerald-500' : ''}/>
                <span className={`text-[10px] font-medium ${isActive ? 'block' : 'hidden'}`}>{item.label}</span>
                {item.id === 'checkout' && cart.length > 0 && <span className="absolute top-1 right-3 w-2 h-2 bg-emerald-500 rounded-full border border-zinc-950"></span>}
              </button>
            )
          })}
        </div>
      </div>

    </div>
  );
}
