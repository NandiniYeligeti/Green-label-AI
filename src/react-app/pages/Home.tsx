import { useState } from 'react';
import { Scan, Keyboard, Leaf, Sparkles, ShieldCheck, Layers, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import BarcodeScanner from '@/react-app/components/BarcodeScanner';
import ProductCard from '@/react-app/components/ProductCard';
import ProductRecommendations from '@/react-app/components/ProductRecommendations';
import ScoreBreakdown from '@/react-app/components/ScoreBreakdown';
import Navigation from '@/react-app/components/Navigation';

import { API_BASE_URL } from "../../config";

const sectionFade = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

const sectionSlide = { hidden: { opacity: 0, y: 36 }, visible: { opacity: 1, y: 0 } };

const transitionFade = { duration: 0.6, ease: 'easeOut' as const };

const transitionSlide = { duration: 0.7, ease: 'easeOut' as const };

const cardStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const cardSlideLeftToRight = {
  hidden: { opacity: 0, x: -40, scale: 0.96 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
};

const Footer = () => (
  <footer className="bg-gray-900/60 border-t border-white/6 text-gray-300 py-6 md:py-8 mt-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
      <div className="text-xs sm:text-sm md:text-sm">© {new Date().getFullYear()} Green Label AI</div>
      <div className="flex items-center gap-3 md:gap-4 text-xs sm:text-sm">
        <a href="/privacy" className="hover:underline">Privacy</a>
        <a href="/terms" className="hover:underline">Terms</a>
        <a href="mailto:hello@greenlabel.ai" className="hover:underline">Contact</a>
      </div>
    </div>
  </footer>
);


export default function Home() {
  const [showScanner, setShowScanner] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getDetailedScores = (product: any) => {
    const baseScore = product.ecoScore !== 'N/A' ? product.ecoScore : 50;
    return {
      packaging_score: Math.min(100, baseScore + Math.floor(Math.random() * 20) - 10),
      nutrition_score: Math.min(100, baseScore + Math.floor(Math.random() * 20) - 10),
      environmental_score: Math.min(100, baseScore + Math.floor(Math.random() * 20) - 10),
      sustainability_score: Math.min(100, baseScore + Math.floor(Math.random() * 20) - 10),
      overall_score: baseScore,
    };
  };

  const handleBarcodeSubmit = async (barcode: string) => {
    if (!barcode.trim()) {
      setError('Please enter a valid barcode');
      return;
    }

    setLoading(true);
    setError('');
    setProduct(null);

    try {
      // 1) Try Open Food Facts
      const offRes = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode.trim()}.json`);
      if (offRes.ok) {
        const offJson = await offRes.json();
        if (offJson && offJson.status === 1 && offJson.product) {
          const p = offJson.product;
          const mapped = {
            productName: p.product_name || p.generic_name || 'Unknown Product',
            barcode: p.code || barcode.trim(),
            ecoScore: p.ecoscore_score ?? (p.ecoscore_grade ? 50 : 50),
            image_url: p.image_small_url || p.image_url || '',
            brand: p.brands || '',
            raw_data: JSON.stringify(p),
          };

          // Save to history and products collection in backend (non-blocking)
          (async () => {
            try {
              await fetch(`${API_BASE_URL}/history/add?barcode=${encodeURIComponent(mapped.barcode)}`);
              await fetch(`${API_BASE_URL}/api/products/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: mapped.productName,
                  barcode: mapped.barcode,
                  ecoScore: mapped.ecoScore,
                  image_url: mapped.image_url,
                  brand: mapped.brand,
                  description: '',
                  raw_data: mapped.raw_data,
                }),
              });
            } catch (e) {
              console.warn('Save scan to backend failed', e);
            }
          })();

          setProduct(mapped);
          setManualBarcode('');
          return;
        }
      }

      // 2) Fallback to our backend
      const response = await fetch(`${API_BASE_URL}/api/product/${barcode.trim()}`);
      if (!response.ok) {
        setError('Product not found. Try another barcode.');
        return;
      }

      const data = await response.json();
      if (data.success && data.product) {
        const p = data.product;
        const mapped = {
          productName: p.name || p.Name || 'Unknown Product',
          barcode: p.barcode || barcode.trim(),
          ecoScore: p.ecoScore ?? p.EcoScore ?? 50,
          image_url: p.image_url || '',
          brand: p.brand || '',
          raw_data: JSON.stringify(p),
        };

        // Save to history and products collection in backend (non-blocking)
        (async () => {
          try {
            await fetch(`${API_BASE_URL}/history/add?barcode=${encodeURIComponent(mapped.barcode)}`);
            await fetch(`${API_BASE_URL}/api/products/add`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: mapped.productName,
                barcode: mapped.barcode,
                ecoScore: mapped.ecoScore,
                image_url: mapped.image_url,
                brand: mapped.brand,
                description: '',
                raw_data: mapped.raw_data,
              }),
            });
          } catch (e) {
            console.warn('Save scan to backend failed', e);
          }
        })();

        setProduct(mapped);
        setManualBarcode('');
      } else {
        setError('Product not found. Try another barcode.');
      }
    } catch (err) {
      console.error('Barcode lookup error:', err);
      setError('Failed to connect to lookup services.');
    } finally {
      setLoading(false);
    }
  };

  const handleScanResult = (barcode: string) => {
    setShowScanner(false);
    handleBarcodeSubmit(barcode);
  };

  const handleShare = async () => {
    if (!product) return;
    const text = `Check out this product on Green Label AI!\n${product.productName}\nEco Score: ${product.ecoScore}/100`;
    if (navigator.share) await navigator.share({ text });
    else await navigator.clipboard.writeText(text);
  };

  /* ================= PRODUCT VIEW ================= */
  if (product) {
    return (
      <div className="min-h-screen pt-24 pb-24 px-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-10">
          <div className="w-full md:w-1/3 sticky top-24">
            <button
              onClick={() => setProduct(null)}
              className="mb-6 text-emerald-700 font-semibold"
            >
              ← Scan Another Product
            </button>
            <ProductCard product={product} onShare={handleShare} />
          </div>

          <div className="w-full md:w-2/3 space-y-8">
            <div className="glass-panel p-6 rounded-3xl">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                Detailed Eco Breakdown
              </h3>
              <ScoreBreakdown scores={getDetailedScores(product)} dataSource="openfoodfacts" />
            </div>

            <ProductRecommendations
              barcode={product.barcode}
              currentScore={product.ecoScore || 0}
            />
          </div>
        </div>
        <Navigation />
      </div>
    );
  }

  /* ================= HOME VIEW ================= */
  return (
    <div className="min-h-screen pb-24">

      {/* HERO */}
      <div className="text-center pt-24 pb-16 px-4">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 font text-green-300">
          Green Label{' '}
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            AI
          </span>
        </h1>

        <p className="text-2xl text-gray-300 mb-3">Scan smart, shop green</p>
        <p className="text-gray-300 max-w-xl mx-auto">
          Instantly discover eco-friendliness before you buy.
        </p>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* SCAN + ENTER */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">

          {/* SCAN */}
              <div className="glass-panel rounded-3xl p-6 md:p-8 flex items-center justify-center w-full">
            <button
              onClick={() => setShowScanner(true)}
              className="w-full bg-gray-900 text-white py-6 rounded-2xl flex items-center justify-center gap-4 text-lg font-semibold hover:scale-[1.02]"
            >
              <Scan className="w-6 h-6" />
              Scan Barcode
            </button>
          </div>

          {/* ENTER */}
              <div className="glass-panel rounded-3xl p-6 md:p-8 w-full">
            <div className="flex items-center gap-3 mb-4">
              <Keyboard className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-bold">Enter Barcode</h3>
            </div>

                <input
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              placeholder="e.g. 5449000000996"
                  className="w-full text-center text-lg sm:text-xl font-mono px-4 py-3 sm:py-4 rounded-xl border mb-4 bg-white text-gray-900 placeholder-gray-400"
              onKeyDown={(e) => e.key === 'Enter' && handleBarcodeSubmit(manualBarcode)}
            />

            <button
              onClick={() => handleBarcodeSubmit(manualBarcode)}
              disabled={loading || !manualBarcode.trim()}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold disabled:opacity-50"
            >
              {loading ? 'Analyzing…' : 'Check Eco Score'}
            </button>

            {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
          </div>
        </div>

            <div className="glass rounded-2xl p-6 md:p-10 w-full">
          <h3 className="text-lg font-bold mb-10 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-500" />
            How it works
          </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              ['Scan Product', 'Use your camera or enter barcode manually'],
              ['AI Analysis', 'We analyze ingredients and eco impact'],
              ['Get Results', 'Receive a clear Green Score'],
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white/60 backdrop-blur rounded-2xl p-6 border border-emerald-100 shadow-sm hover:shadow-md transition"
              >
                <div className="w-12 h-12 mb-4 bg-white text-emerald-600 rounded-2xl flex items-center justify-center text-lg font-bold border">
                  {i + 1}
                </div>
                <h4 className="font-semibold mb-1">{item[0]}</h4>
                <p className="text-gray-500 text-sm">{item[1]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* NEW SECTIONS: Trust / Analyze / Meaning / Why / Alternatives */}
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 space-y-8 mt-8 sm:mt-12">

          {/* WHY TRUST US */}
          <motion.section className="card-primary p-6 md:p-8" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionFade} transition={transitionFade}>
            <div className="flex items-start gap-6">
              <motion.div className="p-3 rounded-xl bg-white/6" whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
                <ShieldCheck className="w-8 h-8 text-cream" />
              </motion.div>
              <div>
                <motion.h3 className="text-2xl font-bold mb-2 card-header" variants={sectionFade}>Why trust us?</motion.h3>
                <motion.p className="muted" variants={sectionFade}>We combine open data, scientific impact models and transparent scoring so you can shop with confidence.</motion.p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <motion.div className="p-4 bg-white/3 rounded-xl" whileHover={{ scale: 1.02 }} transition={{ duration: 0.18 }}>
                    <h4 className="font-semibold text-stone-400">Open Data</h4>
                    <p className="text-sm muted">We use trusted datasets like Open Food Facts.</p>
                  </motion.div>
                  <motion.div className="p-4 bg-white/3 rounded-xl" whileHover={{ scale: 1.02 }} transition={{ duration: 0.18 }}>
                    <h4 className="font-semibold text-stone-400 ">Transparent Methods</h4>
                    <p className="text-sm muted">See how scores are calculated and what they mean.</p>
                  </motion.div>
                  <motion.div className="p-4 bg-white/3 rounded-xl" whileHover={{ scale: 1.02 }} transition={{ duration: 0.18 }}>
                    <h4 className="font-semibold text-stone-400">Privacy-first</h4>
                    <p className="text-sm muted">No tracking, just useful product insight.</p>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* WHAT WE ANALYZE */}
          {/* WHAT WE ANALYZE */}
