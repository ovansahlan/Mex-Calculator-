import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Home, 
  ShoppingCart, 
  ChevronLeft, 
  Check, 
  ArrowRight, 
  Store,
  Users2,
  Info,
  Zap,
  Edit3,
  Settings,
  List,
  Tags,
  TrendingUp,
  BarChart3,
  PieChart,
  Wallet,
  Ticket,
  ChevronDown,
  AlertCircle,
  Plus,
  Minus
} from 'lucide-react';

// --- CONSTANTS ---
const STRATEGY = {
  'normal': { k: 20, v: 0, tiers: null, title: 'NORMAL', benefits: ['Margin Aman 100%', 'Kestabilan Brand Jangka Panjang'] },
  'puas-cuan': { k: 32, v: 30, tiers: { hemat: { max: 45000, min: 15000 }, ekstra: { max: 80000, min: 35000 } }, title: 'CUAN 32%', benefits: ['Diskon Didukung Grab', 'Volume Penjualan Meningkat Drastis'] },
  'booster': { k: 38, v: 35, tiers: { hemat: { max: 55000, min: 15000 }, ekstra: { max: 100000, min: 35000 } }, title: 'BOOSTER 38%', benefits: ['Prioritas Pencarian Utama', 'Slot Banner Flash Sale Eksklusif'] },
  'cofund': { k: 20, v: 40, tiers: null, title: 'COFUND', benefits: ['Sharing Cost Promo', 'Akses ke Pengguna Baru'] }
};

// VOUCHER Updated
const VOUCHERS = [
  { code: 'PUAS30', scheme: 'puas-cuan', label: 'Diskon Puas 30%', desc: 'Komisi 32%', disc: 30 },
  { code: 'PUAS35', scheme: 'booster', label: 'Diskon Puas 35%', desc: 'Komisi 38% + Prioritas', disc: 35 },
  { code: 'MITRA50', scheme: 'cofund', label: 'Diskon 40% (Patungan)', desc: 'Sharing Cost', disc: 40 }
];

const PRESETS = [
  { name: "Brand Week", v: 45, s: 55, min: 50000, max: 50000 },
  { name: "Flash Sale", v: 50, s: 60, min: 64000, max: 40000 }
];

