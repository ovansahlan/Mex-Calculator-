import React, { useState, useEffect, useMemo, Fragment } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  ComposedChart, Line, Cell, AreaChart, Area, PieChart, Pie, LineChart
} from 'recharts';
import { 
  UploadCloud, TrendingUp, Database, Filter, Megaphone,
  Search, CheckCircle, AlertCircle, DollarSign, Activity, X,
  Store, ArrowUpRight, ArrowDownRight, Minus, Users, Info, ArrowLeft, Zap, MapPin, Phone, Mail, Award, LayoutDashboard, Table, ShoppingBag, Target, Percent, ExternalLink, Calculator,
  ShoppingCart, Check, ArrowRight, Settings, List, Tags, Ticket, ChevronDown, Plus, MousePointer, Eye, RefreshCw, BarChart2
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs, setDoc, doc, writeBatch, onSnapshot } from 'firebase/firestore';

// --- FIREBASE INITIALIZATION ---
let app, auth, db, appId;
try {
  const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
  appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.error("Firebase init failed:", e);
}

// ============================================================================
// UTILS & CONSTANTS (DASHBOARD)
// ============================================================================
const cleanNumber = (val) => {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return val;
  const str = String(val).replace(/[▲▼%,]/g, '').trim();
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
};

const formatCurrency = (val) => {
  if (val >= 1000000000) return `Rp ${(val / 1000000000).toFixed(2)}B`;
  if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `Rp ${(val / 1000).toFixed(0)}K`;
  return `Rp ${val}`;
};

const formatMonth = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d) ? dateStr : d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
};

const COLORS = {
  primary: '#00B14F',   
  growth: '#0ea5e9',    
  decline: '#ef4444',   
  finance: '#f59e0b',   
  lastMonth: '#94a3b8', 
  white: '#ffffff',
  slate900: '#0f172a',
  slate500: '#64748b',
  netSales: '#10b981', 
  basketSize: '#cbd5e1' 
};

// ============================================================================
// UTILS, CONSTANTS & COMPONENTS (MERCHANT SIMULATOR)
// ============================================================================
const STRATEGY = {
  'normal': { k: 20, v: 0, tiers: null, title: 'NORMAL', benefits: ['Margin Aman 100%', 'Kestabilan Brand Jangka Panjang'] },
  'puas-cuan': { k: 32, v: 30, tiers: { hemat: { max: 45000, min: 15000 }, ekstra: { max: 80000, min: 35000 } }, title: 'CUAN 32%', benefits: ['Diskon Didukung Grab', 'Volume Penjualan Meningkat Drastis'] },
  'booster': { k: 38, v: 35, tiers: { hemat: { max: 55000, min: 15000 }, ekstra: { max: 100000, min: 35000 } }, title: 'BOOSTER 38%', benefits: ['Prioritas Pencarian Utama', 'Slot Banner Flash Sale Eksklusif'] },
  'cofund': { k: 20, v: 40, tiers: null, title: 'COFUND', benefits: ['Sharing Cost Promo', 'Akses ke Pengguna Baru'] }
};

const VOUCHERS = [
  { code: 'PUAS30', scheme: 'puas-cuan', label: 'Diskon Puas 30%', desc: 'Potongan 30%', disc: 30 },
  { code: 'PUAS35', scheme: 'booster', label: 'Diskon Puas 35%', desc: 'Potongan 35%', disc: 35 },
  { code: 'MITRA50', scheme: 'cofund', label: 'Diskon 40% (Patungan)', desc: 'Sharing Cost', disc: 40 }
];