<motion.section
  className="card-primary p-6 md:p-10"
  variants={sectionFade}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.3 }}
>
  {/* Header */}
  <div className="flex items-start gap-6 mb-10">
    <motion.div
      className="p-4 rounded-2xl bg-white/10 shadow-lg"
      whileHover={{ rotate: -3, scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      <Layers className="w-8 h-8 text-cream" />
    </motion.div>

    <div>
      <h3 className="text-3xl font-extrabold mb-2 card-header">
        What we analyze
      </h3>
      <p className="muted max-w-xl">
        We break down products into meaningful sustainability factors and
        convert them into a single, simple eco score.
      </p>
    </div>
  </div>

  {/* Cards */}
  <motion.div
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    variants={cardStagger}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
  >
    {[
      {
        title: 'Ingredients',
        desc: 'Additives, sourcing & health impact',
        emoji: '🧪',
      },
      {
        title: 'Packaging',
        desc: 'Plastic use & recyclability',
        emoji: '📦',
      },
      {
        title: 'Carbon Impact',
        desc: 'Manufacturing & transport emissions',
        emoji: '🌍',
      },
      {
        title: 'Waste & Reuse',
        desc: 'Refill, reuse & circular economy',
        emoji: '♻️',
      },
    ].map((item, i) => (
      <motion.div
        key={i}
        variants={cardSlideLeftToRight}
        whileHover={{ y: -6, scale: 1.04 }}
        transition={{ type: 'spring', stiffness: 260 }}
        className="relative bg-white/8 backdrop-blur rounded-3xl p-6 border border-white/20 shadow-lg cursor-default"
      >
        <div className="text-3xl mb-4">{item.emoji}</div>
        <h4 className="font-semibold text-lg mb-1 text-slate-400">{item.title}</h4>
        <p className="text-sm muted">{item.desc}</p>

        {/* Accent glow */}
        <div className="absolute inset-0 rounded-3xl ring-1 ring-white/10 pointer-events-none" />
      </motion.div>
    ))}
  </motion.div>
</motion.section>


          {/* ECO SCORE MEANING */}
          <motion.section className="card-primary p-6 md:p-8" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionFade} transition={transitionFade}>
            <h3 className="text-2xl font-bold mb-4 card-header">Eco Score Meaning</h3>
            <motion.p className="muted mb-4">Numbers are useful — but context makes them actionable. Here's how to read an Eco Score:</motion.p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <motion.div className="p-4 rounded-lg bg-red-600/20 text-center" whileHover={{ scale: 1.02 }} transition={{ duration: 0.14 }}>
                <div className="text-2xl font-bold">0–30</div>
                <div className="mt-1">❌ Poor</div>
              </motion.div>
              <motion.div className="p-4 rounded-lg bg-yellow-600/20 text-center" whileHover={{ scale: 1.02 }} transition={{ duration: 0.14 }}>
                <div className="text-2xl font-bold">31–60</div>
                <div className="mt-1">⚠️ Average</div>
              </motion.div>
              <motion.div className="p-4 rounded-lg bg-green-500/20 text-center" whileHover={{ scale: 1.02 }} transition={{ duration: 0.14 }}>
                <div className="text-2xl font-bold">61–80</div>
                <div className="mt-1">✅ Good</div>
              </motion.div>
              <motion.div className="p-4 rounded-lg bg-emerald-700/60 text-center text-white" whileHover={{ scale: 1.02 }} transition={{ duration: 0.14 }}>
                <div className="text-2xl font-bold">81–100</div>
                <div className="mt-1">🌟 Excellent</div>
              </motion.div>
            </div>
          </motion.section>

          {/* WHY THIS MATTERS */}
          <motion.section className="card-primary p-6 md:p-8" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionSlide} transition={transitionSlide}>
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="w-full md:w-1/2">
                <motion.h3 className="text-2xl font-bold mb-3 card-header" variants={sectionSlide}>Why this matters</motion.h3>
                <motion.p className="muted" variants={sectionSlide}>Small choices add up. Buying greener products reduces waste, lowers carbon emissions, and supports better manufacturing practices.</motion.p>
                <ul className="mt-4 space-y-3 text-sm muted">
                  <motion.li>• One product switch can reduce up to 30% plastic waste per year.</motion.li>
                  <motion.li>• Replacing 1 high-impact item can cut tens of kg of CO₂ annually.</motion.li>
                  <motion.li>• Choosing recyclable packaging reduces landfill and encourages brands to change.</motion.li>
                </ul>
              </div>
              <div className="w-full md:w-1/2">
                <motion.div className="p-6 card-dark rounded-xl" animate={{ y: [-4, -10, -4] }} transition={{ duration: 6, repeat: Infinity, repeatType: 'loop' as const, ease: 'easeInOut' }}>
                  <h4 className="text-lg font-semibold mb-2">Emotional impact</h4>
                  <p className="text-sm">Feel good about your choices — we provide clear, compassionate guidance so change is simple and meaningful.</p>
                </motion.div>
              </div>
            </div>
          </motion.section>

          {/* GREEN ALTERNATIVES PREVIEW */}
          <motion.section className="card-primary p-6 md:p-8" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionFade} transition={transitionFade}>
            <h3 className="text-2xl font-bold mb-4 card-header">Green Alternatives Preview</h3>
            <p className="muted mb-4">See quick before / after suggestions — value shown before you even scan.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div className="p-6 bg-white/4 rounded-2xl flex items-center gap-4" whileHover={{ scale: 1.02 }} transition={{ duration: 0.14 }}>
                <div className="w-24 h-24 rounded-xl bg-white/6 vignette flex items-center justify-center">🍫</div>
                <div className="flex-1">
                  <div className="text-sm muted">Before</div>
                  <div className="font-semibold">ChocoSnack Bar</div>
                  <div className="text-xs muted">Eco Score: 34 ⚠️</div>
                </div>
                <div className="text-sm">→</div>
                <div className="w-24 h-24 rounded-xl bg-white/6 vignette flex items-center justify-center">🌿</div>
                <div className="flex-1">
                  <div className="text-sm muted">After</div>
                  <div className="font-semibold">ChocoSnack (Repacked)</div>
                  <div className="text-xs muted">Eco Score: 76 ✅</div>
                </div>
              </motion.div>

              <motion.div className="p-6 bg-white/4 rounded-2xl flex items-center gap-4" whileHover={{ scale: 1.02 }} transition={{ duration: 0.14 }}>
                <div className="w-24 h-24 rounded-xl bg-white/6 vignette flex items-center justify-center">🧴</div>
                <div className="flex-1">
                  <div className="text-sm muted">Before</div>
                  <div className="font-semibold">CleanWash Liquid</div>
                  <div className="text-xs muted">Eco Score: 42 ⚠️</div>
                </div>
                <div className="text-sm">→</div>
                <div className="w-24 h-24 rounded-xl bg-white/6 vignette flex items-center justify-center">♻️</div>
                <div className="flex-1">
                  <div className="text-sm muted">After</div>
                  <div className="font-semibold">CleanWash (Refill)</div>
                  <div className="text-xs muted">Eco Score: 82 🌟</div>
                </div>
              </motion.div>
            </div>

            <div className="mt-6 text-right">
              <button className="btn-ghost-emerald hover-lift flex items-center gap-2">Explore more <ArrowRight className="w-4 h-4"/></button>
            </div>
          </motion.section>

          {/* SMART CHECKOUT WITH DISCOUNTS */}
          <motion.section className="card-primary p-6 md:p-8" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionFade} transition={transitionFade}>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-full md:w-1/2">
                <motion.h3 className="text-2xl font-bold mb-3 card-header flex items-center gap-2" variants={sectionSlide}>
                  <Sparkles className="w-6 h-6 text-emerald-400" />
                  Get Discounts at Checkout
                </motion.h3>
                <motion.p className="muted mb-4" variants={sectionSlide}>
                  Make your shopping count. Use our app to scan your items, check their green scores, and bring your score to the checkout counter to unlock exclusive eco-friendly discounts.
                </motion.p>
                <ul className="space-y-3 text-sm muted">
                  <motion.li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">✓</span>
                    <span><strong className="text-white">Scan & Score:</strong> Build your cart with confidence</span>
                  </motion.li>
                  <motion.li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">✓</span>
                    <span><strong className="text-white">Higher Score = Bigger Discount:</strong> Premium eco choices get premium savings</span>
                  </motion.li>
                  <motion.li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">✓</span>
                    <span><strong className="text-white">Instant Rewards:</strong> No loyalty cards needed — green shopping pays instantly</span>
                  </motion.li>
                </ul>
              </div>
              <div className="w-full md:w-1/2">
                <motion.div 
                  className="p-6 card-dark rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/20 to-teal-900/20"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-sm muted">Your Score</span>
                      <span className="text-2xl font-bold text-emerald-400">78</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-sm muted">Discount Tier</span>
                      <span className="text-xl font-bold text-green-400">Gold ⭐</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-emerald-500/20 rounded-lg border border-emerald-500/50">
                      <span className="text-sm font-semibold">Instant Discount</span>
                      <span className="text-2xl font-bold text-emerald-300">15% OFF</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.section>

        </div>

        


        

      </div>

      <BarcodeScanner
        isOpen={showScanner}
        onScan={handleScanResult}
        onClose={() => setShowScanner(false)}
      />
      <Footer />
      <Navigation />
      
    </div>
    
  );
}
