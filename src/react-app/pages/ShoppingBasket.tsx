import { useState } from 'react';
import { ShoppingBasket as BasketIcon, Trash2, Plus, AlertCircle, CheckCircle2, Scan, Sparkles } from 'lucide-react';
import Navigation from '@/react-app/components/Navigation';
import BarcodeScanner from '@/react-app/components/BarcodeScanner';

interface BasketItem {
    barcode: string;
    product_name: string;
    name?: string;
    productName?: string;
    carbon: number;
    health_score: number;
    image_url?: string;
    brand?: string;
}

interface BasketResult {
    total_items: number;
    total_carbon: number;
    avg_health_score: number;
    items: BasketItem[];
}

import { API_BASE_URL } from "../../config";
import { useEffect } from 'react';

export default function ShoppingBasket() {
    const [barcodes, setBarcodes] = useState<string[]>([]);
    const [currentBarcode, setCurrentBarcode] = useState('');
    const [basketResult, setBasketResult] = useState<BasketResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [previousBaskets, setPreviousBaskets] = useState<any[]>([]);

    const addBarcode = (code?: string) => {
        const barcodeToAdd = code || currentBarcode;
        if (barcodeToAdd && !barcodes.includes(barcodeToAdd)) {
            setBarcodes([...barcodes, barcodeToAdd]);
            setCurrentBarcode('');
        }
    };

    const handleScanResult = (code: string) => {
        setShowScanner(false);
        addBarcode(code);
    };

    const removeBarcode = (code: string) => {
        setBarcodes(barcodes.filter(b => b !== code));
    };

    const analyzeBasket = async () => {
        if (barcodes.length === 0) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/basket`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ barcodes }),
            });
            const data = await response.json();
            if (data.success) {
                setBasketResult(data.basket);

                // Save this basket to backend for history
                try {
                    const saveRes = await fetch(`${API_BASE_URL}/api/basket/save`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ barcodes }),
                    });
                    const saveJson = await saveRes.json();
                    if (saveJson.success) {
                        // prepend saved basket to list
                        setPreviousBaskets(prev => [saveJson.basket, ...prev]);
                    }
                } catch (e) {
                    console.warn('Failed to save basket', e);
                }
            }
        } catch (error) {
            console.error('Failed to analyze basket', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // fetch previous saved baskets
        (async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/baskets`);
                const json = await res.json();
                if (json && json.success) setPreviousBaskets(json.baskets || []);
            } catch (e) {
                console.warn('Failed to load previous baskets', e);
            }
        })();
    }, []);

    // Client-side fallback: if basketResult items lack a product name, try to fetch product details
    useEffect(() => {
        if (!basketResult || !basketResult.items || basketResult.items.length === 0) return;

        const needsLookup = basketResult.items.filter(i => !i.product_name && !i.name && !i.productName);
        if (needsLookup.length === 0) return;

        let cancelled = false;

        (async () => {
            try {
                const lookups = await Promise.all(needsLookup.map(async (it) => {
                    try {
                        const res = await fetch(`${API_BASE_URL}/api/product/${encodeURIComponent(it.barcode)}`);
                        if (!res.ok) return null;
                        const json = await res.json();
                        return json && json.product ? json.product : null;
                    } catch (e) {
                        return null;
                    }
                }));

                if (cancelled) return;

                const enriched = basketResult.items.map((it) => {
                    const found = lookups.find(l => l && (l.barcode === it.barcode || l.code === it.barcode));
                    if (!found) return it;

                    return {
                        ...it,
                        product_name: it.product_name || found.product_name || found.name || found.productName || found.title || it.product_name,
                        image_url: it.image_url || found.image_url || found.image_small_url || found.image || it.image_url,
                        brand: it.brand || found.brand || found.brands || found.manufacturer || it.brand,
                    };
                });

                setBasketResult(prev => prev ? { ...prev, items: enriched } : prev);
            } catch (e) {
                console.warn('Basket item lookup failed', e);
            }
        })();

        return () => { cancelled = true; };
    }, [basketResult]);

    return (
        <div className="min-h-screen pb-20" style={{ background: 'var(--page-bg)' }}>
            <div className="border-b" style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="max-w-2xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-3 mb-2">
                        <BasketIcon className="w-8 h-8" style={{ color: 'var(--cream)' }} />
                        <h1 className="text-2xl font-bold" style={{ color: 'var(--cream)' }}>Shopping Basket</h1>
                    </div>
                    <p className="text-gray-400">Scan multiple items to see your total impact.</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

                {/* Green Box Banner */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden mb-6">
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold mb-1">Smart Checkout With Green Score</h2>
                            <p className="text-emerald-50 text-sm opacity-90">Scan your products here, then go to the counter with your score to unlock eco-friendly discounts!</p>
                        </div>
                        <Sparkles className="w-8 h-8 text-emerald-200" />
                    </div>

                    {/* Decorative circles */}
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl"></div>
                </div>

                {/* Input Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Add Product Barcodes</label>
                    <div className="flex flex-col md:flex-row gap-2">
                        <button
                            onClick={() => setShowScanner(true)}
                            className="bg-gray-900 text-white p-3 rounded-xl hover:bg-gray-800 transition-colors"
                            title="Scan Barcode"
                        >
                            <Scan className="w-6 h-6" />
                        </button>
                        <input
                            type="text"
                            value={currentBarcode}
                            onChange={(e) => setCurrentBarcode(e.target.value)}
                            placeholder="e.g. 5449000000996"
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && addBarcode()}
                        />
                        <button
                            onClick={() => addBarcode()}
                            className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 transition-colors"
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Barcode List */}
                    {barcodes.length > 0 && (
                        <div className="mt-6 flex flex-wrap gap-2">
                            {barcodes.map((code) => (
                                <span key={code} className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                                    {code}
                                    <button onClick={() => removeBarcode(code)} className="hover:text-red-500">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Previous baskets */}
                    {previousBaskets.length > 0 && (
                        <div className="mt-6">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Previous Baskets</h4>
                            <div className="flex flex-col gap-2">
                                {previousBaskets.map((b) => (
                                    <button
                                        key={b.id ?? b._id}
                                        onClick={() => setBasketResult(b)}
                                        className="text-left bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-gray-900">{b.total_items} items</div>
                                            <div className="text-sm text-gray-600">{(b.total_carbon || 0).toFixed ? b.total_carbon.toFixed(1) + ' kg' : b.total_carbon}</div>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">{b.created_at ? new Date(b.created_at).toLocaleString() : ''}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {barcodes.length > 0 && (
                        <button
                            onClick={analyzeBasket}
                            disabled={loading}
                            className="mt-6 w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-semibold shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Analyze Basket Impact
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Results Section */}
                {basketResult && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl text-white shadow-lg">
                                <div className="flex items-center gap-2 mb-2 opacity-90">
                                    <AlertCircle className="w-5 h-5" />
                                    <span className="font-medium">Total Carbon</span>
                                </div>
                                <div className="text-3xl font-bold">{basketResult.total_carbon.toFixed(1)} <span className="text-lg font-normal opacity-80">kg CO2</span></div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2 text-gray-600">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    <span className="font-medium">Avg Health Score</span>
                                </div>
                                <div className="text-3xl font-bold text-gray-900">{Math.round(basketResult.avg_health_score)}<span className="text-lg text-gray-400">/100</span></div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="font-semibold text-gray-900">Basket Breakdown</h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {basketResult.items.map((item) => (
                                    <div key={item.barcode} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.product_name || item.barcode} className="w-12 h-12 rounded-lg object-cover" loading="lazy" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-600">{item.product_name ? item.product_name.charAt(0) : '🍏'}</div>
                                            )}

                                            <div>
                                                <p className="font-medium text-gray-900">{item.product_name || `Item ${item.barcode}`}</p>
                                                <p className="text-sm text-gray-500">{item.brand ? item.brand : item.barcode}</p>
                                            </div>
                                        </div>

                                        <div className="text-right ml-4">
                                            <div className="text-sm font-medium text-gray-900">{item.carbon.toFixed(1)} kg CO2</div>
                                            <div className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1 ${item.health_score >= 70 ? 'bg-green-100 text-green-700' :
                                                item.health_score >= 40 ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                Score: {item.health_score}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
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
