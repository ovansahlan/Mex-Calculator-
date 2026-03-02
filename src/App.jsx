import React, { useState, useEffect, useMemo, Fragment } from 'react';
import { 
  ShoppingCart, Check, ArrowRight, Store, Info, Zap, 
  Settings, List, Tags, TrendingUp, BarChart3, Wallet, Ticket, 
  ChevronDown, AlertCircle, Plus, Minus, Megaphone, Target, 
  MousePointer2, ShoppingBag, Activity, Eye, Calculator, 
  Receipt, Crosshair, BarChart, ChevronRight, Sparkles
} from 'lucide-react';

// --- CONSTANTS & DATA ---
const STRATEGY = {
  'normal': { k: 20, v: 0, tiers: null, title: 'NORMAL', subtitle: 'Basic Plan', benefits: ['Margin Aman 100%', ] },
  'puas-cuan': { k: 32, v: 30, tiers: { hemat: { max: 45000, min: 15000 }, ekstra: { max: 80000, min: 35000 } }, title: 'CUAN 32%', subtitle: 'High Volume', benefits: ['Always on Promo 30%', 'In App Exposure'] },
  'booster': { k: 38, v: 35, tiers: { hemat: { max: 55000, min: 15000 }, ekstra: { max: 100000, min: 35000 } }, title: 'BOOSTER 38%', subtitle: 'Max Exposure', benefits: ['FLASH SALE 50%', 'Always on Promo 35%','In App Exposure'] },
  'cofund': { k: 20, v: 40, tiers: null, title: 'COFUND', subtitle: 'Partnership', benefits: ['Patungan Diskon'] }
};

const VOUCHERS = [
  { code: 'CUAN', scheme: 'puas-cuan', label: 'Diskon Puas 30%', desc: 'Potongan 30%', disc: 30 },
  { code: 'BOOSTER', scheme: 'booster', label: 'Diskon Puas 35%', desc: 'Potongan 35%', disc: 35 },
  { code: 'COFUND', scheme: 'cofund', label: 'Diskon 40% (Patungan)', desc: 'Sharing Cost', disc: 40 }
];

const METRICS_GUIDE = [
  { metric: "Click-Through Rate (CTR)", rows: [ { status: "Buruk", range: "< 1%", desc: "Foto kurang menarik, butuh perbaikan visual.", color: "text-rose-600", bg: "bg-rose-50" }, { status: "Sehat", range: "1.5% - 2.5%", desc: "Tampil di audiens yang tepat.", color: "text-blue-600", bg: "bg-blue-50" }, { status: "Ideal", range: "> 3.5%", desc: "Foto kuat & promo memicu klik.", color: "text-emerald-600", bg: "bg-emerald-50" } ] },
  { metric: "Conversion Rate (CVR)", rows: [ { status: "Buruk", range: "< 5%", desc: "Harga/ongkir tinggi, ada hambatan konversi.", color: "text-rose-600", bg: "bg-rose-50" }, { status: "Sehat", range: "8% - 12%", desc: "Harga sesuai ekspektasi pasar.", color: "text-blue-600", bg: "bg-blue-50" }, { status: "Ideal", range: "> 15%", desc: "Mesin penjual efektif.", color: "text-emerald-600", bg: "bg-emerald-50" } ] },
  { metric: "Return on Ad Spend (ROAS)", rows: [ { status: "Buruk", range: "< 2.5x", desc: "Bakar duit. Pendapatan tidak menutupi biaya operasional & iklan.", color: "text-rose-600", bg: "bg-rose-50" }, { status: "Sehat", range: "4x - 6x", desc: "Operasional aman. Balik modal (BEP) dan mulai mendapat margin tipis.", color: "text-blue-600", bg: "bg-blue-50" }, { status: "Ideal", range: "> 8x", desc: "Sangat Profitabel. Iklan efisien, keuntungan bersih sangat tebal.", color: "text-emerald-600", bg: "bg-emerald-50" } ] }
];

const COFUND_PRESETS = [
  { id: 'p40_50', label: 'Cofund 40% (Beban Toko 50%)', vDisk: 40, mShare: 50 },
  { id: 'p50_60', label: 'Cofund 50% (Beban Toko 60%)', vDisk: 50, mShare: 60 },
  { id: 'p35_50', label: 'Cofund 35% (Beban Toko 50%)', vDisk: 35, mShare: 50 },
  { id: 'p30_40', label: 'Cofund 30% (Beban Toko 40%)', vDisk: 30, mShare: 40 }
];

