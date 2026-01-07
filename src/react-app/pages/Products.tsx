import { useState, useEffect } from 'react';
import { Search, Package, Leaf, Filter, ScanLine, Sparkles } from 'lucide-react';
import { ProductType } from '@/shared/types';
import Navigation from '@/react-app/components/Navigation';
import { Link } from 'react-router';

import { API_BASE_URL } from "../../config";

export default function Products() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'score' | 'name'>('newest');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/products`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.products || []);
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = products;

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = products.filter(product =>
        product.name?.toLowerCase().includes(term) ||
        product.brand?.toLowerCase().includes(term) ||
        product.barcode.includes(term)
      );
    }

    // Sort products
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return (b.green_score || 0) - (a.green_score || 0);
        case 'name':
          return (a.name || 'Unknown').localeCompare(b.name || 'Unknown');
        case 'newest':
        default:
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
    });

    setFilteredProducts(filtered);
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-500';
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number | null) => {
    if (!score) return 'bg-gray-100';
    if (score >= 70) return 'bg-green-100';
    if (score >= 40) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-20 md:pt-20">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto mb-6"></div>
            <p className="text-gray-500 font-medium">Loading database...</p>
          </div>
        </div>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pt-20">
      {/* Header */}
      <div className="glass-panel sticky top-0 md:top-20 z-40 border-b border-white/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                <p className="text-xs text-gray-500 font-medium">{products.length} items scanned</p>
              </div>
            </div>

            {/* Sort Options - Desktop Right */}
            <div className="flex items-center gap-2 md:order-last">
              <div className="bg-white/80 p-1 rounded-lg border border-gray-200 flex items-center shadow-sm">
                <Filter className="w-4 h-4 text-gray-400 ml-2" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-sm bg-transparent border-none rounded-md px-2 py-1 focus:ring-0 text-gray-700 font-medium cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="score">Top Rated</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Green Box Banner */}
          <div className="mb-6 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold mb-1">Browse Eco-Friendly Products</h2>
                <p className="text-emerald-50 text-sm opacity-90">Find the best sustainable options for your lifestyle</p>
              </div>
              <Sparkles className="w-8 h-8 text-emerald-200 animate-pulse" />
            </div>

            {/* Decorative circles */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl"></div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search database..."
              className="w-full pl-12 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-8 text-center text-red-700">
            {error}
          </div>
        )}

        {products.length === 0 && !loading ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">Start scanning to build your eco-database</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl hover:bg-black transition-all font-semibold shadow-lg hover:-translate-y-1"
            >
              <ScanLine className="w-5 h-5" />
              Scan Product
            </Link>
          </div>
        ) : filteredProducts.length === 0 && searchTerm ? (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No matches found for "{searchTerm}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 animate-slide-up">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.barcode}`}
                className="group block bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className="aspect-square bg-gray-50 relative overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name || 'Product'}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <Package className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <div className={`px-2 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md ${getScoreBg(product.green_score)} ${getScoreColor(product.green_score)}`}>
                      {product.green_score || 0}
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-gray-900 truncate mb-1">
                    {product.name || `Product ${product.barcode}`}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="truncate max-w-[60%]">{product.brand || 'Unknown Brand'}</span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-mono">{product.barcode.slice(-4)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Navigation />
    </div>
  );
}