const METRICS_GUIDE = [
  {
    metric: "CTR (Click-Through Rate)",
    rows: [
      { status: "Buruk", range: "< 1%", desc: "Daya tarik visual rendah. Foto menu tidak menggugah selera, judul kurang menarik.", color: "text-rose-600", bg: "bg-rose-50 border-rose-100" },
      { status: "Sehat", range: "1.5% - 2.5%", desc: "Cukup relevan. Restomu sudah muncul di depan audiens yang tepat.", color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
      { status: "Ideal", range: "> 3.5%", desc: "Sangat Menarik. Foto produk sangat kuat dan biasanya dibantu dengan promo.", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" }
    ]
  },
  {
    metric: "CVR (Conversion Rate)",
    rows: [
      { status: "Buruk", range: "< 5%", desc: "Ada hambatan di menu. Mungkin harga terlalu mahal, ongkir tidak masuk akal.", color: "text-rose-600", bg: "bg-rose-50 border-rose-100" },
      { status: "Sehat", range: "8% - 12%", desc: "Menu meyakinkan. Deskripsi jelas dan harga sesuai dengan ekspektasi konsumen.", color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
      { status: "Ideal", range: "> 15%", desc: "Mesin Penjual Otomatis. Promo dalam toko sangat efektif mengunci pembeli.", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" }
    ]
  },
  {
    metric: "ROAS (Return on Ad Spend)",
    rows: [
      { status: "Buruk", range: "< 2.5x", desc: "Bakar duit. Pendapatan tidak cukup menutupi biaya (COGS, komisi, iklan).", color: "text-rose-600", bg: "bg-rose-50 border-rose-100" },
      { status: "Sehat", range: "4x - 6x", desc: "Operasional aman. Sudah balik modal dan mulai mendapatkan margin tipis.", color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
      { status: "Ideal", range: "> 8x", desc: "Sangat Profitabel. Iklan bekerja sangat efisien. Keuntungan bersih tebal.", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" }
    ]
  }
];

const fNum = (n) => Math.round(n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const pNum = (n) => typeof n === 'number' ? n : parseFloat((n||'').toString().replace(/[^0-9]/g, '')) || 0;
const pFloat = (n) => typeof n === 'number' ? n : parseFloat((n||'').toString().replace(/,/g, '.').replace(/[^0-9.]/g, '')) || 0;

const SimLabel = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
    <div className="bg-slate-100 p-1.5 rounded-lg text-slate-500">
      {Icon && <Icon size={16} />}
    </div>
    <span className="text-sm font-bold text-slate-800 uppercase tracking-wide">
      {children}
    </span>
  </div>
);

const SimInputGroup = ({ label, prefix, suffix, value, onChange, type = "text", inputMode }) => (
  <div className="w-full">
    {label && <div className="mb-1.5"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p></div>}
    <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 flex items-center transition-all focus-within:border-[#00B14F] focus-within:bg-white focus-within:ring-2 focus-within:ring-green-100 h-10 md:h-12 shadow-sm">
      {prefix && <span className="text-xs font-bold text-slate-400 mr-2">{prefix}</span>}
      <input 
        type={type}
        inputMode={inputMode || (type === 'number' ? 'decimal' : 'numeric')}
        className="w-full bg-transparent outline-none font-bold text-slate-700 text-sm tabular-nums placeholder:text-slate-300"
        value={value}
        onChange={onChange}
      />
      {suffix && <span className="text-xs font-bold text-slate-400 ml-2">{suffix}</span>}
    </div>
  </div>
);

const SimKpiCard = ({ title, value, sub, valueColor = "text-slate-800", isClickable, onClick, isEditing, editValue, onEditChange, onEditFocus, onEditBlur }) => (
  <div 
    onClick={onClick}
    className={`bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center relative overflow-hidden ${isClickable ? 'cursor-pointer hover:border-[#00B14F] group transition-colors' : ''}`}
  >
    <div className="flex justify-between items-start mb-2">
       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
          {title} {isClickable && <MousePointer size={10} className="text-slate-300 group-hover:text-[#00B14F]"/>}
       </p>
    </div>
    
    {isEditing !== undefined ? (
       <input 
          className={`w-full bg-transparent border-none outline-none font-black text-xl md:text-2xl ${valueColor} tabular-nums p-0 focus:ring-0`}
          value={isEditing ? editValue : value}
          onChange={(e) => onEditChange(e.target.value)}
          onFocus={onEditFocus}
          onBlur={onEditBlur}
          inputMode="numeric"
          placeholder="0"
        />
    ) : (
       <div className={`text-xl md:text-2xl font-black tracking-tight leading-none ${valueColor}`}>
         {value}
       </div>
    )}
    
    {sub && <div className="mt-auto pt-2"><p className="text-[10px] font-bold text-slate-400">{sub}</p></div>}
  </div>
);

// ============================================================================
// KOMPONEN: TAB MERCHANT SIMULATOR (TERINTEGRASI)
// ============================================================================
const MerchantSimulator = () => {
  const [page, setPage] = useState('calc'); 
  const [scheme, setScheme] = useState('normal');
  const [tier, setTier] = useState('hemat');
  const [subMode, setSubMode] = useState('val'); 
  const [activeModal, setActiveModal] = useState(null); 

  const [inputs, setInputs] = useState({
    mainVal: "25.000", subVal: "0", menuName: "Menu Baru", kPct: 20, vDisk: 0, mDisk: "0", minO: "0", mShare: 50
  });

  const [histData, setHistData] = useState({ omset: "50.000.000", orders: "1000", aov: "50.000", invest: "5" });
  const [growthProj, setGrowthProj] = useState(20);
  const [futureCostPct, setFutureCostPct] = useState(5); 

  const [adsBudget, setAdsBudget] = useState("30.000"); 
  const [adsType, setAdsType] = useState('keyword'); 
  const [cpcBid, setCpcBid] = useState("2.500");
  const [adsCvr, setAdsCvr] = useState("15"); 
  const [adsCtr, setAdsCtr] = useState("3.5");

  const [localAppPrice, setLocalAppPrice] = useState("");
  const [isEditingAppPrice, setIsEditingAppPrice] = useState(false);

  const [cart, setCart] = useState([]);
  const [activeVoucher, setActiveVoucher] = useState(null);
  const [deliveryType, setDeliveryType] = useState('prioritas');
  const [showVoucherDropdown, setShowVoucherDropdown] = useState(false);

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

  const handleAppPriceManual = (val) => {
    const rawVal = parseInt(val.replace(/[^0-9]/g, '') || '0', 10);
    setLocalAppPrice(fNum(rawVal));
    const k = pNum(inputs.kPct); const subRaw = pNum(inputs.subVal); const actSub = subMode === 'val' ? subRaw : (pNum(inputs.mainVal) * subRaw / 100);
    setInputs(prev => ({ ...prev, mainVal: fNum(Math.round(rawVal * (1 - k / 100) + actSub)) }));
  };

  const handleTargetOrderChange = (val) => {
    const rawVal = pNum(val); const baseOrders = pNum(histData.orders);
    if (baseOrders > 0) setGrowthProj(((rawVal - baseOrders) / baseOrders) * 100);
  };

  const addToCart = () => {
    const priceToCart = pNum(isEditingAppPrice ? localAppPrice : calc.list);
    const newItem = { id: Date.now(), name: inputs.menuName, price: priceToCart, qty: 1 };
    setCart(prev => {
      const idx = prev.findIndex(i => i.name === newItem.name && i.price === newItem.price);
      if (idx > -1) { const next = [...prev]; next[idx].qty += 1; return next; }
      return [...prev, newItem];
    });
  };

  const updateCartQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) return { ...item, qty: Math.max(1, item.qty + delta) };
      return item;
    }));
  };

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
    return { subtotal, finalDisc: totalPotDisc, finalOngkir: Math.max(0, baseOngkir - ongkirDisc), total: subtotal - totalPotDisc + Math.max(0, baseOngkir - ongkirDisc) + 1500, ongkirDisc, totalMerchantCost, schemeKey, limitMin, limitMax, thresholdMet };
  }, [cart, activeVoucher, deliveryType, inputs.mShare, inputs.minO, inputs.mDisk, tier]);

  const projection = useMemo(() => {
    const hOmset = pNum(histData.omset); const hOrders = pNum(histData.orders); const hAOV = pNum(histData.aov); const hInvestPct = pFloat(histData.invest); 
    const pOrders = Math.round(hOrders * (1 + growthProj / 100));
    const newAOV = checkout.subtotal > 0 ? checkout.subtotal : hAOV;
    const pOmset = pOrders * newAOV;
    const futureInvestPct = pFloat(futureCostPct);
    const pInvestTotal = Math.round(pOmset * (futureInvestPct / 100));
    return { 
      hOmset, hOrders, hDailyOrders: hOrders > 0 ? Math.round(hOrders / 30) : 0, hInvestAmount: Math.round(hOmset * (hInvestPct / 100)), hInvestPct, hNet: hOmset - Math.round(hOmset * (hInvestPct / 100)), hAOV, 
      pOmset, pOrders, pDailyOrders: Math.round(pOrders / 30), pInvestTotal, pNet: pOmset - pInvestTotal, newAOV, futureInvestPct 
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
    <div className="animate-in fade-in duration-300">
        
        {/* MODAL BREAKDOWN */}
        {activeModal && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
            <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3">
                 <h3 className="font-bold text-sm uppercase tracking-widest text-slate-800">
                   {activeModal === 'cust' ? 'Payment Breakdown' : 'Revenue Breakdown'}
                 </h3>
                 <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Harga Aplikasi</span>
                  <span className="font-bold text-slate-800">Rp {fNum(calc.list)}</span>
                </div>
                {activeModal === 'cust' ? (
                  <div className="flex justify-between text-sm text-rose-500 font-medium">
                    <span>Diskon Campaign</span>
                    <span className="font-bold">- Rp {fNum(calc.list - calc.pay)}</span>
                  </div>
                ) : (
                  <Fragment>
                    <div className="flex justify-between text-sm text-slate-500 font-medium">
                      <span>Komisi Grab ({inputs.kPct}%)</span>
                      <span className="font-bold text-slate-800">- Rp {fNum((calc.list - calc.mPromoCost) * (pNum(inputs.kPct)/100))}</span>
                    </div>
                    {scheme === 'cofund' && (
                      <div className="flex justify-between text-sm text-blue-600 font-medium">
                        <span>Beban Toko</span>
                        <span className="font-bold">- Rp {fNum(calc.mPromoCost)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-amber-600 pt-2 border-t border-slate-100 font-medium">
                      <span>Mex Investment</span>
                      <span className="font-bold">{calc.mexInvestPct.toFixed(1)}%</span>
                    </div>
                  </Fragment>
                )}
                <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {activeModal === 'cust' ? 'Total Bayar' : 'Net Bersih'}
                  </span>
                  <span className={`text-2xl font-black tracking-tight ${activeModal === 'cust' ? 'text-[#00B14F]' : 'text-blue-600'}`}>
                    Rp {fNum(activeModal === 'cust' ? calc.pay : calc.net)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TOP SUB-NAVIGATION */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-lg md:text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                 <Calculator className="w-5 h-5 text-[#00B14F]"/> Merchant Simulator
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Simulasikan margin, harga coret, ongkir, hingga ROAS Ads.</p>
            </div>
            
            <div className="flex bg-slate-200/60 p-1.5 rounded-xl shrink-0 border border-slate-200 shadow-inner overflow-x-auto w-full sm:w-auto custom-scrollbar">
               <button onClick={() => setPage('calc')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${page === 'calc' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                   <Calculator className="w-3.5 h-3.5" /> Margin
               </button>
               <button onClick={() => setPage('checkout')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${page === 'checkout' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                   <ShoppingCart className="w-3.5 h-3.5" /> Checkout {cart.length > 0 && <span className="bg-red-500 text-white w-3 h-3 rounded-full flex items-center justify-center text-[8px] ml-0.5">{cart.length}</span>}
               </button>
               <button onClick={() => setPage('prospect')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${page === 'prospect' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                   <TrendingUp className="w-3.5 h-3.5" /> Proyeksi
               </button>
               <button onClick={() => setPage('ads')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${page === 'ads' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                   <Megaphone className="w-3.5 h-3.5" /> Ads
               </button>
            </div>
        </div>

        {/* DYNAMIC TOP PANELS */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
            {page === 'prospect' ? (
              <Fragment>
                <SimKpiCard title="AOV Lama" value={`Rp ${fNum(projection.hAOV)}`} sub={`${fNum(projection.hOrders)} Order/Bulan`} valueColor="text-slate-600" />
                <SimKpiCard title="AOV Baru (Est)" value={`Rp ${fNum(projection.newAOV)}`} sub={`${fNum(projection.pOrders)} Order/Bulan`} valueColor="text-emerald-600" />
                <SimKpiCard title="Selisih Profit" value={`${projection.pNet >= projection.hNet ? '+' : ''}Rp ${fNum(projection.pNet - projection.hNet)}`} valueColor={projection.pNet >= projection.hNet ? 'text-blue-600' : 'text-rose-500'} />
              </Fragment>
            ) : page === 'checkout' ? (
               <Fragment>
                <SimKpiCard title="Subtotal Cart" value={`Rp ${fNum(checkout.subtotal)}`} valueColor="text-slate-700" />
                <SimKpiCard title="Promo Terpakai" value={activeVoucher ? activeVoucher.code : 'NORMAL'} valueColor={activeVoucher ? 'text-emerald-600' : 'text-slate-400'} />
                <SimKpiCard title="Total Diskon" value={checkout.finalDisc > 0 ? `- Rp ${fNum(checkout.finalDisc)}` : '-'} valueColor="text-rose-500" />
               </Fragment>
            ) : page === 'ads' ? (
               <Fragment>
                <SimKpiCard title="Model Ads" value={adsType === 'cpo' ? 'Pesanan' : adsType.toUpperCase()} valueColor="text-slate-700" />
                <SimKpiCard title={adsType === 'cpo' ? 'Biaya/Order' : 'Bid CPC'} value={`Rp ${fNum(pNum(cpcBid))}`} valueColor="text-slate-700" />
                <SimKpiCard title="Target ROAS" value={`${adsSim.roas.toFixed(1)}x`} valueColor={adsSim.roas >= 5 ? 'text-emerald-600' : adsSim.roas >= 3 ? 'text-blue-500' : 'text-rose-500'} />
               </Fragment>
            ) : (
              <Fragment>
                <SimKpiCard title="Harga Aplikasi" value={`Rp ${fNum(calc.list)}`} valueColor="text-slate-800"
                   isEditing={isEditingAppPrice} editValue={localAppPrice} 
                   onEditChange={handleAppPriceManual} onEditFocus={() => { setIsEditingAppPrice(true); setLocalAppPrice(fNum(calc.list)); }} onEditBlur={() => { setIsEditingAppPrice(false); setLocalAppPrice(fNum(calc.list)); }}
                />
                <SimKpiCard title="Pax Pays (Bayar)" value={`Rp ${fNum(calc.pay)}`} sub={calc.list > calc.pay ? `Coret dari Rp ${fNum(calc.list)}` : 'Harga Normal'} valueColor="text-[#00B14F]" isClickable onClick={() => setActiveModal('cust')} />
                <SimKpiCard title="Net Rev (Bersih)" value={`Rp ${fNum(calc.net)}`} sub={`Mex Inv: ${calc.mexInvestPct.toFixed(1)}%`} valueColor="text-blue-600" isClickable onClick={() => setActiveModal('net')} />
              </Fragment>
            )}
        </div>

        {/* TAB CONTENTS */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-6 mb-10">
          
          {/* TAB 1: MARGIN CALC */}
          {page === 'calc' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-6">
                <SimLabel icon={Tags}>1. Strategi Campaign</SimLabel>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  {Object.keys(STRATEGY).map(k => {
                    const isActive = scheme === k;
                    return (
                      <button 
                        key={k} onClick={() => setScheme(k)} 
                        className={`py-3 rounded-xl text-xs font-black uppercase transition-all duration-200 border-2 relative
                          ${isActive ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                      >
                        {k === 'normal' ? 'Normal' : k === 'puas-cuan' ? 'Cuan 32%' : k === 'booster' ? 'Boost 38%' : 'CoFund'}
                      </button>
                    )
                  })}
                </div>

                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex-1">
                    <h2 className="font-black text-sm text-slate-800 tracking-tight mb-2">{STRATEGY[scheme].title}</h2>
                    <div className="flex flex-col gap-1.5">
                      {STRATEGY[scheme].benefits.map((b, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="text-emerald-500 mt-0.5 shrink-0"><Check size={12} strokeWidth={4}/></div>
                          <span className="text-xs font-bold text-slate-600 leading-snug">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {STRATEGY[scheme].tiers && (
                    <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm self-start">
                      {['hemat', 'ekstra'].map(t => (
                        <button key={t} onClick={() => setTier(t)} className={`px-4 py-2 rounded-md text-[10px] font-black uppercase transition-all ${tier === t ? 'bg-[#00B14F] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>{t}</button>
                      ))}
                    </div>
                  )}
                </div>

                {scheme === 'cofund' && (
                  <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">Mex Promo Share</span>
                      </div>
                      <span className="text-xs font-black bg-white text-blue-600 px-2.5 py-1 rounded-lg border border-blue-200 shadow-sm">{inputs.mShare}%</span>
                    </div>
                    <input type="range" min="0" max="100" step="5" value={inputs.mShare} onChange={(e) => setInputs(prev => ({ ...prev, mShare: parseInt(e.target.value) }))} className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-3" />
                    <div className="flex justify-between items-end bg-white p-3 rounded-xl border border-blue-100">
                      <div className="text-left"><p className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">Beban Toko</p><p className="font-black text-sm text-slate-800">Rp {fNum(calc.mPromoCost)}</p></div>
                      <div className="text-right"><p className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">Beban Grab</p><p className="font-black text-sm text-blue-600">Rp {fNum(calc.totalDisc - calc.mPromoCost)}</p></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* Left: Input Menu */}
                <div>
                   <SimLabel icon={List}>2. Harga Menu</SimLabel>
                   <div className="space-y-4 mb-5">
                      <SimInputGroup label="Harga Jual Offline" prefix="Rp" value={inputs.mainVal} onChange={(e) => handleInputChange('mainVal', e.target.value)} />
                      
                      <div>
                        <div className="mb-1.5"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subsidi Toko / Mark-up</p></div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 flex items-center transition-all focus-within:border-[#00B14F] focus-within:bg-white focus-within:ring-2 focus-within:ring-green-100 h-10 md:h-12 shadow-sm">
                          <input type="text" inputMode="numeric" className="w-full bg-transparent outline-none font-bold text-slate-700 text-sm tabular-nums placeholder:text-slate-300" value={inputs.subVal} onChange={(e) => handleInputChange('subVal', e.target.value)} />
                          <div className="flex bg-slate-200/50 rounded-lg p-1 ml-2 shrink-0 gap-1 border border-slate-200">
                            <button onClick={() => setSubMode('val')} className={`w-8 h-6 flex items-center justify-center text-[10px] font-black rounded transition-all ${subMode === 'val' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>Rp</button>
                            <button onClick={() => setSubMode('pct')} className={`w-8 h-6 flex items-center justify-center text-[10px] font-black rounded transition-all ${subMode === 'pct' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>%</button>
                          </div>
                        </div>
                      </div>
                   </div>
                   <div className="flex gap-3 items-end pt-4 border-t border-slate-100">
                      <SimInputGroup label="Nama Menu" value={inputs.menuName} onChange={(e) => handleInputChange('menuName', e.target.value)} inputMode="text" />
                      <button onClick={addToCart} className="h-10 md:h-12 px-6 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white rounded-xl font-bold text-[11px] uppercase tracking-wider shadow-md transition-all flex items-center gap-2 shrink-0">Add <ArrowRight size={14} strokeWidth={3}/></button>
                   </div>
                </div>

                {/* Right: Config */}
                <div>
                  <SimLabel icon={Settings}>3. Aturan Skema</SimLabel>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    <SimInputGroup label="Komisi" suffix="%" value={inputs.kPct} type="number" onChange={(e) => handleInputChange('kPct', e.target.value)} />
                    <SimInputGroup label="Diskon" suffix="%" value={inputs.vDisk} type="number" onChange={(e) => handleInputChange('vDisk', e.target.value)} />
                    <SimInputGroup label="Min. Order" prefix="Rp" value={inputs.minO} onChange={(e) => handleInputChange('minO', e.target.value)} />
                    <SimInputGroup label="Max. Disk" prefix="Rp" value={inputs.mDisk} onChange={(e) => handleInputChange('mDisk', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHECKOUT */}
          {page === 'checkout' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
               <div className="space-y-6">
                  <div className="border border-slate-200 rounded-2xl p-4 md:p-5 bg-slate-50/50">
                    <SimLabel icon={Info}>1. Pengiriman</SimLabel>
                    <div className="space-y-2.5">
                      {['prioritas', 'standar', 'hemat'].map(id => (
                        <div key={id} onClick={() => setDeliveryType(id)} className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${deliveryType === id ? 'bg-emerald-50 border-emerald-400 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${deliveryType === id ? 'border-emerald-500' : 'border-slate-300'}`}>
                              {deliveryType === id && <div className="w-2 h-2 bg-emerald-500 rounded-full"/>}
                            </div>
                            <div>
                              <p className={`font-black text-[11px] uppercase tracking-wider ${deliveryType === id ? 'text-emerald-700' : 'text-slate-700'}`}>{id}</p>
                              <p className="text-[10px] text-slate-400 font-bold">Est. {id === 'prioritas' ? '20' : id === 'standar' ? '30' : '45'} mnt</p>
                            </div>
                          </div>
                          <div className="text-right">
                             {checkout.ongkirDisc > 0 ? (
                               <Fragment>
                                 <span className="block text-[10px] text-slate-400 line-through font-medium">Rp {fNum(id === 'prioritas' ? 15000 : id === 'standar' ? 10000 : 5000)}</span>
                                 <span className="block font-black text-sm text-emerald-600">Rp {fNum(Math.max(0, (id === 'prioritas' ? 15000 : id === 'standar' ? 10000 : 5000) - checkout.ongkirDisc))}</span>
                               </Fragment>
                             ) : (
                               <span className="font-black text-sm text-slate-700">Rp {fNum(id === 'prioritas' ? 15000 : id === 'standar' ? 10000 : 5000)}</span>
                             )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-2xl p-4 md:p-5">
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="bg-slate-100 p-1.5 rounded-lg text-slate-500"><ShoppingCart size={16} /></div>
                        <span className="text-sm font-bold text-slate-800 uppercase tracking-wide">2. Rincian Item</span>
                      </div>
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-md border border-emerald-200">{cart.reduce((a,b)=>a+b.qty,0)}</span>
                    </div>
                    <div className="space-y-3">
                      {cart.length === 0 ? (
                         <div className="text-center py-8 text-slate-400 font-bold text-[10px] uppercase tracking-widest border border-dashed border-slate-200 rounded-xl bg-slate-50">Keranjang Kosong</div>
                      ) : cart.map(item => {
                        return (
                          <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 font-black flex items-center justify-center text-xs border border-emerald-100">{item.qty}</div>
                              <div>
                                <p className="font-black text-[11px] text-slate-800">{item.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <button onClick={() => updateCartQty(item.id, -1)} className="w-5 h-5 flex items-center justify-center bg-slate-100 rounded text-slate-600 hover:bg-slate-200"><Minus size={10} strokeWidth={3} /></button>
                                  <span className="text-[10px] font-black text-slate-800 w-3 text-center">{item.qty}</span>
                                  <button onClick={() => updateCartQty(item.id, 1)} className="w-5 h-5 flex items-center justify-center bg-emerald-100 rounded text-emerald-700 hover:bg-emerald-200"><Plus size={10} strokeWidth={3} /></button>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-slate-800 text-sm">Rp {fNum(item.price * item.qty)}</p>
                              <button onClick={() => setCart(prev => prev.filter(i=>i.id!==item.id))} className="text-[9px] text-red-500 font-bold hover:text-red-700 uppercase tracking-widest mt-1">Hapus</button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
               </div>

               <div className="space-y-6">
                   <div className="border border-slate-200 rounded-2xl p-4 md:p-5 bg-slate-50/50 h-full flex flex-col">
                      <SimLabel icon={Ticket}>3. Voucher & Promo</SimLabel>
                      <div className="relative mb-6">
                        <button onClick={() => setShowVoucherDropdown(!showVoucherDropdown)} className={`w-full p-3 md:p-4 rounded-xl border flex justify-between items-center transition-all bg-white shadow-sm ${activeVoucher ? 'border-emerald-400 ring-2 ring-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeVoucher ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}><Ticket size={16} /></div>
                            <div className="text-left">
                              <p className={`text-[11px] md:text-xs font-black uppercase tracking-wide ${activeVoucher ? 'text-emerald-700' : 'text-slate-600'}`}>{activeVoucher ? activeVoucher.code : 'Pilih Voucher'}</p>
                              <p className={`text-[9px] md:text-[10px] font-bold mt-0.5 ${activeVoucher ? 'text-emerald-500' : 'text-slate-400'}`}>{activeVoucher ? activeVoucher.label : 'Makin hemat pakai promo'}</p>
                            </div>
                          </div>
                          <ChevronDown size={18} className={`transition-transform duration-300 ${showVoucherDropdown ? 'rotate-180' : ''} ${activeVoucher ? 'text-emerald-600' : 'text-slate-400'}`}/>
                        </button>

                        {showVoucherDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100" onClick={() => selectVoucher(null)}>
                              <div className="flex justify-between items-center">
                                <div><p className="text-[11px] font-black text-slate-700">NORMAL</p><p className="text-[9px] text-slate-500 font-medium">Tanpa Voucher (Harga Normal)</p></div>
                                {!activeVoucher && <Check size={16} className="text-[#00B14F]" />}
                              </div>
                            </div>
                            {VOUCHERS.map((v, i) => (
                              <div key={i} className="p-3 hover:bg-emerald-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors" onClick={() => selectVoucher(v)}>
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="text-[11px] font-black text-[#00B14F]">{v.code}</p>
                                    <p className="text-[10px] font-bold text-slate-700 mt-0.5">{v.label}</p>
                                  </div>
                                  {activeVoucher?.code === v.code && <Check size={16} className="text-[#00B14F]" />}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {activeVoucher && (
                        <div className="mb-6 bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                          <div className="flex justify-between text-[10px] mb-1.5"><span className="text-slate-500 font-bold">Min. Order</span><span className="font-black text-slate-700">Rp {fNum(checkout.limitMin)}</span></div>
                          <div className="flex justify-between text-[10px]"><span className="text-slate-500 font-bold">Max. Diskon</span><span className="font-black text-slate-700">{checkout.limitMax === Infinity ? 'Tanpa Batas' : `Rp ${fNum(checkout.limitMax)}`}</span></div>
                          {!checkout.thresholdMet && (<div className="mt-3 text-[9px] text-rose-600 font-bold flex items-center gap-1.5 bg-rose-50 p-2 rounded-lg border border-rose-100"><AlertCircle size={12} /> Belum memenuhi minimum order</div>)}
                        </div>
                      )}

                      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-200 mt-auto">
                        <div className="space-y-3 mb-4">
                            <div className="flex justify-between text-[11px] md:text-xs font-bold text-slate-600"><span>Subtotal</span><span>Rp {fNum(checkout.subtotal)}</span></div>
                            <div className="flex justify-between text-[11px] md:text-xs font-bold text-slate-600"><span>Ongkos Kirim</span><span>Rp {fNum(checkout.finalOngkir)}</span></div>
                            <div className="flex justify-between text-[11px] md:text-xs font-bold text-slate-600"><span>Biaya Layanan</span><span>Rp 1.500</span></div>
                            {checkout.finalDisc > 0 && (<div className="flex justify-between text-[11px] md:text-xs font-black text-emerald-600 pt-3 border-t border-slate-100"><span className="flex items-center gap-1"><Zap size={12}/> Promo Aktif</span><span>- Rp {fNum(checkout.finalDisc)}</span></div>)}
                            
                            {checkout.schemeKey === 'cofund' && checkout.totalMerchantCost > 0 && (
                              <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-100 mt-2">
                                <p className="text-[9px] font-black text-blue-700 uppercase tracking-widest mb-1.5">Rincian Patungan (Cofund)</p>
                                <div className="flex justify-between text-[10px] mb-1"><span className="text-slate-600 font-medium">Beban Toko</span><span className="font-bold text-slate-800">Rp {fNum(checkout.totalMerchantCost)}</span></div>
                                <div className="flex justify-between text-[10px]"><span className="text-slate-600 font-medium">Beban Grab</span><span className="font-bold text-slate-800">Rp {fNum(checkout.finalDisc - checkout.totalMerchantCost)}</span></div>
                              </div>
                            )}
                        </div>

                        <div className="pt-4 mt-2 border-t-2 border-slate-100 border-dashed">
                          <div className="flex justify-between items-end mb-5">
                              <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Tagihan</p>
                                  <p className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Rp {fNum(checkout.total)}</p>
                              </div>
                          </div>
                          <button className="w-full bg-[#00B14F] hover:bg-green-600 text-white p-3 md:p-4 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wide shadow-md transition-all active:scale-[0.98] flex justify-center items-center gap-2 group">
                              Simulasi Pesan <ArrowRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform"/>
                          </button>
                        </div>
                      </div>
                   </div>
               </div>
            </div>
          )}

          {/* TAB 3: PROSPECT */}
          {page === 'prospect' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-6">
                <div className="border border-slate-200 rounded-2xl p-4 md:p-5 bg-slate-50/50">
                  <SimLabel icon={BarChart2}>1. Data Historis (Bulan Lalu)</SimLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SimInputGroup label="Omset Penjualan" prefix="Rp" value={histData.omset} onChange={(e) => handleHistChange('omset', e.target.value)} />
                    <SimInputGroup label="Jumlah Order" value={histData.orders} onChange={(e) => handleHistChange('orders', e.target.value)} />
                    <SimInputGroup label="AOV (Rata2 Order)" prefix="Rp" value={histData.aov} onChange={(e) => handleHistChange('aov', e.target.value)} />
                    <SimInputGroup label="Beban Promo/Ads" suffix="%" value={histData.invest} onChange={(e) => handleHistChange('invest', e.target.value)} />
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 md:p-5 bg-slate-50/50">
                  <SimLabel icon={TrendingUp}>2. Target Proyeksi Baru</SimLabel>
                  <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Kenaikan Order</span>
                      <span className="text-xl font-black text-[#00B14F] bg-green-50 px-2 py-0.5 rounded-lg border border-green-100">+{growthProj}%</span>
                    </div>
                    <input type="range" min="0" max="200" step="5" value={growthProj} onChange={(e) => setGrowthProj(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00B14F]" />
                    <div className="mt-5 pt-5 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Est. Total Order Baru</div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2">
                        <input type="text" inputMode="numeric" className="bg-transparent outline-none font-black text-slate-800 text-base tabular-nums w-16 text-right" value={fNum(Math.round(pNum(histData.orders) * (1 + growthProj/100)))} onChange={(e) => handleTargetOrderChange(e.target.value)} />
                        <span className="text-xs font-bold text-slate-400">Trx</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Historis Summary */}
                <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -mr-4 -mt-4 opacity-50 pointer-events-none"></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 relative z-10">Ringkasan Bulan Lalu</p>
                  <div className="space-y-3 relative z-10">
                    <div className="flex justify-between items-end"><p className="text-[11px] font-bold text-slate-500 uppercase">Omset</p><p className="text-lg font-black text-slate-800">Rp {fNum(projection.hOmset)}</p></div>
                    <div className="flex justify-between items-end"><p className="text-[11px] font-bold text-slate-500 uppercase">Orders</p><p className="text-base font-black text-slate-700">{fNum(projection.hOrders)} <span className="text-[10px] font-medium text-slate-400 ml-1">({fNum(projection.hDailyOrders)}/hr)</span></p></div>
                    <div className="flex justify-between items-end"><p className="text-[11px] font-bold text-slate-500 uppercase">AOV</p><p className="text-base font-black text-slate-700">Rp {fNum(projection.hAOV)}</p></div>
                    <div className="flex justify-between items-end"><p className="text-[11px] font-bold text-slate-500 uppercase">Beban ({projection.hInvestPct}%)</p><p className="text-base font-black text-rose-500">Rp {fNum(projection.hInvestAmount)}</p></div>
                    <div className="flex justify-between items-end pt-2 border-t border-slate-100"><p className="text-xs font-bold text-slate-800 uppercase">Net Profit</p><p className="text-xl font-black text-blue-600">Rp {fNum(projection.hNet)}</p></div>
                  </div>
                </div>

                {/* Proyeksi Summary */}
                <div className="bg-emerald-50 rounded-2xl p-5 md:p-6 border border-emerald-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-bl-full -mr-8 -mt-8 opacity-50 pointer-events-none"></div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4 relative z-10">Simulasi Masa Depan</p>
                  <div className="space-y-3 relative z-10">
                    <div className="flex justify-between items-end"><p className="text-[11px] font-bold text-emerald-700 uppercase">Est. Omset</p><p className="text-xl font-black text-emerald-800">Rp {fNum(projection.pOmset)}</p></div>
                    <div className="flex justify-between items-end">
                       <div className="flex flex-col"><p className="text-[11px] font-bold text-emerald-700 uppercase">Est. Orders</p><span className="text-[9px] font-bold text-emerald-500 mt-0.5">+{growthProj.toFixed(0)}% Kenaikan</span></div>
                       <p className="text-base font-black text-emerald-700">{fNum(projection.pOrders)} <span className="text-[10px] font-medium text-emerald-600/70 ml-1">({fNum(projection.pDailyOrders)}/hr)</span></p>
                    </div>
                    <div className="flex justify-between items-end">
                       <div className="flex flex-col"><p className="text-[11px] font-bold text-emerald-700 uppercase">Est. AOV</p><span className="text-[9px] font-medium text-emerald-600/70 mt-0.5">Diambil dari Cart</span></div>
                       <p className="text-base font-black text-emerald-700">Rp {fNum(projection.newAOV)}</p>
                    </div>
                    <div className="flex justify-between items-end">
                       <div className="flex flex-col gap-1"><p className="text-[11px] font-bold text-emerald-700 uppercase">Est. Beban</p><div className="flex items-center gap-1.5 bg-white px-1.5 py-0.5 rounded border border-emerald-200 w-fit"><input type="number" value={futureCostPct} onChange={(e) => setFutureCostPct(e.target.value)} className="bg-transparent text-emerald-800 font-bold text-xs w-8 outline-none text-center" /><span className="text-[9px] font-bold text-emerald-500">%</span></div></div>
                       <p className="text-base font-black text-rose-500">Rp {fNum(projection.pInvestTotal)}</p>
                    </div>
                    <div className="flex justify-between items-end pt-3 border-t border-emerald-200/50 mt-1"><p className="text-xs font-bold text-emerald-900 uppercase">Est. Net Profit</p><p className="text-2xl font-black text-[#00B14F]">Rp {fNum(projection.pNet)}</p></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADS */}
          {page === 'ads' && (
            <div className="space-y-8 pb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-6">
                  <div className="border border-slate-200 rounded-2xl p-4 md:p-5 bg-slate-50/50">
                    <SimLabel icon={Megaphone}>1. Pilih Jenis Iklan</SimLabel>
                    <div className="space-y-3">
                      <div onClick={() => setAdsType('keyword')} className={`p-4 rounded-xl border-2 cursor-pointer transition-all bg-white ${adsType === 'keyword' ? 'border-[#00B14F] shadow-md ring-1 ring-green-100' : 'border-slate-200 hover:border-slate-300'}`}>
                        <div className="flex justify-between items-start mb-1.5"><h4 className="font-black text-sm text-slate-800">Pencarian (Keyword)</h4>{adsType === 'keyword' && <Check size={16} className="text-[#00B14F]" />}</div>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Tampil di hasil pencarian. Bayar per klik (CPC). Sangat cocok menangkap niat beli tinggi.</p>
                      </div>
                      <div onClick={() => setAdsType('banner')} className={`p-4 rounded-xl border-2 cursor-pointer transition-all bg-white ${adsType === 'banner' ? 'border-[#00B14F] shadow-md ring-1 ring-green-100' : 'border-slate-200 hover:border-slate-300'}`}>
                        <div className="flex justify-between items-start mb-1.5"><h4 className="font-black text-sm text-slate-800">Jelajah (Banner)</h4>{adsType === 'banner' && <Check size={16} className="text-[#00B14F]" />}</div>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Tampil di halaman utama. Cocok untuk membangun brand awareness toko Anda.</p>
                      </div>
                      <div onClick={() => setAdsType('cpo')} className={`p-4 rounded-xl border-2 cursor-pointer transition-all bg-white ${adsType === 'cpo' ? 'border-[#00B14F] shadow-md ring-1 ring-green-100' : 'border-slate-200 hover:border-slate-300'}`}>
                        <div className="flex justify-between items-start mb-1.5"><h4 className="font-black text-sm text-slate-800">Pesanan (CPO)</h4>{adsType === 'cpo' && <Check size={16} className="text-[#00B14F]" />}</div>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Hanya bayar ketika terjadi order. Resiko sangat rendah dan garansi ROAS.</p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-2xl p-4 md:p-5 bg-slate-50/50">
                    <SimLabel icon={Target}>2. Budget & Performa</SimLabel>
                    <div className="space-y-4">
                      <SimInputGroup label="Budget Harian" prefix="Rp" value={adsBudget} onChange={(e) => setAdsBudget(e.target.value)} />
                      <div className="flex gap-4">
                        <div className="flex-1"><SimInputGroup label={adsType === 'cpo' ? "Biaya per Order" : "Max CPC (Bid)"} prefix="Rp" value={cpcBid} onChange={(e) => setCpcBid(e.target.value)} inputMode="numeric"/></div>
                      </div>
                      {adsType !== 'cpo' && (
                        <div className="flex gap-4">
                          <div className="flex-1"><SimInputGroup label="Est. CTR (%)" suffix="%" value={adsCtr} onChange={(e) => setAdsCtr(e.target.value)} inputMode="decimal"/></div>
                          <div className="flex-1"><SimInputGroup label="Est. CVR (%)" suffix="%" value={adsCvr} onChange={(e) => setAdsCvr(e.target.value)} inputMode="decimal"/></div>
                        </div>
                      )}
                      <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-100 flex items-start gap-2.5">
                        <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-[10px] text-blue-700 font-medium leading-relaxed">
                          {adsType === 'cpo' ? <span>Anda hanya akan ditagih <b className="font-black">Rp {cpcBid}</b> saat order masuk.</span> : <span>Default rekomendasi sistem: CPC <b className="font-black">Rp {adsType === 'keyword' ? '2.500' : '800'}</b>, CTR <b className="font-black">{adsType === 'keyword' ? '3.5' : '1.2'}%</b>.</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-full">
                  <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200 h-full flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -mr-8 -mt-8 opacity-50 pointer-events-none transition-transform group-hover:scale-110"></div>
                    
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 relative z-10">
                      <div className="bg-green-50 p-1.5 rounded-lg text-[#00B14F]"><Activity size={16} /></div>
                      <span className="text-sm font-black uppercase tracking-wide text-slate-800">Estimasi Hasil Harian</span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-6 mb-6 relative z-10">
                      <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Est. Tayangan (Mata)</p>
                         <p className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">{fNum(adsSim.estImpressions)}</p>
                         {adsType !== 'cpo' && (<p className="text-[9px] text-slate-500 font-bold flex items-center gap-1 mt-1"><Eye size={10} className="text-[#00B14F]"/> CTR {adsSim.ctrVal}%</p>)}
                      </div>
                      <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Est. Klik (Traffic)</p>
                         <p className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">{fNum(adsSim.estClicks)}</p>
                         {adsType !== 'cpo' && (<p className="text-[9px] text-slate-500 font-bold flex items-center gap-1 mt-1"><MousePointer size={10} className="text-[#00B14F]"/> Bayar jika diklik</p>)}
                      </div>
                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Biaya Iklan</p>
                        <p className="text-lg md:text-xl font-black text-rose-500 tracking-tight">Rp {fNum(adsSim.actualCost)}</p>
                      </div>
                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Est. Order</p>
                        <p className="text-lg md:text-xl font-black text-[#00B14F] tracking-tight">{fNum(adsSim.estOrders)}</p>
                        {adsType !== 'cpo' && (<p className="text-[9px] text-slate-500 font-bold mt-1.5">Mengingat CVR {(adsSim.cvr * 100).toFixed(0)}%</p>)}
                      </div>
                    </div>

                    <div className="mt-auto pt-5 border-t-2 border-slate-100 border-dashed relative z-10">
                      <div className="flex justify-between items-end mb-3">
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Potensi Omset</span>
                        <span className="text-2xl md:text-3xl font-black text-[#00B14F] tracking-tight">Rp {fNum(adsSim.estGrossSales)}</span>
                      </div>
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ROAS</span>
                        <span className={`text-sm md:text-base font-black ${adsSim.roas >= 5 ? 'text-emerald-600' : adsSim.roas >= 3 ? 'text-blue-600' : 'text-rose-600'}`}>{adsSim.roas.toFixed(1)}x</span>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-3 text-center italic font-medium">*Diestimasi dengan AOV Rp {fNum(adsSim.baseAOV)}. Aktual dapat berbeda.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* TABEL METRIK */}
              <div className="border border-slate-200 rounded-2xl p-4 md:p-5 bg-white shadow-sm overflow-hidden">
                <SimLabel icon={Activity}>Panduan Kesehatan Metrik</SimLabel>
                <div className="overflow-x-auto custom-scrollbar pb-2">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b-2 border-slate-100">
                        <th className="py-3 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[140px]">Metrik</th>
                        <th className="py-3 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[90px]">Status</th>
                        <th className="py-3 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[100px]">Target</th>
                        <th className="py-3 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Analisis & Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {METRICS_GUIDE.map((metricItem, mIdx) => (
                        <Fragment key={mIdx}>
                          {metricItem.rows.map((row, rIdx) => (
                            <tr key={`${mIdx}-${rIdx}`} className="hover:bg-slate-50 transition-colors">
                              {rIdx === 0 && (<td rowSpan={3} className="py-3 px-3 align-top border-r border-slate-50"><span className="text-xs font-black text-slate-800">{metricItem.metric}</span></td>)}
                              <td className="py-3 px-3 align-top"><span className={`text-[10px] font-black uppercase px-2 py-1 rounded border ${row.bg} ${row.color}`}>{row.status}</span></td>
                              <td className="py-3 px-3 align-top"><span className="text-xs font-bold text-slate-600">{row.range}</span></td>
                              <td className="py-3 px-3 align-top"><p className="text-[11px] text-slate-500 leading-relaxed font-medium">{row.desc}</p></td>
                            </tr>
                          ))}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isForceUpload, setIsForceUpload] = useState(false);
  
  const [fileMaster, setFileMaster] = useState(null);
  const [fileHistory, setFileHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMex, setSelectedMex] = useState(null);
  
  const [selectedAM, setSelectedAM] = useState('All'); 
  const [selectedPriority, setSelectedPriority] = useState('All');
  
  const [activeTab, setActiveTab] = useState('overview'); 

  // --- FIREBASE AUTH & REALTIME SYNC ---
  useEffect(() => {
    if (!auth) {
        setIsInitializing(false);
        return;
    }
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
         console.error("Auth error", e);
         setIsInitializing(false);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) {
        if(user === null && !auth) setIsInitializing(false);
        return;
    }
    const unsubscribe = onSnapshot(
        collection(db, 'artifacts', appId, 'users', user.uid, 'merchants'),
        (snapshot) => {
            const savedData = [];
            snapshot.forEach(doc => savedData.push(doc.data()));
            
            if (savedData.length > 0) {
                savedData.sort((a, b) => a.name.localeCompare(b.name));
                setData(savedData);
                setIsForceUpload(false);
            } else {
                setData([]);
            }
            setIsInitializing(false);
        },
        (error) => {
            console.error("Firestore sync error", error);
            setIsInitializing(false);
        }
    );
    return () => unsubscribe();
  }, [user]);

  // --- SIMPAN KE CLOUD ---
  const saveToCloud = async (finalData) => {
      if (!user || !db) return;
      setLoading(true);
      try {
          const existingDocs = await getDocs(collection(db, 'artifacts', appId, 'users', user.uid, 'merchants'));
          let batch = writeBatch(db);
          let count = 0;
          
          const commitAndReset = async () => {
              await batch.commit();
              batch = writeBatch(db);
              count = 0;
          };

          for (const d of existingDocs.docs) {
              batch.delete(d.ref);
              count++;
              if (count >= 400) await commitAndReset();
          }

          for (const merchant of finalData) {
              const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'merchants', merchant.id);
              batch.set(docRef, merchant);
              count++;
              if (count >= 400) await commitAndReset();
          }

          if (count > 0) {
              await batch.commit();
          }
      } catch (e) {
          console.error("Save error", e);
          setErrorMsg("Gagal menyimpan ke Cloud: " + e.message);
      }
      setLoading(false);
  };

  // --- PARSERS ---
  const parseCSVString = (str) => {
    const arr = []; let quote = false; let row = 0, col = 0;
    for (let c = 0; c < str.length; c++) {
      let cc = str[c], nc = str[c+1];
      arr[row] = arr[row] || []; arr[row][col] = arr[row][col] || '';
      if (cc === '"' && quote && nc === '"') { arr[row][col] += cc; ++c; continue; }
      if (cc === '"') { quote = !quote; continue; }
      if (cc === ',' && !quote) { ++col; continue; }
      if (cc === '\r' && nc === '\n' && !quote) { ++row; col = 0; ++c; continue; }
      if ((cc === '\n' || cc === '\r') && !quote) { ++row; col = 0; continue; }
      arr[row][col] += cc;
    }
    return arr;
  };

  const parseAndSave = async (masterText, histText) => {
    try {
        const masterLines = parseCSVString(masterText);
        
        let masterHeaderIdx = -1; let masterRawHeaders = [];
        for (let i = 0; i < Math.min(20, masterLines.length); i++) {
          const test = (masterLines[i] || []).map(h => h ? String(h).trim().replace(/[\r\n]+/g, ' ') : '');
          if (test.includes('Mex ID')) { masterRawHeaders = test; masterHeaderIdx = i; break; }
        }

        if (masterHeaderIdx === -1) throw new Error("Kolom 'Mex ID' tidak ditemukan di data Master Outlet."); 

        const masterHeaders = []; const mCounts = {};
        masterRawHeaders.forEach(h => {
          if (!h) { masterHeaders.push(''); return; }
          if (mCounts[h]) { masterHeaders.push(`${h}.${mCounts[h]}`); mCounts[h]++; }
          else { masterHeaders.push(h); mCounts[h] = 1; }
        });

        const mIdx = masterHeaders.indexOf('Mex ID');
        const mtdBIdx = masterHeaders.findIndex(h => h.includes('MTD (BS)') || h.includes('MTD\n(BS)'));
        const lmBIdx = mtdBIdx > 0 ? mtdBIdx - 1 : -1;
        const mtdAIdx = masterHeaders.findIndex(h => h.includes('Total MTD (Ads)') || h.includes('Total MTD\n(Ads)'));
        const lmAIdx = mtdAIdx > 0 ? mtdAIdx - 1 : -1;
        
        const prioHeader = masterHeaders.find(h => {
            const lh = h.toLowerCase();
            return lh.includes('priority') || lh.includes('prio') || lh.includes('framework');
        });

        const pointHeader = masterHeaders.find(h => {
            const lh = h.toLowerCase();
            return lh.includes('total point') || lh.includes('point');
        });

        let parsedDataMap = new Map();

        for (let i = masterHeaderIdx + 1; i < masterLines.length; i++) {
          const vals = masterLines[i];
          if (!vals || !vals[mIdx] || vals[mIdx].toLowerCase() === 'mex id') continue;
          let obj = {};
          masterHeaders.forEach((h, idx) => { if(h) obj[h] = vals[idx] !== undefined ? String(vals[idx]).trim() : ''; });
          
          const mexId = obj['Mex ID'];
          
          let prioVal = (prioHeader && obj[prioHeader]) ? String(obj[prioHeader]).trim() : '-';
          if (!prioVal || prioVal === '') prioVal = '-';
          
          parsedDataMap.set(mexId, {
            id: mexId,
            name: obj['Mex Name'],
            amName: obj['AM Name'] || 'Unassigned',
            ownerName: vals[10] !== undefined && String(vals[10]).trim() !== '' ? String(vals[10]).trim() : '-',
            lmBs: cleanNumber(vals[lmBIdx]),
            mtdBs: cleanNumber(obj['MTD (BS)'] || obj['MTD\n(BS)']),
            rrBs: cleanNumber(obj['RR (BS)'] || obj['RR\n(BS)']),
            rrVsLm: cleanNumber(obj['% RR vs LM (BS)'] || obj['% RR vs LM\n(BS)']),
            miMtd: cleanNumber(obj['MTD (MI)'] || obj['MTD\n(MI)']),
            adsLM: cleanNumber(vals[lmAIdx]),
            adsTotal: cleanNumber(obj['Total MTD (Ads)'] || obj['Total MTD\n(Ads)']),
            adsRR: cleanNumber(obj['RR (Ads)']),
            mcaAmount: cleanNumber(obj['MCA Amount']),
            mcaWlLimit: cleanNumber(obj['MCA WL']),
            mcaWlClass: obj['MCA WL Classification'] || '-Not in WL',
            mcaPriority: prioVal,
            disbursedDate: obj['Disbursed date'],
            zeusStatus: obj['Zeus'],
            joinDate: obj['Join Date'],
            campaigns: obj['Campaign'] || '',
            commission: obj['Base Commission'],
            city: obj['City Mex'],
            address: obj['Adress'] || obj['Address'],
            phone: obj['Phone zeus'],
            email: obj['Email zeus'],
            latitude: obj['Latitude'] || obj['Lat'] || (vals[14] !== undefined ? String(vals[14]).trim() : ''), 
            longitude: obj['Longitude'] || obj['Long'] || obj['Lng'] || (vals[15] !== undefined ? String(vals[15]).trim() : ''),
            lastUpdate: '',
            campaignPoint: cleanNumber(pointHeader ? obj[pointHeader] : 0), 
            history: [] 
          });
        }

        if (histText) {
            const histLines = parseCSVString(histText);
            const histHeaders = (histLines[0] || []).map(h => h ? String(h).trim() : '');
            
            const hMexIdx = histHeaders.indexOf('merchant_id');
            const hMonthIdx = histHeaders.indexOf('first_day_of_month');
            const hBsIdx = histHeaders.indexOf('basket_size');
            const hTotalOrdersIdx = histHeaders.indexOf('total_orders');
            const hCompletedOrdersIdx = histHeaders.indexOf('completed_orders');
            const hPromoOrdersIdx = histHeaders.indexOf('orders_with_promo_mfp_gms');
            const hAovIdx = histHeaders.indexOf('aov');
            const hMfcIdx = histHeaders.indexOf('mfc_mex_spend');
            const hMfpIdx = histHeaders.indexOf('mfp_mex_spend');
            const hCpoIdx = histHeaders.indexOf('cpo');
            const hGmsIdx = histHeaders.indexOf('gms');
            const hCommIdx = histHeaders.indexOf('basic_commission');
            const hAdsWebIdx = histHeaders.indexOf('ads_web');
            const hAdsMobIdx = histHeaders.indexOf('ads_mobile');
            const hAdsDirIdx = histHeaders.indexOf('ads_direct');

            if (hMexIdx !== -1 && hMonthIdx !== -1) {
                for (let i = 1; i < histLines.length; i++) {
                    const vals = histLines[i];
                    if (!vals || !vals[hMexIdx]) continue;
                    const mexId = String(vals[hMexIdx]).trim();
                    
                    if (parsedDataMap.has(mexId)) {
                        if (vals[0] && String(vals[0]).trim() !== '') {
                            parsedDataMap.get(mexId).lastUpdate = String(vals[0]).trim();
                        }
                        
                        const baseBs = cleanNumber(vals[hBsIdx]);
                        const totalOrders = cleanNumber(vals[hTotalOrdersIdx]);
                        const completedOrders = hCompletedOrdersIdx !== -1 ? cleanNumber(vals[hCompletedOrdersIdx]) : totalOrders;
                        const promoOrders = cleanNumber(vals[hPromoOrdersIdx]);
                        const promoPct = totalOrders > 0 ? ((promoOrders / totalOrders) * 100).toFixed(1) : 0;
                        
                        const mfc = cleanNumber(vals[hMfcIdx]);
                        const mfp = cleanNumber(vals[hMfpIdx]);
                        const cpoVal = cleanNumber(vals[hCpoIdx]);
                        const gmsVal = cleanNumber(vals[hGmsIdx]);
                        const basicComm = cleanNumber(vals[hCommIdx]);
                        const adsWeb = cleanNumber(vals[hAdsWebIdx]);
                        const adsMob = cleanNumber(vals[hAdsMobIdx]);
                        const adsDir = cleanNumber(vals[hAdsDirIdx]);
                        const adsTotalHist = adsWeb + adsMob + adsDir;
                        
                        const totalInvestment = mfc + mfp + cpoVal + gmsVal + basicComm + adsTotalHist;
                        const netSales = baseBs - totalInvestment;
                        const miPercentage = baseBs > 0 ? ((totalInvestment / baseBs) * 100).toFixed(1) : 0;

                        parsedDataMap.get(mexId).history.push({
                            month: vals[hMonthIdx],
                            basket_size: baseBs,
                            net_sales: netSales,
                            total_orders: totalOrders,
                            completed_orders: completedOrders,
                            orders_with_promo: promoOrders,
                            promo_order_pct: parseFloat(promoPct),
                            aov: cleanNumber(vals[hAovIdx]),
                            mfc: mfc,
                            mfp: mfp,
                            cpo: cpoVal,
                            gms: gmsVal,
                            basic_commission: basicComm,
                            ads_total_hist: adsTotalHist,
                            mi_percentage: parseFloat(miPercentage),
                            total_investment: totalInvestment
                        });
                    }
                }
            }
        }

        const finalData = Array.from(parsedDataMap.values()).map(merchant => {
            if (merchant.history.length > 0) merchant.history.sort((a, b) => new Date(a.month) - new Date(b.month));
            return merchant;
        });

        // Simpan hasil parse ke Cloud
        await saveToCloud(finalData);

    } catch (err) {
        console.error(err);
        setErrorMsg(err.message || "Gagal memproses data. Pastikan format benar.");
        setLoading(false);
    }
  };

  const handleProcessFiles = async () => {
    setLoading(true); setErrorMsg('');
    try {
        const masterText = await fileMaster.text();
        let histText = null;
        if (fileHistory) {
            histText = await fileHistory.text();
        }
        await parseAndSave(masterText, histText);
    } catch (err) {
        setErrorMsg("Gagal membaca file dari komputer Anda.");
        setLoading(false);
    }
  };

  const loadDemo = () => { 
     setLoading(true); 
     setTimeout(() => { 
        const amNames = ['Muhamad Novan', 'Reza Firmansyah', 'Sarah Amelia', 'Andi Pratama'];
        const possibleCampaigns = ['GMS Booster', 'GMS Cuan', 'Free Ongkir', 'WEEKENDFEST'];
        const months = ['2025-01-01','2025-02-01','2025-03-01','2025-04-01','2025-05-01','2025-06-01','2025-07-01','2025-08-01','2025-09-01','2025-10-01','2025-11-01','2025-12-01','2026-01-01','2026-02-01'];

        const genData = Array.from({ length: 150 }).map((_, i) => {
          const isGrowing = Math.random() > 0.4;
          const lm = Math.floor(Math.random() * 50000000) + 5000000;
          const rr = isGrowing ? lm * (1 + Math.random() * 0.5) : lm * (1 - Math.random() * 0.3);
          const mtd = rr * 0.7;
          const mca = Math.random() > 0.8 ? Math.floor(Math.random() * 50000000) + 10000000 : 0;
          const mcaLimit = mca > 0 ? mca * 1.5 : (Math.random() > 0.85 ? 25000000 : 0);
          
          const pRoll = Math.random();
          const mcaPriority = mcaLimit > 0 ? (pRoll > 0.7 ? 'P1' : pRoll > 0.3 ? 'P2' : 'P3') : '-';

          let assignedCampaigns = [];
          const campaignRoll = Math.random();
          if (campaignRoll < 0.2) assignedCampaigns = ['No Campaign'];
          else if (campaignRoll < 0.5) assignedCampaigns = [possibleCampaigns[0]];
          else if (campaignRoll < 0.8) assignedCampaigns = [possibleCampaigns[1], possibleCampaigns[3]];
          else assignedCampaigns = [possibleCampaigns[0], possibleCampaigns[2]];

          let baseBs = Math.floor(Math.random() * 15000000) + 5000000;
          const history = months.map(m => {
              const trend = 1 + (Math.random() * 0.4 - 0.2); 
              baseBs = Math.max(1000000, baseBs * trend);
              const totalOrders = Math.floor(baseBs / (30000 + Math.random() * 50000));
              const completedOrders = Math.floor(totalOrders * (0.8 + Math.random() * 0.2)); 
              const promoOrders = Math.floor(totalOrders * (Math.random() * 0.8)); 
              
              const mfc = baseBs * (Math.random() * 0.03);
              const mfp = baseBs * (Math.random() * 0.04);
              const cpoVal = baseBs * (Math.random() * 0.02);
              const gmsVal = baseBs * (Math.random() * 0.02);
              const basicComm = baseBs * 0.20; 
              const adsWeb = baseBs * (Math.random() * 0.015);
              const adsMob = baseBs * (Math.random() * 0.015);
              const adsDir = baseBs * (Math.random() * 0.01);
              const adsTotalHist = adsWeb + adsMob + adsDir;
              
              const totalInvestment = mfc + mfp + cpoVal + gmsVal + basicComm + adsTotalHist;
              const netSales = baseBs - totalInvestment;
              const miPercentage = baseBs > 0 ? ((totalInvestment / baseBs) * 100).toFixed(1) : 0;

              return {
                  month: m,
                  basket_size: baseBs,
                  net_sales: netSales,
                  total_orders: totalOrders,
                  completed_orders: completedOrders,
                  orders_with_promo: promoOrders,
                  promo_order_pct: totalOrders > 0 ? parseFloat(((promoOrders / totalOrders) * 100).toFixed(1)) : 0,
                  aov: totalOrders > 0 ? Math.floor(baseBs / totalOrders) : 0,
                  mfc: mfc,
                  mfp: mfp,
                  cpo: cpoVal,
                  gms: gmsVal,
                  basic_commission: basicComm,
                  ads_total_hist: adsTotalHist,
                  mi_percentage: parseFloat(miPercentage),
                  total_investment: totalInvestment
              };
          });

          return {
            id: `6-C${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            name: `Merchant ${String.fromCharCode(65 + (i % 26))} - ${['Bandung', 'Jakarta', 'Sukabumi', 'Bali'][i % 4]}`,
            amName: amNames[i % 4],
            ownerName: `Ona ${String.fromCharCode(65 + (i % 26))}`,
            lmBs: lm, mtdBs: mtd, rrBs: rr, rrVsLm: ((rr - lm) / lm) * 100,
            miMtd: Math.floor(Math.random() * 5000000),
            adsLM: Math.floor(Math.random() * 12000000), 
            adsTotal: Math.floor(Math.random() * 8000000), adsRR: Math.floor(Math.random() * 15000000),
            mcaAmount: mca, 
            mcaWlLimit: mcaLimit, 
            mcaWlClass: mcaLimit > 0 ? 'Repeat' : '-Not in WL',
            mcaPriority: mcaPriority,
            disbursedDate: mca > 0 ? `15-Feb-26` : '',
            zeusStatus: Math.random() > 0.15 ? 'ACTIVE' : 'INACTIVE',
            joinDate: `12-Jan-22`,
            campaigns: assignedCampaigns.join(' | '),
            commission: '20%',
            city: ['Bandung', 'Jakarta', 'Sukabumi', 'Bali'][i % 4],
            address: `Jl. Jend. Sudirman No. ${Math.floor(Math.random() * 100)}`,
            phone: `+62 812-${Math.floor(Math.random() * 9000)}-${Math.floor(Math.random() * 9000)}`,
            email: `contact@merchant${i}.com`,
            latitude: (-6.2 + Math.random() * 0.5).toFixed(6),
            longitude: (106.8 + Math.random() * 0.5).toFixed(6),
            lastUpdate: '22 Feb 2026',
            campaignPoint: Math.random() > 0.7 ? Math.floor(Math.random() * 500) : 0,
            history: history 
          };
        });
        
        saveToCloud(genData); 
     }, 600); 
  };

  // --- COMPUTATIONS ---
  const amOptions = useMemo(() => ['All', ...Array.from(new Set(data.map(d => d.amName).filter(Boolean))).sort()], [data]);
  const priorityOptions = useMemo(() => ['All', ...Array.from(new Set(data.map(d => d.mcaPriority).filter(p => p && p !== '-'))).sort()], [data]);

  const activeData = useMemo(() => {
     let filtered = data;
     if (selectedAM !== 'All') filtered = filtered.filter(d => d.amName === selectedAM);
     if (selectedPriority !== 'All') filtered = filtered.filter(d => d.mcaPriority === selectedPriority);
     return filtered;
  }, [data, selectedAM, selectedPriority]);

  const campaignStats = useMemo(() => {
    const counts = {}; let joiners = 0; let noCamp = 0;
    activeData.forEach(d => {
      const c = d.campaigns ? String(d.campaigns).trim().toLowerCase() : '';
      if (!c || c === '-' || c === '0' || c.includes('no campaign')) noCamp++;
      else {
        joiners++;
        d.campaigns.split(/[|,]/).forEach(camp => {
          const name = camp.trim();
          if (name && name.toLowerCase() !== 'no campaign') counts[name] = (counts[name] || 0) + 1;
        });
      }
    });
    return { joiners, noCamp, list: Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count) };
  }, [activeData]);

  const kpi = useMemo(() => {
    if (!activeData.length) return null;
    let activeMex = 0; let inactiveMex = 0;
    activeData.forEach(d => { if (d.zeusStatus && d.zeusStatus.toUpperCase() === 'ACTIVE') { activeMex++; } else { inactiveMex++; } });
    const totalPts = activeData.reduce((a, c) => a + (c.campaignPoint || 0), 0);

    return {
      lm: activeData.reduce((a, c) => a + c.lmBs, 0), rr: activeData.reduce((a, c) => a + c.rrBs, 0), mtd: activeData.reduce((a, c) => a + c.mtdBs, 0),
      adsLm: activeData.reduce((a, c) => a + c.adsLM, 0), adsMtd: activeData.reduce((a, c) => a + c.adsTotal, 0), adsRr: activeData.reduce((a, c) => a + c.adsRR, 0),
      mcaDis: activeData.reduce((a, c) => a + (String(c.disbursedDate).includes('Feb') ? c.mcaAmount : 0), 0), mcaDisCount: activeData.filter(c => c.mcaAmount > 0).length, mcaEli: activeData.reduce((a, c) => a + (c.mcaWlLimit > 0 && !c.mcaWlClass.includes('Not') ? c.mcaWlLimit : 0), 0),
      joiners: campaignStats.joiners, totalMex: activeData.length, activeMex, inactiveMex, totalPoints: totalPts, activeCampCount: campaignStats.list.length, avgPtsPerJoiner: campaignStats.joiners > 0 ? Math.round(totalPts / campaignStats.joiners) : 0
    };
  }, [activeData, campaignStats]);

  const chartsData = useMemo(() => {
    const mtd = [...activeData].sort((a, b) => b.mtdBs - a.mtdBs).slice(0, 10);
    const ads = [...activeData].sort((a, b) => b.adsLM - a.adsLM).slice(0, 5);
    let g = 0, d = 0, s = 0;
    activeData.forEach(x => { if (x.rrBs > x.lmBs * 1.05) g++; else if (x.rrBs < x.lmBs * 0.95) d++; else s++; });
    const total = Math.max(1, g + d + s);
    return { mtd, ads, health: [ { name: 'Growing', count: g, percentage: ((g / total) * 100).toFixed(0), color: '#00B14F' }, { name: 'Declining', count: d, percentage: ((d / total) * 100).toFixed(0), color: COLORS.decline }, { name: 'Stable', count: s, percentage: ((s / total) * 100).toFixed(0), color: COLORS.finance } ] };
  }, [activeData]);

  const filtered = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return activeData.filter(d => d.name.toLowerCase().includes(s) || d.id.toLowerCase().includes(s));
  }, [activeData, searchTerm]);

  const handleSearchChange = (e) => {
    const val = e.target.value; setSearchTerm(val);
    if (val && activeTab !== 'data' && !selectedMex) { setActiveTab('data'); }
  };

  const renderMerchantCampaigns = (campaignStr) => {
    if (!campaignStr || campaignStr === '-' || campaignStr === '0' || campaignStr.toLowerCase().includes('no campaign')) { return <span className="text-slate-400 text-xs font-semibold italic">Tidak ada partisipasi campaign.</span>; }
    const camps = campaignStr.split(/[|,]/).map(c => c.trim()).filter(Boolean);
    return (
        <div className="flex flex-wrap gap-1.5 mt-2">
            {camps.map((camp, idx) => ( <span key={idx} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-md text-[9px] font-bold flex items-center gap-1 shadow-sm"><Zap className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />{camp}</span> ))}
        </div>
    );
  };

  const onChartClick = (state) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      if (state.activePayload[0].payload.id) { setSelectedMex(state.activePayload[0].payload); setActiveTab('overview'); }
    }
  };

  if (isInitializing) {
     return (
       <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
         <div className="text-center animate-pulse flex flex-col items-center">
            <Activity className="w-12 h-12 text-[#00B14F] mb-4" />
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Menghubungkan ke Cloud...</h2>
         </div>
       </div>
     )
  }

  // --- RENDER SCREEN AWAL (UPLOAD) ---
  if (data.length === 0 || isForceUpload) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans text-slate-800">
        <div className="text-center max-w-xl z-10 bg-white p-8 md:p-10 rounded-3xl shadow-xl w-full mx-auto border border-slate-200 animate-in fade-in zoom-in-95 relative">
          
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-[#00B14F]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black mb-1 text-slate-900 tracking-tight uppercase">AM DASHBOARD <span className="text-[#00B14F]">PRO</span></h1>
          <p className="text-slate-500 mb-8 text-xs font-medium">Merchant Intelligence Platform</p>
          
          {errorMsg && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex gap-2 border border-red-100"><AlertCircle className="w-4 h-4 shrink-0" />{errorMsg}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex flex-col items-center justify-center p-4 border-2 border-slate-200 border-dashed rounded-xl bg-slate-50 relative group hover:border-slate-400 transition-all">
                <Store className={`w-6 h-6 mb-2 ${fileMaster ? 'text-slate-800' : 'text-slate-400'}`} />
                <p className="text-slate-700 font-bold text-xs mb-1">CSV Master Outlet</p>
                <p className="text-[10px] text-slate-400 text-center px-4">{fileMaster ? fileMaster.name : 'Upload file database utama'}</p>
                <input type="file" accept=".csv" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFileMaster(e.target.files[0])} />
                {fileMaster && <div className="absolute top-2 right-2"><CheckCircle className="w-4 h-4 text-slate-800" /></div>}
              </div>
              <div className="flex flex-col items-center justify-center p-4 border-2 border-slate-200 border-dashed rounded-xl bg-slate-50 relative group hover:border-slate-400 transition-all">
                <BarChart2 className={`w-6 h-6 mb-2 ${fileHistory ? 'text-slate-800' : 'text-slate-400'}`} />
                <p className="text-slate-700 font-bold text-xs mb-1">CSV Historis (Opsional)</p>
                <p className="text-[10px] text-slate-400 text-center px-4">{fileHistory ? fileHistory.name : 'Data bulanan merchant'}</p>
                <input type="file" accept=".csv" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFileHistory(e.target.files[0])} />
                {fileHistory && <div className="absolute top-2 right-2"><CheckCircle className="w-4 h-4 text-slate-800" /></div>}
              </div>
          </div>

          <button onClick={handleProcessFiles} disabled={loading || !fileMaster} className={`w-full py-3.5 bg-slate-800 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 mb-4 text-sm hover:bg-slate-900 shadow-md ${!fileMaster ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}>
            {loading ? <Activity className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />} {loading ? 'Memproses Data ke Cloud...' : 'Simpan & Proses Dashboard'}
          </button>
          
          <button onClick={loadDemo} disabled={loading} className="w-full py-3 bg-transparent text-slate-500 hover:text-slate-800 font-bold transition-all flex items-center justify-center gap-2 text-sm border border-slate-200 rounded-xl hover:bg-slate-50">
            <TrendingUp className="w-4 h-4" /> Lihat dengan Data Dummy
          </button>

          {data.length > 0 && isForceUpload && (
             <button onClick={() => setIsForceUpload(false)} disabled={loading} className="w-full py-2.5 mt-3 bg-slate-100 text-slate-500 hover:text-slate-700 font-bold transition-all text-xs rounded-xl hover:bg-slate-200">
                Batal Update & Kembali
             </button>
          )}
        </div>
      </div>
    );
  }

  // --- RENDER DASHBOARD UTAMA ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans overflow-hidden">
      
      {/* ELEGAN & MODERN HEADER */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-40 shadow-sm flex flex-col shrink-0 transition-all">
        <div className="flex items-center justify-between px-4 md:px-6 h-16 md:h-20 gap-4 md:gap-6">
          
          {/* 1. Left Section: Logo & Desktop Tabs / Back Button */}
          <div className="flex items-center gap-4 shrink-0">
             {/* Logo */}
             <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { setSelectedMex(null); setActiveTab('overview'); setSearchTerm(''); }}>
               <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-[#00B14F] rounded-xl flex items-center justify-center shadow-md shadow-green-500/20">
                 <Activity className="w-5 h-5 text-white" />
               </div>
               <h1 className="text-xl font-black text-slate-800 tracking-tight hidden lg:block">
                 AM DASHBOARD <span className="text-[#00B14F] ml-0.5">PRO</span>
               </h1>
             </div>

             {/* TABS NAVIGATION (Desktop) */}
             {!selectedMex && (
               <Fragment>
                 <div className="hidden md:block w-px h-6 bg-slate-200 mx-1"></div>
                 <div className="hidden md:flex bg-slate-100/80 p-1.5 rounded-xl shrink-0 border border-slate-200/50">
                     <button onClick={() => { setActiveTab('overview'); setSearchTerm(''); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'overview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
                         <LayoutDashboard className="w-4 h-4" /> Overview
                     </button>
                     <button onClick={() => setActiveTab('data')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'data' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
                         <Table className="w-4 h-4" /> Master Data
                     </button>
                     {/* TAB SIMULATOR */}
                     <button onClick={() => setActiveTab('simulator')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'simulator' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
                         <Calculator className="w-4 h-4" /> Simulator
                     </button>
                 </div>
               </Fragment>
             )}

             {/* Back Button for Detail View */}
             {selectedMex && (
                 <button onClick={() => setSelectedMex(null)} className="group flex items-center gap-1.5 text-slate-500 hover:text-slate-900 font-bold text-xs md:text-sm transition-all px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 ml-2">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/> Kembali
                 </button>
             )}
          </div>
          
          {/* 2. Center Section: Global Search Bar */}
          {!selectedMex && activeTab !== 'simulator' && (
            <div className="flex-1 max-w-md mx-auto relative group hidden md:block animate-in fade-in zoom-in-95">
               <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                   <Search className="w-4 h-4 text-slate-400 group-focus-within:text-[#00B14F] transition-colors" />
               </div>
               <input 
                   type="text" 
                   value={searchTerm} 
                   onChange={handleSearchChange} 
                   placeholder="Cari nama atau ID merchant..." 
                   className="w-full bg-slate-100/70 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-800 font-semibold placeholder:text-slate-400 placeholder:font-medium focus:outline-none focus:bg-white focus:border-[#00B14F] focus:ring-4 focus:ring-[#00B14F]/10 transition-all shadow-inner shadow-slate-100" 
               />
               {searchTerm && (
                   <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                       <X className="w-3.5 h-3.5" />
                   </button>
               )}
            </div>
          )}

          {/* 3. Right Section: Filters & Actions */}
          {!selectedMex && activeTab !== 'simulator' && (
            <div className="flex items-center gap-2 shrink-0 ml-auto md:ml-0 animate-in fade-in">
               {/* Filters Pill */}
               <div className="flex items-center bg-white border border-slate-200 rounded-xl px-2 py-2 md:px-3 shadow-sm hover:border-slate-300 transition-colors">
                   <Filter className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#00B14F] hidden sm:block mr-1.5" />
                   
                   <select value={selectedAM} onChange={(e) => { setSelectedAM(e.target.value); setSelectedMex(null); }} className="bg-transparent text-slate-700 hover:text-slate-900 text-xs font-bold focus:outline-none w-16 sm:w-28 cursor-pointer appearance-none truncate">
                      {amOptions.map(am => <option key={am} value={am}>{am}</option>)}
                   </select>
                   
                   <div className="w-px h-4 bg-slate-200 mx-1.5 md:mx-2"></div>
                   
                   <select value={selectedPriority} onChange={(e) => { setSelectedPriority(e.target.value); setSelectedMex(null); }} className="bg-transparent text-amber-600 hover:text-amber-700 text-xs font-bold focus:outline-none w-16 sm:w-24 cursor-pointer appearance-none text-right sm:text-left pr-1">
                      {priorityOptions.map(p => <option key={p} value={p}>{p === 'All' ? 'All Prio' : p}</option>)}
                   </select>
                   <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block ml-1" />
               </div>

               {/* UPDATE DATA BUTTON */}
               <button onClick={() => setIsForceUpload(true)} className="group flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-[#00B14F] border border-slate-200 hover:border-[#00B14F] px-3 py-2 md:py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm">
                   <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" /> 
                   <span className="hidden sm:block">Update</span>
               </button>
            </div>
          )}

        </div>

        {/* TABS NAVIGATION (Mobile - Sleek Bottom Border style) */}
        {!selectedMex && (
          <div className="md:hidden flex px-4 pt-1 bg-white border-t border-slate-100 shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)] z-10 relative overflow-x-auto custom-scrollbar">
            <button onClick={() => { setActiveTab('overview'); setSearchTerm(''); }} className={`flex-none px-4 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-[3px] transition-all ${activeTab === 'overview' ? 'border-[#00B14F] text-[#00B14F]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                <LayoutDashboard className="w-4 h-4" /> Overview
            </button>
            <button onClick={() => setActiveTab('data')} className={`flex-none px-4 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-[3px] transition-all ${activeTab === 'data' ? 'border-[#00B14F] text-[#00B14F]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                <Table className="w-4 h-4" /> Data
            </button>
            <button onClick={() => setActiveTab('simulator')} className={`flex-none px-4 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-[3px] transition-all ${activeTab === 'simulator' ? 'border-[#00B14F] text-[#00B14F]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                <Calculator className="w-4 h-4" /> Simulator
            </button>
          </div>
        )}
        
        {/* Mobile Search Bar (Only shows on mobile when not in detail view) */}
        {!selectedMex && activeTab !== 'simulator' && (
           <div className="md:hidden px-4 py-3 bg-slate-50 border-b border-slate-200">
               <div className="relative group">
                   <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                       <Search className="w-4 h-4 text-slate-400 group-focus-within:text-[#00B14F]" />
                   </div>
                   <input 
                       type="text" 
                       value={searchTerm} 
                       onChange={handleSearchChange} 
                       placeholder="Cari merchant..." 
                       className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#00B14F] focus:ring-2 focus:ring-[#00B14F]/10 transition-all shadow-sm" 
                   />
                   {searchTerm && (
                       <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600">
                           <X className="w-3.5 h-3.5" />
                       </button>
                   )}
               </div>
           </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto relative w-full hide-scrollbar z-10 p-3 md:p-6 bg-slate-50">
        <div className="max-w-[1400px] mx-auto">
          {!selectedMex ? (
            <Fragment>
              {/* ========================================================= */}
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {/* ========================================================= */}
              {activeTab === 'overview' && (
                <div className="space-y-4 md:space-y-5 animate-in fade-in duration-300">

                    {/* KPI CARDS - Compact 5 Columns */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
                      
                      {/* Basketsize Card */}
                      <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between col-span-2 lg:col-span-1 ring-1 ring-[#00B14F]/10 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-green-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
                        <div className="flex justify-between items-start mb-3 relative z-10">
                          <div className="flex items-center gap-1.5">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Basketsize</p>
                            {kpi && kpi.rr < kpi.lm && (
                              <span className="flex items-center text-rose-500 bg-rose-50 px-1 py-0.5 rounded border border-rose-100" title="Proyeksi Turun">
                                <ArrowDownRight className="w-3 h-3 animate-float-down" />
                              </span>
                            )}
                            {kpi && kpi.rr > kpi.lm && (
                              <span className="flex items-center text-emerald-500 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-100" title="Proyeksi Naik">
                                <ArrowUpRight className="w-3 h-3 animate-float-up" />
                              </span>
                            )}
                          </div>
                          <Activity className="w-4 h-4 text-[#00B14F]" />
                        </div>
                        <div className="flex flex-col gap-2 mt-auto pt-3 border-t border-slate-100 relative z-10">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">LM</span>
                            <span className="text-[13px] md:text-sm font-black text-slate-600 tracking-tight">{formatCurrency(kpi?.lm || 0)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-600 uppercase">MTD</span>
                            <span className="text-[13px] md:text-sm font-black text-slate-800 tracking-tight">{formatCurrency(kpi?.mtd || 0)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#00B14F] uppercase">RR</span>
                            <span className="text-[13px] md:text-sm font-black text-[#00B14F] tracking-tight">{formatCurrency(kpi?.rr || 0)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Ads Spend Card */}
                      <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-rose-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
                        <div className="flex justify-between items-start mb-3 relative z-10">
                          <div className="flex items-center gap-1.5">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ads Spend</p>
                            {kpi && kpi.adsRr < kpi.adsLm && (
                              <span className="flex items-center text-emerald-500 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-100" title="Beban Berkurang">
                                <ArrowDownRight className="w-3 h-3 animate-float-down" />
                              </span>
                            )}
                            {kpi && kpi.adsRr > kpi.adsLm && (
                              <span className="flex items-center text-rose-500 bg-rose-50 px-1 py-0.5 rounded border border-rose-100" title="Beban Naik">
                                <ArrowUpRight className="w-3 h-3 animate-float-up" />
                              </span>
                            )}
                          </div>
                          <DollarSign className="w-4 h-4 text-rose-500" />
                        </div>
                        <div className="flex flex-col gap-2 mt-auto pt-3 border-t border-slate-100 relative z-10">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">LM</span>
                            <span className="text-[13px] md:text-sm font-black text-slate-600 tracking-tight">{formatCurrency(kpi?.adsLm || 0)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-600 uppercase">MTD</span>
                            <span className="text-[13px] md:text-sm font-black text-slate-800 tracking-tight">{formatCurrency(kpi?.adsMtd || 0)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-rose-500 uppercase">RR</span>
                            <span className="text-[13px] md:text-sm font-black text-rose-500 tracking-tight">{formatCurrency(kpi?.adsRr || 0)}</span>
                          </div>
                        </div>
                      </div>

                      {/* MCA Disbursed Card */}
                      <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
                        <div className="flex justify-between items-start mb-3 relative z-10">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">MCA Config</p>
                          <Database className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="flex flex-col gap-2 mt-auto pt-3 border-t border-slate-100 relative z-10">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Limit</span>
                            <span className="text-[13px] md:text-sm font-black text-slate-600 tracking-tight">{formatCurrency(kpi?.mcaEli || 0)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-amber-600 uppercase">Disbursed</span>
                            <span className="text-[13px] md:text-sm font-black text-amber-600 tracking-tight">{formatCurrency(kpi?.mcaDis || 0)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-amber-500 uppercase">Toko Cair</span>
                            <span className="text-[13px] md:text-sm font-black text-amber-500 tracking-tight">{kpi?.mcaDisCount || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Campaign Pts Card */}
                      <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
                        <div className="flex justify-between items-start mb-3 relative z-10">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Points</p>
                          <Award className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="flex flex-col gap-2 mt-auto pt-3 border-t border-slate-100 relative z-10">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Active Promo</span>
                            <span className="text-[13px] md:text-sm font-black text-slate-600 tracking-tight">{kpi?.activeCampCount || 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase">Avg/Toko</span>
                            <span className="text-[13px] md:text-sm font-black text-indigo-500 tracking-tight">{kpi?.avgPtsPerJoiner || 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-indigo-600 uppercase">Total Pts</span>
                            <span className="text-[13px] md:text-sm font-black text-indigo-600 tracking-tight">{(kpi?.totalPoints || 0).toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Outlets & Joiners Card */}
                      <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between relative overflow-hidden group cursor-default">
                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
                        <div className="flex justify-between items-start mb-3 relative z-10">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Outlets</p>
                          <Store className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="flex flex-col gap-2 mt-auto pt-3 border-t border-slate-100 relative z-10">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Inactive</span>
                            <span className="text-[13px] md:text-sm font-black text-slate-500 tracking-tight">{kpi?.inactiveMex || 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-emerald-500 uppercase">Active</span>
                            <span className="text-[13px] md:text-sm font-black text-emerald-600 tracking-tight">{kpi?.activeMex || 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#00B14F] uppercase">Joiners</span>
                            <span className="text-[13px] md:text-sm font-black text-[#00B14F] tracking-tight">{kpi?.joiners || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CHARTS ROW 1 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
                      {/* Top 10 MTD */}
                      <div className="lg:col-span-2 bg-white p-4 md:p-5 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Top 10 Merchants <span className="text-slate-400 font-medium">(MTD Sales)</span></h3>
                        </div>
                        <div className="h-56 md:h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartsData.mtd} onClick={onChartClick} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                              <XAxis dataKey="name" tick={{ fill: COLORS.slate500, fontSize: 9, fontWeight: 600 }} tickLine={false} axisLine={false} tickFormatter={(v) => v.substring(0, 6)+'.'} />
                              <YAxis tick={{ fill: COLORS.slate500, fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} width={45} />
                              <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border:'1px solid #e2e8f0', fontSize: '11px', padding: '6px' }} formatter={(v) => formatCurrency(v)} />
                              <Legend wrapperStyle={{ fontSize: '10px', paddingTop:'5px' }} iconType="circle"/>
                              <Bar dataKey="lmBs" name="LM Sales" fill={COLORS.lastMonth} radius={[4,4,0,0]} maxBarSize={24} cursor="pointer" />
                              <Bar dataKey="mtdBs" name="MTD Sales" fill={COLORS.primary} radius={[4,4,0,0]} maxBarSize={24} cursor="pointer" />
                              <Line type="monotone" dataKey="rrBs" name="Runrate" stroke={COLORS.growth} strokeWidth={3} dot={{r:3, fill: '#ffffff', strokeWidth: 2}} activeDot={{r: 5}} cursor="pointer" />
                            </ComposedChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Campaign Participants Chart & Details (Moved to Row 1) */}
                      <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full max-h-[350px]">
                        <div className="flex justify-between items-center mb-4 shrink-0">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Campaign Participants</h3>
                            <span className="bg-emerald-100 text-emerald-700 font-black text-[10px] md:text-xs px-2.5 py-1 rounded-lg shadow-sm border border-emerald-200">
                                {(( (kpi?.joiners || 0) / Math.max(1, (kpi?.joiners || 0) + campaignStats.noCamp)) * 100).toFixed(0)}% Rate
                            </span>
                        </div>
                        
                        <div className="flex flex-row items-stretch gap-4 flex-1 overflow-hidden min-h-[140px]">
                            {/* Left: Chart */}
                            <div className="w-[55%] relative flex justify-center items-center shrink-0">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart style={{ outline: 'none' }}>
                                  <Pie 
                                      data={[
                                          { name: 'Joiners', value: kpi?.joiners || 0 },
                                          { name: 'No Campaign', value: campaignStats.noCamp }
                                      ]} 
                                      cx="50%" cy="50%" innerRadius={0} outerRadius={65} dataKey="value" stroke="white" strokeWidth={2}
                                      style={{ outline: 'none' }}
                                      labelLine={false}
                                      label={({ cx, cy, midAngle, innerRadius, outerRadius, value, percent, index }) => {
                                          const RADIAN = Math.PI / 180;
                                          const radius = outerRadius * 0.55;
                                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                          const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                          if (percent < 0.05) return null;
                                          return (
                                              <text 
                                                  x={x} y={y} 
                                                  fill={index === 0 ? "white" : "#475569"} 
                                                  textAnchor="middle" dominantBaseline="central" 
                                                  className="text-[11px] font-black pointer-events-none"
                                              >
                                                  {value}
                                              </text>
                                          );
                                      }}
                                  >
                                      <Cell key="cell-0" fill="#00B14F" />
                                      <Cell key="cell-1" fill="#cbd5e1" />
                                  </Pie>
                                </PieChart>
                              </ResponsiveContainer>
                            </div>

                            {/* Right: List Details */}
                            <div className="w-[45%] overflow-y-auto custom-scrollbar pr-1 space-y-1.5 flex flex-col justify-center">
                                {campaignStats.list.map((it, idx) => (
                                  <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100 shadow-sm shrink-0">
                                    <span className="text-[10px] font-bold text-slate-700 truncate mr-2" title={it.name}>{it.name}</span>
                                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md shrink-0">{it.count}</span>
                                  </div>
                                ))}
                                <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200 border-dashed mt-1 shrink-0">
                                  <span className="text-[10px] font-bold text-slate-500">Non-Participants</span>
                                  <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md border border-slate-200">{campaignStats.noCamp}</span>
                                </div>
                            </div>
                        </div>
                      </div>
                    </div>

                    {/* CHARTS ROW 2 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
                      <div className="lg:col-span-2 bg-white p-4 md:p-5 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Top 5 Ads Spender <span className="text-slate-400 font-medium">(vs LM & RR)</span></h3>
                        </div>
                        <div className="h-48 md:h-56 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartsData.ads} onClick={onChartClick} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                              <XAxis dataKey="name" tick={{ fill: COLORS.slate500, fontSize: 9, fontWeight: 600 }} tickLine={false} axisLine={false} tickFormatter={(v) => v.substring(0, 8)+'.'} />
                              <YAxis tick={{ fill: COLORS.slate500, fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} width={45} />
                              <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border:'1px solid #e2e8f0', fontSize: '11px', padding:'6px' }} formatter={(v) => formatCurrency(v)} />
                              <Legend wrapperStyle={{ fontSize: '10px', paddingTop:'5px' }} iconType="circle" />
                              <Bar dataKey="adsLM" name="Ads LM" fill="#c084fc" radius={[4,4,0,0]} maxBarSize={30} cursor="pointer" />
                              <Bar dataKey="adsTotal" name="Ads MTD" fill="#fb923c" radius={[4,4,0,0]} maxBarSize={30} cursor="pointer" />
                              <Line type="monotone" dataKey="adsRR" name="Ads RR" stroke="#2dd4bf" strokeWidth={3} dot={{r:3, fill: '#ffffff', strokeWidth: 2}} activeDot={{r: 5}} cursor="pointer" />
                            </ComposedChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Portfolio Health */}
                      <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center h-full max-h-[350px]">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Portfolio Health</h3>
                                <p className="text-[10px] text-slate-500 mt-0.5">Growth vs LM</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xl md:text-2xl font-black text-[#00B14F] leading-none">{chartsData.health[0].percentage}%</span>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Growing</p>
                            </div>
                        </div>
                        <div className="flex h-4 md:h-5 w-full rounded-full overflow-hidden bg-slate-100 shadow-inner mb-6 md:mb-8">
                            {chartsData.health.map((h, i) => (
                                <div key={i} style={{ width: `${h.percentage}%`, backgroundColor: h.color }} className="h-full border-r border-white/30" />
                            ))}
                        </div>
                        <div className="space-y-3">
                            {chartsData.health.map((h, i) => (
                                <div key={i} className="flex items-center justify-between text-xs md:text-sm">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-3 h-3 rounded-sm shadow-sm" style={{ backgroundColor: h.color }} />
                                        <span className="font-semibold text-slate-600">{h.name}</span>
                                    </div>
                                    <span className="font-bold text-slate-900">{h.count} <span className="text-[10px] text-slate-400 font-normal ml-1.5">({h.percentage}%)</span></span>
                                </div>
                            ))}
                        </div>
                      </div>
                    </div>

                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 2: MASTER DATASET */}
              {/* ========================================================= */}
              {activeTab === 'data' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300 flex flex-col h-[80vh]">
                  <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Master Data Directory</h3>
                    <div className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">Records: {filtered.length}</div>
                  </div>
                  
                  <div className="overflow-auto flex-1 custom-scrollbar">
                    {filtered.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <Search className="w-10 h-10 mb-2 opacity-20" />
                        <p className="text-xs font-bold">Data tidak ditemukan.</p>
                      </div>
                    ) : (
                      <table className="w-full text-left text-sm relative">
                         <thead className="bg-white text-slate-400 text-[9px] font-bold uppercase border-b border-slate-200 sticky top-0 z-10">
                           <tr>
                             <th className="px-4 py-2.5 font-semibold">Merchant</th>
                             <th className="px-3 py-2.5 font-semibold text-center hidden md:table-cell">Campaign</th>
                             <th className="px-3 py-2.5 font-semibold text-center">Trend vs LM</th>
                             <th className="px-3 py-2.5 font-semibold text-center hidden md:table-cell">Priority</th>
                             <th className="px-4 py-2.5 font-semibold text-right">MTD Sales</th>
                             <th className="px-4 py-2.5 font-semibold text-center">Status</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                            {filtered.map((r) => (
                              <tr key={r.id} onClick={() => setSelectedMex(r)} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                                <td className="px-4 py-2 w-1/3">
                                  <p className="font-semibold text-slate-800 text-[11px] md:text-xs group-hover:text-[#00B14F] truncate">{r.name}</p>
                                  <p className="text-[9px] text-slate-400 font-mono">{r.id}</p>
                                </td>
                                <td className="px-3 py-2 text-center hidden md:table-cell">
                                  <span className={`text-[9px] font-bold ${r.campaigns && r.campaigns !== '-' && !r.campaigns.toLowerCase().includes('no campaign') ? 'text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded' : 'text-slate-400'}`}>
                                    {r.campaigns && r.campaigns !== '-' && !r.campaigns.toLowerCase().includes('no campaign') ? 'Active' : '-'}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-center">
                                   <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold ${r.rrBs > r.lmBs ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                      {r.rrBs > r.lmBs ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>}
                                      {Math.abs(r.rrVsLm).toFixed(0)}%
                                   </span>
                                </td>
                                <td className="px-3 py-2 text-center hidden md:table-cell">
                                   <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${r.mcaPriority !== '-' ? 'bg-amber-100 text-amber-700' : 'text-slate-400'}`}>
                                      {r.mcaPriority}
                                   </span>
                                </td>
                                <td className="px-4 py-2 font-mono text-slate-700 font-semibold text-right text-[11px] md:text-xs">{formatCurrency(r.mtdBs)}</td>
                                <td className="px-4 py-2 text-center">
                                   <div className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${r.zeusStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{r.zeusStatus}</div>
                                </td>
                              </tr>
                            ))}
                         </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 3: MERCHANT SIMULATOR */}
              {/* ========================================================= */}
              {activeTab === 'simulator' && (
                <MerchantSimulator />
              )}
            </Fragment>
          ) : (
            // =========================================================
            // VIEW MERCHANT DETAIL
            // =========================================================
            <div className="animate-in slide-in-from-right-8 duration-300 space-y-4 pb-12">

               {/* Makit Man Profil Heda (Klin & Stret) */}
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 md:p-6 flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                     <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight break-words">{selectedMex.name}</h2>
                     <span className={`inline-flex px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${selectedMex.zeusStatus === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{selectedMex.zeusStatus}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                       <Store className="w-4 h-4 text-slate-400" />
                       <span className="font-mono bg-slate-50 text-slate-600 px-2 py-0.5 rounded text-xs border border-slate-200">{selectedMex.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Users className="w-4 h-4 text-slate-400" />
                       <span className="text-slate-700">{selectedMex.ownerName}</span>
                    </div>
                  </div>
               </div>

               {/* MAIN HISTORICAL CHART (Year-in-Review: Basket Size vs Net Sales) */}
               {selectedMex.history && selectedMex.history.length > 0 && (
                   <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-5">
                        <div className="flex justify-between items-start md:items-center mb-4 gap-2">
                           <div>
                              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">12-Month Review <span className="text-slate-400 font-medium normal-case block md:inline mt-0.5 md:mt-0">(Basket Size, Net Sales & MI)</span></h3>
                           </div>
                           {selectedMex.lastUpdate && (
                               <div className="flex flex-col text-right justify-center bg-green-50 px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-lg border border-green-200 shadow-sm shrink-0">
                                   <span className="text-[8px] md:text-[9px] text-green-700 font-bold uppercase tracking-widest leading-none mb-1">Data Update</span>
                                   <span className="text-[10px] md:text-xs font-black text-slate-900 leading-none">{selectedMex.lastUpdate}</span>
                               </div>
                           )}
                        </div>
                        <div className="h-48 md:h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart data={selectedMex.history.slice(-12)} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="month" tick={{ fill: COLORS.slate500, fontSize: 9, fontWeight: 600 }} tickLine={false} axisLine={false} tickFormatter={formatMonth} />
                                <YAxis yAxisId="left" tick={{ fill: COLORS.slate500, fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} width={45} />
                                <YAxis yAxisId="right" orientation="right" tick={{ fill: COLORS.slate500, fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} width={35} />
                                <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border:'1px solid #e2e8f0', fontSize: '11px', padding: '8px' }} formatter={(v, n) => [n.includes('%') ? `${v}%` : formatCurrency(v), n]} labelFormatter={formatMonth}/>
                                <Legend wrapperStyle={{ fontSize: '10px', paddingTop:'5px' }} />
                                {/* Display Gross Basket Size, Net Sales, and MI */}
                                <Bar yAxisId="left" dataKey="basket_size" name="Total Basket Size" fill={COLORS.basketSize} radius={[3,3,0,0]} maxBarSize={16} />
                                <Bar yAxisId="left" dataKey="net_sales" stackId="a" name="Net Sales" fill={COLORS.netSales} maxBarSize={16} />
                                <Bar yAxisId="left" dataKey="total_investment" stackId="a" name="MI (Rp)" fill="#f43f5e" radius={[3,3,0,0]} maxBarSize={16} />
                                <Line yAxisId="right" type="monotone" dataKey="mi_percentage" name="MI %" stroke="#f43f5e" strokeWidth={2} dot={{r:3}} activeDot={{r: 5}} />
                              </ComposedChart>
                            </ResponsiveContainer>
                         </div>
                   </div>
               )}

               {/* Grid 3 NEW ANALYTICS CHARTS */}
               {selectedMex.history && selectedMex.history.length > 0 && (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* 1. AOV TREND */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center gap-2 mb-4">
                           <ShoppingBag className="w-4 h-4 text-indigo-500"/>
                           <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">AOV & Orders</h3>
                        </div>
                        <div className="h-44 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart data={selectedMex.history} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                  <defs>
                                      <linearGradient id="colorAov" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                      </linearGradient>
                                  </defs>
                                  <XAxis dataKey="month" hide />
                                  <YAxis yAxisId="left" domain={['auto', 'auto']} tick={{ fill: COLORS.slate500, fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} width={45} />
                                  <YAxis yAxisId="right" orientation="right" tick={{ fill: COLORS.slate500, fontSize: 9 }} tickLine={false} axisLine={false} width={30} />
                                  <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border:'1px solid #e2e8f0', fontSize: '10px', padding: '6px' }} formatter={(v, n) => [n.includes('Orders') ? v : formatCurrency(v), n]} labelFormatter={formatMonth}/>
                                  <Area yAxisId="left" type="monotone" dataKey="aov" name="AOV" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorAov)" />
                                  <Line yAxisId="right" type="monotone" dataKey="completed_orders" name="Completed Orders" stroke="#10b981" strokeWidth={2} dot={{r:2}} activeDot={{r:4}} />
                              </ComposedChart>
                          </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 2. ORDER WITH CAMPAIGN % */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <div className="flex items-start gap-2 mb-4">
                           <Target className="w-4 h-4 text-teal-500 mt-0.5 shrink-0"/>
                           <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide leading-tight">
                               Promo Usage <span className="text-[10px] text-slate-400 font-medium normal-case tracking-normal block mt-0.5">(Gms & Cofund Only)</span>
                           </h3>
                        </div>
                        <div className="h-44 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={selectedMex.history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                  <XAxis dataKey="month" hide />
                                  <YAxis domain={[0, 100]} tick={{ fill: COLORS.slate500, fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} width={35} />
                                  <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border:'1px solid #e2e8f0', fontSize: '10px', padding: '6px' }} formatter={(v) => `${v}%`} labelFormatter={formatMonth}/>
                                  <Line type="monotone" dataKey="promo_order_pct" name="% Promo Usage" stroke="#14b8a6" strokeWidth={2} dot={{r:2}} activeDot={{r:4}} />
                              </LineChart>
                          </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 3. MERCHANT INVESTMENT */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <div className="flex justify-between items-start mb-4">
                           <div className="flex items-center gap-2">
                              <Activity className="w-4 h-4 text-rose-500"/>
                              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Investment (MI)</h3>
                           </div>
                           <div className="bg-rose-50 px-2 py-0.5 rounded border border-rose-100 flex items-center gap-1">
                              <Percent className="w-3 h-3 text-rose-500"/>
                              <span className="text-[10px] font-bold text-rose-700" title="MI % dari Basket Size Bulan Terakhir">
                                  {selectedMex.history[selectedMex.history.length-1].mi_percentage}%
                              </span>
                           </div>
                        </div>
                        <div className="h-44 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={selectedMex.history} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                  <XAxis dataKey="month" hide />
                                  <YAxis tick={{ fill: COLORS.slate500, fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} width={45} />
                                  <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border:'1px solid #e2e8f0', fontSize: '10px', padding: '6px' }} formatter={(v) => formatCurrency(v)} labelFormatter={formatMonth}/>
                                  <Legend verticalAlign="top" align="center" wrapperStyle={{ fontSize: '9px', paddingBottom: '10px' }} iconType="circle" />
                                  <Bar dataKey="mfp" stackId="a" name="Local Promo" fill="#8b5cf6" />
                                  <Bar dataKey="mfc" stackId="a" name="Harga Coret" fill="#ec4899" />
                                  <Bar dataKey="cpo" stackId="a" name="GMS" fill="#0ea5e9" />
                                  <Bar dataKey="gms" stackId="a" name="CPO" fill="#f59e0b" />
                                  <Bar dataKey="basic_commission" stackId="a" name="BC" fill="#10b981" />
                                  <Bar dataKey="ads_total_hist" stackId="a" name="Iklan" fill="#f43f5e" radius={[2,2,0,0]} />
                              </BarChart>
                          </ResponsiveContainer>
                        </div>
                    </div>

                 </div>
               )}

               {/* Legacy Details (Current Month) */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left Column: Sales & Campaign */}
                  <div className="space-y-4">
                     {/* Sales Benchmarking Panel (Current Month) */}
                     <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-5">
                        <div className="flex justify-between items-end mb-4">
                           <div>
                              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Current Performance</h3>
                              <p className="text-[10px] text-slate-500">LM vs MTD vs Projected</p>
                           </div>
                           <div className={`flex items-center gap-1 text-sm font-black ${selectedMex.rrBs > selectedMex.lmBs ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {selectedMex.rrBs > selectedMex.lmBs ? <ArrowUpRight className="w-4 h-4"/> : <ArrowDownRight className="w-4 h-4"/>}
                              {Math.abs(selectedMex.rrVsLm).toFixed(1)}%
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 mb-4">
                           <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                             <p className="text-[9px] text-slate-500 font-bold uppercase">Last Month</p>
                             <p className="text-xs md:text-sm font-black text-slate-700 mt-0.5 truncate">{formatCurrency(selectedMex.lmBs)}</p>
                           </div>
                           <div className="bg-green-50 p-2.5 rounded-lg border border-green-100">
                             <p className="text-[9px] text-[#00B14F] font-bold uppercase">MTD Sales</p>
                             <p className="text-xs md:text-sm font-black text-slate-900 mt-0.5 truncate">{formatCurrency(selectedMex.mtdBs)}</p>
                           </div>
                           <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                             <p className="text-[9px] text-slate-500 font-bold uppercase">Projected RR</p>
                             <p className="text-xs md:text-sm font-black text-slate-700 mt-0.5 truncate">{formatCurrency(selectedMex.rrBs)}</p>
                           </div>
                        </div>
                        {!selectedMex.history || selectedMex.history.length === 0 ? (
                            <div className="h-40 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[{ name: 'Sales', lmBs: selectedMex.lmBs, mtdBs: selectedMex.mtdBs, rrBs: selectedMex.rrBs }]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                  <XAxis dataKey="name" tick={false} axisLine={false} tickLine={false} />
                                  <YAxis tick={{ fill: COLORS.slate500, fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} width={45} />
                                  <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border:'1px solid #e2e8f0', fontSize: '10px' }} formatter={(v) => formatCurrency(v)} />
                                  <Bar dataKey="lmBs" name="LM Sales" fill={COLORS.lastMonth} radius={[3,3,0,0]} maxBarSize={50} />
                                  <Bar dataKey="mtdBs" name="MTD Sales" fill={COLORS.primary} radius={[3,3,0,0]} maxBarSize={50} />
                                  <Bar dataKey="rrBs" name="Runrate" fill={COLORS.growth} radius={[3,3,0,0]} maxBarSize={50} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                        ) : null}
                     </div>

                     <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col">
                         <div className="flex justify-between items-start mb-3">
                           <div className="flex items-center gap-1.5">
                              <Zap className="w-4 h-4 text-amber-500"/>
                              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Active Campaigns</h3>
                           </div>
                           <div className="bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 flex items-center gap-1">
                              <Award className="w-3 h-3 text-indigo-500"/>
                              <span className="text-[10px] font-bold text-indigo-700">{selectedMex.campaignPoint || 0} Pts</span>
                           </div>
                         </div>
                         <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            {renderMerchantCampaigns(selectedMex.campaigns)}
                         </div>
                      </div>
                  </div>

                  {/* Right Column: MCA & Marketing */}
                  <div className="space-y-4">
                     
                     <div className="bg-amber-50 rounded-xl shadow-sm border border-amber-100 p-4 md:p-5">
                        <div className="flex items-center justify-between mb-4">
                           <div className="flex items-center gap-1.5">
                               <Database className="w-4 h-4 text-amber-600"/>
                               <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wide">MCA Eligibility</h3>
                           </div>
                           {selectedMex.mcaPriority && selectedMex.mcaPriority !== '-' && (
                               <span className="bg-amber-200 text-amber-800 border border-amber-300 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shadow-sm">
                                  {selectedMex.mcaPriority}
                               </span>
                           )}
                        </div>
                        
                        <div className="space-y-3">
                           <div className="flex items-center justify-between">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${selectedMex.mcaWlLimit > 0 && !selectedMex.mcaWlClass.includes('Not') ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                {selectedMex.mcaWlLimit > 0 && !selectedMex.mcaWlClass.includes('Not') ? 'Eligible' : 'Not Eligible'}
                              </span>
                              <span className="text-[10px] font-bold text-slate-800">{selectedMex.mcaWlClass}</span>
                           </div>
                           
                           <div className="bg-white p-3 rounded-lg border border-amber-100 shadow-sm">
                              <p className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">Available Limit</p>
                              <p className="text-xl md:text-2xl font-black text-amber-500 tracking-tight leading-none">{selectedMex.mcaWlLimit > 0 ? formatCurrency(selectedMex.mcaWlLimit) : 'Rp 0'}</p>
                           </div>

                           <div className="flex justify-between items-center pt-1 border-t border-amber-100/50">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Disbursed</span>
                              <span className="text-sm font-black text-slate-800">{formatCurrency(selectedMex.mcaAmount)}</span>
                           </div>
                        </div>
                     </div>

                     <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center gap-1.5 mb-3">
                           <Megaphone className="w-4 h-4 text-[#00B14F]"/>
                           <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Marketing Stats (MTD)</h3>
                        </div>
                        <div className="space-y-2">
                           <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                             <span className="text-[11px] text-slate-500 font-medium">Ads Spend</span>
                             <span className="text-xs font-black text-rose-500">{formatCurrency(selectedMex.adsTotal)}</span>
                           </div>
                           <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                             <span className="text-[11px] text-slate-500 font-medium">Promo Invest (MI)</span>
                             <span className="text-xs font-bold text-amber-500">{formatCurrency(selectedMex.miMtd)}</span>
                           </div>
                           <div className="flex justify-between items-center">
                             <span className="text-[11px] text-slate-500 font-medium">Commission</span>
                             <span className="text-xs font-bold text-slate-800">{selectedMex.commission || '-'}</span>
                           </div>
                        </div>
                     </div>

                  </div>
               </div>

               {/* NEW: CONTACT DETAILS AT THE BOTTOM */}
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-5">
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
                     <Info className="w-4 h-4 text-indigo-500"/>
                     <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Contact Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                      {/* Address */}
                      <div className="bg-slate-50 p-2.5 md:p-3 rounded-lg border border-slate-100 flex gap-2.5 h-full">
                         <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5"/>
                         <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Address</span>
                            <div className="text-xs text-slate-800 font-medium max-h-12 overflow-y-auto custom-scrollbar break-words leading-snug">
                               {selectedMex.city ? `${selectedMex.address}, ${selectedMex.city}` : '-'}
                            </div>
                         </div>
                      </div>

                      {/* Map Links */}
                      <div className="bg-slate-50 p-2.5 md:p-3 rounded-lg border border-slate-100 flex gap-2.5 h-full">
                         <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5"/>
                         <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Location Maps</span>
                            <div className="text-xs font-medium max-h-12 overflow-y-auto custom-scrollbar">
                               {(selectedMex.latitude || selectedMex.longitude) ? (
                                 <a 
                                    href={`https://maps.google.com/?q=${selectedMex.latitude},${selectedMex.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono text-indigo-600 hover:text-indigo-800 transition-colors flex items-start gap-1 break-all"
                                    title="Buka di Google Maps"
                                 >
                                    {selectedMex.latitude || '-'}, {selectedMex.longitude || '-'}
                                    <ExternalLink className="w-3 h-3 opacity-70 shrink-0 mt-0.5" />
                                 </a>
                               ) : <span className="text-slate-400">-</span>}
                            </div>
                         </div>
                      </div>

                      {/* Phone */}
                      <div className="bg-slate-50 p-2.5 md:p-3 rounded-lg border border-slate-100 flex gap-2.5 h-full">
                         <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5"/>
                         <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Phone Number</span>
                            <div className="text-xs text-slate-800 font-medium max-h-12 overflow-y-auto custom-scrollbar break-words">
                               {selectedMex.phone || '-'}
                            </div>
                         </div>
                      </div>

                      {/* Email */}
                      <div className="bg-slate-50 p-2.5 md:p-3 rounded-lg border border-slate-100 flex gap-2.5 h-full">
                         <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5"/>
                         <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email Address</span>
                            <div className="text-xs text-slate-800 font-medium max-h-12 overflow-y-auto custom-scrollbar break-all">
                               {selectedMex.email || '-'}
                            </div>
                         </div>
                      </div>
                  </div>
               </div>

            </div>
          )}
        </div>
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .pb-safe { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
        * { font-feature-settings: "tnum" on, "lnum" on; }
        
        @keyframes float-down { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(2.5px); } }
        .animate-float-down { animation: float-down 1.5s ease-in-out infinite; }
        
        @keyframes float-up { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2.5px); } }
        .animate-float-up { animation: float-up 1.5s ease-in-out infinite; }
      `}} />
    </div>
  );
}