// --- UTILS ---
const fNum = (n) => Math.round(n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const pNum = (n) => { if (typeof n === 'number') return n; if (!n) return 0; return parseFloat(n.toString().replace(/[^0-9]/g, '')) || 0; };
const pFloat = (n) => { if (typeof n === 'number') return n; if (!n) return 0; return parseFloat(n.toString().replace(/,/g, '.').replace(/[^0-9.]/g, '')) || 0; };

// --- BENTO MINIMALIST COMPONENTS ---
const BentoCard = ({ children, className = "", onClick, clickable = false, accent = "slate" }) => {
  const accentStyles = {
    emerald: 'border-emerald-500/40 shadow-[0_15px_40px_-12px_rgba(16,185,129,0.15)] ring-1 ring-emerald-50/50',
    blue: 'border-blue-500/40 shadow-[0_15px_40px_-12px_rgba(59,130,246,0.15)] ring-1 ring-blue-50/50',
    amber: 'border-amber-500/40 shadow-[0_15px_40px_-12px_rgba(245,158,11,0.15)] ring-1 ring-amber-50/50',
    rose: 'border-rose-500/40 shadow-[0_15px_40px_-12px_rgba(244,63,94,0.15)] ring-1 ring-rose-50/50',
    slate: 'border-gray-200 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.06)]'
  };

  const topStrip = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    slate: 'bg-gray-200'
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-[28px] p-6 md:p-8 transition-all duration-300 border relative overflow-hidden
        ${accentStyles[accent] || accentStyles.slate} 
        ${clickable ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1.5' : ''} 
        ${className}`}
    >
      {/* Decorative top strip for visual identity */}
      <div className={`absolute top-0 left-0 right-0 h-[4px] ${topStrip[accent] || topStrip.slate} opacity-60`}></div>
      {children}
    </div>
  );
};

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-start gap-4 mb-6">
    <div className="w-12 h-12 rounded-[16px] bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700 shrink-0">
      {Icon && <Icon size={22} strokeWidth={2} />}
    </div>
    <div>
      <h2 className="text-lg font-bold text-gray-900 tracking-tight leading-none pt-1 mb-1.5">{title}</h2>
      {subtitle && <p className="text-xs text-gray-500 font-medium">{subtitle}</p>}
    </div>
  </div>
);

const MinimalInput = ({ label, value, onChange, prefix, suffix, type = "text" }) => (
  <div className="w-full flex flex-col gap-2">
    {label && <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-1">{label}</label>}
    <div className="relative flex items-center bg-gray-50 hover:bg-gray-100/50 border border-gray-200 rounded-[16px] h-14 px-4 transition-all duration-200 focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10">
      {prefix && <span className="text-gray-500 font-medium mr-2">{prefix}</span>}
      <input 
        type={type}
        inputMode={type === 'number' ? 'decimal' : 'numeric'}
        className="flex-1 bg-transparent border-none outline-none text-gray-900 font-semibold text-base tabular-nums placeholder:text-gray-400 w-full"
        value={value}
        onChange={onChange}
      />
      {suffix && <span className="text-gray-500 font-medium ml-2">{suffix}</span>}
    </div>
  </div>
);

export default function App() {
  const [page, setPage] = useState('calc'); 
  const [scheme, setScheme] = useState('normal');
  const [tier, setTier] = useState('hemat');
  const [subMode, setSubMode] = useState('val'); 
  const [activeModal, setActiveModal] = useState(null); 

  const [inputs, setInputs] = useState({ mainVal: "25.000", subVal: "0", menuName: "Kopi Susu Gula Aren", kPct: 20, vDisk: 0, mDisk: "0", minO: "0", mShare: 50 });
  const [histData, setHistData] = useState({ omset: "50.000.000", orders: "1000", aov: "50.000", invest: "5" });
  const [growthProj, setGrowthProj] = useState(20);
  const [futureCostPct, setFutureCostPct] = useState(5); 

  const [adsBudget, setAdsBudget] = useState("30.000"); 
  const [adsType, setAdsType] = useState('keyword'); 
  const [cpcBid, setCpcBid] = useState("2.500");
  const [adsCvr, setAdsCvr] = useState("15"); 
  const [adsCtr, setAdsCtr] = useState("3.5");

  const [cart, setCart] = useState([]);
  const [activeVoucher, setActiveVoucher] = useState(null);
  const [deliveryType, setDeliveryType] = useState('prioritas');
  const [showVoucherDropdown, setShowVoucherDropdown] = useState(false);

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
    let cleanVal = value;
    if (['mainVal', 'subVal', 'mDisk', 'minO'].includes(key)) cleanVal = fNum(pNum(value));
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
      if (conf.tiers && conf.tiers[tier]) { limitMin = conf.tiers[tier].min; limitMax = conf.tiers[tier].max; } 
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
      hOmset, hOrders, hDailyOrders: hOrders > 0 ? Math.round(hOrders / 30) : 0, hInvestAmount: Math.round(hOmset * (hInvestPct / 100)), hInvestPct, hNet: hOmset - Math.round(hOmset * (hInvestPct / 100)), hAOV, 
      pOmset, pOrders, pDailyOrders: Math.round(pOrders / 30), pInvestTotal, pNet: pOmset - pInvestTotal, newAOV, futureInvestPct: pFloat(futureCostPct) 
    };
  }, [histData, growthProj, checkout, futureCostPct]);

  const adsSim = useMemo(() => {
    const budget = pNum(adsBudget); const costUnit = pNum(cpcBid) || 0; const cvrVal = pNum(adsCvr) || 0; const ctrVal = pNum(adsCtr) || 0.1; 
    const cvr = cvrVal / 100; const ctr = ctrVal / 100; const baseAOV = pNum(histData.aov) || 40000;
    let estClicks, estOrders, estGrossSales, roas, actualCost, estImpressions;

    if (adsType === 'cpo') {
       estOrders = Math.floor(budget / (costUnit || 10000)); actualCost = estOrders * (costUnit || 10000); estGrossSales = estOrders * baseAOV;
       estClicks = cvr > 0 ? Math.round(estOrders / (cvrVal > 99 ? 0.2 : cvr)) : 0; estImpressions = ctr > 0 ? Math.round(estClicks / ctr) : 0;
       roas = actualCost > 0 ? (estGrossSales / actualCost) : 0;
    } else {
       const cpc = costUnit || (adsType === 'keyword' ? 2500 : 800);
       estClicks = Math.floor(budget / cpc); estOrders = Math.floor(estClicks * cvr); actualCost = estClicks * cpc; estGrossSales = estOrders * baseAOV;
       roas = budget > 0 ? (estGrossSales / budget) : 0; estImpressions = ctr > 0 ? Math.round(estClicks / ctr) : 0;
    }
    return { cpc: costUnit, estClicks, cvr, ctrVal, estImpressions, estOrders, estGrossSales, roas, baseAOV, actualCost };
  }, [adsBudget, adsType, histData.aov, cpcBid, adsCvr, adsCtr]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden relative pb-32">
      
      {/* GLOBAL STYLES & ANIMATIONS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
        
        .bento-slider { -webkit-appearance: none; width: 100%; background: transparent; }
        .bento-slider:focus { outline: none; }
        .bento-slider::-webkit-slider-runnable-track { width: 100%; height: 6px; cursor: pointer; background: #e5e7eb; border-radius: 8px; }
        .bento-slider::-webkit-slider-thumb { height: 20px; width: 20px; border-radius: 50%; background: #10b981; box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4); cursor: pointer; -webkit-appearance: none; margin-top: -7px; border: 2px solid white; transition: transform 0.1s; }
        .bento-slider::-webkit-slider-thumb:hover { transform: scale(1.15); }
        
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes fadeInScale { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-fade-in { animation: fadeInScale 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />

      {/* MODAL (BENTO STYLE) */}
      {activeModal && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm transition-opacity" onClick={() => setActiveModal(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-[32px] p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] z-10 animate-fade-in border border-gray-100">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-xs uppercase tracking-widest text-gray-500">
                 {activeModal === 'cust' ? 'Struk Pelanggan' : 'Estimasi Net Resto'}
               </h3>
               <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">✕</button>
            </div>
            
            <div className="space-y-4 font-medium text-gray-600">
              <div className="flex justify-between">
                <span>Harga Aplikasi</span>
                <span className="font-bold text-gray-900">Rp {fNum(calc.list)}</span>
              </div>
              {activeModal === 'cust' ? (
                <div className="flex justify-between text-emerald-600">
                  <span>Diskon Promo</span>
                  <span className="font-bold">- Rp {fNum(calc.list - calc.pay)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-rose-500">
                    <span>Komisi ({inputs.kPct}%)</span>
                    <span className="font-bold">- Rp {fNum((calc.list - calc.mPromoCost) * (pNum(inputs.kPct)/100))}</span>
                  </div>
                  {scheme === 'cofund' && (
                    <div className="flex justify-between text-blue-500">
                      <span>Beban Patungan Toko</span>
                      <span className="font-bold">- Rp {fNum(calc.mPromoCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-4 mt-4 border-t border-gray-100">
                    <span className="text-xs uppercase tracking-wider text-gray-500">Marketing Invest.</span>
                    <span className="font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-xs">{calc.mexInvestPct.toFixed(1)}%</span>
                  </div>
                </>
              )}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100 bg-gray-50 -mx-8 -mb-8 p-8 rounded-b-[32px]">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                {activeModal === 'cust' ? 'Total Dibayar Pembeli' : 'Diterima Resto (Net)'}
              </p>
              <p className={`text-4xl font-extrabold tracking-tight ${activeModal === 'cust' ? 'text-gray-900' : 'text-emerald-600'}`}>
                Rp {fNum(activeModal === 'cust' ? calc.pay : calc.net)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FIXED HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#F8F9FA]/80 backdrop-blur-xl border-b border-gray-200/80 transition-all duration-300">
        <div className="px-6 py-4 md:py-5 max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-200/60 flex items-center justify-center">
              <Calculator size={24} className="text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight leading-none">GrabMerchant</h1>
              <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mt-1">Simulator Studio</p>
            </div>
          </div>

          {/* Desktop Segmented Control */}
          <div className="hidden md:flex bg-gray-200/50 p-1.5 rounded-full border border-gray-200/60 backdrop-blur-sm">
            {[
              { id: 'calc', label: 'Margin Menu' },
              { id: 'checkout', label: 'Simulasi Cart' },
              { id: 'prospect', label: 'Proyeksi' },
              { id: 'ads', label: 'Iklan (Ads)' }
            ].map(item => {
               const isActive = page === item.id;
               return (
                <button 
                  key={item.id} onClick={() => setPage(item.id)}
                  className={`relative px-6 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300 
                    ${isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'}
                  `}
                >
                  {item.label}
                  {item.id === 'checkout' && cart.length > 0 && <span className={`absolute top-2.5 right-3.5 w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>}
                </button>
               )
            })}
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from hiding under the fixed header */}
      <div className="h-36 md:h-28"></div>

      {/* MAIN CONTENT AREA */}
      <main className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-6 w-full animate-fade-in">
        
        {/* =========================================
            PAGE 1: MARGIN & MENU CALCULATION
            ========================================= */}
        {page === 'calc' && (
          <div className="space-y-6 md:space-y-8">
            
            {/* HERO KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
               <BentoCard accent="slate" className="flex flex-col text-left !p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Harga App</p>
                    <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500"><Tags size={14}/></div>
                  </div>
                  <p className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Rp {fNum(calc.list)}</p>
               </BentoCard>

               <BentoCard clickable accent="blue" onClick={() => setActiveModal('cust')} className="flex flex-col text-left !p-6 group">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">Bayar (Cust)</p>
                    <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform"><ShoppingCart size={14}/></div>
                  </div>
                  <p className="text-2xl md:text-3xl font-extrabold text-blue-600 tracking-tight">Rp {fNum(calc.pay)}</p>
               </BentoCard>

               <BentoCard clickable accent="emerald" onClick={() => setActiveModal('net')} className="flex flex-col text-left !p-6 group relative">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">Net (Resto)</p>
                    <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform"><Wallet size={14}/></div>
                  </div>
                  <div className="flex items-end justify-between">
                    <p className="text-2xl md:text-3xl font-extrabold text-emerald-600 tracking-tight">Rp {fNum(calc.net)}</p>
                    <div className="bg-rose-50 text-rose-600 px-2 py-1 rounded-[8px] text-[10px] font-bold uppercase border border-rose-100/50">
                       MI: {calc.mexInvestPct.toFixed(1)}%
                    </div>
                  </div>
               </BentoCard>
            </div>

            <BentoCard accent="emerald">
              <SectionHeader icon={Sparkles} title="Strategi Campaign" subtitle="Pilih skema promo untuk mengkalkulasi margin otomatis." />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
                {Object.entries(STRATEGY).map(([k, s]) => {
                  const isActive = scheme === k;
                  return (
                    <button 
                      key={k} onClick={() => setScheme(k)} 
                      className={`relative p-5 rounded-[20px] text-left transition-all duration-300 border
                        ${isActive ? 'bg-white border-emerald-500 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.15)] ring-1 ring-emerald-50' : 'bg-gray-50/50 border-gray-200/70 hover:bg-gray-50 hover:border-gray-300'}
                      `}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-emerald-500' : 'text-gray-500'}`}>{s.subtitle}</p>
                        {isActive && <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"><Check size={12} strokeWidth={3} className="text-white"/></div>}
                      </div>
                      <h3 className={`text-sm md:text-base font-extrabold tracking-tight ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>{s.title}</h3>
                    </button>
                  )
                })}
              </div>

              {/* Dynamic Benefits / Cofund Presets */}
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 p-6 md:p-8 rounded-[24px] bg-gray-50/80 border border-gray-100">
                 
                 {scheme !== 'cofund' ? (
                   <div className="flex-1">
                     <p className="text-[11px] font-bold text-gray-500 mb-4 uppercase tracking-widest">Keuntungan Skema</p>
                     <div className="flex flex-col gap-3">
                        {STRATEGY[scheme].benefits.map((b, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center shrink-0"><Check size={12} strokeWidth={3} className="text-emerald-500"/></div>
                            <span className="text-sm font-semibold text-gray-700">{b}</span>
                          </div>
                        ))}
                      </div>
                   </div>
                 ) : (
                   <div className="flex-1">
                      <p className="text-[11px] font-bold text-gray-500 mb-4 uppercase tracking-widest">Preset Patungan (Cofund)</p>
                      <div className="relative">
                         <select
                           className="w-full appearance-none bg-white border border-gray-200 text-gray-800 py-3.5 px-4 rounded-[16px] font-bold text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-sm transition-all cursor-pointer"
                           value={
                             COFUND_PRESETS.find(p => p.vDisk === pNum(inputs.vDisk) && p.mShare === pNum(inputs.mShare))?.id || 'custom'
                           }
                           onChange={(e) => {
                             const sel = COFUND_PRESETS.find(p => p.id === e.target.value);
                             if(sel) {
                                setInputs(prev => ({ ...prev, vDisk: sel.vDisk, mShare: sel.mShare }));
                             }
                           }}
                         >
                           {COFUND_PRESETS.map(p => (
                             <option key={p.id} value={p.id}>{p.label}</option>
                           ))}
                           <option value="custom">Custom (Atur Manual di Kanan)</option>
                         </select>
                         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                           <ChevronDown size={18} />
                         </div>
                      </div>
                      
                      <div className="mt-4 flex gap-3">
                         <div className="bg-white p-3 rounded-[16px] border border-gray-100 flex-1 shadow-sm">
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Diskon Promo</p>
                           <p className="font-extrabold text-lg text-emerald-600 leading-none">{inputs.vDisk}%</p>
                         </div>
                         <div className="bg-white p-3 rounded-[16px] border border-gray-100 flex-1 shadow-sm">
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Beban Resto</p>
                           <p className="font-extrabold text-lg text-blue-600 leading-none">{inputs.mShare}%</p>
                         </div>
                      </div>
                   </div>
                 )}

                 {/* Tiers / Co-fund Sliders */}
                 {STRATEGY[scheme].tiers && (
                    <div className="md:w-64 shrink-0">
                       <p className="text-[11px] font-bold text-gray-500 mb-4 uppercase tracking-widest">Level Promo (Tier)</p>
                       <div className="flex bg-gray-200/50 rounded-[16px] p-1 border border-gray-200">
                          {['hemat', 'ekstra'].map(t => (
                            <button key={t} onClick={() => setTier(t)} className={`flex-1 py-2.5 text-[11px] font-bold uppercase rounded-[12px] transition-all ${tier === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{t}</button>
                          ))}
                       </div>
                    </div>
                 )}

                 {scheme === 'cofund' && (
                    <div className="md:w-80 shrink-0">
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Beban Promo Toko</p>
                        <span className="text-blue-700 bg-blue-100 px-2.5 py-1 rounded-[8px] text-xs font-bold">{inputs.mShare}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" step="5" value={inputs.mShare}
                        onChange={(e) => setInputs(prev => ({ ...prev, mShare: parseInt(e.target.value) }))}
                        className="bento-slider mb-5"
                      />
                      <div className="flex justify-between text-xs font-semibold bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                         <span className="text-gray-500">Resto: <span className="text-gray-900">Rp {fNum(calc.mPromoCost)}</span></span>
                         <span className="text-gray-500">Platform: <span className="text-blue-600">Rp {fNum(calc.totalDisc - calc.mPromoCost)}</span></span>
                      </div>
                    </div>
                 )}
              </div>
            </BentoCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <BentoCard accent="slate">
                <SectionHeader icon={List} title="Data Menu" subtitle="Harga dasar dan mark-up aplikasi." />
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-[3]">
                       <MinimalInput label="Harga Jual Offline" prefix="Rp" value={inputs.mainVal} onChange={(e) => handleInputChange('mainVal', e.target.value)} />
                    </div>
                    <div className="flex-[2]">
                       <div className="w-full flex flex-col gap-2">
                          <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-1">Subsidi Mex</label>
                          <div className="relative flex items-center bg-gray-50 hover:bg-gray-100/50 border border-gray-200 rounded-[16px] h-14 px-2 transition-all focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10">
                            <input type="text" inputMode="numeric" className="w-full bg-transparent border-none outline-none text-gray-900 font-semibold text-base tabular-nums px-2" value={inputs.subVal} onChange={(e) => handleInputChange('subVal', e.target.value)} />
                            <div className="flex bg-gray-200/60 p-1 rounded-[12px] gap-1 shrink-0">
                              <button onClick={() => setSubMode('val')} className={`w-8 h-8 rounded-[8px] text-[10px] font-bold transition-all ${subMode === 'val' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Rp</button>
                              <button onClick={() => setSubMode('pct')} className={`w-8 h-8 rounded-[8px] text-[10px] font-bold transition-all ${subMode === 'pct' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>%</button>
                            </div>
                          </div>
                       </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 items-end pt-2">
                    <MinimalInput label="Nama Menu (Opsional)" value={inputs.menuName} onChange={(e) => handleInputChange('menuName', e.target.value)} />
                    <button onClick={addToCart} className="h-14 px-6 bg-gray-900 hover:bg-black text-white rounded-[16px] font-bold text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 shrink-0 shadow-md">
                      Add <ArrowRight size={16} strokeWidth={2.5}/>
                    </button>
                  </div>
                </div>
              </BentoCard>

              <BentoCard accent="slate">
                <SectionHeader icon={Settings} title="Parameter Sistem" subtitle="Konfigurasi batas hitungan." />
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <MinimalInput label="Komisi" suffix="%" value={inputs.kPct} type="number" onChange={(e) => handleInputChange('kPct', e.target.value)} />
                  <MinimalInput label="Diskon" suffix="%" value={inputs.vDisk} type="number" onChange={(e) => handleInputChange('vDisk', e.target.value)} />
                  <MinimalInput label="Min. Order" prefix="Rp" value={inputs.minO} onChange={(e) => handleInputChange('minO', e.target.value)} />
                  <MinimalInput label="Max. Disk" prefix="Rp" value={inputs.mDisk} onChange={(e) => handleInputChange('mDisk', e.target.value)} />
                </div>
              </BentoCard>
            </div>
          </div>
        )}

        {/* =========================================
            PAGE 2: CHECKOUT / CART
            ========================================= */}
        {page === 'checkout' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch">
            
            <div className="lg:col-span-7 flex flex-col gap-6 md:gap-8">
              <BentoCard accent="blue">
                <SectionHeader icon={Info} title="Opsi Pengiriman" subtitle="Kecepatan mempengaruhi harga ongkir." />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {['prioritas', 'standar', 'hemat'].map(id => {
                     const isSelected = deliveryType === id;
                     const baseOngkir = id === 'prioritas' ? 15000 : id === 'standar' ? 10000 : 5000;
                     return (
                        <div key={id} onClick={() => setDeliveryType(id)} className={`relative p-5 rounded-[20px] cursor-pointer transition-all duration-300 flex flex-col justify-between h-32 border ${isSelected ? 'bg-blue-50/50 border-blue-500 shadow-sm ring-1 ring-blue-500/20' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                           <div className="flex justify-between items-start">
                             <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-blue-500' : 'border-gray-300'}`}>
                               {isSelected && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"/>}
                             </div>
                             <span className="text-[10px] text-gray-500 font-bold uppercase bg-gray-100 px-2 py-0.5 rounded-[6px]">
                               {id === 'prioritas' ? '20m' : id === 'standar' ? '30m' : '45m'}
                             </span>
                           </div>
                           <div>
                             <h4 className={`font-extrabold uppercase tracking-widest text-sm mb-0.5 ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>{id}</h4>
                             {checkout.ongkirDisc > 0 ? (
                               <div className="flex items-center gap-2">
                                 <span className="text-[10px] text-gray-400 line-through font-medium">Rp {fNum(baseOngkir)}</span>
                                 <span className="font-bold text-gray-900 text-sm">Rp {fNum(Math.max(0, baseOngkir - checkout.ongkirDisc))}</span>
                               </div>
                             ) : (
                               <span className="font-bold text-gray-900 text-sm">Rp {fNum(baseOngkir)}</span>
                             )}
                           </div>
                        </div>
                     )
                  })}
                </div>
              </BentoCard>

              <BentoCard accent="emerald" className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-6 shrink-0">
                  <SectionHeader icon={ShoppingBag} title="Keranjang Belanja" subtitle="Daftar menu yang telah disimulasikan." />
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-[8px] text-[11px] font-bold">{cart.reduce((a,b)=>a+b.qty,0)} Items</span>
                </div>
                
                <div className="space-y-3 flex-1">
                  {cart.length === 0 ? (
                     <div className="py-12 flex flex-col items-center justify-center bg-gray-50 border border-dashed border-gray-200 rounded-[20px] h-full">
                        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 text-gray-400"><ShoppingCart size={20} /></div>
                        <p className="text-gray-500 font-semibold text-xs uppercase tracking-widest">Keranjang Kosong</p>
                     </div>
                  ) : cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-4 rounded-[20px] bg-white border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[14px] bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700 font-bold text-lg">{item.qty}</div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm mb-1.5">{item.name}</p>
                          <div className="flex items-center gap-1 bg-gray-100/80 w-fit p-1 rounded-[10px]">
                            <button onClick={() => updateCartQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded-md text-gray-500 hover:text-rose-500 shadow-sm transition-colors"><Minus size={12} strokeWidth={2.5}/></button>
                            <span className="text-xs font-bold text-gray-700 w-8 text-center">{item.qty}</span>
                            <button onClick={() => updateCartQty(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded-md text-gray-500 hover:text-emerald-500 shadow-sm transition-colors"><Plus size={12} strokeWidth={2.5}/></button>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-gray-900 text-base tabular-nums mb-1.5">Rp {fNum(item.price * item.qty)}</p>
                        <button onClick={() => setCart(prev => prev.filter(i=>i.id!==item.id))} className="text-[10px] text-rose-500 font-semibold hover:underline">Hapus Item</button>
                      </div>
                    </div>
                  ))}
                </div>
              </BentoCard>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6 md:gap-8">
               <BentoCard accent="amber" className="!p-0 z-20 overflow-visible shrink-0">
                  <div className="p-6 md:p-8">
                    <SectionHeader icon={Ticket} title="Promo & Voucher" subtitle="Terapkan skema diskon." />
                    <div className="relative">
                      <button onClick={() => setShowVoucherDropdown(!showVoucherDropdown)} className={`w-full p-4 rounded-[20px] flex justify-between items-center transition-all border ${activeVoucher ? 'bg-amber-50 border-amber-500 shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${activeVoucher ? 'bg-amber-500 text-white shadow-sm' : 'bg-gray-100 text-gray-500'}`}><Ticket size={18} /></div>
                          <div className="text-left">
                            <p className={`text-sm font-extrabold uppercase tracking-wide ${activeVoucher ? 'text-amber-700' : 'text-gray-700'}`}>{activeVoucher ? activeVoucher.code : 'Pilih Promo'}</p>
                            <p className={`text-[11px] font-medium mt-0.5 ${activeVoucher ? 'text-amber-600' : 'text-gray-500'}`}>{activeVoucher ? activeVoucher.label : 'Makin hemat'}</p>
                          </div>
                        </div>
                        <ChevronDown size={20} className={`transition-transform duration-300 ${showVoucherDropdown ? 'rotate-180' : ''} ${activeVoucher ? 'text-amber-600' : 'text-gray-500'}`}/>
                      </button>

                      {showVoucherDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[20px] border border-gray-200 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] z-50 overflow-hidden animate-fade-in p-2">
                          <div className="p-3 hover:bg-gray-50 rounded-[14px] cursor-pointer transition-colors mb-1" onClick={() => selectVoucher(null)}>
                            <div className="flex justify-between items-center">
                              <div><p className="text-sm font-bold text-gray-900">TANPA PROMO</p><p className="text-[10px] text-gray-500">Harga Normal</p></div>
                              {!activeVoucher && <Check size={18} strokeWidth={3} className="text-gray-900" />}
                            </div>
                          </div>
                          {VOUCHERS.map((v, i) => (
                            <div key={i} className="p-3 hover:bg-emerald-50 rounded-[14px] cursor-pointer transition-colors mb-1 last:mb-0" onClick={() => selectVoucher(v)}>
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-sm font-bold text-amber-600 tracking-wide mb-0.5">{v.code}</p>
                                  <p className="text-[10px] text-gray-500">{v.label}</p>
                                </div>
                                {activeVoucher?.code === v.code && <Check size={18} strokeWidth={3} className="text-amber-500" />}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {activeVoucher && (
                      <div className="mt-5 bg-amber-50/50 border border-amber-100 rounded-[16px] p-4">
                        <div className="flex justify-between text-xs mb-2 font-medium"><span className="text-gray-500">Min. Order</span><span className="font-bold text-gray-900">Rp {fNum(checkout.limitMin)}</span></div>
                        <div className="flex justify-between text-xs font-medium"><span className="text-gray-500">Max. Diskon</span><span className="font-bold text-gray-900">{checkout.limitMax === Infinity ? 'Tanpa Batas' : `Rp ${fNum(checkout.limitMax)}`}</span></div>
                        {!checkout.thresholdMet && (
                          <div className="mt-4 text-[10px] text-rose-600 font-bold flex items-center gap-2 bg-rose-50 p-2.5 rounded-[10px]">
                            <AlertCircle size={14} /> Belum memenuhi syarat order minimal
                          </div>
                        )}
                      </div>
                    )}
                  </div>
               </BentoCard>

               <BentoCard accent="emerald" className="flex-1 flex flex-col bg-gray-50/80 !border-emerald-500/20">
                  <div className="space-y-4 mb-8 font-medium">
                      <div className="flex justify-between text-sm text-gray-500"><span>Subtotal Menu</span><span className="text-gray-900 font-bold">Rp {fNum(checkout.subtotal)}</span></div>
                      <div className="flex justify-between text-sm text-gray-500"><span>Ongkos Kirim</span><span className="text-gray-900 font-bold">Rp {fNum(checkout.finalOngkir)}</span></div>
                      <div className="flex justify-between text-sm text-gray-500"><span>Biaya Platform</span><span className="text-gray-900 font-bold">Rp 1.500</span></div>
                      {checkout.finalDisc > 0 && (
                        <div className="flex justify-between text-sm font-bold text-emerald-600 pt-5 border-t border-gray-200">
                          <span className="flex items-center gap-2"><Zap size={16}/> Potongan Promo</span>
                          <span>- Rp {fNum(checkout.finalDisc)}</span>
                        </div>
                      )}
                  </div>
                  
                  <div className="mt-auto pt-6 border-t border-emerald-100">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Total Tagihan Pembeli</p>
                    <div className="mb-6">
                       <p className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tighter">Rp {fNum(checkout.total)}</p>
                    </div>
                    <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-[16px] font-bold text-sm uppercase tracking-widest transition-all active:scale-95 flex justify-center items-center gap-2 shadow-[0_4px_14px_rgba(16,185,129,0.3)]">
                        Lanjut Pesan <ChevronRight size={18} strokeWidth={3} />
                    </button>
                  </div>
               </BentoCard>
            </div>
          </div>
        )}

        {/* =========================================
            PAGE 3: PROSPECT & GROWTH
            ========================================= */}
        {page === 'prospect' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-6 md:space-y-8">
              <BentoCard accent="slate">
                <SectionHeader icon={BarChart3} title="Data Historis" subtitle="Performa rata-rata bulan lalu." />
                <div className="grid grid-cols-2 gap-4">
                  <MinimalInput label="Omset / Bln" prefix="Rp" value={histData.omset} onChange={(e) => handleHistChange('omset', e.target.value)} />
                  <MinimalInput label="Total Orders" value={histData.orders} onChange={(e) => handleHistChange('orders', e.target.value)} />
                  <MinimalInput label="Avg Order Val" prefix="Rp" value={histData.aov} onChange={(e) => handleHistChange('aov', e.target.value)} />
                  <MinimalInput label="Budget Ads" suffix="%" value={histData.invest} onChange={(e) => handleHistChange('invest', e.target.value)} />
                </div>
              </BentoCard>

              <BentoCard accent="emerald">
                <SectionHeader icon={TrendingUp} title="Proyeksi Pertumbuhan" subtitle="Simulasi jika pesanan meningkat." />
                <div className="bg-emerald-50/20 border border-emerald-100 p-6 md:p-8 rounded-[24px]">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Ekspektasi Order</span>
                    <span className="text-xl font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-[10px] border border-emerald-100">+{growthProj}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="200" step="5" value={growthProj} onChange={(e) => setGrowthProj(Number(e.target.value))}
                    className="bento-slider mb-8"
                  />
                  <div className="mt-6 flex items-center justify-between pt-6 border-t border-emerald-100 border-dashed">
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Est. Trx Baru</div>
                    <div className="flex items-center gap-3 bg-white border border-emerald-100 px-4 py-2 rounded-[14px] shadow-sm">
                      <input type="text" inputMode="numeric" className="bg-transparent outline-none font-extrabold text-gray-900 text-2xl tabular-nums w-24 text-right" value={fNum(Math.round(pNum(histData.orders) * (1 + growthProj/100)))} onChange={(e) => handleTargetOrderChange(e.target.value)} />
                      <span className="text-sm font-semibold text-gray-500">Order</span>
                    </div>
                  </div>
                </div>
              </BentoCard>
            </div>

            <div className="space-y-6 md:space-y-8">
              {/* CURRENT VS FUTURE CARD */}
              <BentoCard accent="slate" className="!p-0 border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                  <div className="p-6 md:p-8 space-y-6 bg-gray-50/50">
                    <div className="inline-block border border-gray-200 text-gray-500 px-3 py-1 rounded-full bg-white"><p className="text-[10px] font-bold uppercase tracking-widest">Current (As Is)</p></div>
                    <div><p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Omset Kotor</p><p className="text-xl font-extrabold text-gray-900">Rp {fNum(projection.hOmset)}</p></div>
                    <div><p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Pesanan</p><p className="text-lg font-bold text-gray-700">{fNum(projection.hOrders)}</p></div>
                    <div><p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Biaya Iklan ({projection.hInvestPct}%)</p><p className="text-lg font-bold text-rose-500">Rp {fNum(projection.hInvestAmount)}</p></div>
                    <div className="pt-5 border-t border-gray-200"><p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Laba Bersih</p><p className="text-2xl font-extrabold text-gray-900">Rp {fNum(projection.hNet)}</p></div>
                  </div>

                  <div className="p-6 md:p-8 space-y-6 bg-emerald-50/30">
                    <div className="inline-block bg-emerald-100 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full"><p className="text-[10px] font-bold uppercase tracking-widest">Proyeksi (To Be)</p></div>
                    <div><p className="text-[11px] font-semibold text-emerald-700/70 uppercase tracking-wider mb-1">Est. Omset Baru</p><p className="text-xl font-extrabold text-gray-900">Rp {fNum(projection.pOmset)}</p></div>
                    <div><p className="text-[11px] font-semibold text-emerald-700/70 uppercase tracking-wider mb-1">Est. Pesanan</p><p className="text-lg font-bold text-gray-700">{fNum(projection.pOrders)}</p></div>
                    <div>
                      <div className="flex items-center gap-3 mb-1.5">
                        <p className="text-[11px] font-semibold text-emerald-700/70 uppercase tracking-wider">Est. Biaya</p>
                        <div className="flex items-center bg-white border border-gray-200 shadow-sm rounded-[8px] px-2 py-0.5">
                           <input type="number" value={futureCostPct} onChange={(e) => setFutureCostPct(e.target.value)} className="bg-transparent text-gray-900 font-bold text-sm w-8 outline-none text-center" />
                           <span className="text-[10px] font-medium text-gray-500">%</span>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-rose-500">Rp {fNum(projection.pInvestTotal)}</p>
                    </div>
                    <div className="pt-5 border-t border-emerald-100"><p className="text-[11px] font-semibold text-emerald-700/70 uppercase tracking-wider mb-1">Est. Laba Bersih</p><p className="text-2xl font-extrabold text-emerald-600">Rp {fNum(projection.pNet)}</p></div>
                  </div>
                </div>
              </BentoCard>

              <BentoCard accent="blue">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[16px] bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600"><Receipt size={20}/></div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Selisih Laba</h3>
                  </div>
                  <span className={`text-xl font-extrabold px-5 py-2.5 rounded-[16px] shadow-sm border ${projection.pNet >= projection.hNet ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                    {projection.pNet >= projection.hNet ? '+' : ''}Rp {fNum(projection.pNet - projection.hNet)}
                  </span>
                </div>
              </BentoCard>

            </div>
          </div>
        )}

        {/* =========================================
            PAGE 4: ADS & PERFORMANCE
            ========================================= */}
        {page === 'ads' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              
              {/* Controls */}
              <div className="space-y-6 md:space-y-8">
                <BentoCard accent="slate">
                  <SectionHeader icon={Megaphone} title="Model Iklan" subtitle="Pilih jenis penempatan Ads." />
                  <div className="space-y-3">
                    {[
                      { id: 'keyword', title: 'Pencarian (Keyword)', desc: 'Tampil di hasil pencarian. Bayar per klik.' },
                      { id: 'banner', title: 'Banner / Jelajah', desc: 'Tampil di halaman depan. Untuk brand awareness.' },
                      { id: 'cpo', title: 'Pesanan (CPO)', desc: 'Bayar hanya jika pembeli benar-benar memesan.' }
                    ].map(ad => {
                       const isSelected = adsType === ad.id;
                       return (
                         <div key={ad.id} onClick={() => setAdsType(ad.id)} className={`p-4 rounded-[20px] cursor-pointer transition-all duration-300 flex items-center gap-4 border ${isSelected ? 'bg-emerald-50/50 border-emerald-500 shadow-sm ring-1 ring-emerald-500/20' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                           <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-emerald-500' : 'border-gray-300'}`}>
                             {isSelected && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"/>}
                           </div>
                           <div>
                             <h4 className={`text-sm font-bold tracking-tight mb-0.5 ${isSelected ? 'text-emerald-700' : 'text-gray-900'}`}>{ad.title}</h4>
                             <p className="text-[11px] text-gray-500 font-medium">{ad.desc}</p>
                           </div>
                         </div>
                       )
                    })}
                  </div>
                </BentoCard>

                <BentoCard accent="slate">
                  <SectionHeader icon={Crosshair} title="Parameter Budget" subtitle="Atur dana dan rasio konversi." />
                  <div className="space-y-5">
                    <MinimalInput label="Budget Harian" prefix="Rp" value={adsBudget} onChange={(e) => setAdsBudget(e.target.value)} />
                    <MinimalInput label={adsType === 'cpo' ? "Biaya per Order Target" : "Max Bid per Klik (CPC)"} prefix="Rp" value={cpcBid} onChange={(e) => setCpcBid(e.target.value)} type="number" />
                    
                    {adsType !== 'cpo' && (
                      <div className="grid grid-cols-2 gap-4">
                        <MinimalInput label="Rasio Klik (CTR)" suffix="%" value={adsCtr} onChange={(e) => setAdsCtr(e.target.value)} type="number" />
                        <MinimalInput label="Rasio Beli (CVR)" suffix="%" value={adsCvr} onChange={(e) => setAdsCvr(e.target.value)} type="number" />
                      </div>
                    )}

                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-[16px] flex items-start gap-3 mt-4">
                      <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0 mt-0.5 text-blue-500 shadow-sm"><Info size={12} strokeWidth={3} /></div>
                      <p className="text-[11px] text-blue-800 font-medium leading-relaxed">
                        {adsType === 'cpo' 
                          ? <>Anda hanya akan ditagih <b className="font-bold">Rp {cpcBid}</b> jika pesanan sukses terjadi.</>
                          : <>Sistem menyarankan Bid <b className="font-bold">Rp {adsType === 'keyword' ? '2.500' : '800'}</b> untuk performa ideal.</>
                        }
                      </p>
                    </div>
                  </div>
                </BentoCard>
              </div>

              {/* Visualization */}
              <div className="space-y-8">
                <BentoCard accent="emerald" className="h-full flex flex-col bg-emerald-50/30 !border-emerald-500/20 overflow-hidden relative">
                    {/* Minimal decorative element */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full"></div>

                    <div className="flex items-center gap-4 mb-10 relative z-10">
                      <div className="w-10 h-10 rounded-[12px] bg-white border border-emerald-100 shadow-sm flex items-center justify-center"><Activity size={20} className="text-emerald-500" /></div>
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-700">Estimasi Kinerja Harian</span>
                    </div>

                    <div className="flex-1 flex flex-col justify-center space-y-10 pl-2 relative z-10">
                       {/* Funnel Layout Minimalist */}
                       <div className="relative">
                          {/* Connector Line */}
                          <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-emerald-200/50"></div>
                          
                          <div className="flex items-center gap-6 mb-8 relative z-10">
                            <div className="w-10 h-10 rounded-full bg-white border border-emerald-100 shadow-sm flex items-center justify-center shrink-0"><Eye size={16} className="text-gray-500"/></div>
                            <div>
                              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Dilihat (Tayangan)</p>
                              <p className="text-2xl font-extrabold text-gray-900">{fNum(adsSim.estImpressions)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 mb-8 relative z-10">
                            <div className="w-10 h-10 rounded-full bg-white border border-emerald-100 shadow-sm flex items-center justify-center shrink-0"><MousePointer2 size={16} className="text-blue-500"/></div>
                            <div>
                              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Diklik (Traffic)</p>
                              <div className="flex items-center gap-3">
                                <p className="text-2xl font-extrabold text-gray-900">{fNum(adsSim.estClicks)}</p>
                                {adsType !== 'cpo' && <p className="text-[9px] text-blue-400 font-bold bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md shadow-sm">CTR {adsSim.ctrVal}%</p>}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 relative z-10">
                            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-[0_4px_10px_rgba(16,185,129,0.3)]"><ShoppingBag size={16} className="text-white"/></div>
                            <div>
                              <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest mb-1">Dibeli (Order)</p>
                              <div className="flex items-center gap-3">
                                <p className="text-3xl font-extrabold text-emerald-600">{fNum(adsSim.estOrders)}</p>
                                {adsType !== 'cpo' && <p className="text-[9px] text-emerald-600 font-bold bg-emerald-100/50 border border-emerald-200 px-2 py-0.5 rounded-md shadow-sm">CVR {(adsSim.cvr * 100).toFixed(0)}%</p>}
                              </div>
                            </div>
                          </div>
                       </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-emerald-100 relative z-10">
                      <div className="flex justify-between items-end mb-5">
                        <div>
                          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Total Biaya Ads</p>
                          <p className="text-lg font-bold text-rose-500">Rp {fNum(adsSim.actualCost)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Potensi Omset</p>
                          <p className="text-xl font-extrabold text-gray-900">Rp {fNum(adsSim.estGrossSales)}</p>
                        </div>
                      </div>
                      <div className="bg-white border border-emerald-100 p-4 rounded-[16px] flex justify-between items-center shadow-sm">
                        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Return on Ad Spend</span>
                        <span className={`text-lg font-extrabold ${adsSim.roas >= 5 ? 'text-emerald-600' : adsSim.roas >= 3 ? 'text-blue-500' : 'text-rose-500'}`}>{adsSim.roas.toFixed(1)}x ROAS</span>
                      </div>
                    </div>
                </BentoCard>
              </div>
            </div>

            {/* METRICS TABLE */}
            <BentoCard accent="slate">
              <SectionHeader icon={BarChart} title="Panduan Diagnostik" subtitle="Standar metrik sehat di industri FnB." />
              <div className="overflow-x-auto hide-scrollbar pb-2 mt-4">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr>
                      <th className="pb-4 px-4 text-[10px] font-semibold text-gray-500 uppercase tracking-widest w-[180px] border-b border-gray-100">Metric</th>
                      <th className="pb-4 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest w-[120px] border-b border-gray-100">Status</th>
                      <th className="pb-4 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest w-[120px] border-b border-gray-100">Target</th>
                      <th className="pb-4 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest border-b border-gray-100">Saran Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {METRICS_GUIDE.map((metricItem, mIdx) => (
                      <React.Fragment key={mIdx}>
                        {metricItem.rows.map((row, rIdx) => (
                          <tr key={`${mIdx}-${rIdx}`} className="hover:bg-gray-50/50 transition-colors">
                            {rIdx === 0 && (
                              <td rowSpan={3} className="py-4 px-4 align-top">
                                 <span className="text-xs font-bold text-gray-800 block pt-1">{metricItem.metric}</span>
                              </td>
                            )}
                            <td className="py-3 px-4 align-middle">
                              <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-[6px] border ${row.color} ${row.bg}`}>
                                {row.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 align-middle">
                              <span className="text-sm font-semibold text-gray-700 tabular-nums">{row.range}</span>
                            </td>
                            <td className="py-3 px-4 align-middle">
                              <p className="text-xs text-gray-500 font-medium leading-relaxed">{row.desc}</p>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </BentoCard>
          </div>
        )}
      </main>

      {/* FLOATING MOBILE NAV */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
        <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-800 shadow-[0_20px_40px_rgba(0,0,0,0.2)] rounded-2xl p-2 flex items-center justify-between">
          {[
            { id: 'calc', icon: Calculator, label: 'Margin' },
            { id: 'checkout', icon: ShoppingCart, label: 'Cart' },
            { id: 'prospect', icon: TrendingUp, label: 'Proyeksi' },
            { id: 'ads', icon: Megaphone, label: 'Iklan' }
          ].map((item) => {
            const isActive = page === item.id;
            return (
              <button 
                key={item.id} 
                onClick={() => setPage(item.id)}
                className={`relative flex flex-col items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-white'}`}
              >
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[9px] font-bold uppercase tracking-widest ${isActive ? 'block' : 'hidden'}`}>{item.label}</span>
                {item.id === 'checkout' && cart.length > 0 && (
                  <span className={`absolute top-2 right-4 w-2 h-2 rounded-full border-2 ${isActive ? 'bg-emerald-500 border-white' : 'bg-rose-500 border-gray-900'}`}></span>
                )}
              </button>
            )
          })}
        </div>
      </div>

    </div>
  );
}
