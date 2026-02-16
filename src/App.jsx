import React, { useState, useEffect, useMemo } from 'react';
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
  Wallet,
  Ticket,
  ChevronDown,
  AlertCircle,
  Plus,
  Minus,
  Megaphone, 
  Target,    
  MousePointer2,
  ShoppingBag
} from 'lucide-react';

// --- CONSTANTS ---
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
  <div className={`rounded-[20px] shadow-xl p-5 relative transition-colors duration-300 ${overflowHidden ? 'overflow-hidden' : ''} ${isDark ? 'bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 text-white' : 'bg-white border border-slate-100'} ${className}`}>
    {children}
  </div>
);

const Label = ({ icon: Icon, children, isDark = false }) => (
  <div className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-xl shadow-sm backdrop-blur-sm mb-5 ${isDark ? 'bg-white/10 border border-white/20' : 'bg-slate-100/90 border border-slate-200'}`}>
    {Icon ? <Icon size={18} className={isDark ? "text-emerald-400" : "text-emerald-600"} /> : <div className={`w-2 h-2 rounded-full shadow-sm ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'}`} />}
    <span className={`text-sm md:text-base font-black uppercase tracking-widest leading-none pt-[1px] ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>
      {children}
    </span>
  </div>
);

const InputGroup = ({ label, prefix, suffix, value, onChange, type = "text", inputMode }) => (
  <div className="w-full">
    {label && <div className="mb-2"><p className="text-xs font-black text-slate-500 uppercase tracking-widest">{label}</p></div>}
    <div className="bg-slate-50 border-2 border-slate-200 rounded-xl px-3 flex items-center transition-all focus-within:border-emerald-500 focus-within:bg-white focus-within:shadow-md h-[50px]">
      {prefix && <span className="text-sm font-bold text-slate-400 mr-2">{prefix}</span>}
      <input 
        type={type}
        inputMode={inputMode || (type === 'number' ? 'decimal' : 'numeric')}
        className="w-full bg-transparent outline-none font-bold text-slate-700 text-base tabular-nums placeholder:text-slate-300"
        value={value}
        onChange={onChange}
      />
      {suffix && <span className="text-xs font-bold text-slate-400 ml-2">{suffix}</span>}
    </div>
  </div>
);

export default function App() {
  const [page, setPage] = useState('calc'); 
  const [scheme, setScheme] = useState('normal');
  const [tier, setTier] = useState('hemat');
  const [subMode, setSubMode] = useState('val'); 
  const [activeModal, setActiveModal] = useState(null); 

  // Inputs Halaman 1
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

  // Inputs Halaman 3 (Prospect)
  const [histData, setHistData] = useState({
    omset: "50.000.000",
    orders: "1000",
    aov: "50.000",
    invest: "5"
  });
  const [growthProj, setGrowthProj] = useState(20);
  const [futureCostPct, setFutureCostPct] = useState(5); 

  // Inputs Halaman 4 (Ads)
  const [adsBudget, setAdsBudget] = useState("30.000"); 
  const [adsType, setAdsType] = useState('keyword'); 
  const [cpcBid, setCpcBid] = useState("2.500");
  const [adsCvr, setAdsCvr] = useState("15"); 

  const [localAppPrice, setLocalAppPrice] = useState("");
  const [isEditingAppPrice, setIsEditingAppPrice] = useState(false);

  const [cart, setCart] = useState([]);
  
  const [activeVoucher, setActiveVoucher] = useState(null);
  const [deliveryType, setDeliveryType] = useState('prioritas');
  const [showVoucherDropdown, setShowVoucherDropdown] = useState(false);

  // --- CALCULATION CORE ---
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

  // REVISI: Reset CPC/CPO dan CVR saat tipe iklan ganti
  useEffect(() => {
    if (adsType === 'keyword') {
      setCpcBid("2.500");
      setAdsCvr("15");
    } else if (adsType === 'banner') {
      setCpcBid("800");
      setAdsCvr("5");
    } else if (adsType === 'cpo') {
      setCpcBid("8.000"); // Default Cost Per Order
      setAdsCvr("100"); // CVR tidak relevan untuk user di model CPO, tapi kita set 100 untuk visualisasi
    }
  }, [adsType]);

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

  const handleTargetOrderChange = (val) => {
    const rawVal = pNum(val);
    const baseOrders = pNum(histData.orders);
    
    if (baseOrders > 0) {
       const newGrowth = ((rawVal - baseOrders) / baseOrders) * 100;
       setGrowthProj(newGrowth);
    }
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

  // REVISI: Logika AdsSim support CPO (Cost Per Order)
  const adsSim = useMemo(() => {
    const budget = pNum(adsBudget);
    const costUnit = pNum(cpcBid) || 0; // Bisa CPC atau CPO
    const cvrVal = pNum(adsCvr) || 0;
    const cvr = cvrVal / 100;
    const baseAOV = pNum(histData.aov) || 40000;

    let estClicks, estOrders, estGrossSales, roas, actualCost;

    if (adsType === 'cpo') {
       // --- LOGIKA CPO ---
       // User input budget & cost per order
       // Order = Budget / Cost Per Order
       const cpo = costUnit || 10000;
       estOrders = Math.floor(budget / cpo);
       actualCost = estOrders * cpo; // Biaya real yg dikeluarkan (bisa dibawah budget jika sisa tidak cukup untuk 1 order)
       estGrossSales = estOrders * baseAOV;
       
       // Clicks dihitung mundur dari CVR (hanya simulasi)
       // Jika CVR user input 100% (default CPO), clicks = orders. Jika user ganti, menyesuaikan.
       estClicks = cvr > 0 ? Math.round(estOrders / (cvrVal > 99 ? 0.2 : cvr)) : 0; // Asumsi CVR normal 20% jika user set 100%
       
       roas = actualCost > 0 ? (estGrossSales / actualCost) : 0;
    } else {
       // --- LOGIKA CPC (Keyword/Banner) ---
       const cpc = costUnit || (adsType === 'keyword' ? 2500 : 800);
       estClicks = Math.floor(budget / cpc);
       estOrders = Math.floor(estClicks * cvr);
       actualCost = estClicks * cpc; // Asumsi budget habis
       estGrossSales = estOrders * baseAOV;
       roas = budget > 0 ? (estGrossSales / budget) : 0;
    }

    return { cpc: costUnit, estClicks, cvr, estOrders, estGrossSales, roas, baseAOV, actualCost };
  }, [adsBudget, adsType, histData.aov, cpcBid, adsCvr]);

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

        {/* DASHBOARD HEADER */}
        <div className="fixed top-0 left-0 right-0 z-50 p-3 bg-gradient-to-b from-[#002a14]/90 to-transparent md:relative md:bg-none md:p-0 md:mt-4 md:mx-auto md:w-full">
          <div className="grid grid-cols-3 gap-2 md:gap-4 md:max-w-5xl">
            {page === 'prospect' ? (
              // --- PANEL KHUSUS PAGE PROYEKSI ---
              <>
                {/* Panel 1: AOV History */}
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-3 flex flex-col items-center justify-center border border-white/40 h-[70px]">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">AOV Lama</p>
                  <div className="font-black text-lg md:text-xl text-slate-600 tabular-nums leading-none">
                    Rp {fNum(projection.hAOV)}
                  </div>
                  <p className="text-[8px] font-bold text-slate-400 mt-1">({fNum(projection.hOrders)} Order)</p>
                </div>

                {/* Panel 2: AOV Proyeksi */}
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-3 flex flex-col items-center justify-center border border-white/40 h-[70px]">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">AOV Baru</p>
                  <div className="font-black text-lg md:text-xl text-emerald-600 tabular-nums leading-none">
                    Rp {fNum(projection.newAOV)}
                  </div>
                  <p className="text-[8px] font-bold text-emerald-500 mt-1">({fNum(projection.pOrders)} Order)</p>
                </div>

                {/* Panel 3: Selisih Profit */}
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-3 flex flex-col items-center justify-center border border-white/40 h-[70px]">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Selisih Profit</p>
                  <div className={`font-black text-lg md:text-xl tabular-nums leading-none ${projection.pNet >= projection.hNet ? 'text-blue-600' : 'text-rose-500'}`}>
                    {projection.pNet >= projection.hNet ? '+' : ''}Rp {fNum(projection.pNet - projection.hNet)}
                  </div>
                </div>
              </>
            ) : page === 'checkout' ? (
               // --- PANEL KHUSUS PAGE CHECKOUT ---
               <>
                {/* Panel 1: Subtotal */}
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-3 flex flex-col items-center justify-center border border-white/40 h-[70px]">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Subtotal</p>
                  <div className="font-black text-lg md:text-xl text-slate-700 tabular-nums leading-none">
                    Rp {fNum(checkout.subtotal)}
                  </div>
                </div>

                {/* Panel 2: Voucher */}
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-3 flex flex-col items-center justify-center border border-white/40 h-[70px]">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Voucher</p>
                  <div className={`font-black text-lg md:text-xl tabular-nums leading-none ${activeVoucher ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {activeVoucher ? activeVoucher.code : 'NORMAL'}
                  </div>
                </div>

                {/* Panel 3: Total Diskon */}
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-3 flex flex-col items-center justify-center border border-white/40 h-[70px]">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Diskon</p>
                  <div className="font-black text-lg md:text-xl text-rose-500 tabular-nums leading-none">
                    {checkout.finalDisc > 0 ? `- Rp ${fNum(checkout.finalDisc)}` : '-'}
                  </div>
                </div>
               </>
            ) : page === 'ads' ? (
               // --- PANEL KHUSUS PAGE ADS ---
               <>
                {/* Panel 1: Jenis Iklan */}
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-3 flex flex-col items-center justify-center border border-white/40 h-[70px]">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Jenis Iklan</p>
                  <div className="font-black text-lg md:text-xl text-slate-700 tabular-nums leading-none uppercase">
                    {adsType === 'cpo' ? 'Pesanan' : adsType}
                  </div>
                </div>

                {/* Panel 2: Bid/Biaya */}
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-3 flex flex-col items-center justify-center border border-white/40 h-[70px]">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    {adsType === 'cpo' ? 'Biaya/Order' : 'Bid CPC'}
                  </p>
                  <div className="font-black text-lg md:text-xl text-slate-700 tabular-nums leading-none">
                    Rp {fNum(pNum(cpcBid))}
                  </div>
                </div>

                {/* Panel 3: ROAS */}
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-3 flex flex-col items-center justify-center border border-white/40 h-[70px]">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">ROAS</p>
                  <div className={`font-black text-lg md:text-xl tabular-nums leading-none ${adsSim.roas >= 5 ? 'text-emerald-600' : adsSim.roas >= 3 ? 'text-blue-500' : 'text-rose-500'}`}>
                    {adsSim.roas.toFixed(1)}x
                  </div>
                </div>
               </>
            ) : (
              // --- PANEL DEFAULT (CALC) ---
              <>
                {/* Panel 1: App Price */}
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-3 flex flex-col items-center justify-center border border-white/40 h-[70px] relative group">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    App Price <Edit3 size={10} className="text-slate-300"/>
                  </p>
                  <input 
                    className="w-full bg-transparent border-none text-center outline-none font-black text-2xl text-slate-800 tabular-nums p-0 placeholder:text-slate-300"
                    value={isEditingAppPrice ? localAppPrice : fNum(calc.list)}
                    onChange={(e) => handleAppPriceManual(e.target.value)}
                    onFocus={() => { setIsEditingAppPrice(true); setLocalAppPrice(fNum(calc.list)); }}
                    onBlur={() => { setIsEditingAppPrice(false); setLocalAppPrice(fNum(calc.list)); }}
                    inputMode="numeric"
                    placeholder="0"
                  />
                </div>

                {/* Panel 2: Pax Pays */}
                <div 
                  className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-3 flex flex-col items-center justify-center border border-white/40 h-[70px] cursor-pointer hover:scale-[1.02] transition-transform" 
                  onClick={() => setActiveModal('cust')}
                >
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Pax Pays</p>
                  {calc.list > calc.pay ? (
                    <div className="flex flex-col items-center leading-none">
                      <span className="text-[10px] text-slate-300 line-through decoration-slate-300 font-bold mb-0.5">
                        Rp {fNum(calc.list)}
                      </span>
                      <span className="font-black text-lg md:text-xl text-emerald-600 tabular-nums">
                        Rp {fNum(calc.pay)}
                      </span>
                    </div>
                  ) : (
                    <div className="font-black text-lg md:text-xl text-emerald-600 tabular-nums leading-none mt-1">
                      Rp {fNum(calc.pay)}
                    </div>
                  )}
                </div>

                {/* Panel 3: Net Rev */}
                <div 
                  className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-3 flex flex-col items-center justify-center border border-white/40 h-[70px] cursor-pointer hover:scale-[1.02] transition-transform" 
                  onClick={() => setActiveModal('net')}
                >
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Net Rev</p>
                  <div className="font-black text-lg md:text-xl text-blue-600 tabular-nums leading-none">Rp {fNum(calc.net)}</div>
                  <p className="text-[8px] font-bold text-rose-500 mt-1.5 bg-rose-50 px-1.5 py-0.5 rounded-md">Mex Inv: {calc.mexInvestPct.toFixed(1)}%</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="h-[105px] md:h-8"></div>

        <main className="flex-1 p-4 space-y-4 md:p-0">
          
          {/* PAGE 1: CALCULATOR */}
          {page === 'calc' && (
            <div className="space-y-4 md:space-y-6 md:scale-[1.02] md:origin-top pb-10">
              {/* Full Width Strategy Card */}
              <Card isDark={true} className="md:p-6 min-h-[200px] flex flex-col justify-center">
                <Label icon={Tags} isDark={true}>1. Strategi Campaign</Label>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {Object.keys(STRATEGY).map(k => {
                    const isSpecial = (k === 'puas-cuan' || k === 'booster');
                    const isActive = scheme === k;
                    return (
                      <button 
                        key={k} 
                        onClick={() => setScheme(k)} 
                        className={`
                          py-2.5 rounded-xl text-xs font-black uppercase transition-all duration-200 border-2 relative
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

                <div className="h-px bg-white/10 w-full my-3"></div>

                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <h2 className="font-black text-xl text-white tracking-tight italic mb-2">{STRATEGY[scheme].title}</h2>
                    {STRATEGY[scheme].tiers && (
                      <div className="flex bg-black/20 p-1 rounded-lg border border-white/5 shadow-inner self-start mb-2 md:mb-0 md:float-right">
                        {['hemat', 'ekstra'].map(t => (
                          <button key={t} onClick={() => setTier(t)} className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${tier === t ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>{t}</button>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      {STRATEGY[scheme].benefits.map((b, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="bg-emerald-500/20 text-emerald-400 rounded-full p-0.5 mt-0.5 shrink-0"><Check size={10} strokeWidth={4}/></div>
                          <span className="text-xs font-bold text-slate-200 leading-snug">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {scheme === 'cofund' && (
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <div className="bg-blue-600/90 backdrop-blur-md rounded-xl p-4 text-white shadow-lg border border-blue-500/30">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Users2 size={14} className="text-blue-200" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-blue-100">Mex Promo Share</span>
                        </div>
                        <span className="text-xs font-black bg-black/20 px-2 py-0.5 rounded-lg border border-white/10">{inputs.mShare}%</span>
                      </div>
                      
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="5" 
                        value={inputs.mShare}
                        onChange={(e) => setInputs(prev => ({ ...prev, mShare: parseInt(e.target.value) }))}
                        className="w-full h-1.5 bg-blue-900/50 rounded-lg appearance-none cursor-pointer accent-white mb-3"
                      />

                      <div className="flex justify-between items-end">
                        <div className="text-left">
                          <p className="text-[9px] text-blue-100 uppercase font-bold mb-0.5">Beban Toko</p>
                          <p className="font-black text-sm">Rp {fNum(calc.mPromoCost)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-blue-100 uppercase font-bold mb-0.5">Beban Grab</p>
                          <p className="font-black text-sm text-[#FFD200]">Rp {fNum(calc.totalDisc - calc.mPromoCost)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Side-by-Side Inputs */}
              <div className="md:grid md:grid-cols-2 md:gap-4 space-y-4 md:space-y-0">
                
                {/* Left: Input Menu */}
                <div className="h-full">
                   <Card className="h-full md:p-8 md:min-h-[320px] flex flex-col justify-center">
                    <Label icon={List}>2. Input Data Menu</Label>
                    <div className="flex gap-3 mb-6">
                      <div className="flex-1">
                        <InputGroup label="Harga Offline" prefix="Rp" value={inputs.mainVal} onChange={(e) => handleInputChange('mainVal', e.target.value)} />
                      </div>
                      <div className="flex-1">
                        <div className="mb-1.5"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subsidi Toko</p></div>
                        <div className="bg-slate-50 border-2 border-slate-200 rounded-xl px-3 flex items-center transition-all focus-within:border-emerald-500 focus-within:bg-white focus-within:shadow-md h-[50px]">
                          <input type="text" inputMode="numeric" className="w-full bg-transparent outline-none font-bold text-slate-700 text-base tabular-nums placeholder:text-slate-300" value={inputs.subVal} onChange={(e) => handleInputChange('subVal', e.target.value)} />
                          <div className="flex bg-slate-200/60 rounded-lg p-1 ml-1 shrink-0 gap-1">
                            <button onClick={() => setSubMode('val')} className={`w-6 h-6 flex items-center justify-center text-[8px] font-black rounded transition-all ${subMode === 'val' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>Rp</button>
                            <button onClick={() => setSubMode('pct')} className={`w-6 h-6 flex items-center justify-center text-[8px] font-black rounded transition-all ${subMode === 'pct' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>%</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 items-end">
                      <InputGroup value={inputs.menuName} onChange={(e) => handleInputChange('menuName', e.target.value)} inputMode="text" />
                      <button onClick={addToCart} className="h-[50px] px-6 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl font-black text-[10px] uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2">Add <ArrowRight size={14} strokeWidth={3}/></button>
                    </div>
                  </Card>
                </div>

                {/* Right: Config */}
                <div className="h-full">
                  <Card className="h-full md:p-8 md:min-h-[320px] flex flex-col justify-center">
                    <Label icon={Settings}>3. Konfigurasi</Label>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                      <InputGroup label="Komisi (%)" value={inputs.kPct} type="number" onChange={(e) => handleInputChange('kPct', e.target.value)} />
                      <InputGroup label="Diskon (%)" value={inputs.vDisk} type="number" onChange={(e) => handleInputChange('vDisk', e.target.value)} />
                      <InputGroup label="Min. Order" value={inputs.minO} onChange={(e) => handleInputChange('minO', e.target.value)} />
                      <InputGroup label="Max. Disk" value={inputs.mDisk} onChange={(e) => handleInputChange('mDisk', e.target.value)} />
                    </div>
                  </Card>
                </div>

              </div>
            </div>
          )}
          
          {/* PAGE 2: CHECKOUT */}
          {page === 'checkout' && (
            <div className="space-y-6 pb-32">
              <header className="flex items-center gap-4 pt-4">
                  <h1 className="font-black uppercase text-sm tracking-[0.2em] text-white">Checkout</h1>
              </header>

              <div className="md:grid md:grid-cols-2 md:gap-6 space-y-6 md:space-y-0">
                <div className="space-y-6">
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
                                <div className="flex items-center gap-3 mt-1.5">
                                  <button onClick={() => updateCartQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-600"><Minus size={12} strokeWidth={3} /></button>
                                  <span className="text-xs font-black text-slate-800 w-3 text-center">{item.qty}</span>
                                  <button onClick={() => updateCartQty(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-lg hover:bg-slate-200 text-emerald-600"><Plus size={12} strokeWidth={3} /></button>
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
                </div>

                <div className="space-y-6 md:sticky md:top-24 md:h-fit">
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

                    <div className="bg-white/95 backdrop-blur-xl rounded-[32px] p-8 shadow-2xl border border-white/20">
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

                      {/* NEW: Total & Button for Desktop */}
                      <div className="hidden md:block pt-8 mt-6 border-t-2 border-slate-100/80">
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Tagihan</p>
                                <p className="text-4xl font-black text-slate-900 italic tracking-tighter">Rp {fNum(checkout.total)}</p>
                            </div>
                        </div>
                        <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-600/20 transition-all active:scale-[0.98] flex justify-center items-center gap-3 group">
                            Pesan Sekarang 
                            <ArrowRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform"/>
                        </button>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
          )}

          {/* PAGE 3: PROSPECT */}
          {page === 'prospect' && (
            <div className="space-y-6 pb-32">
               <header className="flex items-center gap-4 pt-4">
                  <h1 className="font-black uppercase text-sm tracking-[0.2em] text-white">Proyeksi Bisnis</h1>
                </header>
                
                <div className="md:grid md:grid-cols-2 md:gap-6 space-y-6 md:space-y-0">
                  <div className="space-y-6">
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
                        <div className="mt-6">
                          <div className="mb-2"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Total Order</p></div>
                          <div className="bg-white border-2 border-slate-200 rounded-2xl px-4 flex items-center transition-all focus-within:border-emerald-500 focus-within:shadow-md h-[54px]">
                            <input 
                              type="text" 
                              inputMode="numeric"
                              className="w-full bg-transparent outline-none font-black text-slate-700 text-lg tabular-nums placeholder:text-slate-300"
                              value={fNum(Math.round(pNum(histData.orders) * (1 + growthProj/100)))} 
                              onChange={(e) => handleTargetOrderChange(e.target.value)}
                            />
                            <span className="text-sm font-bold text-slate-400 ml-2">Order</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-900/80 backdrop-blur-xl rounded-[24px] p-6 border border-white/10 text-white">
                      <p className="text-[11px] font-black text-white/50 uppercase tracking-[0.2em] mb-6">Saat Ini (Avg 1 Thn)</p>
                      <div className="space-y-5">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Omset</p>
                          <p className="text-2xl font-black text-white">Rp {fNum(projection.hOmset)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Orders</p>
                          <p className="text-xl font-black text-white">{fNum(projection.hOrders)} <span className="text-sm text-slate-200 font-bold ml-1">({fNum(projection.hDailyOrders)}/hari)</span></p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">AOV (Rata-rata)</p>
                          <p className="text-xl font-black text-white">Rp {fNum(projection.hAOV)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Cost ({projection.hInvestPct}%)</p>
                          <p className="text-xl font-black text-rose-400">Rp {fNum(projection.hInvestAmount)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Net Profit</p>
                          <p className="text-xl font-black text-emerald-400">Rp {fNum(projection.hNet)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-emerald-600 rounded-[24px] p-6 border border-white/20 text-white relative overflow-hidden shadow-xl shadow-emerald-900/30">
                      <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                      <p className="text-[11px] font-black text-emerald-100 uppercase tracking-[0.2em] mb-6">Proyeksi Masa Depan</p>
                      <div className="space-y-5 relative z-10">
                        <div>
                          <p className="text-[10px] font-bold text-emerald-200 uppercase mb-1">Est. Omset</p>
                          <p className="text-3xl font-black text-white">Rp {fNum(projection.pOmset)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-emerald-200 uppercase mb-1">Est. Orders</p>
                          <p className="text-xl font-black text-white">{fNum(projection.pOrders)} <span className="text-sm text-white/90 font-bold ml-1">({fNum(projection.pDailyOrders)}/hari)</span></p>
                          <p className="text-[8px] text-emerald-300 mt-0.5 font-bold">+{growthProj.toFixed(0)}% dari Historis</p>
                        </div>
                        
                        {/* INPUT FUTURE COST */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                             <p className="text-[10px] font-bold text-emerald-200 uppercase">Est. Cost %</p>
                          </div>
                          <div className="flex items-center gap-2 bg-black/20 rounded-lg px-2 py-1 border border-white/10 w-fit">
                             <input 
                                type="number" 
                                value={futureCostPct}
                                onChange={(e) => setFutureCostPct(e.target.value)}
                                className="bg-transparent text-white font-bold text-lg w-12 outline-none text-center"
                             />
                             <span className="text-xs font-bold text-emerald-200">%</span>
                          </div>
                          <p className="text-sm font-bold text-white/80 mt-1">Rp {fNum(projection.pInvestTotal)}</p>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold text-emerald-200 uppercase mb-1">Est. Net Profit</p>
                          <p className="text-xl font-black text-[#FFD200]">Rp {fNum(projection.pNet)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-emerald-200 uppercase mb-1">AOV Baru (Dr Cart)</p>
                          <p className="text-sm font-bold text-white">Rp {fNum(projection.newAOV)}</p>
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
            </div>
          )}

          {/* PAGE 4: ADS */}
          {page === 'ads' && (
            <div className="space-y-6 pb-32">
              <header className="flex items-center gap-4 pt-4">
                <h1 className="font-black uppercase text-sm tracking-[0.2em] text-white">GrabFood Ads</h1>
              </header>

              <div className="md:grid md:grid-cols-2 md:gap-6 space-y-6 md:space-y-0">
                <div className="space-y-6">
                  <Card>
                    <Label icon={Megaphone}>Jenis Iklan</Label>
                    <div className="space-y-4">
                      <div 
                        onClick={() => setAdsType('keyword')}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${adsType === 'keyword' ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-100'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-black text-slate-800">Pencarian (Keyword)</h4>
                          {adsType === 'keyword' && <Check size={16} className="text-emerald-500" />}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Tampil paling atas saat pelanggan mencari makanan. Bayar hanya jika diklik (CPC). Cocok untuk menangkap niat beli tinggi.
                        </p>
                      </div>

                      <div 
                        onClick={() => setAdsType('banner')}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${adsType === 'banner' ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-100'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-black text-slate-800">Jelajah (Banner)</h4>
                          {adsType === 'banner' && <Check size={16} className="text-emerald-500" />}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Tampil di halaman utama sebagai rekomendasi. Bagus untuk membangun *brand awareness* ke pelanggan baru.
                        </p>
                      </div>

                      {/* NEW: Opsi Iklan Pesanan (Cost Per Order) */}
                      <div 
                        onClick={() => setAdsType('cpo')}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${adsType === 'cpo' ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-100'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-black text-slate-800">Pesanan (Cost Per Order)</h4>
                          {adsType === 'cpo' && <Check size={16} className="text-emerald-500" />}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Hanya bayar ketika order terjadi. Resiko rendah, cocok untuk memaksimalkan ROAS tanpa pusing memikirkan klik.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <Label icon={Target}>Targeting & Budget</Label>
                    <div className="space-y-4">
                      <InputGroup label="Budget Harian" prefix="Rp" value={adsBudget} onChange={(e) => setAdsBudget(e.target.value)} />
                      
                      {/* NEW: Custom CPC & CVR Input */}
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <InputGroup 
                            label={adsType === 'cpo' ? "Biaya per Order" : "Max CPC (Bid)"}
                            prefix="Rp" 
                            value={cpcBid} 
                            onChange={(e) => setCpcBid(e.target.value)} 
                            inputMode="numeric"
                          />
                        </div>
                        {/* CVR Input disembunyikan jika tipe CPO karena kurang relevan buat user biasa */}
                        {adsType !== 'cpo' && (
                          <div className="flex-1">
                            <InputGroup 
                              label="Est. CVR (%)" 
                              suffix="%" 
                              value={adsCvr} 
                              onChange={(e) => setAdsCvr(e.target.value)} 
                              inputMode="decimal"
                            />
                          </div>
                        )}
                      </div>
  
                      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
                        <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-[10px] text-blue-700 font-medium">
                          {adsType === 'cpo' 
                            ? <span>Anda hanya akan ditagih <b>Rp {cpcBid}</b> setiap kali ada pesanan masuk dari iklan.</span>
                            : <span>Default: CPC <span className="font-black">Rp {adsType === 'keyword' ? '2.500' : '800'}</span>, CVR <span className="font-black">{adsType === 'keyword' ? '15' : '5'}%</span>. Ubah untuk simulasi manual.</span>
                          }
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="space-y-6 h-full">
                  <div className="bg-white/95 backdrop-blur-xl rounded-[32px] p-8 shadow-2xl border border-white/20 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-6">
                        <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
                          <Zap size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-slate-500">Estimasi Hasil Harian</span>
                      </div>

                      <div className="grid grid-cols-2 gap-6 mb-8">
                        <div>
                          {adsType === 'cpo' ? (
                            <>
                               <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Est. Belanja Iklan</p>
                               <p className="text-2xl font-black text-slate-800">Rp {fNum(adsSim.actualCost)}</p>
                            </>
                          ) : (
                            <>
                               <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Est. Klik</p>
                               <p className="text-2xl font-black text-slate-800">{fNum(adsSim.estClicks)}</p>
                               <p className="text-[9px] text-emerald-500 font-bold flex items-center gap-1 mt-1">
                                 <MousePointer2 size={8} /> Klik
                               </p>
                            </>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Est. Order</p>
                          <p className="text-2xl font-black text-slate-800">{fNum(adsSim.estOrders)}</p>
                          {adsType !== 'cpo' && (
                            <p className="text-[9px] text-slate-400 font-bold mt-1">
                              CVR {(adsSim.cvr * 100).toFixed(0)}%
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-black text-slate-400 uppercase">Potensi Omset</span>
                        <span className="text-2xl font-black text-emerald-600">Rp {fNum(adsSim.estGrossSales)}</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-500">ROAS (Return on Ad Spend)</span>
                        <span className="text-sm font-black text-slate-800">{adsSim.roas.toFixed(1)}x</span>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-3 text-center italic">
                        *Estimasi berdasarkan rata-rata AOV Rp {fNum(adsSim.baseAOV)}. Hasil aktual dapat bervariasi.
                      </p>
                    </div>
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
            <button onClick={() => setPage('ads')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${page === 'ads' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100'}`}>
              <Megaphone size={18} strokeWidth={2.5}/>
            </button>
          </div>
        </nav>

        {/* CHECKOUT BUTTON */}
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
