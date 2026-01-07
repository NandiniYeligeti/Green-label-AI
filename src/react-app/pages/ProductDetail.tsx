import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Leaf } from 'lucide-react';
import ProductCard from '@/react-app/components/ProductCard';
import ProductRecommendations from '@/react-app/components/ProductRecommendations';
import ScoreBreakdown from '@/react-app/components/ScoreBreakdown';
import Navigation from '@/react-app/components/Navigation';
import { ProductType } from '@/shared/types';

export default function ProductDetail() {
  const { barcode } = useParams<{ barcode: string }>();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (barcode) {
      fetchProduct(barcode);
    }
  }, [barcode]);

  const fetchProduct = async (productBarcode: string) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/product/${productBarcode}`);
      const data = await response.json();

      if (data.success && data.product) {
        setProduct(data.product);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!product) return;

    const shareText = `Check out this product's Green Score on Green Label AI!\n\n${product.name || `Product ${product.barcode}`}\nGreen Score: ${product.green_score}/100\n\n#GreenLabelAI #EcoFriendly`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Green Label AI - Product Scan Results',
          text: shareText,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Results copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const getDetailedScores = (product: ProductType) => {
    // Try to get detailed scores from raw_data
    if (product.raw_data) {
      try {
        const rawData = JSON.parse(product.raw_data);
        if (rawData.detailed_scores) {
          return rawData.detailed_scores;
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }

    // Fallback: estimate scores based on overall green score
    const baseScore = product.green_score || 50;
    return {
      packaging_score: Math.min(100, baseScore + Math.floor(Math.random() * 20) - 10),
      nutrition_score: Math.min(100, baseScore + Math.floor(Math.random() * 20) - 10),
      environmental_score: Math.min(100, baseScore + Math.floor(Math.random() * 20) - 10),
      sustainability_score: Math.min(100, baseScore + Math.floor(Math.random() * 20) - 10),
      overall_score: baseScore
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Link
              to="/products"
              className="text-emerald-600 hover:text-emerald-700 font-medium text-sm mb-4 inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </Link>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Leaf className="w-8 h-8 text-emerald-600" />
              <h1 className="text-2xl font-bold text-gray-900">Green Label AI</h1>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              to="/"
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Scan Another Product
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 pb-32 md:pb-20 md:pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            to="/products"
            className="text-emerald-600 hover:text-emerald-700 font-medium text-sm inline-flex items-center gap-2 bg-white/50 px-4 py-2 rounded-full border border-emerald-100 hover:bg-white transition-all mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Left Column - Product Card */}
          <div className="w-full md:w-1/3 sticky top-24 animate-slide-up">
            <ProductCard product={product} onShare={handleShare} />
          </div>

          {/* Right Column - Detailed Analysis */}
          <div className="w-full md:w-2/3 space-y-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="glass-panel p-6 rounded-3xl">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-500" />
                Detailed Eco-Breakdown
              </h3>
              <ScoreBreakdown
                scores={getDetailedScores(product)}
                dataSource={product.source}
              />
            </div>

            <ProductRecommendations barcode={product.barcode} currentScore={product.green_score || 0} />
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  );
}
