import { useState, useEffect } from 'react';
import { Lightbulb, Star, ShoppingBag, Leaf, Award } from 'lucide-react';
import { API_BASE_URL } from "../../config";

interface Recommendation {
  name: string;
  brand: string;
  category: string;
  why_better: string;
  estimated_green_score: number;
  key_benefits: string[];
  where_to_find: string;
  price_comparison: string;
  certifications: string;
}

interface RecommendationData {
  database_products: any[];
  ai_suggestions: Recommendation[];
  current_score: number;
  improvement_tips: string[];
}

interface Macros {
  calories_kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  per: string;
}

interface Recipe {
  title: string;
  time_minutes: number;
  ingredients: string[];
  steps: string[];
}

interface ProductRecommendationsProps {
  barcode: string;
  currentScore: number;
}

export default function ProductRecommendations({ barcode, currentScore }: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendationData | null>(null);
  const [macros, setMacros] = useState<Macros | null>(null);
  const [macrosLoading, setMacrosLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecommendations();
    fetchMacros();
    fetchRecipes();
  }, [barcode]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/product/${barcode}/recommendations`);
      const data = await response.json();

      if (data.success) {
        setRecommendations(data.recommendations);
      } else {
        setError('Failed to load recommendations');
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipes = async () => {
    try {
      setRecipesLoading(true);
      setRecipes(null);
      const response = await fetch(`${API_BASE_URL}/api/product/${barcode}/recipes?count=2`);
      const data = await response.json();

      if (data.success) {
        setRecipes(data.recipes);
      }
    } catch (err) {
      console.error('Error fetching recipes:', err);
    } finally {
      setRecipesLoading(false);
    }
  };

  const fetchMacros = async () => {
    try {
      setMacrosLoading(true);
      setMacros(null);
      const response = await fetch(`${API_BASE_URL}/api/product/${barcode}/macros`);
      const data = await response.json();

      if (data.success) {
        setMacros(data.macros);
      }
    } catch (err) {
      console.error('Error fetching macros:', err);
    } finally {
      setMacrosLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPriceIcon = (priceComparison: string) => {
    if (priceComparison.toLowerCase().includes('expensive')) {
      return '💰💰';
    } else if (priceComparison.toLowerCase().includes('similar')) {
      return '💰';
    } else {
      return '💸';
    }
  };

  const macroTotalG = (macros?.protein_g || 0) + (macros?.carbs_g || 0) + (macros?.fat_g || 0);
  const proteinPct = macroTotalG > 0 ? ((macros?.protein_g || 0) / macroTotalG) * 100 : 0;
  const carbsPct = macroTotalG > 0 ? ((macros?.carbs_g || 0) / macroTotalG) * 100 : 0;
  const fatPct = macroTotalG > 0 ? ((macros?.fat_g || 0) / macroTotalG) * 100 : 0;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="w-6 h-6 text-emerald-600" />
          <h3 className="text-lg font-bold text-gray-900">Better Alternatives</h3>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !recommendations) {
    return null;
  }

  const hasRecommendations = recommendations.ai_suggestions.length > 0 || recommendations.database_products.length > 0;

  if (!hasRecommendations && currentScore >= 80) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mt-6 border border-green-200">
        <div className="flex items-center gap-3 mb-3">
          <Award className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-bold text-green-800">Excellent Choice!</h3>
        </div>
        <p className="text-green-700 mb-4">
          This product already has an outstanding green score of {currentScore}/100. You're making a great eco-friendly choice!
        </p>
        {recommendations.improvement_tips.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-green-800">General eco-tips:</h4>
            <ul className="space-y-1">
              {recommendations.improvement_tips.map((tip, index) => (
                <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                  <Leaf className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
      <div className="flex items-center gap-3 mb-4">
        <Lightbulb className="w-6 h-6 text-emerald-600" />
        <h3 className="text-lg font-bold text-gray-900">Better Alternatives</h3>
        <span className="text-sm text-gray-500">
          (Score {currentScore}/100 → Higher scores available)
        </span>
      </div>

      {/* Database Products */}
      {recommendations.database_products.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-emerald-600" />
            Products in our database with better scores:
          </h4>
          <div className="space-y-3">
            {recommendations.database_products.map((product: any, index: number) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{product.name || `Product ${product.barcode}`}</h5>
                    {product.brand && (
                      <p className="text-sm text-gray-600">{product.brand}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Barcode: {product.barcode}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full ${getScoreColor(product.green_score)}`}>
                    <span className="text-sm font-bold">{product.green_score}/100</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      {recommendations.ai_suggestions.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            AI-recommended alternatives:
          </h4>
          <div className="space-y-4">
            {recommendations.ai_suggestions.map((rec, index) => (
              <div key={index} className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-200">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900">{rec.name}</h5>
                    {rec.brand && (
                      <p className="text-sm text-gray-700 font-medium">{rec.brand}</p>
                    )}
                    <p className="text-xs text-gray-600">{rec.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getPriceIcon(rec.price_comparison)}</span>
                    <div className={`px-3 py-1 rounded-full ${getScoreColor(rec.estimated_green_score)}`}>
                      <span className="text-sm font-bold">{rec.estimated_green_score}/100</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-3">{rec.why_better}</p>

                {rec.key_benefits && rec.key_benefits.length > 0 && (
                  <div className="mb-3">
                    <h6 className="text-xs font-medium text-gray-700 mb-1">Key Benefits:</h6>
                    <div className="flex flex-wrap gap-1">
                      {rec.key_benefits.map((benefit, i) => (
                        <span key={i} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>
                    <span className="font-medium">Where to find:</span> {rec.where_to_find}
                  </div>
                  <div>
                    <span className="font-medium">Price:</span> {rec.price_comparison}
                  </div>
                  {rec.certifications && (
                    <div className="col-span-1 sm:col-span-2">
                      <span className="font-medium">Certifications:</span> {rec.certifications}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improvement Tips */}
      {recommendations.improvement_tips.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
            <Leaf className="w-4 h-4" />
            Tips for making greener choices:
          </h4>
          <ul className="space-y-1">
            {recommendations.improvement_tips.map((tip, index) => (
              <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Macros Distribution */}
      {(macrosLoading || macros) && (
        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-3">Macros Distribution {macros?.per ? `(per ${macros.per})` : '(per 100g)'}</h4>

          {macrosLoading && (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          )}

          {!macrosLoading && macros && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Calories:</span> {Math.round(macros.calories_kcal)} kcal
                </div>
                <div className="text-xs text-gray-500">Protein/Carbs/Fat</div>
              </div>

              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-sky-500" style={{ width: `${proteinPct}%` }} />
                <div className="h-full bg-amber-500" style={{ width: `${carbsPct}%` }} />
                <div className="h-full bg-violet-500" style={{ width: `${fatPct}%` }} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center justify-between bg-sky-50 rounded-md px-3 py-2">
                  <span className="text-sky-700 font-medium">Protein</span>
                  <span className="text-sky-800">{macros.protein_g.toFixed(1)}g</span>
                </div>
                <div className="flex items-center justify-between bg-amber-50 rounded-md px-3 py-2">
                  <span className="text-amber-700 font-medium">Carbs</span>
                  <span className="text-amber-800">{macros.carbs_g.toFixed(1)}g</span>
                </div>
                <div className="flex items-center justify-between bg-violet-50 rounded-md px-3 py-2">
                  <span className="text-violet-700 font-medium">Fat</span>
                  <span className="text-violet-800">{macros.fat_g.toFixed(1)}g</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recipes */}
      {(recipesLoading || recipes) && (
        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-3">Recipes using this product</h4>

          {recipesLoading && (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          )}

          {!recipesLoading && recipes && recipes.length > 0 && (
            <div className="space-y-4">
              {recipes.map((r, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h5 className="font-semibold text-gray-900">{r.title}</h5>
                    {typeof r.time_minutes === 'number' && r.time_minutes > 0 && (
                      <span className="text-xs text-gray-500 whitespace-nowrap">~{r.time_minutes} min</span>
                    )}
                  </div>

                  {r.ingredients && r.ingredients.length > 0 && (
                    <div className="mb-3">
                      <h6 className="text-xs font-medium text-gray-700 mb-1">Ingredients</h6>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                        {r.ingredients.map((ing, i) => (
                          <li key={i}>{ing}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {r.steps && r.steps.length > 0 && (
                    <div>
                      <h6 className="text-xs font-medium text-gray-700 mb-1">Steps</h6>
                      <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-700">
                        {r.steps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
