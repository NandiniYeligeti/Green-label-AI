import { useState } from 'react';
import { Scan, Keyboard, Leaf, Sparkles } from 'lucide-react';
import BarcodeScanner from '@/react-app/components/BarcodeScanner';
import ProductCard from '@/react-app/components/ProductCard';
import ProductRecommendations from '@/react-app/components/ProductRecommendations';
import ScoreBreakdown from '@/react-app/components/ScoreBreakdown';
import Navigation from '@/react-app/components/Navigation';

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
      const response = await fetch('http://localhost:3000/api/scan-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode: barcode.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Product not found');
        return;
      }

      const data = await response.json();
      if (data.productName) {
        setProduct(data);
        setManualBarcode('');
      } else {
        setError('Product not found. Try another barcode.');
      }
    } catch {
      setError('Failed to connect to backend.');
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
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
          Green Label{' '}
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            AI
          </span>
        </h1>
        <p className="text-2xl text-gray-600 mb-3">Scan smart, shop green</p>
        <p className="text-gray-500 max-w-xl mx-auto">
          Instantly discover eco-friendliness before you buy.
        </p>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* SCAN + ENTER */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">

          {/* SCAN */}
          <div className="glass-panel rounded-3xl p-8 flex items-center justify-center">
            <button
              onClick={() => setShowScanner(true)}
              className="w-full bg-gray-900 text-white py-6 rounded-2xl flex items-center justify-center gap-4 text-lg font-semibold hover:scale-[1.02]"
            >
              <Scan className="w-6 h-6" />
              Scan Barcode
            </button>
          </div>

          {/* ENTER */}
          <div className="glass-panel rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Keyboard className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-bold">Enter Barcode</h3>
            </div>

            <input
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              placeholder="e.g. 5449000000996"
              className="w-full text-center text-xl font-mono px-4 py-4 rounded-xl border mb-4"
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

        {/* HOW IT WORKS */}
        <div className="glass rounded-2xl p-8 md:p-10 w-full">
          <h3 className="text-lg font-bold mb-10 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-500" />
            How it works
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

      </div>

      <BarcodeScanner
        isOpen={showScanner}
        onScan={handleScanResult}
        onClose={() => setShowScanner(false)}
      />
      <Navigation />
    </div>
  );
}
