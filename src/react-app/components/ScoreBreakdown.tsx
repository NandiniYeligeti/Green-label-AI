import { Package, Utensils, Leaf, Recycle, Target } from 'lucide-react';

interface ScoreData {
  packaging_score: number;
  nutrition_score: number;
  environmental_score: number;
  sustainability_score: number;
  overall_score: number;
}

interface ScoreBreakdownProps {
  scores: ScoreData;
  dataSource: 'openfoodfacts' | 'gpt4';
}

export default function ScoreBreakdown({ scores, dataSource }: ScoreBreakdownProps) {
  const getGrade = (score: number): string => {
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'E';
  };

  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-green-600 bg-green-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'E': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressColor = (score: number): string => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getScoreAnalysis = (score: number): string => {
    if (score >= 80) return 'Excellent performance, leading sustainability practices';
    if (score >= 70) return 'Good performance with minor improvements possible';
    if (score >= 60) return 'Average performance, moderate improvements needed';
    if (score >= 50) return 'Below average performance, consider improvements';
    return 'Poor performance, significant improvements needed';
  };

  const getOverallImpact = (score: number): string => {
    if (score >= 80) return 'Low Impact';
    if (score >= 60) return 'Medium Impact';
    return 'High Impact';
  };

  const scoreCategories = [
    {
      name: 'Packaging',
      score: scores.packaging_score,
      icon: Package,
      description: 'Recyclability and sustainability of packaging materials',
      color: 'text-blue-600'
    },
    {
      name: 'Nutrition',
      score: scores.nutrition_score,
      icon: Utensils,
      description: 'Nutritional quality and health impact',
      color: 'text-green-600'
    },
    {
      name: 'Environmental',
      score: scores.environmental_score,
      icon: Leaf,
      description: 'Carbon footprint, water usage, and resource consumption',
      color: 'text-emerald-600'
    },
    {
      name: 'Sustainability',
      score: scores.sustainability_score,
      icon: Recycle,
      description: 'Ethical sourcing, fair trade, and renewable practices',
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Target className="w-6 h-6 text-emerald-600" />
        <h3 className="text-xl font-bold text-gray-900">Detailed Score Breakdown</h3>
      </div>

      {/* Individual Category Scores */}
      <div className="space-y-6 mb-8">
        {scoreCategories.map((category, index) => {
          const grade = getGrade(category.score);
          const Icon = category.icon;
          
          return (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gray-50`}>
                    <Icon className={`w-5 h-5 ${category.color}`} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{category.name}</h4>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full ${getGradeColor(grade)}`}>
                    <span className="text-sm font-bold">{grade}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{category.score}</div>
                    <div className="text-xs text-gray-500">out of 100</div>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-700 ${getProgressColor(category.score)}`}
                  style={{ width: `${category.score}%` }}
                />
              </div>
              
              {/* Score Analysis */}
              <p className="text-sm text-gray-700 font-medium">
                <span className="text-gray-600">Score Analysis:</span>{' '}
                <span className={category.score >= 70 ? 'text-green-600' : category.score >= 50 ? 'text-yellow-600' : 'text-orange-600'}>
                  {getScoreAnalysis(category.score)}
                </span>
              </p>
            </div>
          );
        })}
      </div>

      {/* Environmental Assembly Summary */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-6 border border-green-200">
        <div className="flex items-center gap-3 mb-3">
          <Leaf className="w-5 h-5 text-green-600" />
          <h4 className="text-lg font-semibold text-green-800">Environmental Assembly Summary</h4>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-green-700">Overall Impact:</span>
            <div className="text-green-800 font-semibold">{getOverallImpact(scores.overall_score)}</div>
          </div>
          <div>
            <span className="font-medium text-green-700">Data Source:</span>
            <div className="text-green-800 font-semibold">
              {dataSource === 'openfoodfacts' ? 'Official Database' : 'AI Analysis'}
            </div>
          </div>
        </div>
      </div>

      {/* Overall Green Score */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="bg-orange-500 p-2 rounded-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <h4 className="text-xl font-bold text-gray-900">Overall Green Score</h4>
        </div>
        
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#f3f4f6"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke={scores.overall_score >= 70 ? '#10b981' : scores.overall_score >= 50 ? '#f59e0b' : '#ef4444'}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${scores.overall_score * 2.51} 251`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Leaf className="w-6 h-6 text-white mb-1" />
            <div className="text-2xl font-bold text-white">{scores.overall_score}</div>
            <div className="text-sm text-white opacity-90">/ 100</div>
          </div>
          <div className={`absolute inset-0 rounded-full ${
            scores.overall_score >= 70 ? 'bg-green-500' : 
            scores.overall_score >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
          } -z-10`} />
        </div>
      </div>
    </div>
  );
}
