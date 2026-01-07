import { useState } from 'react';
import { ShoppingBasket as BasketIcon, Trash2, Plus, Sparkles, AlertCircle, CheckCircle2, Scan } from 'lucide-react';
import Navigation from '@/react-app/components/Navigation';
import BarcodeScanner from '@/react-app/components/BarcodeScanner';

interface BasketItem {
    barcode: string;
    product_name: string;
    carbon: number;
    health_score: number;
}

interface BasketResult {
    total_items: number;
    total_carbon: number;
    avg_health_score: number;
    items: BasketItem[];
}

import { API_BASE_URL } from "../../config";

export default function ShoppingBasket() {
    const [barcodes, setBarcodes] = useState<string[]>([]);
    const [currentBarcode, setCurrentBarcode] = useState('');
    const [basketResult, setBasketResult] = useState<BasketResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [showScanner, setShowScanner] = useState(false);

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
            }
        } catch (error) {
            console.error('Failed to analyze basket', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 pb-20">
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-2xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-3 mb-2">
                        <BasketIcon className="w-8 h-8 text-emerald-600" />
                        <h1 className="text-2xl font-bold text-gray-900">Shopping Basket</h1>
                    </div>
                    <p className="text-gray-600">Scan multiple items to see your total impact.</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Input Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Add Product Barcodes</label>
                    <div className="flex gap-2">
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
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
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
                        <div className="grid grid-cols-2 gap-4">
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
                                        <div>
                                            <p className="font-medium text-gray-900">{item.product_name || `Item ${item.barcode}`}</p>
                                            <p className="text-sm text-gray-500">{item.barcode}</p>
                                        </div>
                                        <div className="text-right">
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