// --- UTILS ---
const fNum = (n) => {
  const num = Math.round(n || 0);
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const pNum = (n) => {
  if (typeof n === 'number') return n;
  if (!n) return 0;
  const cleanStr = n.toString().replace(/[^0-9]/g, '');
  return parseFloat(cleanStr) || 0;
};

const pFloat = (n) => {
  if (typeof n === 'number') return n;
  if (!n) return 0;
  const normalized = n.toString().replace(/,/g, '.');
  const cleanStr = normalized.replace(/[^0-9.]/g, '');
  return parseFloat(cleanStr) || 0;
};

// --- COMPONENTS ---
const Card = ({ children, className = "", isDark = false, overflowHidden = true }) => (
  <div className={`rounded-[24px] shadow-xl p-6 relative transition-colors duration-300 ${overflowHidden ? 'overflow-hidden' : ''} ${isDark ? 'bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 text-white' : 'bg-white border border-slate-100'} ${className}`}>
    {children}
  </div>
);

const Label = ({ icon: Icon, children, isDark = false }) => (
  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg shadow-sm backdrop-blur-sm mb-5 ${isDark ? 'bg-white/10 border border-white/10' : 'bg-slate-100/80 border border-slate-200/80'}`}>
    {Icon ? <Icon size={12} className={isDark ? "text-emerald-400" : "text-emerald-600"} /> : <div className={`w-1.5 h-1.5 rounded-full shadow-sm ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'}`} />}
    <span className={`text-[10px] font-black uppercase tracking-widest leading-none pt-[1px] ${isDark ? 'text-slate-200' : 'text-slate-600'}`}>
      {children}
    </span>
  </div>
);

const InputGroup = ({ label, prefix, suffix, value, onChange, type = "text", inputMode }) => (
  <div className="w-full">
    {label && <div className="mb-2"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p></div>}
    <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 flex items-center transition-all focus-within:border-emerald-500 focus-within:bg-white focus-within:shadow-md h-[54px]">
      {prefix && <span className="text-base font-bold text-slate-400 mr-2">{prefix}</span>}
      <input 
        type={type}
        inputMode={inputMode || (type === 'number' ? 'decimal' : 'numeric')}
        className="w-full bg-transparent outline-none font-bold text-slate-600 text-lg tabular-nums placeholder:text-slate-300"
        value={value}
        onChange={onChange}
      />
      {suffix && <span className="text-sm font-bold text-slate-400 ml-2">{suffix}</span>}
    </div>
  </div>
);

export default function App() {
  const [page, setPage] = useState('calc'); 
  const [scheme, setScheme] = useState('normal');
  const [tier, setTier] = useState('hemat');
  const [subMode, setSubMode] = useState('val'); 
  const [activeModal, setActiveModal] = useState(null); 
  const [showPreset, setShowPreset] = useState(false);

  const [inputs, setInputs] = useState({
    mainVal: "25.000",
    subVal: "0",
    menuName: "Menu Baru",
    kPct: 20,
    vDisk: 0,
    mDisk: "0",
    minO: "0",
    mShare: 50
  });

  const [histData, setHistData] = useState({
    omset: "50.000.000",
    orders: "1000",
    aov: "50.000",
    invest: "5"
  });
  const [growthProj, setGrowthProj] = useState(20);
  const [futureCostPct, setFutureCostPct] = useState(5); 

  const [localAppPrice, setLocalAppPrice] = useState("");
  const [isEditingAppPrice, setIsEditingAppPrice] = useState(false);

  const [cart, setCart] = useState([]);
  
  const [activeVoucher, setActiveVoucher] = useState(null);
  const [deliveryType, setDeliveryType] = useState('prioritas');
  const [showVoucherDropdown, setShowVoucherDropdown] = useState(false);

  const calc = useMemo(() => {
    const off = pNum(inputs.mainVal);
    const subRaw = pNum(inputs.subVal);
    const actSub = subMode === 'val' ? subRaw : (off * subRaw / 100);
    const k = pNum(inputs.kPct);
    const v = pNum(inputs.vDisk);
    const md = pNum(inputs.mDisk) || Infinity;
    const s = pNum(inputs.mShare);

    const list = Math.ceil(((off - actSub) / (1 - k / 100)) / 100) * 100;
    const disc = Math.round(Math.min(list * v / 100, md));
    const pay = list - disc;
    
    let mPromoCost = 0;
    if (scheme === 'cofund') {
      mPromoCost = Math.round((s / 100) * (v / 100) * list);
    }
    
    const commAmount = (list - mPromoCost) * (k/100); 
    const net = Math.round(list - commAmount - mPromoCost);

    const totalCut = list - net;
    const mexInvestPct = list > 0 ? (totalCut / list) * 100 : 0;

    const normalApp = Math.ceil(((off - actSub) / 0.8) / 100) * 100;
    
    return { list, pay, net, mPromoCost, totalDisc: disc, normalApp, mexInvestPct };
  }, [inputs, subMode, scheme]);

  useEffect(() => {
    const conf = STRATEGY[scheme];
    setInputs(prev => ({
      ...prev,
      kPct: conf.k,
      vDisk: conf.v,
      mDisk: conf.tiers ? fNum(conf.tiers[tier].max) : "0",
      minO: conf.tiers ? fNum(conf.tiers[tier].min) : "0"
    }));
  }, [scheme, tier]);

  const handleInputChange = (key, value) => {
    let cleanVal = value;
    if (['mainVal', 'subVal', 'mDisk', 'minO'].includes(key)) cleanVal = fNum(pNum(value));
    setInputs(prev => ({ ...prev, [key]: cleanVal }));
  };

  const handleHistChange = (key, value) => {
    if (key === 'invest') {
      const validVal = value.replace(/[^0-9.,]/g, '');
      setHistData(prev => ({ ...prev, [key]: validVal }));
      return;
    }
    const rawVal = pNum(value);
    setHistData(prev => {
      const curOrders = pNum(prev.orders);
      const curAov = pNum(prev.aov);
      let newData = { ...prev, [key]: fNum(rawVal) };
      if (key === 'omset') {
        if (curOrders > 0) newData.aov = fNum(rawVal / curOrders);
      } else if (key === 'orders') {
        newData.omset = fNum(rawVal * curAov);
      } else if (key === 'aov') {
        newData.omset = fNum(curOrders * rawVal);
      }
      return newData;
    });
  };

  const handleAppPriceManual = (val) => {
    const numericString = val.replace(/[^0-9]/g, ''); 
    const rawVal = parseInt(numericString || '0', 10);
    setLocalAppPrice(fNum(rawVal));
    const k = pNum(inputs.kPct);
    const subRaw = pNum(inputs.subVal);
    const offPrice = pNum(inputs.mainVal);
    const actSub = subMode === 'val' ? subRaw : (offPrice * subRaw / 100);
    const newOff = Math.round(rawVal * (1 - k / 100) + actSub);
    setInputs(prev => ({ ...prev, mainVal: fNum(newOff) }));
  };

  const addToCart = () => {
    const priceToCart = pNum(isEditingAppPrice ? localAppPrice : calc.list);
    const newItem = { 
      id: Date.now(), 
      name: inputs.menuName, 
      price: priceToCart, 
      qty: 1 
    };
    setCart(prev => {
      const idx = prev.findIndex(i => i.name === newItem.name && i.price === newItem.price);
      if (idx > -1) {
        const next = [...prev];
        next[idx].qty += 1;
        return next;
      }
      return [...prev, newItem];
    });
  };

  const updateCartQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, qty: Math.max(1, item.qty + delta) };
      }
      return item;
    }));
  };

  const selectVoucher = (v) => {
    setActiveVoucher(v);
    setShowVoucherDropdown(false);
  };

  const checkout = useMemo(() => {
    const deliveryCosts = { prioritas: 15000, standar: 10000, hemat: 5000 };
    const baseOngkir = deliveryCosts[deliveryType];
    
    let subtotal = 0;
    cart.forEach(item => {
      subtotal += (item.price * item.qty);
    });

    let totalPotDisc = 0;
    let schemeKey = 'normal';
    let totalMerchantCost = 0;
    let limitMin = 0;
    let limitMax = Infinity;
    let thresholdMet = true;

    if (activeVoucher) {
      schemeKey = activeVoucher.scheme;
      const conf = STRATEGY[schemeKey];

      if (conf.tiers && conf.tiers[tier]) {
        limitMin = conf.tiers[tier].min;
        limitMax = conf.tiers[tier].max;
      } else if (schemeKey === 'cofund') {
        limitMin = pNum(inputs.minO);
        limitMax = pNum(inputs.mDisk) || Infinity;
      }

      if (subtotal >= limitMin) {
        const rawDisc = Math.round(subtotal * (activeVoucher.disc / 100));
        totalPotDisc = Math.min(rawDisc, limitMax);

        if (schemeKey === 'cofund') {
          const sharePct = inputs.mShare;
          totalMerchantCost = Math.round(totalPotDisc * (sharePct / 100));
        }
      } else {
        thresholdMet = false;
        totalPotDisc = 0;
      }
    }

    const ongkirDisc = (schemeKey !== 'normal') ? 10000 : 0;
    const finalOngkir = Math.max(0, baseOngkir - ongkirDisc);
    const total = subtotal - totalPotDisc + finalOngkir + 1500;

    return { 
      subtotal, 
      finalDisc: totalPotDisc, 
      finalOngkir, 
      total, 
      ongkirDisc,
      totalMerchantCost,
      schemeKey,
      limitMin,
      limitMax,
      thresholdMet
    };
  }, [cart, activeVoucher, deliveryType, inputs.mShare, inputs.minO, inputs.mDisk, tier]);

  const projection = useMemo(() => {
    const hOmset = pNum(histData.omset);
    const hOrders = pNum(histData.orders);
    const hAOV = pNum(histData.aov);
    const hInvestPct = pFloat(histData.invest); 
    
    const hDailyOrders = hOrders > 0 ? Math.round(hOrders / 30) : 0;
    const hInvestAmount = Math.round(hOmset * (hInvestPct / 100));
    const hNet = hOmset - hInvestAmount;
    
    const newAOV = checkout.subtotal > 0 ? checkout.subtotal : hAOV;
    const pOrders = Math.round(hOrders * (1 + growthProj / 100));
    const pDailyOrders = Math.round(pOrders / 30);
    const pOmset = pOrders * newAOV;
    const futureInvestPct = pFloat(futureCostPct);
    const pInvestTotal = Math.round(pOmset * (futureInvestPct / 100));
    const pNet = pOmset - pInvestTotal;

    return { 
      hOmset, hOrders, hDailyOrders, hInvestAmount, hInvestPct, hNet, hAOV, 
      pOmset, pOrders, pDailyOrders, pInvestTotal, pNet, newAOV, futureInvestPct
    };
  }, [histData, growthProj, checkout, futureCostPct]);

  return (
    <div className="min-h-screen font-sans text-slate-900 pb-32 overflow-x-hidden flex justify-center bg-[#002a14]" 
         style={{ backgroundImage: 'linear-gradient(160deg, #004d22 0%, #002a14 100%)' }}>
      
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 210, 0, 0.4); }
          50% { box-shadow: 0 0 20px 2px rgba(255, 210, 0, 0.7); }
        }
        .animate-glow {
          animation: pulse-glow 2s infinite ease-in-out;
          border-color: #FFD200 !important;
          z-index: 10;
        }
      `}</style>

      <div className="w-full md:max-w-5xl bg-transparent min-h-screen relative flex flex-col md:px-6">
        
        {/* MODAL */}
        {activeModal && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
            <div className="relative w-full max-w-xs bg-slate-900 text-white rounded-[32px] p-6 shadow-2xl border border-white/10">
              <h3 className="text-center font-bold text-xs uppercase tracking-widest mb-6 text-emerald-400">
                {activeModal === 'cust' ? 'Payment Breakdown' : 'Revenue Breakdown'}
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Harga Aplikasi</span>
                  <span className="font-bold">Rp {fNum(calc.list)}</span>
                </div>
                {activeModal === 'cust' ? (
                  <div className="flex justify-between text-sm text-rose-400">
                    <span>Diskon Campaign</span>
                    <span className="font-bold">- Rp {fNum(calc.list - calc.pay)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Komisi Grab ({inputs.kPct}%)</span>
                      <span className="font-bold text-white">- Rp {fNum((calc.list - calc.mPromoCost) * (pNum(inputs.kPct)/100))}</span>
                    </div>
                    {scheme === 'cofund' && (
                      <div className="flex justify-between text-sm text-blue-400">
                        <span>Beban Toko</span>
                        <span className="font-bold">- Rp {fNum(calc.mPromoCost)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-amber-400 pt-2 border-t border-white/10">
                      <span>Mex Investment</span>
                      <span className="font-bold">{calc.mexInvestPct.toFixed(1)}%</span>
                    </div>
                  </>
                )}
                <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {activeModal === 'cust' ? 'Total Bayar' : 'Net Bersih'}
                  </span>
                  <span className={`text-2xl font-black tracking-tight ${activeModal === 'cust' ? 'text-emerald-400' : 'text-blue-400'}`}>
                    Rp {fNum(activeModal === 'cust' ? calc.pay : calc.net)}
                  </span>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="w-full mt-6 py-3.5 bg-white/10 rounded-xl font-bold text-xs hover:bg-white/20 transition-all">Tutup</button>
            </div>
          </div>
        )}

        {/* DASHBOARD HEADER (FIXED & FULL WIDTH MOBILE) */}
        <div className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl shadow-lg border-b-4 border-[#FFD200] rounded-b-[20px] md:relative md:rounded-[20px] md:mt-4 md:border-none md:mx-auto md:w-full md:shadow-xl">
          <div className="grid grid-cols-3 py-4 px-3 text-center divide-x divide-slate-100">
            <div className="relative group">
              <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5 flex justify-center items-center gap-1">
                App Price <Edit3 size={10} className="text-slate-300"/>
              </p>
              <input 
                className="w-full bg-transparent border-none text-center outline-none font-black text-xl text-slate-900 tabular-nums p-0 placeholder:text-slate-300"
                value={isEditingAppPrice ? localAppPrice : fNum(calc.list)}
                onChange={(e) => handleAppPriceManual(e.target.value)}
                onFocus={() => { setIsEditingAppPrice(true); setLocalAppPrice(fNum(calc.list)); }}
                onBlur={() => { setIsEditingAppPrice(false); setLocalAppPrice(fNum(calc.list)); }}
                inputMode="numeric"
                placeholder="0"
              />
            </div>
            <div className="cursor-pointer hover:bg-slate-50 transition-colors rounded-xl" onClick={() => setActiveModal('cust')}>
              <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Pax Pays</p>
              <div className="font-black text-xl text-emerald-600 tabular-nums">Rp {fNum(calc.pay)}</div>
            </div>
            <div className="cursor-pointer hover:bg-slate-50 transition-colors rounded-xl" onClick={() => setActiveModal('net')}>
              <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Net Rev</p>
              <div className="font-black text-xl text-blue-600 tabular-nums leading-none">Rp {fNum(calc.net)}</div>
              <p className="text-[9px] font-bold text-rose-500 mt-1">Mex Inv: {calc.mexInvestPct.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Spacer for Fixed Header */}
        <div className="h-[100px] md:h-8"></div>

        <main className="flex-1 p-5 space-y-8 md:p-0">
          
          {/* PAGE 1: CALCULATOR */}
          {page === 'calc' && (
            <div className="space-y-8 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
              {/* Left Column */}
              <div className="space-y-8">
                <Card isDark={true}>
                  <Label icon={Tags} isDark={true}>1. Strategi Campaign</Label>
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    {Object.keys(STRATEGY).map(k => {
                      const isSpecial = (k === 'puas-cuan' || k === 'booster');
                      const isActive = scheme === k;
                      return (
                        <button 
                          key={k} 
                          onClick={() => setScheme(k)} 
                          className={`
                            py-3.5 rounded-2xl text-[10px] font-black uppercase transition-all duration-200 border-2 relative
                            ${isActive 
                              ? 'bg-[#FFD200] border-[#FFD200] text-slate-900 shadow-md transform scale-105' 
                              : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white hover:border-white/30'
                            }
                            ${(isSpecial && isActive) ? 'animate-glow' : ''}
                          `}
                        >
                          {k === 'normal' ? 'Norm' : k === 'puas-cuan' ? 'Cuan' : k === 'booster' ? 'Boost' : 'CoFund'}
                        </button>
                      )
                    })}
                  </div>

                  <div className="h-px bg-white/10 w-full my-5"></div>

                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 pr-2">
                      <h2 className="font-black text-2xl text-white tracking-tight italic mb-3">{STRATEGY[scheme].title}</h2>
                      <div className="flex flex-col gap-3">
                        {STRATEGY[scheme].benefits.map((b, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className="bg-emerald-500/20 text-emerald-400 rounded-full p-0.5 mt-0.5 shrink-0"><Check size={12} strokeWidth={4}/></div>
                            <span className="text-sm font-bold text-slate-300 leading-snug">{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {STRATEGY[scheme].tiers && (
                      <div className="flex bg-black/20 p-1.5 rounded-xl border border-white/5 shadow-inner">
                        {['hemat', 'ekstra'].map(t => (
                          <button key={t} onClick={() => setTier(t)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${tier === t ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>{t}</button>
                        ))}
                      </div>
                    )}
                  </div>

                  {scheme === 'cofund' && (
                    <div className="mt-6 pt-4 border-t border-white/10">
                      <button onClick={() => setShowPreset(!showPreset)} className="w-full bg-white/5 hover:bg-white/10 border-2 border-white/10 p-3.5 rounded-2xl flex justify-between items-center text-xs font-bold text-slate-300 transition-colors">
                        <span>{showPreset ? 'Tutup Pilihan' : 'Pilih Database Promo...'}</span>
                        <ArrowRight size={14} className={`transition-transform ${showPreset ? 'rotate-90' : ''}`} />
                      </button>
                      {showPreset && (
                        <div className="mt-2 bg-[#1e293b] border border-white/10 rounded-2xl overflow-hidden shadow-xl mb-4 animate-in slide-in-from-top-2">
                          {PRESETS.map((p, i) => (
                            <div key={i} className="p-4 hover:bg-white/5 cursor-pointer text-xs font-bold text-slate-300 border-b border-white/5 last:border-0"
                              onClick={() => { setInputs(prev => ({ ...prev, vDisk: p.v, mShare: p.s, minO: fNum(p.min), mDisk: fNum(p.max) })); setShowPreset(false); }}>
                              {p.name}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="bg-blue-600/90 backdrop-blur-md rounded-2xl p-5 text-white shadow-xl mt-3 border border-blue-500/30">
                        <div className="flex justify-between items-end">
                          <div className="text-left bg-black/20 px-3 py-2 rounded-lg border border-white/5">
                            <p className="text-[9px] text-blue-100 uppercase font-bold mb-0.5">Beban Toko</p>
                            <p className="font-black text-sm">Rp {fNum(calc.mPromoCost)}</p>
                          </div>
                          <div className="text-right bg-black/20 px-3 py-2 rounded-lg border border-white/5">
                            <p className="text-[9px] text-blue-100 uppercase font-bold mb-0.5">Beban Grab</p>
                            <p className="font-black text-sm text-[#FFD200]">Rp {fNum(calc.totalDisc - calc.mPromoCost)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>

                <Card>
                  <Label icon={List}>2. Input Data Menu</Label>
                  <div className="flex gap-4 mb-5">
                    <div className="flex-1">
                      <InputGroup label="Harga Offline" prefix="Rp" value={inputs.mainVal} onChange={(e) => handleInputChange('mainVal', e.target.value)} />
                    </div>
                    <div className="flex-1">
                      <div className="mb-2"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subsidi Toko</p></div>
                      <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl pl-4 pr-1.5 py-1.5 flex items-center transition-all focus-within:border-emerald-500 focus-within:bg-white focus-within:shadow-md h-[54px]">
                        <input type="text" inputMode="numeric" className="w-full bg-transparent outline-none font-bold text-slate-600 text-lg tabular-nums placeholder:text-slate-300" value={inputs.subVal} onChange={(e) => handleInputChange('subVal', e.target.value)} />
                        <div className="flex bg-slate-200/60 rounded-xl p-1 ml-1 shrink-0">
                          <button onClick={() => setSubMode('val')} className={`w-8 h-8 flex items-center justify-center text-[9px] font-black rounded-lg transition-all ${subMode === 'val' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>Rp</button>
                          <button onClick={() => setSubMode('pct')} className={`w-8 h-8 flex items-center justify-center text-[9px] font-black rounded-lg transition-all ${subMode === 'pct' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>%</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 items-end">
                    <InputGroup value={inputs.menuName} onChange={(e) => handleInputChange('menuName', e.target.value)} inputMode="text" />
                    <button onClick={addToCart} className="h-[54px] px-8 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2">Add <ArrowRight size={18} strokeWidth={3}/></button>
                  </div>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-8 md:mt-0">
                <Card>
                  <Label icon={Settings}>3. Konfigurasi</Label>
                  <div className="grid grid-cols-2 gap-x-5 gap-y-5">
                    <InputGroup label="Komisi (%)" value={inputs.kPct} type="number" onChange={(e) => handleInputChange('kPct', e.target.value)} />
                    <InputGroup label="Diskon (%)" value={inputs.vDisk} type="number" onChange={(e) => handleInputChange('vDisk', e.target.value)} />
                    <InputGroup label="Min. Order" value={inputs.minO} onChange={(e) => handleInputChange('minO', e.target.value)} />
                    <InputGroup label="Max. Disk" value={inputs.mDisk} onChange={(e) => handleInputChange('mDisk', e.target.value)} />
                    {scheme === 'cofund' && (
                      <div className="col-span-2">
                        <InputGroup label="Mex Promo Share (%)" value={inputs.mShare} type="number" onChange={(e) => handleInputChange('mShare', e.target.value)} />
                      </div>
                    )}
                  </div>
                </Card>

                <div className="grid grid-cols-2 gap-5 mt-2">
                  <div className="bg-slate-900/70 backdrop-blur-xl rounded-[28px] p-6 border border-white/10 text-white shadow-2xl">
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3">Normal Price</p>
                    <p className="text-2xl font-black italic tracking-tight mb-2">Rp {fNum(calc.normalPay)}</p>
                    <div className="w-10 h-1.5 bg-white/10 rounded-full"/>
                  </div>
                  <div className="bg-emerald-600 rounded-[28px] p-6 border border-white/10 text-white shadow-2xl shadow-emerald-900/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 blur-3xl"/>
                    <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest mb-3">Campaign</p>
                    <p className="text-2xl font-black italic tracking-tight mb-2">Rp {fNum(calc.pay)}</p>
                    <div className="w-10 h-1.5 bg-white/40 rounded-full"/>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 2: CHECKOUT */}
          {page === 'checkout' && (
            <div className="md:grid md:grid-cols-2 md:gap-6 space-y-6 md:space-y-0 pb-32">
              <div className="space-y-6">
                <header className="flex items-center gap-4">
                  <button onClick={() => setPage('calc')} className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-lg">
                    <ChevronLeft size={24} strokeWidth={3}/>
                  </button>
                  <h1 className="font-black uppercase text-sm tracking-[0.2em] text-white">Checkout</h1>
                </header>

                <Card>
                  <Label icon={Info}>Pilih Pengiriman</Label>
                  <div className="space-y-3">
                    {['prioritas', 'standar', 'hemat'].map(id => (
                      <div key={id} onClick={() => setDeliveryType(id)} className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex justify-between items-center ${deliveryType === id ? 'bg-emerald-50 border-emerald-500 shadow-md' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${deliveryType === id ? 'border-emerald-500' : 'border-slate-300'}`}>
                            {deliveryType === id && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"/>}
                          </div>
                          <div>
                            <p className={`font-black text-sm uppercase ${deliveryType === id ? 'text-emerald-700' : 'text-slate-700'}`}>{id}</p>
                            <p className="text-[10px] text-slate-400 font-bold">Estimasi {id === 'prioritas' ? '20' : id === 'standar' ? '30' : '45'} menit</p>
                          </div>
                        </div>
                        <div className="text-right">
                           {checkout.ongkirDisc > 0 ? (
                             <>
                               <span className="block text-[10px] text-slate-400 line-through font-bold">Rp {fNum(id === 'prioritas' ? 15000 : id === 'standar' ? 10000 : 5000)}</span>
                               <span className="block font-black text-sm text-emerald-600">Rp {fNum(Math.max(0, (id === 'prioritas' ? 15000 : id === 'standar' ? 10000 : 5000) - checkout.ongkirDisc))}</span>
                             </>
                           ) : (
                             <span className="font-black text-sm text-slate-700">Rp {fNum(id === 'prioritas' ? 15000 : id === 'standar' ? 10000 : 5000)}</span>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card>
                  <div className="flex justify-between items-center mb-5">
                    <Label icon={ShoppingCart}>Rincian Pesanan</Label>
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-200">{cart.reduce((a,b)=>a+b.qty,0)} Item</span>
                  </div>
                  <div className="space-y-4">
                    {cart.length === 0 ? (
                       <div className="text-center py-10 text-slate-300 font-bold text-xs uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-2xl">Keranjang Kosong</div>
                    ) : cart.map(item => {
                      return (
                        <div key={item.id} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white text-emerald-600 font-black flex items-center justify-center text-sm border border-slate-200 shadow-sm">{item.qty}</div>
                            <div>
                              <p className="font-black text-sm text-slate-800">{item.name}</p>
                              {/* ITEM CONTROLS */}
                              <div className="flex items-center gap-3 mt-1.5">
                                <button 
                                  onClick={() => updateCartQty(item.id, -1)}
                                  className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-600"
                                >
                                  <Minus size={12} strokeWidth={3} />
                                </button>
                                <span className="text-xs font-black text-slate-800 w-3 text-center">{item.qty}</span>
                                <button 
                                  onClick={() => updateCartQty(item.id, 1)}
                                  className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-lg hover:bg-slate-200 text-emerald-600"
                                >
                                  <Plus size={12} strokeWidth={3} />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-slate-700 text-lg">Rp {fNum(item.price * item.qty)}</p>
                            <button onClick={() => setCart(prev => prev.filter(i=>i.id!==item.id))} className="text-[10px] text-red-400 font-bold hover:text-red-600 uppercase tracking-wider mt-1">Hapus</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>

                {/* VOUCHER DROPDOWN CARD (Moved to Bottom of Left Col) */}
                <Card overflowHidden={false}>
                  <Label icon={Ticket}>Voucher & Promo</Label>
                  <div className="relative">
                    <button 
                      onClick={() => setShowVoucherDropdown(!showVoucherDropdown)}
                      className={`w-full p-4 rounded-2xl border-2 flex justify-between items-center transition-all ${activeVoucher ? 'bg-emerald-50 border-emerald-500 shadow-md' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeVoucher ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                          <Ticket size={16} />
                        </div>
                        <div className="text-left">
                          <p className={`text-xs font-black uppercase ${activeVoucher ? 'text-emerald-800' : 'text-slate-500'}`}>
                            {activeVoucher ? activeVoucher.code : 'Makin Hemat Pakai Promo'}
                          </p>
                          <p className={`text-[10px] font-bold ${activeVoucher ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {activeVoucher ? activeVoucher.label : 'Klik untuk pilih voucher'}
                          </p>
                        </div>
                      </div>
                      <ChevronDown size={20} className={`transition-transform duration-300 ${showVoucherDropdown ? 'rotate-180' : ''} ${activeVoucher ? 'text-emerald-600' : 'text-slate-400'}`}/>
                    </button>

                    {showVoucherDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top">
                        <div 
                          className="p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-50"
                          onClick={() => selectVoucher(null)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-xs font-black text-slate-700">NORMAL</p>
                              <p className="text-[10px] text-slate-500">Tanpa Voucher (Harga Normal)</p>
                            </div>
                            {!activeVoucher && <Check size={16} className="text-emerald-500" />}
                          </div>
                        </div>
                        {VOUCHERS.map((v, i) => (
                          <div 
                            key={i} 
                            className="p-4 hover:bg-emerald-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                            onClick={() => selectVoucher(v)}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-xs font-black text-emerald-800">{v.code}</p>
                                <p className="text-[10px] font-bold text-emerald-600">{v.label}</p>
                                <p className="text-[9px] text-slate-400 mt-0.5">{v.desc}</p>
                              </div>
                              {activeVoucher?.code === v.code && <Check size={16} className="text-emerald-500" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* DISPLAY INFO THRESHOLD */}
                  {activeVoucher && (
                    <div className="mt-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-slate-500 font-bold">Min. Order</span>
                        <span className="font-black text-slate-700">Rp {fNum(checkout.limitMin)}</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-500 font-bold">Max. Diskon</span>
                        <span className="font-black text-slate-700">{checkout.limitMax === Infinity ? 'Tanpa Batas' : `Rp ${fNum(checkout.limitMax)}`}</span>
                      </div>
                      {!checkout.thresholdMet && (
                        <div className="mt-2 text-[9px] text-red-500 font-bold flex items-center gap-1 bg-red-50 p-1.5 rounded-lg border border-red-100">
                          <AlertCircle size={10} /> Belum memenuhi minimum order
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </div>

              {/* Right Col - Sticky Summary */}
              <div className="bg-white/95 backdrop-blur-xl rounded-[32px] p-8 shadow-2xl border border-white/20 sticky top-24 h-fit">
                 <div className="space-y-4">
                    <div className="flex justify-between text-xs font-bold text-slate-500"><span>Subtotal</span><span>Rp {fNum(checkout.subtotal)}</span></div>
                    <div className="flex justify-between text-xs font-bold text-slate-500"><span>Ongkir</span><span>Rp {fNum(checkout.finalOngkir)}</span></div>
                    <div className="flex justify-between text-xs font-bold text-slate-500"><span>Biaya Layanan</span><span>Rp 1.500</span></div>
                    {checkout.finalDisc > 0 && (
                      <div className="flex justify-between text-xs font-black text-emerald-600 pt-4 border-t border-slate-100">
                        <span className="flex items-center gap-1"><Zap size={14}/> Diskon Promo</span>
                        <span>- Rp {fNum(checkout.finalDisc)}</span>
                      </div>
                    )}
                    {checkout.schemeKey === 'cofund' && checkout.totalMerchantCost > 0 && (
                      <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 mt-2">
                        <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-2">Rincian Patungan (Cofund)</p>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-slate-500">Beban Toko</span>
                          <span className="font-bold text-slate-700">Rp {fNum(checkout.totalMerchantCost)}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-500">Beban Grab</span>
                          <span className="font-bold text-slate-700">Rp {fNum(checkout.finalDisc - checkout.totalMerchantCost)}</span>
                        </div>
                      </div>
                    )}
                 </div>
              </div>
            </div>
          )}

          {/* PAGE 3: PROSPECT */}
          {page === 'prospect' && (
            <div className="md:grid md:grid-cols-2 md:gap-6 space-y-6 md:space-y-0 pb-32">
              <div className="space-y-6">
                <header className="flex items-center gap-4">
                  <button onClick={() => setPage('calc')} className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-lg">
                    <ChevronLeft size={24} strokeWidth={3}/>
                  </button>
                  <h1 className="font-black uppercase text-sm tracking-[0.2em] text-white">Proyeksi Bisnis</h1>
                </header>

                <Card>
                  <Label icon={BarChart3}>Data Historis (Rata2/Bulan)</Label>
                  <div className="space-y-4">
                    <InputGroup label="Omset Penjualan" prefix="Rp" value={histData.omset} onChange={(e) => handleHistChange('omset', e.target.value)} />
                    <InputGroup label="Jumlah Order" value={histData.orders} onChange={(e) => handleHistChange('orders', e.target.value)} />
                    <InputGroup label="AOV (Otomatis/Manual)" prefix="Rp" value={histData.aov} onChange={(e) => handleHistChange('aov', e.target.value)} />
                    <InputGroup label="Investasi Promo/Ads" suffix="%" value={histData.invest} onChange={(e) => handleHistChange('invest', e.target.value)} />
                  </div>
                </Card>

                <Card>
                  <Label icon={TrendingUp}>Target Pertumbuhan Order</Label>
                  <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Kenaikan</span>
                      <span className="text-2xl font-black text-emerald-600">{growthProj}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="200" 
                      step="5"
                      value={growthProj} 
                      onChange={(e) => setGrowthProj(Number(e.target.value))}
                      className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <p className="text-[10px] text-slate-400 font-medium mt-3 text-center">Geser untuk simulasi kenaikan order</p>
                  </div>
                </Card>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-900/80 backdrop-blur-xl rounded-[24px] p-5 border border-white/10 text-white">
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-4">Saat Ini (Avg 1 Thn)</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase">Omset</p>
                      <p className="text-sm font-bold">Rp {fNum(projection.hOmset)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase">Orders</p>
                      <p className="text-sm font-bold">{fNum(projection.hOrders)} <span className="text-[10px] text-slate-500 font-normal">({fNum(projection.hDailyOrders)}/hari)</span></p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase">AOV (Rata-rata)</p>
                      <p className="text-sm font-bold">Rp {fNum(projection.hAOV)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase">Cost ({projection.hInvestPct}%)</p>
                      <p className="text-sm font-bold text-rose-400">Rp {fNum(projection.hInvestAmount)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase">Net Profit</p>
                      <p className="text-sm font-bold text-emerald-400">Rp {fNum(projection.hNet)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-600 rounded-[24px] p-5 border border-white/20 text-white relative overflow-hidden shadow-xl shadow-emerald-900/30">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                  <p className="text-[9px] font-bold text-emerald-100 uppercase tracking-widest mb-4">Proyeksi Masa Depan</p>
                  <div className="space-y-3 relative z-10">
                    <div>
                      <p className="text-[9px] text-emerald-200 uppercase">Est. Omset</p>
                      <p className="text-xl font-black">Rp {fNum(projection.pOmset)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-emerald-200 uppercase">Est. Orders</p>
                      <p className="text-sm font-bold">{fNum(projection.pOrders)} <span className="text-[10px] text-emerald-300 font-normal">({fNum(projection.pDailyOrders)}/hari)</span></p>
                      <p className="text-[8px] text-emerald-300 mt-0.5 font-bold">+{growthProj}% dari Historis</p>
                    </div>
                    
                    {/* INPUT FUTURE COST */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                         <p className="text-[9px] text-emerald-200 uppercase">Est. Cost %</p>
                      </div>
                      <div className="flex items-center gap-2 bg-black/20 rounded-lg px-2 py-1 border border-white/10 w-fit">
                         <input 
                            type="number" 
                            value={futureCostPct}
                            onChange={(e) => setFutureCostPct(e.target.value)}
                            className="bg-transparent text-white font-bold text-sm w-8 outline-none text-center"
                         />
                         <span className="text-[10px] font-bold text-emerald-200">%</span>
                      </div>
                      <p className="text-[10px] font-bold text-white/80 mt-1">Rp {fNum(projection.pInvestTotal)}</p>
                    </div>

                    <div>
                      <p className="text-[9px] text-emerald-200 uppercase">Est. Net Profit</p>
                      <p className="text-sm font-bold text-[#FFD200]">Rp {fNum(projection.pNet)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-emerald-200 uppercase">AOV Baru (Dr Cart)</p>
                      <p className="text-xs font-bold">Rp {fNum(projection.newAOV)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[24px] p-6 shadow-xl border border-slate-100">
                  <Label icon={Wallet}>Analisa Profitability</Label>
                  <div className="grid grid-cols-2 gap-8 mt-2">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Net Profit Lama</p>
                      <p className="text-lg font-black text-slate-700">Rp {fNum(projection.hNet)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Est. Net Profit Baru</p>
                      <p className={`text-lg font-black ${projection.pNet >= projection.hNet ? 'text-emerald-600' : 'text-rose-500'}`}>
                        Rp {fNum(projection.pNet)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Selisih Profit</span>
                    <span className={`text-sm font-black px-3 py-1 rounded-full ${projection.pNet >= projection.hNet ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {projection.pNet >= projection.hNet ? '+' : ''}{fNum(projection.pNet - projection.hNet)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* BOTTOM NAV */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-5 py-3 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-[24px] md:bottom-6 md:w-fit md:mx-auto md:rounded-full md:px-8 md:border md:shadow-2xl">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
               <Store size={16} />
             </div>
             <div>
               <p className="font-black text-[10px] uppercase tracking-widest text-slate-800 leading-none">Merchant</p>
               <p className="text-[9px] font-bold text-slate-400 mt-0.5">Simulator</p>
             </div>
          </div>
          <div className="flex gap-4 ml-8">
            <button onClick={() => setPage('calc')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${page === 'calc' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100'}`}>
              <Home size={18} strokeWidth={2.5}/>
            </button>
            <div className="relative">
              <button onClick={() => setPage('checkout')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${page === 'checkout' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100'}`}>
                <ShoppingCart size={18} strokeWidth={2.5}/>
              </button>
              {cart.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              )}
            </div>
            <button onClick={() => setPage('prospect')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${page === 'prospect' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100'}`}>
              <TrendingUp size={18} strokeWidth={2.5}/>
            </button>
          </div>
        </nav>

        {/* CHECKOUT BUTTON (Mobile Fixed) */}
        {page === 'checkout' && cart.length > 0 && (
          <div className="fixed bottom-[80px] left-0 right-0 max-w-md mx-auto px-4 z-50 md:hidden">
            <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-[24px] shadow-2xl shadow-emerald-600/40 transition-all active:scale-[0.98] flex justify-between items-center border-t border-emerald-400/30">
              <div className="text-left">
                <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider mb-0.5">Total Tagihan</p>
                <p className="text-2xl font-black italic tracking-tight">Rp {fNum(checkout.total)}</p>
              </div>
              <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wide bg-emerald-800/30 px-5 py-2.5 rounded-xl border border-emerald-400/20">
                Pesan <ArrowRight size={18} strokeWidth={3}/>
              </div>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}


