import { ProductType } from '@/shared/types';
import { Share2, Package, Leaf, Award } from 'lucide-react';

interface ProductCardProps {
  product: ProductType;
  onShare: () => void;
}

export default function ProductCard({ product, onShare }: ProductCardProps) {
  const getScoreColor = (score: number | null) => {
    if (!score) return 'bg-gray-500';
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreText = (score: number | null) => {
    if (!score) return 'Unknown';
    if (score >= 70) return 'Eco-Friendly';
    if (score >= 40) return 'Average';
    return 'Poor';
  };

  const formatGrade = (grade: string | null) => {
    return grade ? grade.toUpperCase() : 'N/A';
  };

  return (
    <div className="group bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden max-w-md mx-auto border border-gray-100 hover:-translate-y-1">
      {/* Product Image */}
      <div className="h-56 overflow-hidden relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name || 'Product'}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
            <Package className="w-20 h-20 text-emerald-300" />
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-sm text-gray-700 pointer-events-none">
          {product.source === 'gpt4' ? 'AI Analysis' : 'Verified Data'}
        </div>
      </div>

      <div className="p-6 relative">
        {/* Product Info */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1 leading-tight">
            {product.name || `Product ${product.barcode}`}
          </h2>
          {product.brand && (
            <p className="text-emerald-700 font-medium">{product.brand}</p>
          )}
          <p className="text-gray-400 text-xs mt-2 font-mono tracking-wider opacity-60">#{product.barcode}</p>
        </div>

        {/* Green Score */}
        <div className="mb-8 bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <div className="flex items-end justify-between mb-3">
            <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Eco Score</span>
            <div className={`text-sm font-bold px-3 py-1 rounded-full ${product.green_score && product.green_score >= 70 ? 'bg-green-100 text-green-700' :
                product.green_score && product.green_score >= 40 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
              }`}>
              {getScoreText(product.green_score)}
            </div>
          </div>

          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div className="text-4xl font-black text-gray-900">
                {product.green_score || 0}<span className="text-lg text-gray-400 font-medium">/100</span>
              </div>
            </div>
            <div className="overflow-hidden h-3 mb-1 text-xs flex rounded-full bg-gray-200 ring-1 ring-gray-200">
              <div
                style={{ width: `${product.green_score || 0}%` }}
                className={`shadow-lg flex flex-col text-center whitespace-nowrap text-white justify-center ${getScoreColor(product.green_score)} transition-all duration-1000 ease-out`}
              ></div>
            </div>
          </div>
        </div>

        {/* Grades */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {product.nutrition_grade && (
            <div className="text-center p-4 bg-orange-50/50 rounded-2xl border border-orange-100 hover:bg-orange-50 transition-colors">
              <Award className="w-6 h-6 mx-auto mb-2 text-orange-500" />
              <div className="text-xs text-orange-600 font-medium uppercase tracking-wide mb-1">Nutri-Score</div>
              <div className="text-2xl font-black text-gray-900">
                {formatGrade(product.nutrition_grade)}
              </div>
            </div>
          )}
          {product.ecoscore_grade && (
            <div className="text-center p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 hover:bg-emerald-50 transition-colors">
              <Leaf className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
              <div className="text-xs text-emerald-600 font-medium uppercase tracking-wide mb-1">Eco-Score</div>
              <div className="text-2xl font-black text-gray-900">
                {formatGrade(product.ecoscore_grade)}
              </div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        {(product.packaging_info || product.ingredients_text) && (
          <div className="space-y-4 mb-8">
            {product.packaging_info && (
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4" /> Packaging
                </h4>
                <p className="text-sm text-blue-800 leading-relaxed">
                  {product.packaging_info}
                </p>
              </div>
            )}
            {product.ingredients_text && (
              <div>
                <h4 className="text-sm font-bold text-gray-800 mb-2">
                  {product.source === 'gpt4' ? 'Sustainability Analysis' : 'Ingredients'}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                  "{product.ingredients_text}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Share Button */}
        <button
          onClick={onShare}
          className="w-full bg-gray-900 text-white py-4 px-6 rounded-xl hover:bg-black transition-all hover:shadow-lg hover:scale-[1.02] flex items-center justify-center gap-3 font-semibold text-lg active:scale-95"
        >
          <Share2 className="w-5 h-5 mb-0.5" />
          Share Results
        </button>
      </div>
    </div>
  );
}
